import {
  db,
  companiesTable,
  companyMembersTable,
  referProjectAccountsTable,
  referProjectAiDecisionsTable,
  referProjectLogsTable,
  referProjectSettingsTable,
  referProjectTradesTable,
} from "@workspace/db";
import { and, desc, eq, gte } from "drizzle-orm";
import { ReferProjectWorkerManager } from "./accountWorkerManager";
import { computeAiDecision } from "./aiDecisionService";
import { encryptCredential } from "./credentials";
import { DEFAULT_REFER_PROJECT_SETTINGS } from "./defaults";
import { evaluateReferProjectRules } from "./ruleEngine";
import type { AiSignalInput, ReferProjectSettingsDto, TradeDirection } from "./types";

function numberValue(value: unknown, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function toSettingsDto(row: typeof referProjectSettingsTable.$inferSelect): ReferProjectSettingsDto {
  return {
    enabled: row.enabled,
    maxOpenPositionsPerAccount: row.maxOpenPositionsPerAccount,
    maxOpenPositionsPerSymbol: row.maxOpenPositionsPerSymbol,
    tradingHours: row.tradingHours,
    allowedSymbols: row.allowedSymbols,
    minimumAiConfidence: row.minimumAiConfidence,
    maximumSpread: numberValue(row.maximumSpread, 30),
    maximumDailyVolumeTarget: numberValue(row.maximumDailyVolumeTarget, 25),
    closeAfterMinutes: row.closeAfterMinutes,
    lotSize: numberValue(row.lotSize, 0.01),
    directionMode: row.directionMode,
    aiWeights: row.aiWeights as ReferProjectSettingsDto["aiWeights"],
  };
}

export class ReferProjectService {
  private workers = new ReferProjectWorkerManager();

  async getCompanyContext(userId: string) {
    const [owned] = await db.select().from(companiesTable).where(eq(companiesTable.ownerId, userId));
    if (owned) {
      return { companyId: owned.id, role: "owner" as const, isAdmin: true };
    }

    const [member] = await db
      .select({
        companyId: companyMembersTable.companyId,
        role: companyMembersTable.role,
      })
      .from(companyMembersTable)
      .where(eq(companyMembersTable.userId, userId));

    if (!member) return null;

    return {
      companyId: member.companyId,
      role: member.role,
      isAdmin: member.role === "owner" || member.role === "admin",
    };
  }

  async ensureSettings(companyId: string) {
    const [existing] = await db.select().from(referProjectSettingsTable).where(eq(referProjectSettingsTable.companyId, companyId));
    if (existing) return existing;

    const [created] = await db.insert(referProjectSettingsTable).values({
      companyId,
      ...DEFAULT_REFER_PROJECT_SETTINGS,
    }).returning();

    return created;
  }

  async getSettings(companyId: string) {
    const row = await this.ensureSettings(companyId);
    return toSettingsDto(row);
  }

  async updateSettings(companyId: string, partial: Partial<ReferProjectSettingsDto>) {
    await this.ensureSettings(companyId);

    const [updated] = await db
      .update(referProjectSettingsTable)
      .set({
        enabled: partial.enabled,
        maxOpenPositionsPerAccount: partial.maxOpenPositionsPerAccount,
        maxOpenPositionsPerSymbol: partial.maxOpenPositionsPerSymbol,
        tradingHours: partial.tradingHours,
        allowedSymbols: partial.allowedSymbols,
        minimumAiConfidence: partial.minimumAiConfidence,
        maximumSpread: partial.maximumSpread !== undefined ? String(partial.maximumSpread) : undefined,
        maximumDailyVolumeTarget:
          partial.maximumDailyVolumeTarget !== undefined ? String(partial.maximumDailyVolumeTarget) : undefined,
        closeAfterMinutes: partial.closeAfterMinutes,
        lotSize: partial.lotSize !== undefined ? String(partial.lotSize) : undefined,
        directionMode: partial.directionMode,
        aiWeights: partial.aiWeights,
      })
      .where(eq(referProjectSettingsTable.companyId, companyId))
      .returning();

    if (updated?.enabled) {
      const accounts = await db
        .select()
        .from(referProjectAccountsTable)
        .where(and(eq(referProjectAccountsTable.companyId, companyId), eq(referProjectAccountsTable.status, "running")));

      for (const account of accounts) {
        this.workers.startAccountWorker(account.id, async (accountId) => this.reconnectAccount(companyId, accountId));
      }
    } else {
      const runningAccounts = await db
        .select()
        .from(referProjectAccountsTable)
        .where(and(eq(referProjectAccountsTable.companyId, companyId), eq(referProjectAccountsTable.status, "running")));

      for (const account of runningAccounts) {
        this.workers.stopAccountWorker(account.id);
      }
    }

    return toSettingsDto(updated);
  }

  async listAccounts(companyId: string) {
    return db
      .select({
        id: referProjectAccountsTable.id,
        accountName: referProjectAccountsTable.accountName,
        mt5Login: referProjectAccountsTable.mt5Login,
        server: referProjectAccountsTable.server,
        brokerName: referProjectAccountsTable.brokerName,
        accountType: referProjectAccountsTable.accountType,
        leverage: referProjectAccountsTable.leverage,
        status: referProjectAccountsTable.status,
        connectionStatus: referProjectAccountsTable.connectionStatus,
        lastSyncTime: referProjectAccountsTable.lastSyncTime,
        createdAt: referProjectAccountsTable.createdAt,
      })
      .from(referProjectAccountsTable)
      .where(eq(referProjectAccountsTable.companyId, companyId))
      .orderBy(desc(referProjectAccountsTable.createdAt));
  }

  async createAccount(companyId: string, input: {
    accountName: string;
    mt5Login: string;
    password: string;
    server: string;
    brokerName?: string;
    accountType?: string;
    leverage?: string;
  }) {
    const [created] = await db.insert(referProjectAccountsTable).values({
      companyId,
      accountName: input.accountName,
      mt5Login: input.mt5Login,
      passwordEncrypted: encryptCredential(input.password),
      server: input.server,
      brokerName: input.brokerName ?? "XM",
      accountType: input.accountType ?? "Ultra Low Standard",
      leverage: input.leverage ?? "1:1000",
      status: "stopped",
      connectionStatus: "disconnected",
    }).returning();

    await this.log(companyId, "LOGIN", `Added account ${created.accountName}`, { accountId: created.id });
    return created;
  }

  async updateAccount(companyId: string, accountId: string, input: Partial<{
    accountName: string;
    mt5Login: string;
    password: string;
    server: string;
    brokerName: string;
    accountType: string;
    leverage: string;
    status: "running" | "stopped" | "error";
    connectionStatus: "connected" | "disconnected" | "reconnecting";
  }>) {
    const [updated] = await db
      .update(referProjectAccountsTable)
      .set({
        accountName: input.accountName,
        mt5Login: input.mt5Login,
        passwordEncrypted: input.password ? encryptCredential(input.password) : undefined,
        server: input.server,
        brokerName: input.brokerName,
        accountType: input.accountType,
        leverage: input.leverage,
        status: input.status,
        connectionStatus: input.connectionStatus,
        lastSyncTime: new Date(),
      })
      .where(and(eq(referProjectAccountsTable.companyId, companyId), eq(referProjectAccountsTable.id, accountId)))
      .returning();

    return updated;
  }

  async removeAccount(companyId: string, accountId: string) {
    this.workers.stopAccountWorker(accountId);
    await db.delete(referProjectAccountsTable).where(and(eq(referProjectAccountsTable.companyId, companyId), eq(referProjectAccountsTable.id, accountId)));
    await this.log(companyId, "LOGOUT", "Removed account", { accountId });
  }

  async startAccount(companyId: string, accountId: string) {
    const settings = await this.getSettings(companyId);
    if (!settings.enabled) return { ok: false, reason: "Refer Project is disabled" };

    const account = await this.updateAccount(companyId, accountId, {
      status: "running",
      connectionStatus: "connected",
    });

    if (!account) return { ok: false, reason: "Account not found" };

    this.workers.startAccountWorker(account.id, async (id) => this.reconnectAccount(companyId, id));
    await this.log(companyId, "CONNECTION", `Account ${account.accountName} connected`, { accountId });
    return { ok: true };
  }

  async stopAccount(companyId: string, accountId: string) {
    const account = await this.updateAccount(companyId, accountId, {
      status: "stopped",
      connectionStatus: "disconnected",
    });

    this.workers.stopAccountWorker(accountId);
    await this.log(companyId, "DISCONNECTION", `Account ${account?.accountName ?? accountId} disconnected`, { accountId });
    return { ok: true };
  }

  async reconnectAccount(companyId: string, accountId: string) {
    const [account] = await db
      .select()
      .from(referProjectAccountsTable)
      .where(and(eq(referProjectAccountsTable.companyId, companyId), eq(referProjectAccountsTable.id, accountId)));

    if (!account || account.status !== "running") return;

    await db
      .update(referProjectAccountsTable)
      .set({ connectionStatus: "connected", lastSyncTime: new Date() })
      .where(eq(referProjectAccountsTable.id, accountId));
  }

  async openTrade(companyId: string, payload: {
    accountId: string;
    symbol: string;
    direction: TradeDirection;
    spread: number;
    aiSignals: AiSignalInput;
  }) {
    const settings = await this.getSettings(companyId);
    if (!settings.enabled) return { opened: false, reason: "Refer Project is disabled" };

    const [account] = await db
      .select()
      .from(referProjectAccountsTable)
      .where(and(eq(referProjectAccountsTable.companyId, companyId), eq(referProjectAccountsTable.id, payload.accountId)));

    if (!account || account.status !== "running") {
      return { opened: false, reason: "Account not running" };
    }

    const openPositions = await db
      .select({ symbol: referProjectTradesTable.symbol, direction: referProjectTradesTable.direction })
      .from(referProjectTradesTable)
      .where(and(
        eq(referProjectTradesTable.companyId, companyId),
        eq(referProjectTradesTable.accountId, payload.accountId),
        eq(referProjectTradesTable.status, "OPEN"),
      ));

    const ruleCheck = evaluateReferProjectRules({
      symbol: payload.symbol,
      direction: payload.direction,
      spread: payload.spread,
      openPositions: openPositions as Array<{ symbol: string; direction: TradeDirection }>,
      settings,
    });

    if (!ruleCheck.allowed) {
      await this.log(companyId, ruleCheck.logEvent ?? "REJECTED_TRADE", ruleCheck.reason ?? "Trade rejected", {
        accountId: payload.accountId,
        symbol: payload.symbol,
      });
      return { opened: false, reason: ruleCheck.reason };
    }

    const decision = computeAiDecision(payload.aiSignals, {
      aiWeights: settings.aiWeights,
      minimumAiConfidence: settings.minimumAiConfidence,
    });

    await db.insert(referProjectAiDecisionsTable).values({
      companyId,
      accountId: payload.accountId,
      symbol: payload.symbol,
      confidence: decision.confidence,
      threshold: settings.minimumAiConfidence,
      decision: decision.shouldTrade ? "OPEN" : "SKIP",
      reason: decision.shouldTrade ? "Confidence threshold met" : "Confidence below threshold",
      factors: payload.aiSignals,
    });

    await this.log(companyId, "AI_DECISION", `AI confidence ${decision.confidence} for ${payload.symbol}`, {
      accountId: payload.accountId,
      confidence: decision.confidence,
      rating: decision.rating,
    });

    if (!decision.shouldTrade) {
      await this.log(companyId, "SKIPPED_TRADE", "Trade skipped due to low confidence", {
        accountId: payload.accountId,
        symbol: payload.symbol,
      });
      return { opened: false, reason: "Confidence below threshold", confidence: decision.confidence };
    }

    const ticket = `RP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const closeAt = new Date(Date.now() + settings.closeAfterMinutes * 60_000);

    const [trade] = await db.insert(referProjectTradesTable).values({
      companyId,
      accountId: payload.accountId,
      ticket,
      symbol: payload.symbol,
      direction: payload.direction,
      lot: String(settings.lotSize),
      status: "OPEN",
      confidence: decision.confidence,
      marketDirection: payload.direction,
      openTime: new Date(),
      closeTime: closeAt,
    }).returning();

    this.workers.scheduleTimerClose(payload.accountId, trade.id, closeAt, async (tradeId, accountId) => {
      await this.closeTrade(companyId, tradeId, accountId, "TIMER_CLOSE");
    });

    await this.log(companyId, "TRADE_OPEN", `Opened ${payload.direction} ${payload.symbol}`, {
      accountId: payload.accountId,
      tradeId: trade.id,
      confidence: decision.confidence,
    });

    return { opened: true, tradeId: trade.id, confidence: decision.confidence, closeAt };
  }

  async closeTrade(companyId: string, tradeId: string, accountId: string, closeReason: "TIMER_CLOSE" | "MANUAL_CLOSE" | "BROKER_REJECT" | "SYSTEM_CLOSE") {
    const pnl = (Math.random() * 20 - 10).toFixed(2);

    const [trade] = await db
      .update(referProjectTradesTable)
      .set({
        status: "CLOSED",
        closeReason,
        closeTime: new Date(),
        profitLoss: pnl,
      })
      .where(and(eq(referProjectTradesTable.companyId, companyId), eq(referProjectTradesTable.id, tradeId)))
      .returning();

    this.workers.clearTradeTimer(accountId, tradeId);

    await this.log(companyId, closeReason === "TIMER_CLOSE" ? "TIMER_CLOSE" : "TRADE_CLOSE", `Closed trade ${trade?.ticket ?? tradeId}`, {
      accountId,
      tradeId,
      closeReason,
      profitLoss: pnl,
    });

    return trade;
  }

  async getDashboard(companyId: string) {
    const settings = await this.getSettings(companyId);
    const accounts = await db.select().from(referProjectAccountsTable).where(eq(referProjectAccountsTable.companyId, companyId));
    const trades = await db.select().from(referProjectTradesTable).where(eq(referProjectTradesTable.companyId, companyId));

    const openTrades = trades.filter((trade) => trade.status === "OPEN");
    const closedTrades = trades.filter((trade) => trade.status === "CLOSED");

    const now = new Date();
    const dayStart = new Date(now);
    dayStart.setHours(0, 0, 0, 0);

    const tradesToday = trades.filter((trade) => new Date(trade.openTime) >= dayStart);
    const todayClosed = closedTrades.filter((trade) => trade.closeTime && new Date(trade.closeTime) >= dayStart);

    const todayProfit = todayClosed
      .map((trade) => numberValue(trade.profitLoss, 0))
      .filter((profit) => profit > 0)
      .reduce((sum, profit) => sum + profit, 0);

    const todayLoss = todayClosed
      .map((trade) => numberValue(trade.profitLoss, 0))
      .filter((profit) => profit < 0)
      .reduce((sum, profit) => sum + Math.abs(profit), 0);

    const totalLots = trades.reduce((sum, trade) => sum + numberValue(trade.lot, 0), 0);
    const floatingPl = openTrades.reduce((sum, trade) => sum + numberValue(trade.profitLoss, 0), 0);
    const avgConfidence = closedTrades.length
      ? Math.round(closedTrades.reduce((sum, trade) => sum + numberValue(trade.confidence, 0), 0) / closedTrades.length)
      : 0;

    return {
      connectedAccounts: accounts.length,
      runningAccounts: accounts.filter((account) => account.status === "running").length,
      stoppedAccounts: accounts.filter((account) => account.status !== "running").length,
      openPositions: openTrades.length,
      tradesToday: tradesToday.length,
      closedTrades: closedTrades.length,
      totalLots,
      currentFloatingPL: floatingPl,
      todaysProfit: todayProfit,
      todaysLoss: todayLoss,
      aiConfidence: avgConfidence,
      currentMarketDirection: settings.directionMode === "BUY_ONLY" ? "BUY" : "SELL",
      runningSymbols: Array.from(new Set(openTrades.map((trade) => trade.symbol))),
    };
  }

  async getTradeMonitor(companyId: string) {
    const rows = await db
      .select({
        id: referProjectTradesTable.id,
        ticket: referProjectTradesTable.ticket,
        accountId: referProjectTradesTable.accountId,
        accountName: referProjectAccountsTable.accountName,
        pair: referProjectTradesTable.symbol,
        direction: referProjectTradesTable.direction,
        lot: referProjectTradesTable.lot,
        openTime: referProjectTradesTable.openTime,
        closeTime: referProjectTradesTable.closeTime,
        profitLoss: referProjectTradesTable.profitLoss,
        status: referProjectTradesTable.status,
        closeReason: referProjectTradesTable.closeReason,
      })
      .from(referProjectTradesTable)
      .innerJoin(referProjectAccountsTable, eq(referProjectTradesTable.accountId, referProjectAccountsTable.id))
      .where(eq(referProjectTradesTable.companyId, companyId))
      .orderBy(desc(referProjectTradesTable.openTime));

    return rows.map((row) => {
      const deadline = row.closeTime ? new Date(row.closeTime).getTime() : null;
      const remainingMs = deadline ? Math.max(0, deadline - Date.now()) : 0;
      return {
        ...row,
        remainingTimeSeconds: Math.floor(remainingMs / 1000),
      };
    });
  }

  async getStatistics(companyId: string) {
    const trades = await db.select().from(referProjectTradesTable).where(eq(referProjectTradesTable.companyId, companyId));
    const closed = trades.filter((trade) => trade.status === "CLOSED");
    const wins = closed.filter((trade) => numberValue(trade.profitLoss) > 0);
    const losses = closed.filter((trade) => numberValue(trade.profitLoss) < 0);

    const averageHoldingSeconds = closed.length
      ? closed.reduce((sum, trade) => {
          if (!trade.closeTime) return sum;
          return sum + (new Date(trade.closeTime).getTime() - new Date(trade.openTime).getTime()) / 1000;
        }, 0) / closed.length
      : 0;

    const tradesPerSymbol = trades.reduce<Record<string, number>>((acc, trade) => {
      acc[trade.symbol] = (acc[trade.symbol] ?? 0) + 1;
      return acc;
    }, {});

    const tradesPerAccount = trades.reduce<Record<string, number>>((acc, trade) => {
      acc[trade.accountId] = (acc[trade.accountId] ?? 0) + 1;
      return acc;
    }, {});

    return {
      totalTrades: trades.length,
      winningTrades: wins.length,
      losingTrades: losses.length,
      winRate: closed.length ? Math.round((wins.length / closed.length) * 100) : 0,
      averageProfit: wins.length ? wins.reduce((sum, trade) => sum + numberValue(trade.profitLoss), 0) / wins.length : 0,
      averageLoss: losses.length ? losses.reduce((sum, trade) => sum + Math.abs(numberValue(trade.profitLoss)), 0) / losses.length : 0,
      averageHoldingTimeSeconds: Math.round(averageHoldingSeconds),
      largestWin: wins.length ? Math.max(...wins.map((trade) => numberValue(trade.profitLoss))) : 0,
      largestLoss: losses.length ? Math.min(...losses.map((trade) => numberValue(trade.profitLoss))) : 0,
      totalLots: trades.reduce((sum, trade) => sum + numberValue(trade.lot), 0),
      tradesPerSymbol,
      tradesPerAccount,
    };
  }

  async getVolumeTracking(companyId: string) {
    const now = new Date();
    const dayStart = new Date(now); dayStart.setHours(0, 0, 0, 0);

    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [todayTrades, weekTrades, monthTrades, allTrades] = await Promise.all([
      db.select().from(referProjectTradesTable).where(and(eq(referProjectTradesTable.companyId, companyId), gte(referProjectTradesTable.openTime, dayStart))),
      db.select().from(referProjectTradesTable).where(and(eq(referProjectTradesTable.companyId, companyId), gte(referProjectTradesTable.openTime, weekStart))),
      db.select().from(referProjectTradesTable).where(and(eq(referProjectTradesTable.companyId, companyId), gte(referProjectTradesTable.openTime, monthStart))),
      db.select().from(referProjectTradesTable).where(eq(referProjectTradesTable.companyId, companyId)),
    ]);

    const total = (rows: typeof allTrades) => rows.reduce((sum, trade) => sum + numberValue(trade.lot), 0);

    const perAccount = allTrades.reduce<Record<string, number>>((acc, trade) => {
      acc[trade.accountId] = (acc[trade.accountId] ?? 0) + numberValue(trade.lot);
      return acc;
    }, {});

    const perSymbol = allTrades.reduce<Record<string, number>>((acc, trade) => {
      acc[trade.symbol] = (acc[trade.symbol] ?? 0) + numberValue(trade.lot);
      return acc;
    }, {});

    return {
      today: total(todayTrades),
      week: total(weekTrades),
      month: total(monthTrades),
      total: total(allTrades),
      perAccount,
      perSymbol,
    };
  }

  async getLogs(companyId: string, limit = 200) {
    return db
      .select()
      .from(referProjectLogsTable)
      .where(eq(referProjectLogsTable.companyId, companyId))
      .orderBy(desc(referProjectLogsTable.createdAt))
      .limit(limit);
  }

  async getAiOverview(companyId: string) {
    const settings = await this.getSettings(companyId);
    const latest = await db
      .select()
      .from(referProjectAiDecisionsTable)
      .where(eq(referProjectAiDecisionsTable.companyId, companyId))
      .orderBy(desc(referProjectAiDecisionsTable.createdAt))
      .limit(20);

    return {
      threshold: settings.minimumAiConfidence,
      weights: settings.aiWeights,
      latest,
    };
  }

  async recoverWorkers() {
    const enabledSettings = await db
      .select({ companyId: referProjectSettingsTable.companyId })
      .from(referProjectSettingsTable)
      .where(eq(referProjectSettingsTable.enabled, true));

    const enabledCompanyIds = new Set(enabledSettings.map((item) => item.companyId));

    const runningAccounts = await db
      .select({
        companyId: referProjectAccountsTable.companyId,
        accountId: referProjectAccountsTable.id,
      })
      .from(referProjectAccountsTable)
      .where(eq(referProjectAccountsTable.status, "running"));

    const openTrades = await db
      .select({
        tradeId: referProjectTradesTable.id,
        accountId: referProjectTradesTable.accountId,
        companyId: referProjectTradesTable.companyId,
        closeTime: referProjectTradesTable.closeTime,
      })
      .from(referProjectTradesTable)
      .where(eq(referProjectTradesTable.status, "OPEN"));

    const recoverableAccounts = runningAccounts.filter((row) => enabledCompanyIds.has(row.companyId));
    const recoverableTrades = openTrades.filter((row) => enabledCompanyIds.has(row.companyId));
    const accountIds = recoverableAccounts.map((row) => row.accountId);

    this.workers.recover(
      accountIds,
      recoverableTrades
        .filter((trade) => trade.closeTime)
        .map((trade) => ({
          accountId: trade.accountId,
          tradeId: trade.tradeId,
          closeAt: trade.closeTime as Date,
        })),
      async (accountId) => {
        const account = recoverableAccounts.find((row) => row.accountId === accountId);
        if (!account) return;
        await this.reconnectAccount(account.companyId, accountId);
      },
      async (tradeId, accountId) => {
        const trade = recoverableTrades.find((item) => item.tradeId === tradeId);
        if (!trade) return;
        await this.closeTrade(trade.companyId, tradeId, accountId, "TIMER_CLOSE");
      },
    );
  }

  async log(
    companyId: string,
    eventType: typeof referProjectLogsTable.$inferInsert.eventType,
    message: string,
    metadata: Record<string, unknown> = {},
    accountId?: string,
  ) {
    await db.insert(referProjectLogsTable).values({
      companyId,
      accountId,
      eventType,
      message,
      metadata,
    });
  }
}

export const referProjectService = new ReferProjectService();

void referProjectService.recoverWorkers().then(async () => {
  const companies = await db.select({ companyId: referProjectSettingsTable.companyId }).from(referProjectSettingsTable).where(eq(referProjectSettingsTable.enabled, true));
  for (const company of companies) {
    await referProjectService.log(company.companyId, "SYSTEM_RESTART", "Refer Project workers recovered after restart");
  }
});
