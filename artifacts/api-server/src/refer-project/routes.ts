/**
 * Refer Project — HTTP Routes
 * Mounted at /api/refer-project/* (see routes/index.ts)
 * Admin-only: enforced server-side via Bearer token on every request.
 */
import { Router, type Request, type Response, type NextFunction } from "express";
import { db } from "@workspace/db";
import {
  rpAccountsTable, rpPositionsTable, rpLogsTable,
  rpSettingsTable, rpAiConfigTable,
} from "@workspace/db/schema";
import { eq, and, desc, gte, sql } from "drizzle-orm";
import { workerManager } from "./workerManager.js";
import { rpLog } from "./rpLogger.js";
import { DEFAULT_SYMBOLS } from "./types.js";
import { verifyMetaApiAccount, MetaApiRestConnector } from "./metaApiConnector.js";

/* ─── Admin auth ─────────────────────────────────────────────────────────── */
const RP_ADMIN_EMAIL = "saidumuhammed664@gmail.com";
const RP_ADMIN_PASS  = "Mhixter664@gmail.com";
const VALID_TOKEN    = Buffer.from(`${RP_ADMIN_EMAIL}:${RP_ADMIN_PASS}`).toString("base64");

function requireRPAdmin(req: Request, res: Response, next: NextFunction): void {
  // Accept either: (a) valid Bearer token, or (b) an active OIDC session (req.user set by authMiddleware)
  if (req.user) { next(); return; }
  const auth  = (req.headers["authorization"] ?? "") as string;
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (token === VALID_TOKEN) { next(); return; }
  res.status(401).json({ error: "Admin authentication required" });
}

/** Strip sensitive credential fields from an account record before sending to client. */
function sanitizeAccount(a: Record<string, unknown>): Record<string, unknown> {
  const { tradingPassword, investorPassword, ...safe } = a;
  return safe;
}

const router = Router();
router.use(requireRPAdmin);

/* ─── Settings ──────────────────────────────────────────────────────────── */
router.get("/refer-project/settings", async (req, res) => {
  try {
    let [row] = await db.select().from(rpSettingsTable).where(eq(rpSettingsTable.id, 1)).limit(1);
    if (!row) {
      await db.insert(rpSettingsTable).values({ id: 1 }).onConflictDoNothing();
      [row] = await db.select().from(rpSettingsTable).where(eq(rpSettingsTable.id, 1)).limit(1);
    }
    res.json(row);
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Failed to get settings" }); }
});

router.patch("/refer-project/settings", async (req, res) => {
  try {
    const body = req.body ?? {};
    await db.insert(rpSettingsTable).values({ id: 1 }).onConflictDoNothing();
    const [updated] = await db.update(rpSettingsTable)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(rpSettingsTable.id, 1))
      .returning();
    await rpLog({ event: "SETTINGS_UPDATED", message: "Refer Project settings updated", details: body });
    res.json(updated);
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Failed to update settings" }); }
});

/* ─── AI Config ─────────────────────────────────────────────────────────── */
router.get("/refer-project/ai-config", async (req, res) => {
  try {
    let [row] = await db.select().from(rpAiConfigTable).where(eq(rpAiConfigTable.id, 1)).limit(1);
    if (!row) {
      await db.insert(rpAiConfigTable).values({ id: 1 }).onConflictDoNothing();
      [row] = await db.select().from(rpAiConfigTable).where(eq(rpAiConfigTable.id, 1)).limit(1);
    }
    res.json(row);
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Failed to get AI config" }); }
});

router.patch("/refer-project/ai-config", async (req, res) => {
  try {
    const body = req.body ?? {};
    await db.insert(rpAiConfigTable).values({ id: 1 }).onConflictDoNothing();
    const [updated] = await db.update(rpAiConfigTable)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(rpAiConfigTable.id, 1))
      .returning();
    res.json(updated);
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Failed to update AI config" }); }
});

/* ─── Accounts ───────────────────────────────────────────────────────────── */
router.get("/refer-project/accounts", async (req, res) => {
  try {
    const accounts = await db.select().from(rpAccountsTable).orderBy(rpAccountsTable.createdAt);
    const running  = workerManager.runningAccountIds();
    res.json(accounts.map(a => sanitizeAccount({ ...a, workerRunning: running.includes(a.id) })));
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Failed to fetch accounts" }); }
});

router.post("/refer-project/accounts", async (req, res) => {
  try {
    const { accountName, mt5Login, investorPassword, tradingPassword, server, brokerName, accountType, leverage } = req.body ?? {};
    if (!accountName || !mt5Login || !server) {
      return void res.status(400).json({ error: "accountName, mt5Login, and server are required" });
    }
    const [account] = await db.insert(rpAccountsTable).values({
      accountName, mt5Login,
      investorPassword: investorPassword || null,
      tradingPassword:  tradingPassword  || null,
      server, brokerName: brokerName || "XM",
      accountType: accountType || "Ultra Low Standard",
      leverage: leverage || "1:1000",
    }).returning();
    await rpLog({ event: "ACCOUNT_ADDED", accountId: account.id,
      message: `Account "${accountName}" (${mt5Login}) added` });
    res.status(201).json(sanitizeAccount(account as unknown as Record<string, unknown>));
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Failed to add account" }); }
});

router.put("/refer-project/accounts/:id", async (req, res) => {
  try {
    const id   = parseInt(req.params.id);
    const body = req.body ?? {};
    const [updated] = await db.update(rpAccountsTable)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(rpAccountsTable.id, id))
      .returning();
    if (!updated) return void res.status(404).json({ error: "Account not found" });
    res.json(sanitizeAccount(updated as unknown as Record<string, unknown>));
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Failed to update account" }); }
});

router.delete("/refer-project/accounts/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await workerManager.stopAccount(id);
    await db.delete(rpAccountsTable).where(eq(rpAccountsTable.id, id));
    await rpLog({ event: "ACCOUNT_REMOVED", accountId: id, message: `Account ${id} removed` });
    res.json({ success: true });
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Failed to delete account" }); }
});

router.post("/refer-project/accounts/:id/start", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [account] = await db.select().from(rpAccountsTable).where(eq(rpAccountsTable.id, id)).limit(1);
    if (!account) return void res.status(404).json({ error: "Account not found" });
    await db.update(rpAccountsTable).set({ status: "active", updatedAt: new Date() }).where(eq(rpAccountsTable.id, id));
    workerManager.startAccount(id); // fire-and-forget
    await rpLog({ event: "WORKER_START", accountId: id, message: `Worker started for account ${id}` });
    res.json({ success: true, message: "Worker starting" });
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Failed to start account" }); }
});

router.post("/refer-project/accounts/:id/stop", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await workerManager.stopAccount(id);
    await db.update(rpAccountsTable).set({ status: "inactive", updatedAt: new Date() }).where(eq(rpAccountsTable.id, id));
    await rpLog({ event: "WORKER_STOP", accountId: id, message: `Worker stopped for account ${id}` });
    res.json({ success: true, message: "Worker stopped" });
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Failed to stop account" }); }
});

router.post("/refer-project/accounts/:id/test-connection", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [account] = await db.select().from(rpAccountsTable).where(eq(rpAccountsTable.id, id)).limit(1);
    if (!account) return void res.status(404).json({ error: "Account not found" });

    const metaToken = process.env.METAAPI_TOKEN;

    if (metaToken) {
      // Real MetaApi verification — fast (no deploy, just provisioning list lookup)
      const t0 = Date.now();
      await db.update(rpAccountsTable)
        .set({ verificationStatus: "verifying", updatedAt: new Date() })
        .where(eq(rpAccountsTable.id, id));

      const result = await verifyMetaApiAccount(metaToken, account.mt5Login, account.server);
      const latencyMs = Date.now() - t0;

      // "verified"        — account found and provisioned on MetaApi
      // "unverified"      — token OK but account not yet provisioned
      // "network_blocked" — MetaApi domain unreachable from this host (egress filter)
      // "failed"          — token rejected by MetaApi
      const newStatus = result.accountFound   ? "verified"
        : result.tokenValid                   ? "unverified"
        : result.networkBlocked               ? "network_blocked"
        : "failed";

      await db.update(rpAccountsTable)
        .set({
          verificationStatus: newStatus,
          metaApiAccountId:   result.metaApiAccountId ?? account.metaApiAccountId ?? null,
          updatedAt: new Date(),
        })
        .where(eq(rpAccountsTable.id, id));

      await rpLog({
        event:     result.accountFound ? "CONNECTION" : (result.tokenValid ? "CONNECTION" : "ERROR"),
        accountId: id,
        level:     result.tokenValid ? "info" : "error",
        message:   `MetaApi verify: ${result.message}`,
        details:   { metaApiAccountId: result.metaApiAccountId, state: result.state, connectionStatus: result.connectionStatus },
      });

      return void res.json({
        success:    result.accountFound,
        tokenValid: result.tokenValid,
        isLive:     true,
        latencyMs,
        message:    result.message,
        metaApiAccountId: result.metaApiAccountId,
        state:            result.state,
        connectionStatus: result.connectionStatus,
      });
    }

    // Fallback — simulated test (no METAAPI_TOKEN configured)
    const delay = 500 + Math.random() * 800;
    await new Promise(r => setTimeout(r, delay));
    const ok = Math.random() > 0.1;
    res.json({ success: ok, isLive: false, latencyMs: Math.round(delay), message: ok ? "Simulated connection OK" : "Simulated connection failed" });
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Test failed" }); }
});

/* ─── Live balance sync (bypasses worker — calls MetaApi client API directly) ── */
router.post("/refer-project/accounts/:id/sync-balance", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return void res.status(400).json({ error: "Invalid account id" });

    const [account] = await db.select().from(rpAccountsTable).where(eq(rpAccountsTable.id, id)).limit(1);
    if (!account) return void res.status(404).json({ error: "Account not found" });

    const token = process.env.METAAPI_TOKEN;
    if (!token) {
      return void res.status(503).json({
        error: "METAAPI_TOKEN not configured on this server",
        hint: "Add METAAPI_TOKEN to Railway environment variables → Deploy",
      });
    }

    if (!account.tradingPassword) {
      return void res.status(422).json({
        error: "No trading password stored for this account",
        hint: "Edit the account and enter the MT5 trading password",
      });
    }

    // Instantiate connector (no worker — direct in-request call)
    const connector = new MetaApiRestConnector(
      token, account.mt5Login, account.tradingPassword, account.server,
      account.accountName, id, account.metaApiAccountId ?? null,
    );

    // Step 1: provision — finds account by login/stored-ID, saves ID to DB, resolves region
    try {
      await connector.provision();
    } catch (provErr: unknown) {
      const msg = String(provErr);
      return void res.status(502).json({
        error: "MetaApi provisioning failed",
        details: msg,
        hint: msg.includes("not found in MetaApi account list")
          ? "Click the Verify (wifi) button first to register this account with MetaApi, then try Sync Balance"
          : "Check that METAAPI_TOKEN is valid and the MT5 login is correct",
      });
    }

    // Step 2: fetch live balance from client API (requires broker to be CONNECTED on MetaApi side)
    let info: { balance: number; equity: number; margin: number; freeMargin: number };
    try {
      info = await connector.getAccountInfo();
    } catch (balErr: unknown) {
      const msg = String(balErr);
      const hint =
        msg.includes("404")
          ? "MetaApi account ID not found — click Verify, then Sync Balance again"
          : msg.includes("401") || msg.includes("403")
          ? "METAAPI_TOKEN rejected — check it hasn't expired in Railway env vars"
          : "MetaApi broker connection not yet established — this can take 2–5 min after first deploy. Start the worker and wait, or try again in a minute.";
      // Try deploying the account so MetaApi starts connecting to broker in background
      try {
        await connector.connect(); // deploy best-effort; ignore result
      } catch { /* ignore */ }
      return void res.status(502).json({ error: "Broker not yet connected on MetaApi", details: msg, hint });
    }

    // Persist real balance to DB
    await db.update(rpAccountsTable)
      .set({
        balance:          String(info.balance.toFixed(2)),
        equity:           String(info.equity.toFixed(2)),
        connectionStatus: "connected",
        lastSyncTime:     new Date(),
        updatedAt:        new Date(),
      })
      .where(eq(rpAccountsTable.id, id));

    await rpLog({
      event: "CONNECTION", accountId: id, level: "info",
      message: `Live balance synced: ${info.balance.toFixed(2)} | Equity: ${info.equity.toFixed(2)}`,
      details: { balance: info.balance, equity: info.equity, freeMargin: info.freeMargin },
    });

    res.json({
      success: true,
      balance:    info.balance,
      equity:     info.equity,
      margin:     info.margin,
      freeMargin: info.freeMargin,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Balance sync failed", details: String(err) });
  }
});

/* ─── Real MT5 History (live from MetaApi) ───────────────────────────────── */
router.get("/refer-project/accounts/:id/mt5-history", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return void res.status(400).json({ error: "Invalid account id" });

    const rawDays = parseInt((req.query.days as string) ?? "30");
    const days = Number.isFinite(rawDays) && rawDays >= 1 && rawDays <= 365 ? rawDays : 30;

    const [account] = await db.select().from(rpAccountsTable).where(eq(rpAccountsTable.id, id)).limit(1);
    if (!account) return void res.status(404).json({ error: "Account not found" });
    if (!account.metaApiAccountId) {
      return void res.status(422).json({
        error: "Account not yet provisioned on MetaApi",
        message: "Click the Verify button on the Connected Accounts page first.",
        deals: [], positions: [],
      });
    }

    const token = process.env.METAAPI_TOKEN;
    if (!token) {
      return void res.status(503).json({
        error: "METAAPI_TOKEN not configured",
        message: "Add METAAPI_TOKEN to the Railway environment variables.",
        deals: [], positions: [],
      });
    }

    const connector = new MetaApiRestConnector(
      token, account.mt5Login, account.tradingPassword ?? "", account.server,
      account.accountName, id, account.metaApiAccountId
    );

    const [deals, positions] = await Promise.allSettled([
      connector.getDealHistory(days),
      connector.getRealOpenPositions(),
    ]);

    const dealsData  = deals.status     === "fulfilled" ? deals.value     : [];
    const posData    = positions.status === "fulfilled" ? positions.value : [];
    const dealsErr   = deals.status     === "rejected"  ? String(deals.reason)     : null;
    const posErr     = positions.status === "rejected"  ? String(positions.reason) : null;
    const errorMsg   = [dealsErr, posErr].filter(Boolean).join("; ");

    if (errorMsg && dealsData.length === 0 && posData.length === 0) {
      // Full failure — tell the client clearly
      return void res.status(502).json({
        error: "MetaApi client API unreachable",
        message: errorMsg,
        deals: [], positions: [],
      });
    }

    res.json({
      deals: dealsData, positions: posData,
      metaApiAccountId: account.metaApiAccountId,
      ...(errorMsg ? { warning: errorMsg } : {}),
    });
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Failed to fetch MT5 history", details: String(err) }); }
});

/* ─── MetaApi diagnostic — quick provisioning status for an account ─────── */
router.get("/refer-project/accounts/:id/metaapi-status", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return void res.status(400).json({ error: "Invalid account id" });

    const [account] = await db.select().from(rpAccountsTable).where(eq(rpAccountsTable.id, id)).limit(1);
    if (!account) return void res.status(404).json({ error: "Account not found" });

    const token = process.env.METAAPI_TOKEN;
    if (!token) return void res.status(503).json({ error: "METAAPI_TOKEN not configured", metaApiAccountId: null });

    if (!account.metaApiAccountId) {
      return void res.json({
        metaApiAccountId: null,
        state: null, connectionStatus: null, region: null,
        message: "Not yet provisioned — click Verify to register this account with MetaApi.",
      });
    }

    // Fetch live state from MetaApi provisioning API
    const headers = { "auth-token": token, "Content-Type": "application/json" };
    const provUrl = `https://mt-provisioning-api-v1.agiliumtrade.agiliumtrade.ai/users/current/accounts/${account.metaApiAccountId}`;
    try {
      const provRes = await fetch(provUrl, { headers });
      if (!provRes.ok) {
        const text = await provRes.text().catch(() => "");
        return void res.json({
          metaApiAccountId: account.metaApiAccountId,
          state: null, connectionStatus: null, region: null,
          error: `Provisioning API returned ${provRes.status}`,
          message: text,
        });
      }
      const acc = await provRes.json() as {
        id?: string; state?: string; connectionStatus?: string;
        region?: string; server?: string; version?: number;
      };
      return void res.json({
        metaApiAccountId: account.metaApiAccountId,
        state:            acc.state,
        connectionStatus: acc.connectionStatus,
        region:           acc.region,
        server:           acc.server,
        version:          acc.version,
        clientApiUrl:     `https://mt-client-api-v1.${acc.region ?? "london"}.agiliumtrade.agiliumtrade.ai`,
        message: acc.connectionStatus === "CONNECTED"
          ? `✅ MetaApi connected (region: ${acc.region ?? "unknown"})`
          : `⏳ MetaApi state=${acc.state} connectionStatus=${acc.connectionStatus} — may still be deploying`,
      });
    } catch (fetchErr) {
      return void res.status(502).json({ error: "Could not reach MetaApi provisioning API", details: String(fetchErr) });
    }
  } catch (err) { req.log.error(err); res.status(500).json({ error: "MetaApi status check failed", details: String(err) }); }
});

/* ─── Dashboard ─────────────────────────────────────────────────────────── */
router.get("/refer-project/dashboard", async (req, res) => {
  try {
    const [accounts, allPositions, [settings]] = await Promise.all([
      db.select().from(rpAccountsTable),
      db.select().from(rpPositionsTable).orderBy(desc(rpPositionsTable.openTime)),
      db.select().from(rpSettingsTable).where(eq(rpSettingsTable.id, 1)).limit(1),
    ]);

    const running      = workerManager.runningAccountIds();
    const openPos      = allPositions.filter(p => p.status === "open");
    const closedPos    = allPositions.filter(p => p.status === "closed");
    const todayStart   = new Date(); todayStart.setHours(0,0,0,0);
    const todayTrades  = closedPos.filter(p => p.closeTime && new Date(p.closeTime) >= todayStart);
    const todayProfit  = todayTrades.filter(p => parseFloat(String(p.profit)) > 0).reduce((s, p) => s + parseFloat(String(p.profit)), 0);
    const todayLoss    = todayTrades.filter(p => parseFloat(String(p.profit)) < 0).reduce((s, p) => s + parseFloat(String(p.profit)), 0);
    const floatingPnl  = openPos.reduce((s, p) => s + parseFloat(String(p.profit)), 0);
    const totalLots    = allPositions.reduce((s, p) => s + parseFloat(String(p.lotSize)), 0);
    const runningSyms  = [...new Set(openPos.map(p => p.symbol))];
    const avgConf      = openPos.length
      ? openPos.filter(p => p.aiConfidence != null).reduce((s, p) => s + parseFloat(String(p.aiConfidence)), 0) / openPos.filter(p => p.aiConfidence != null).length
      : 0;

    res.json({
      connectedAccounts: accounts.length,
      runningAccounts:   running.length,
      stoppedAccounts:   accounts.length - running.length,
      openPositions:     openPos.length,
      tradesToday:       todayTrades.length,
      closedTrades:      closedPos.length,
      totalLots:         parseFloat(totalLots.toFixed(2)),
      floatingPnl:       parseFloat(floatingPnl.toFixed(2)),
      todayProfit:       parseFloat(todayProfit.toFixed(2)),
      todayLoss:         parseFloat(todayLoss.toFixed(2)),
      aiConfidence:      parseFloat(avgConf.toFixed(1)),
      directionMode:     settings?.directionMode ?? "BUY",
      runningSymbols:    runningSyms,
      enabled:           settings?.enabled ?? false,
    });
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Failed to fetch dashboard" }); }
});

/* ─── Trade Monitor (positions) ─────────────────────────────────────────── */
router.get("/refer-project/positions", async (req, res) => {
  try {
    const { status, limit = "100" } = req.query as Record<string, string>;
    const query = db.select().from(rpPositionsTable).orderBy(desc(rpPositionsTable.openTime)).limit(parseInt(limit));
    const positions = status
      ? await db.select().from(rpPositionsTable)
          .where(eq(rpPositionsTable.status, status))
          .orderBy(desc(rpPositionsTable.openTime))
          .limit(parseInt(limit))
      : await query;

    const accounts = await db.select({ id: rpAccountsTable.id, accountName: rpAccountsTable.accountName }).from(rpAccountsTable);
    const accMap   = new Map(accounts.map(a => [a.id, a.accountName]));

    const now = Date.now();
    res.json(positions.map(p => {
      const openMs      = new Date(p.openTime).getTime();
      const elapsedSecs = (now - openMs) / 1_000;
      const totalSecs   = p.closeAfterMinutes * 60;
      const remainSecs  = p.status === "open" ? Math.max(0, totalSecs - elapsedSecs) : 0;
      return {
        ...p,
        accountName:      accMap.get(p.accountId) ?? `Account ${p.accountId}`,
        remainingSeconds: Math.round(remainSecs),
        profit:           parseFloat(String(p.profit)),
        openPrice:        parseFloat(String(p.openPrice)),
        closePrice:       p.closePrice ? parseFloat(String(p.closePrice)) : null,
        currentPrice:     p.currentPrice ? parseFloat(String(p.currentPrice)) : null,
        lotSize:          parseFloat(String(p.lotSize)),
        aiConfidence:     p.aiConfidence ? parseFloat(String(p.aiConfidence)) : null,
      };
    }));
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Failed to fetch positions" }); }
});

/* ─── Statistics ─────────────────────────────────────────────────────────── */
router.get("/refer-project/stats", async (req, res) => {
  try {
    const positions = await db.select().from(rpPositionsTable).where(eq(rpPositionsTable.status, "closed"));
    if (positions.length === 0) {
      return void res.json({ totalTrades: 0, winningTrades: 0, losingTrades: 0, winRate: 0,
        avgProfit: 0, avgLoss: 0, avgHoldingMinutes: 0, largestWin: 0, largestLoss: 0,
        totalLots: 0, tradesBySymbol: {}, tradesByAccount: {} });
    }
    const profits  = positions.map(p => parseFloat(String(p.profit)));
    const winning  = profits.filter(p => p > 0);
    const losing   = profits.filter(p => p < 0);
    const holdMins = positions.filter(p => p.closeTime).map(p =>
      (new Date(p.closeTime!).getTime() - new Date(p.openTime).getTime()) / 60_000);

    const tradesBySymbol: Record<string, number>  = {};
    const tradesByAccount: Record<string, number> = {};
    for (const p of positions) {
      tradesBySymbol[p.symbol] = (tradesBySymbol[p.symbol] ?? 0) + 1;
      tradesByAccount[`Account ${p.accountId}`] = (tradesByAccount[`Account ${p.accountId}`] ?? 0) + 1;
    }

    res.json({
      totalTrades:       positions.length,
      winningTrades:     winning.length,
      losingTrades:      losing.length,
      winRate:           parseFloat(((winning.length / positions.length) * 100).toFixed(1)),
      avgProfit:         winning.length ? parseFloat((winning.reduce((a,b)=>a+b,0)/winning.length).toFixed(2)) : 0,
      avgLoss:           losing.length  ? parseFloat((losing.reduce((a,b)=>a+b,0)/losing.length).toFixed(2))  : 0,
      avgHoldingMinutes: holdMins.length ? parseFloat((holdMins.reduce((a,b)=>a+b,0)/holdMins.length).toFixed(1)) : 0,
      largestWin:        winning.length ? parseFloat(Math.max(...winning).toFixed(2)) : 0,
      largestLoss:       losing.length  ? parseFloat(Math.min(...losing).toFixed(2))  : 0,
      totalLots:         parseFloat(positions.reduce((s,p)=>s+parseFloat(String(p.lotSize)),0).toFixed(2)),
      tradesBySymbol,
      tradesByAccount,
    });
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Failed to fetch stats" }); }
});

/* ─── Logs ───────────────────────────────────────────────────────────────── */
router.get("/refer-project/logs", async (req, res) => {
  try {
    const { limit = "200", level, event, accountId } = req.query as Record<string, string>;
    let query = db.select().from(rpLogsTable).orderBy(desc(rpLogsTable.createdAt)).limit(parseInt(limit));
    // Note: for simplicity, filters applied client-side after fetch (DB query already limited)
    let logs = await db.select().from(rpLogsTable).orderBy(desc(rpLogsTable.createdAt)).limit(parseInt(limit));
    if (level)     logs = logs.filter(l => l.level === level);
    if (event)     logs = logs.filter(l => l.event === event);
    if (accountId) logs = logs.filter(l => l.accountId === parseInt(accountId));
    res.json(logs);
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Failed to fetch logs" }); }
});

export default router;
