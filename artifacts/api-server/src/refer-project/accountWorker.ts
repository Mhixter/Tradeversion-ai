/**
 * Refer Project — Account Worker
 * Independent trading loop for one XM MT5 account.
 * Isolated: failures here do NOT affect other accounts or the rest of the app.
 */
import { db } from "@workspace/db";
import { rpAccountsTable, rpPositionsTable, rpSettingsTable, rpAiConfigTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";
import { SimulatedMT5Connector } from "./mt5Connector.js";
import type { MT5Connector } from "./mt5Connector.js";
import { MetaApiRestConnector } from "./metaApiConnector.js";
import { computeAIScore } from "./aiEngine.js";
import { rpLog } from "./rpLogger.js";
import type { RPSettings, AIWeights, AIThresholds } from "./types.js";
import { DEFAULT_SYMBOLS } from "./types.js";

const TICK_INTERVAL_MS = 30_000; // 30 seconds

/* ── Worker class ────────────────────────────────────────────────────────── */
export class AccountWorker {
  private running   = false;
  private connector: MT5Connector;
  private usingMetaApi = false;
  private handle:    ReturnType<typeof setTimeout> | null = null;

  constructor(private readonly accountId: number) {
    this.connector = new SimulatedMT5Connector(); // overridden in initConnector()
  }

  /**
   * Choose the right connector based on env and account credentials.
   * MetaApiRestConnector is used when METAAPI_TOKEN is set and the account
   * has a tradingPassword stored. Falls back to SimulatedMT5Connector.
   */
  private async initConnector(): Promise<void> {
    const token = process.env.METAAPI_TOKEN;
    if (!token) return;

    const [account] = await db.select().from(rpAccountsTable)
      .where(eq(rpAccountsTable.id, this.accountId)).limit(1);

    if (!account?.tradingPassword) return; // no credentials → simulated

    this.connector   = new MetaApiRestConnector(
      token,
      account.mt5Login,
      account.tradingPassword,
      account.server,
      account.accountName,
      this.accountId,
      account.metaApiAccountId ?? null,
    );
    this.usingMetaApi = true;
  }

  /** Start the worker loop. Idempotent. */
  async start(): Promise<void> {
    if (this.running) return;
    this.running = true;

    try {
      // Choose connector before connecting (inside try so DB errors are caught)
      await this.initConnector();

      await db.update(rpAccountsTable)
        .set({ connectionStatus: "connecting", updatedAt: new Date() })
        .where(eq(rpAccountsTable.id, this.accountId));

      // connect() now returns { ok, error? } so we can surface the real error in Event Logs
      const connectResult = this.usingMetaApi
        ? await (this.connector as import("./metaApiConnector.js").MetaApiRestConnector).connect()
        : { ok: await this.connector.connect() };

      const ok = connectResult.ok;
      const connectError = "error" in connectResult ? connectResult.error : undefined;

      // If MetaApi connector fails, do NOT fall back to simulation.
      // Log the REAL error so the user can fix it without digging into Railway raw logs.
      if (!ok && this.usingMetaApi) {
        await rpLog({ event: "ERROR", accountId: this.accountId, level: "error",
          message: `MetaApi connect failed: ${connectError ?? "unknown error"}` });
        this.running = false;
        await db.update(rpAccountsTable)
          .set({ connectionStatus: "error", status: "error", updatedAt: new Date() })
          .where(eq(rpAccountsTable.id, this.accountId));
        return;
      }

      const status = ok ? "connected" : "error";

      await db.update(rpAccountsTable)
        .set({ connectionStatus: status, status: ok ? "active" : "error", lastSyncTime: new Date(), updatedAt: new Date() })
        .where(eq(rpAccountsTable.id, this.accountId));

      await rpLog({ event: ok ? "CONNECTION" : "ERROR", accountId: this.accountId,
        message: ok ? `Account ${this.accountId} connected` : `Account ${this.accountId} failed to connect`,
        level: ok ? "info" : "error" });

      if (!ok) { this.running = false; return; }
    } catch (err) {
      this.running = false;
      await rpLog({ event: "ERROR", accountId: this.accountId,
        message: `Worker startup error: ${String(err)}`, level: "error" });
      return;
    }

    // Begin the tick loop
    this.scheduleTick();
  }

  /** Stop the worker cleanly. */
  async stop(): Promise<void> {
    this.running = false;
    if (this.handle) { clearTimeout(this.handle); this.handle = null; }
    try {
      await this.connector.disconnect();
      await db.update(rpAccountsTable)
        .set({ connectionStatus: "disconnected", status: "inactive", updatedAt: new Date() })
        .where(eq(rpAccountsTable.id, this.accountId));
      await rpLog({ event: "DISCONNECTION", accountId: this.accountId,
        message: `Account ${this.accountId} disconnected` });
    } catch { /* best-effort */ }
  }

  isRunning(): boolean { return this.running; }

  /* ── Private ─────────────────────────────────────────────────────────── */

  private scheduleTick(): void {
    if (!this.running) return;
    this.handle = setTimeout(() => this.tick().catch(() => {}).finally(() => this.scheduleTick()), TICK_INTERVAL_MS);
  }

  private async tick(): Promise<void> {
    if (!this.running) return;

    // Reconnect if needed (before anything else)
    if (!this.connector.isConnected()) {
      await rpLog({ event: "CONNECTION", accountId: this.accountId, message: "Reconnecting...", level: "warn" });
      const ok = await this.connector.connect();
      if (!ok) return;
    }

    /* 1. Always update account balance/equity — regardless of whether trading is enabled */
    let currentBalance = -1; // -1 = unknown (error case)
    try {
      const info = await this.connector.getAccountInfo();
      currentBalance = info.balance;
      await db.update(rpAccountsTable)
        .set({ balance: String(info.balance.toFixed(2)), equity: String(info.equity.toFixed(2)), lastSyncTime: new Date(), updatedAt: new Date() })
        .where(eq(rpAccountsTable.id, this.accountId));
      await rpLog({ event: "CONNECTION", accountId: this.accountId, level: "info",
        message: `Balance synced: ${info.balance.toFixed(2)} | Equity: ${info.equity.toFixed(2)}`,
        details: { balance: info.balance, equity: info.equity, freeMargin: info.freeMargin } });
    } catch (err) {
      await rpLog({ event: "ERROR", accountId: this.accountId, level: "warn",
        message: `getAccountInfo failed: ${String(err)}` });
    }

    const [settings, aiConfig] = await Promise.all([this.getSettings(), this.getAIConfig()]);

    /* 2. Process open positions: update P&L + close timers */
    if (settings) await this.processOpenPositions(settings);

    /* 3. Open new positions only when trading is enabled.
          When using MetaApi (live data) and the real balance is $0,
          skip silently — no log spam. */
    if (!settings || !settings.enabled) return;
    if (this.usingMetaApi && currentBalance === 0) return;

    if (this.withinTradingHours(settings)) {
      await this.tryOpenPositions(settings, aiConfig);
    }
  }

  private async processOpenPositions(settings: RPSettings): Promise<void> {
    const openPositions = await db.select()
      .from(rpPositionsTable)
      .where(and(eq(rpPositionsTable.accountId, this.accountId), eq(rpPositionsTable.status, "open")));

    const connectorPositions = await this.connector.getOpenPositions();
    const connMap = new Map(connectorPositions.map(p => [p.ticket, p]));

    for (const pos of openPositions) {
      const connPos = connMap.get(pos.ticket);
      const currentPrice = connPos?.currentPrice ?? parseFloat(String(pos.openPrice));
      const profit       = connPos?.profit ?? 0;

      // Check timer
      const elapsedMinutes = (Date.now() - new Date(pos.openTime).getTime()) / 60_000;
      const shouldClose    = elapsedMinutes >= (pos.closeAfterMinutes ?? settings.closeAfterMinutes);

      if (shouldClose) {
        try {
          await this.connector.closePosition(pos.ticket);
          await db.update(rpPositionsTable)
            .set({ status: "closed", closePrice: String(currentPrice.toFixed(5)),
              profit: String(profit.toFixed(2)), closeTime: new Date(), closeReason: "timer" })
            .where(eq(rpPositionsTable.id, pos.id));
          await rpLog({ event: "TIMER_CLOSE", accountId: this.accountId,
            message: `Closed ${pos.symbol} ${pos.direction} after ${elapsedMinutes.toFixed(1)}m | P&L: ${profit >= 0 ? "+" : ""}${profit.toFixed(2)}`,
            details: { ticket: pos.ticket, symbol: pos.symbol, profit, elapsedMinutes } });
        } catch (err) {
          await rpLog({ event: "ERROR", accountId: this.accountId,
            message: `Failed to close position ${pos.ticket}: ${String(err)}`, level: "error" });
        }
      } else {
        // Update floating P&L
        await db.update(rpPositionsTable)
          .set({ currentPrice: String(currentPrice.toFixed(5)), profit: String(profit.toFixed(2)) })
          .where(eq(rpPositionsTable.id, pos.id));
      }
    }
  }

  private async tryOpenPositions(settings: RPSettings, aiConfig: { weights: AIWeights; thresholds: AIThresholds }): Promise<void> {
    const symbols = settings.allowedSymbols.length > 0 ? settings.allowedSymbols : DEFAULT_SYMBOLS;

    // Count current open positions for this account
    const openPositions = await db.select({ symbol: rpPositionsTable.symbol, direction: rpPositionsTable.direction })
      .from(rpPositionsTable)
      .where(and(eq(rpPositionsTable.accountId, this.accountId), eq(rpPositionsTable.status, "open")));

    const totalOpen     = openPositions.length;
    const openBySymbol  = new Map<string, { directions: Set<string>; count: number }>();
    for (const p of openPositions) {
      const entry = openBySymbol.get(p.symbol) ?? { directions: new Set(), count: 0 };
      entry.directions.add(p.direction);
      entry.count++;
      openBySymbol.set(p.symbol, entry);
    }

    if (totalOpen >= settings.maxPositionsPerAccount) return;

    // Track positions opened during this tick (const totalOpen is the pre-tick snapshot)
    let openedThisTick = 0;

    for (const symbol of symbols) {
      if (!this.running) break;
      // Guard: check live running total before each attempt
      if (totalOpen + openedThisTick >= settings.maxPositionsPerAccount) break;

      const symData = openBySymbol.get(symbol);
      // Hedge check: if ANY opposite direction exists on this symbol, skip
      if (symData?.directions.has(settings.directionMode === "BUY" ? "SELL" : "BUY")) {
        await rpLog({ event: "REJECTED_TRADE", accountId: this.accountId, level: "warn",
          message: `Hedge rejected for ${symbol} — opposite direction already open` });
        continue;
      }
      // Max per symbol
      if ((symData?.count ?? 0) >= settings.maxPositionsPerSymbol) continue;

      try {
        const tick = await this.connector.getTick(symbol);
        // Spread check
        if (tick.spread > settings.maxSpread) {
          await rpLog({ event: "SPREAD_TOO_HIGH", accountId: this.accountId, level: "warn",
            message: `Skipped ${symbol}: spread ${tick.spread.toFixed(5)} > max ${settings.maxSpread}` });
          continue;
        }

        const candles = await this.connector.getCandles(symbol, 200);
        const aiResult = computeAIScore(symbol, candles, tick.spread, aiConfig.weights, aiConfig.thresholds, settings);

        await rpLog({ event: "AI_DECISION", accountId: this.accountId,
          message: `${symbol}: confidence=${aiResult.confidence} signal=${aiResult.signal}`,
          details: { symbol, confidence: aiResult.confidence, signal: aiResult.signal, rsi: aiResult.rsi } });

        if (aiResult.confidence < settings.minAiConfidence || aiResult.signal === "SKIP") {
          await rpLog({ event: "SKIPPED_TRADE", accountId: this.accountId,
            message: `Skipped ${symbol}: confidence ${aiResult.confidence} below threshold ${settings.minAiConfidence}` });
          continue;
        }

        // Open position
        const ticket = await this.connector.openPosition(symbol, settings.directionMode, settings.lotSize);
        const price  = settings.directionMode === "BUY" ? tick.ask : tick.bid;

        await db.insert(rpPositionsTable).values({
          accountId:         this.accountId,
          ticket,
          symbol,
          direction:         settings.directionMode,
          lotSize:           String(settings.lotSize),
          openPrice:         String(price.toFixed(5)),
          currentPrice:      String(price.toFixed(5)),
          openTime:          new Date(),
          closeAfterMinutes: settings.closeAfterMinutes,
          status:            "open",
          aiConfidence:      String(aiResult.confidence),
          aiDetails:         aiResult as unknown as Record<string, unknown>,
        });

        openedThisTick++;
        // Update symbol map so subsequent symbols see the correct count
        const existing = openBySymbol.get(symbol) ?? { directions: new Set(), count: 0 };
        existing.directions.add(settings.directionMode);
        existing.count++;
        openBySymbol.set(symbol, existing);

        await rpLog({ event: "TRADE_OPEN", accountId: this.accountId,
          message: `Opened ${settings.directionMode} ${symbol} @ ${price.toFixed(5)} | confidence=${aiResult.confidence}`,
          details: { ticket, symbol, direction: settings.directionMode, price, confidence: aiResult.confidence } });
      } catch (err) {
        await rpLog({ event: "ERROR", accountId: this.accountId, level: "error",
          message: `Error processing ${symbol}: ${String(err)}` });
      }
    }
  }

  private withinTradingHours(settings: RPSettings): boolean {
    const now  = new Date();
    const hhmm = `${String(now.getUTCHours()).padStart(2, "0")}:${String(now.getUTCMinutes()).padStart(2, "0")}`;
    return hhmm >= settings.tradingHoursStart && hhmm <= settings.tradingHoursEnd;
  }

  private async getSettings(): Promise<RPSettings | null> {
    const [row] = await db.select().from(rpSettingsTable).where(eq(rpSettingsTable.id, 1)).limit(1);
    if (!row) return null;
    return {
      enabled:                row.enabled,
      maxPositionsPerAccount: row.maxPositionsPerAccount,
      maxPositionsPerSymbol:  row.maxPositionsPerSymbol,
      tradingHoursStart:      row.tradingHoursStart,
      tradingHoursEnd:        row.tradingHoursEnd,
      allowedSymbols:         row.allowedSymbols ?? DEFAULT_SYMBOLS,
      minAiConfidence:        parseFloat(String(row.minAiConfidence)),
      maxSpread:              parseFloat(String(row.maxSpread)),
      maxDailyVolume:         parseFloat(String(row.maxDailyVolume)),
      closeAfterMinutes:      row.closeAfterMinutes,
      lotSize:                parseFloat(String(row.lotSize)),
      directionMode:          row.directionMode as "BUY" | "SELL",
    };
  }

  private async getAIConfig(): Promise<{ weights: AIWeights; thresholds: AIThresholds }> {
    const [row] = await db.select().from(rpAiConfigTable).where(eq(rpAiConfigTable.id, 1)).limit(1);
    const defaults = { weights: { trend:30, momentum:20, volatility:15, supportResistance:15, spread:10, marketStructure:10 }, thresholds: { strong:80, medium:65 } };
    if (!row) return defaults;
    return {
      weights: {
        trend:            parseFloat(String(row.weightTrend)),
        momentum:         parseFloat(String(row.weightMomentum)),
        volatility:       parseFloat(String(row.weightVolatility)),
        supportResistance:parseFloat(String(row.weightSupportResistance)),
        spread:           parseFloat(String(row.weightSpread)),
        marketStructure:  parseFloat(String(row.weightMarketStructure)),
      },
      thresholds: {
        strong: parseFloat(String(row.thresholdStrong)),
        medium: parseFloat(String(row.thresholdMedium)),
      },
    };
  }
}
