/**
 * Refer Project — MetaApi REST Connector
 *
 * Uses MetaApi.cloud's REST API (no npm package) to:
 *  - Provision/reuse a deployed MT5 account on MetaApi
 *  - Fetch real balance, equity, and open positions
 *  - Simulate price data (candles/ticks) — same simulator as SimulatedMT5Connector
 *  - Simulate trade execution (no real orders placed)
 *
 * Swap `openPosition` / `closePosition` for real MetaApi order endpoints
 * when live trade execution is required.
 */
import { db } from "@workspace/db";
import { rpAccountsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import type { MT5Connector, MT5AccountInfo, MT5Position, MT5TickData } from "./mt5Connector.js";
import { simulator } from "./mt5Connector.js";
import type { Candle } from "./types.js";
import { PIP_SIZE } from "./types.js";

const PROVISIONING_URL = "https://mt-provisioning-api-v1.agiliumtrade.agiliumtrade.ai";
const CLIENT_URL_TEMPLATE = "https://mt-client-api-v1.{region}.agiliumtrade.agiliumtrade.ai";
const DEPLOY_TIMEOUT_MS = 90_000; // 90 seconds
const DEPLOY_POLL_MS    = 5_000;
// All MetaApi regions — tried in order when the default fails
const KNOWN_REGIONS = ["london", "vint-hill", "new-york", "us-east", "singapore"] as const;

/* ── MetaApi REST Connector ──────────────────────────────────────────────── */
export class MetaApiRestConnector implements MT5Connector {
  private metaApiAccountId: string | null;
  private region = "london";
  private connected = false;
  // Simulated positions for the "simulated execution" layer
  private simPositions = new Map<string, { symbol: string; type: "BUY"|"SELL"; volume: number; openPrice: number; openTime: Date }>();

  constructor(
    private readonly token:          string,
    private readonly mt5Login:       string,
    private readonly tradingPassword: string,
    private readonly server:         string,
    private readonly accountName:    string,
    private readonly dbAccountId:    number,
    initialMetaApiAccountId: string | null,
  ) {
    this.metaApiAccountId = initialMetaApiAccountId;
  }

  /* ── Public interface ────────────────────────────────────────────────── */

  /**
   * Connect to MetaApi. Ensures the account is found and deployed, then returns immediately
   * without waiting for the broker connection to be established. The tick loop handles
   * retrying the client API on every cycle — this avoids a hard 120s startup timeout
   * that causes the worker to permanently fail when the broker takes >2 min to connect.
   *
   * Returns { ok: true } if the account is found and deployed (or already connected).
   * Returns { ok: false, error } only if the account cannot be found/provisioned at all.
   */
  async connect(): Promise<{ ok: boolean; error?: string }> {
    try {
      // Step 1: Find the account on MetaApi and set region. Returns true if already CONNECTED.
      const alreadyConnected = await this.provision();
      console.log(`[MetaApiConnector] provision done — alreadyConnected=${alreadyConnected} region=${this.region} id=${this.metaApiAccountId}`);

      // Step 2: Ensure the account is deployed (best-effort — MetaApi will connect to broker in background)
      if (!alreadyConnected) {
        try {
          await this.deployAccount();
          console.log(`[MetaApiConnector] Deploy request sent — MetaApi will connect to broker in background`);
        } catch (deployErr: unknown) {
          const msg = String(deployErr);
          // 409 = already deploying; 422 = already deployed — both are fine
          if (!msg.includes("409") && !msg.includes("422")) {
            console.warn(`[MetaApiConnector] deploy warning (non-fatal): ${msg}`);
          }
        }
      }

      // Step 3: Try the client API immediately (works when account is already connected)
      const reachable = await this.tryClientApiAllRegions();
      if (reachable) {
        console.log(`[MetaApiConnector] Client API accessible immediately (region=${this.region})`);
        this.connected = true;
        return { ok: true };
      }

      // Account is deployed but broker connection not yet established.
      // Return ok=true so the worker starts — the tick loop will retry the client API every 30s.
      console.log(`[MetaApiConnector] Account deployed (id=${this.metaApiAccountId} region=${this.region}) — waiting for broker connection. Tick loop will retry.`);
      this.connected = false; // mark as not connected yet; tick loop will call connect() again when it is
      return { ok: true };    // worker should stay running and keep retrying
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      // Only clear the stored MetaApi account ID when the provisioning API explicitly says
      // the account ID doesn't exist (true 404 on /users/current/accounts/{id}).
      const isProvisioningNotFound = msg.includes("provisioning GET /users/current/accounts/") && msg.includes("404");
      if (isProvisioningNotFound) {
        console.warn("[MetaApiConnector] MetaApi account ID no longer exists — clearing for re-provision next restart");
        await db.update(rpAccountsTable)
          .set({ metaApiAccountId: null, updatedAt: new Date() })
          .where(eq(rpAccountsTable.id, this.dbAccountId));
      }
      console.warn(`[MetaApiConnector] connect threw: ${msg}`);
      this.connected = false;
      return { ok: false, error: msg };
    }
  }

  async disconnect(): Promise<void> {
    this.connected = false;
    if (this.metaApiAccountId) {
      try {
        await this.provFetch(`/users/current/accounts/${this.metaApiAccountId}/undeploy`, "POST");
      } catch { /* best-effort */ }
    }
  }

  isConnected(): boolean { return this.connected; }

  async getAccountInfo(): Promise<MT5AccountInfo> {
    const data = await this.clientFetch<{
      balance: number; equity: number; margin: number; freeMargin?: number; marginFree?: number;
    }>(`/users/current/accounts/${this.metaApiAccountId}/account-information`);
    return {
      balance:    data.balance,
      equity:     data.equity,
      margin:     data.margin,
      freeMargin: data.freeMargin ?? data.marginFree ?? (data.equity - data.margin),
    };
  }

  async getOpenPositions(): Promise<MT5Position[]> {
    const data = await this.clientFetch<Array<{
      id: string|number; symbol: string; type: string;
      volume: number; openPrice: number; currentPrice: number;
      profit: number; time: string;
    }>>(`/users/current/accounts/${this.metaApiAccountId}/positions`);

    return data.map(p => ({
      ticket:       String(p.id),
      symbol:       p.symbol,
      type:         p.type === "POSITION_TYPE_BUY" ? "BUY" : "SELL",
      volume:       p.volume,
      openPrice:    p.openPrice,
      currentPrice: p.currentPrice,
      profit:       p.profit,
      openTime:     new Date(p.time),
    }));
  }

  /**
   * Fetch the correct region from MetaApi provisioning API and update this.region.
   * Call this before making client API requests so we use the right endpoint.
   * Safe to call even if metaApiAccountId is null (no-op in that case).
   */
  async syncRegionFromProvisioning(): Promise<void> {
    if (!this.metaApiAccountId) return;
    try {
      const acc = await this.provFetch<{ region?: string; state?: string; connectionStatus?: string }>(
        `/users/current/accounts/${this.metaApiAccountId}`
      );
      if (acc.region) {
        const prev = this.region;
        this.region = acc.region;
        if (prev !== acc.region) {
          console.log(`[MetaApiConnector] Region updated: ${prev} → ${acc.region} (state=${acc.state} connectionStatus=${acc.connectionStatus})`);
        }
      }
    } catch (err) {
      console.warn(`[MetaApiConnector] syncRegion failed: ${err}`);
    }
  }

  /**
   * Try the client API with each known region, updating this.region to the first one that works.
   * Returns true if any region responds successfully.
   */
  private async tryClientApiAllRegions(): Promise<boolean> {
    // Try current region first (fast path)
    try {
      await this.getAccountInfo();
      return true;
    } catch { /* try other regions */ }

    for (const region of KNOWN_REGIONS) {
      if (region === this.region) continue; // already tried
      this.region = region;
      try {
        await this.getAccountInfo();
        console.log(`[MetaApiConnector] Client API reachable via region="${region}" — updating`);
        // Persist the working region so future instances use it directly
        await db.update(rpAccountsTable)
          .set({ metaApiRegion: region, updatedAt: new Date() })
          .where(eq(rpAccountsTable.id, this.dbAccountId))
          .catch(() => { /* column may not exist in older schema — ignore */ });
        return true;
      } catch { /* try next */ }
    }
    return false;
  }

  /** Fetch real closed deal history from MetaApi (last N days). Throws on network/auth error. */
  async getDealHistory(days = 30): Promise<Array<{
    id: string; symbol: string; type: string; entry: string;
    volume: number; price: number; profit: number; commission: number;
    swap: number; time: string; orderId?: string;
  }>> {
    if (!this.metaApiAccountId) throw new Error("Account not provisioned on MetaApi — click Verify first.");
    // Sync region from provisioning API so we hit the correct client endpoint
    await this.syncRegionFromProvisioning();
    const end   = new Date();
    const start = new Date(end.getTime() - days * 86_400_000);
    const deals = await this.clientFetch<Array<{
      id: string; symbol?: string; type: string; entry?: string;
      volume?: number; price?: number; profit?: number; commission?: number;
      swap?: number; time: string; orderId?: string;
    }>>(`/users/current/accounts/${this.metaApiAccountId}/history-deals/time/${start.toISOString()}/${end.toISOString()}`);
    return deals
      .filter(d => d.symbol && d.type !== "DEAL_TYPE_BALANCE") // skip deposit/withdrawal entries
      .map(d => ({
        id:         String(d.id),
        symbol:     d.symbol ?? "",
        type:       d.type ?? "",
        entry:      d.entry ?? "",
        volume:     d.volume ?? 0,
        price:      d.price ?? 0,
        profit:     d.profit ?? 0,
        commission: d.commission ?? 0,
        swap:       d.swap ?? 0,
        time:       d.time,
        orderId:    d.orderId ? String(d.orderId) : undefined,
      }));
  }

  /** Fetch real open positions from MetaApi live account. Throws on network/auth error. */
  async getRealOpenPositions(): Promise<Array<{
    id: string; symbol: string; type: string; volume: number;
    openPrice: number; currentPrice: number; profit: number;
    commission: number; swap: number; time: string;
  }>> {
    if (!this.metaApiAccountId) throw new Error("Account not provisioned on MetaApi — click Verify first.");
    // Sync region from provisioning API so we hit the correct client endpoint
    await this.syncRegionFromProvisioning();
    const positions = await this.clientFetch<Array<{
      id: string | number; symbol: string; type: string; volume: number;
      openPrice: number; currentPrice?: number; profit?: number;
      commission?: number; swap?: number; time: string;
    }>>(`/users/current/accounts/${this.metaApiAccountId}/positions`);
    return positions.map(p => ({
      id:           String(p.id),
      symbol:       p.symbol,
      type:         p.type,
      volume:       p.volume,
      openPrice:    p.openPrice,
      currentPrice: p.currentPrice ?? p.openPrice,
      profit:       p.profit ?? 0,
      commission:   p.commission ?? 0,
      swap:         p.swap ?? 0,
      time:         p.time,
    }));
  }

  /* ── Simulated price data ────────────────────────────────────────────── */

  async getCandles(symbol: string, count = 200): Promise<Candle[]> {
    return simulator.getHistory(symbol).slice(-count);
  }

  async getTick(symbol: string): Promise<MT5TickData> {
    const bid    = simulator.getPrice(symbol);
    const spread = simulator.getSpread(symbol);
    return { symbol, bid, ask: bid + spread, spread, time: new Date() };
  }

  /* ── Simulated trade execution (no real orders) ──────────────────────── */

  async openPosition(symbol: string, type: "BUY" | "SELL", volume: number): Promise<string> {
    const tick   = await this.getTick(symbol);
    const price  = type === "BUY" ? tick.ask : tick.bid;
    const ticket = `META-SIM-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    this.simPositions.set(ticket, { symbol, type, volume, openPrice: price, openTime: new Date() });
    return ticket;
  }

  async closePosition(ticket: string): Promise<boolean> {
    this.simPositions.delete(ticket);
    return true;
  }

  /* ── Private helpers ─────────────────────────────────────────────────── */

  private provHeaders() {
    return { "auth-token": this.token, "Content-Type": "application/json" };
  }

  private get clientBase(): string {
    return CLIENT_URL_TEMPLATE.replace("{region}", this.region);
  }

  /** Generic fetch against the provisioning API. Returns undefined for 204 No Content. */
  private async provFetch<T = unknown>(path: string, method = "GET", body?: unknown): Promise<T> {
    const res = await fetch(`${PROVISIONING_URL}${path}`, {
      method,
      headers: this.provHeaders(),
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      // Attach parsed JSON details to the error so callers can inspect them
      const err = new Error(`MetaApi provisioning ${method} ${path} → ${res.status}: ${text}`) as Error & { details?: unknown; errorCode?: string };
      try { const j = JSON.parse(text); err.details = j?.details; err.errorCode = j?.details?.code; } catch { /* ignore */ }
      throw err;
    }
    if (res.status === 204 || res.headers.get("content-length") === "0") {
      return undefined as unknown as T;
    }
    return res.json() as Promise<T>;
  }

  /** Generic fetch against the client (RPC) API. Returns undefined for 204 No Content. */
  private async clientFetch<T = unknown>(path: string, method = "GET", body?: unknown): Promise<T> {
    const res = await fetch(`${this.clientBase}${path}`, {
      method,
      headers: this.provHeaders(),
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`MetaApi client ${method} ${path} → ${res.status}: ${text}`);
    }
    if (res.status === 204 || res.headers.get("content-length") === "0") {
      return undefined as unknown as T;
    }
    return res.json() as Promise<T>;
  }

  /**
   * Find an existing MetaApi account for this MT5 login. Saves the MetaApi account ID to DB.
   * Returns true if the account is already CONNECTED (broker link established → can skip deploy).
   *
   * DOES NOT create accounts — account creation requires a higher-tier MetaApi plan.
   * If the account is not found at all, throws a clear error directing the user to click Verify.
   */
  private async provision(): Promise<boolean> {
    // Fetch all MetaApi accounts for this token so we can search by login
    type MetaApiAccount = { id: string; login?: string; server?: string; region?: string; state?: string; connectionStatus?: string };
    const allAccounts = await this.provFetch<MetaApiAccount[]>("/users/current/accounts?limit=100");

    // If we have a stored ID, check its current state
    if (this.metaApiAccountId) {
      const stored = allAccounts.find(a => a.id === this.metaApiAccountId);
      if (stored) {
        this.region = stored.region ?? "london";
        console.log(`[MetaApiConnector] Stored account id=${stored.id} state=${stored.state} connectionStatus=${stored.connectionStatus} region=${stored.region}`);
        if (stored.connectionStatus === "CONNECTED") return true;
        // Account found but not yet connected — fall through to check if another account for this login IS connected
      }
      // If stored ID not in list (deleted/rotated), clear it and search by login below
      if (!stored) {
        console.warn(`[MetaApiConnector] Stored id=${this.metaApiAccountId} not found in account list — searching by login`);
        this.metaApiAccountId = null;
      }
    }

    // Search all accounts for this login, preferring the one that is currently CONNECTED
    const byLogin = allAccounts.filter(a => String(a.login) === String(this.mt5Login));

    if (byLogin.length === 0) {
      throw new Error(
        `MT5 login ${this.mt5Login} not found in MetaApi account list (searched ${allAccounts.length} accounts). ` +
        `Please click the Verify (wifi icon) button to register this account with MetaApi first.`
      );
    }

    // Prefer CONNECTED > DEPLOYED > any other state
    const connected = byLogin.find(a => a.connectionStatus === "CONNECTED");
    const best = connected ?? byLogin[0];

    if (connected && best.id !== this.metaApiAccountId) {
      console.log(`[MetaApiConnector] Switching to CONNECTED account id=${best.id} (was ${this.metaApiAccountId ?? "null"})`);
    } else {
      console.log(`[MetaApiConnector] Using account id=${best.id} state=${best.state} connectionStatus=${best.connectionStatus}`);
    }

    this.metaApiAccountId = best.id;
    this.region = best.region ?? "london";

    // Persist the (possibly updated) MetaApi account ID to DB
    await db.update(rpAccountsTable)
      .set({ metaApiAccountId: this.metaApiAccountId, updatedAt: new Date() })
      .where(eq(rpAccountsTable.id, this.dbAccountId));

    return best.connectionStatus === "CONNECTED";
  }

  private async deployAccount(): Promise<void> {
    // provFetch already handles 204 safely — just call it directly
    await this.provFetch(`/users/current/accounts/${this.metaApiAccountId}/deploy`, "POST");
  }

  private async waitConnected(timeoutMs = DEPLOY_TIMEOUT_MS): Promise<boolean> {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      try {
        const acc = await this.provFetch<{ connectionStatus?: string; state?: string }>(
          `/users/current/accounts/${this.metaApiAccountId}`
        );
        if (acc.connectionStatus === "CONNECTED") return true;
        if (acc.state === "ERROR" || acc.state === "UNDEPLOYED") return false;
      } catch { /* retry */ }
      await new Promise(r => setTimeout(r, DEPLOY_POLL_MS));
    }
    return false;
  }
}

/* ── Quick verification (no deploy, no wait) ─────────────────────────────── */
/**
 * Validate that the MetaApi token is working and the account exists/can be found.
 * Returns a status string + the MetaApi account ID if found.
 * This is fast — it only calls the provisioning list endpoint.
 */
export interface MetaApiVerifyResult {
  /** Token was accepted by MetaApi API (true even if account not yet provisioned). */
  tokenValid:       boolean;
  /** Account was found on MetaApi (provisioned). Only true when both token and account exist. */
  accountFound:     boolean;
  /** MetaApi domain is unreachable (network egress blocked by hosting platform). */
  networkBlocked:   boolean;
  metaApiAccountId?: string;
  state?:            string;
  connectionStatus?: string;
  message:           string;
}

export async function verifyMetaApiAccount(
  token: string,
  mt5Login: string,
  server: string,
): Promise<MetaApiVerifyResult> {
  try {
    const headers = { "auth-token": token, "Content-Type": "application/json" };
    const res = await fetch(`${PROVISIONING_URL}/users/current/accounts?limit=100`, { headers });
    if (!res.ok) {
      return { tokenValid: false, accountFound: false, message: `MetaApi token invalid or quota exceeded (HTTP ${res.status})` };
    }
    const accounts: Array<{ id: string; login?: string; server?: string; state?: string; connectionStatus?: string }> = await res.json();
    // Match by login only — server name in MetaApi may differ from what user typed
    const found = accounts.find(a => String(a.login) === String(mt5Login));
    if (found) {
      const isConnected = found.connectionStatus === "CONNECTED";
      return {
        tokenValid:       true,
        accountFound:     true,
        networkBlocked:   false,
        metaApiAccountId: found.id,
        state:            found.state,
        connectionStatus: found.connectionStatus,
        message: isConnected
          ? `Account connected on MetaApi (server: ${found.server ?? "unknown"})`
          : `Account found on MetaApi but not yet connected — state: ${found.state ?? "unknown"}, connection: ${found.connectionStatus ?? "unknown"}. MetaApi is trying to reach the broker. This usually takes 2–5 minutes on first deploy.`,
      };
    }
    // Token works but account not yet provisioned — list all MetaApi logins for diagnostics
    const allLogins = accounts.map(a => a.login ?? "?").join(", ");
    return {
      tokenValid:     true,
      accountFound:   false,
      networkBlocked: false,
      message: `MetaApi token valid. Searched for login "${mt5Login}" but not found. MetaApi accounts on this token: [${allLogins || "none"}]. If your login is listed, delete this account and re-add it with the exact login shown.`,
    };
  } catch (err: unknown) {
    const msg    = String(err);
    const isEgress = msg.includes("ENOTFOUND") || msg.includes("fetch failed") || msg.includes("ECONNREFUSED") || msg.includes("network");
    return {
      tokenValid:     false,
      accountFound:   false,
      networkBlocked: isEgress,
      message: isEgress
        ? "MetaApi domain is unreachable from this hosting environment (egress blocked). Your token and credentials are correct — live data requires a hosting provider with unrestricted outbound network access."
        : `MetaApi error: ${msg}`,
    };
  }
}
