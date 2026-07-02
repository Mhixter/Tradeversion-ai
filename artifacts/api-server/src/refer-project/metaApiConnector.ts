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

  async connect(): Promise<boolean> {
    // Two attempts: if deploy returns 404 (stale cached ID), clear and re-provision once.
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const alreadyConnected = await this.provision();
        if (!alreadyConnected) {
          await this.deployAccount();
        }
        const ok = await this.waitConnected();
        this.connected = ok;
        return ok;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        const is404Deploy = msg.includes("/deploy →") && msg.includes("404");
        if (is404Deploy && attempt === 1) {
          // Stale MetaApi account ID — wipe it and retry fresh
          console.warn("[MetaApiConnector] deploy 404 (stale ID) — clearing and re-provisioning");
          await db.update(rpAccountsTable)
            .set({ metaApiAccountId: null, updatedAt: new Date() })
            .where(eq(rpAccountsTable.id, this.dbAccountId));
          this.metaApiAccountId = null;
          continue;
        }
        const cause = (err as { cause?: { code?: string } })?.cause?.code;
        console.warn(`[MetaApiConnector] connect failed (${cause ?? msg}) — falling back to simulation`);
        this.connected = false;
        return false;
      }
    }
    this.connected = false;
    return false;
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
   * Find an existing MetaApi account matching our MT5 login+server,
   * or create a new one. Saves the MetaApi account ID back to the DB.
   * Returns true if the account is already CONNECTED (skip deploy step).
   */
  private async provision(): Promise<boolean> {
    if (this.metaApiAccountId) {
      // Already provisioned — just refresh region + check live state
      try {
        const acc = await this.provFetch<{ id: string; region?: string; state?: string; connectionStatus?: string }>(
          `/users/current/accounts/${this.metaApiAccountId}`
        );
        this.region = acc.region ?? "london";
        console.log(`[MetaApiConnector] Existing account state=${acc.state} connectionStatus=${acc.connectionStatus}`);
        // If already deployed+connected, skip the /deploy call
        if (acc.connectionStatus === "CONNECTED") return true;
        return false;
      } catch {
        // If it errors (e.g. deleted on MetaApi side), fall through to re-provision
        this.metaApiAccountId = null;
      }
    }

    if (!this.metaApiAccountId) {
      // Search existing MetaApi accounts by login only (server names may differ slightly)
      const accounts = await this.provFetch<Array<{ id: string; login?: string; server?: string; region?: string; connectionStatus?: string }>>(
        "/users/current/accounts?limit=100"
      );
      const existing = accounts.find(a => String(a.login) === String(this.mt5Login));

      if (existing) {
        this.metaApiAccountId = existing.id;
        this.region = existing.region ?? "london";
        console.log(`[MetaApiConnector] Found existing account by login: id=${existing.id} connectionStatus=${existing.connectionStatus}`);
      } else {
        // Create a new MetaApi cloud account; if server name is unknown, retry with suggested names
        const payload = {
          name:     this.accountName,
          type:     "cloud-g2",
          login:    this.mt5Login,
          password: this.tradingPassword,
          server:   this.server,
          platform: "mt5",
          magic:    0,   // required by MetaApi; 0 = observe all trades
        };

        let created: { id: string; region?: string };
        try {
          created = await this.provFetch<typeof created>("/users/current/accounts", "POST", payload);
        } catch (err: unknown) {
          // E_SRV_NOT_FOUND: MetaApi doesn't know this server name.
          // Try each suggested server in turn until one authenticates successfully.
          const details = (err as { details?: { code?: string; serversByBrokers?: Record<string, string[]> } }).details;
          if (details?.code === "E_SRV_NOT_FOUND" && details.serversByBrokers) {
            const suggested = Object.values(details.serversByBrokers).flat();
            let lastErr: unknown = err;
            created = undefined as unknown as typeof created;
            for (const serverName of suggested) {
              try {
                console.warn(`[MetaApiConnector] Server "${this.server}" unknown — trying "${serverName}"`);
                created = await this.provFetch<typeof created>("/users/current/accounts", "POST", {
                  ...payload, server: serverName,
                });
                break; // success
              } catch (retryErr: unknown) {
                lastErr = retryErr;
                const retryMsg = retryErr instanceof Error ? retryErr.message : String(retryErr);
                // E_AUTH means credentials rejected — this server exists but login is wrong; stop trying
                if (retryMsg.includes("E_AUTH")) throw retryErr;
                // otherwise keep trying next suggested server
              }
            }
            if (!created) throw lastErr;
          } else { throw err; }
        }

        this.metaApiAccountId = created.id;
        this.region = created.region ?? "london";
      }

      // Persist MetaApi account ID to DB for reuse
      await db.update(rpAccountsTable)
        .set({ metaApiAccountId: this.metaApiAccountId, updatedAt: new Date() })
        .where(eq(rpAccountsTable.id, this.dbAccountId));
    }

    return false; // not yet confirmed connected — proceed with deploy
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
