import { Router } from "express";
import { db, botsTable, brokersTable, tradesTable, performanceSnapshotsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { generateSignal, STRATEGY_TEMPLATES } from "../lib/strategyEngine";

const router = Router();

router.get("/dashboard/summary", async (req, res) => {
  try {
    const [brokers, bots, snapshots] = await Promise.all([
      db.select().from(brokersTable),
      db.select().from(botsTable),
      db.select().from(performanceSnapshotsTable).orderBy(desc(performanceSnapshotsTable.snapshotDate)).limit(30),
    ]);

    const running = bots.filter(b => b.status === "RUNNING").length;
    const totalEquity = brokers.reduce((s, b) => s + parseFloat(b.equity), 0);
    const totalBalance = brokers.reduce((s, b) => s + parseFloat(b.balance), 0);
    const dailyProfit = bots.reduce((s, b) => s + parseFloat(b.pnlToday), 0);
    const winRates = bots.filter(b => parseFloat(b.winRate) > 0).map(b => parseFloat(b.winRate));
    const avgWinRate = winRates.length ? winRates.reduce((a, b) => a + b, 0) / winRates.length : 0;

    const totalReturn = totalBalance > 0 && totalEquity > 0
      ? parseFloat(((totalEquity - totalBalance) / totalBalance * 100).toFixed(2))
      : 0;

    const latestSnapshot = snapshots[0];
    const sharpeRatio = latestSnapshot ? parseFloat(String(latestSnapshot.sharpeRatio)) : 0;
    const maxDrawdown = latestSnapshot ? parseFloat(String(latestSnapshot.maxDrawdown)) : 0;

    const prevEquity = snapshots.length >= 2 ? parseFloat(String(snapshots[1].equity)) : totalEquity;
    const equityChange24h = prevEquity > 0 && totalEquity > 0
      ? parseFloat(((totalEquity - prevEquity) / prevEquity * 100).toFixed(2))
      : 0;

    res.json({
      totalEquity,
      dailyProfit,
      activeBots: running,
      winRate: parseFloat(avgWinRate.toFixed(1)),
      totalReturn,
      sharpeRatio: parseFloat(sharpeRatio.toFixed(2)),
      maxDrawdown: parseFloat(maxDrawdown.toFixed(2)),
      equityChange24h,
      profitChange: 0,
      newBots: 0,
      winRateChange: 0,
    });
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/dashboard/equity-curve", async (req, res) => {
  try {
    const { getSnapshots, buildEquityCurve } = await import("../lib/analyticsEngine");
    const snapshots = await getSnapshots(31);
    if (snapshots.length >= 5) {
      return res.json(buildEquityCurve(snapshots));
    }

    const brokers = await db.select().from(brokersTable);
    const totalEquity = brokers.reduce((s, b) => s + parseFloat(b.equity), 0);

    if (totalEquity === 0) {
      return res.json([]);
    }

    const points = [];
    const start = new Date();
    start.setDate(start.getDate() - 30);

    for (let i = 0; i < 31; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const equity = i === 30 ? totalEquity : totalEquity;
      points.push({
        date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        equity: Math.round(equity),
        buyHold: Math.round(equity),
      });
    }
    res.json(points);
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/dashboard/recent-trades", async (req, res) => {
  try {
    const trades = await db.select().from(tradesTable).orderBy(desc(tradesTable.createdAt)).limit(10);
    res.json(trades.map(t => ({
      id: t.id, symbol: t.symbol, type: t.type,
      size: parseFloat(t.size), profit: parseFloat(t.profit), time: t.time,
      entryPrice: t.entryPrice ? parseFloat(t.entryPrice) : null,
      exitPrice: t.exitPrice ? parseFloat(t.exitPrice) : null,
    })));
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/dashboard/signals", async (req, res) => {
  try {
    const PAIRS = [
      { symbol: "EURUSD", assetClass: "Major", atr: 0.0012 },
      { symbol: "XAUUSD", assetClass: "Metals", atr: 8 },
      { symbol: "BTCUSD", assetClass: "Crypto", atr: 250 },
      { symbol: "GBPUSD", assetClass: "Major", atr: 0.0014 },
    ];

    const signals = PAIRS.map((pair, i) => {
      const template = STRATEGY_TEMPLATES[i % STRATEGY_TEMPLATES.length];
      const signal = generateSignal(template.id, pair.symbol, pair.atr);
      const basePrices: Record<string, number> = {
        EURUSD: 1.0850, XAUUSD: 2340, BTCUSD: 67500, GBPUSD: 1.2650,
      };
      return {
        id: i + 1,
        symbol: pair.symbol,
        direction: signal.action === "HOLD" ? "BUY" : signal.action,
        confidence: signal.confidence,
        price: basePrices[pair.symbol] ?? 1.0,
        change: parseFloat(((Math.random() - 0.5) * 0.5).toFixed(2)),
        assetClass: pair.assetClass,
      };
    });

    res.json(signals);
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/dashboard/active-bots", async (req, res) => {
  try {
    const bots = await db.select().from(botsTable).where(eq(botsTable.status, "RUNNING")).limit(5);
    res.json(bots.map(b => ({
      id: b.id, name: b.name, strategy: b.strategy, symbol: b.market,
      status: b.status, pnlToday: parseFloat(b.pnlToday), pnlAllTime: parseFloat(b.pnlAllTime),
    })));
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/dashboard/connected-accounts", async (req, res) => {
  try {
    const brokers = await db.select().from(brokersTable).limit(5);
    res.json(brokers.map(b => ({
      id: b.id, broker: b.broker, platform: b.platform, accountNumber: b.accountNumber,
      equity: parseFloat(b.equity), balance: parseFloat(b.balance), profit: parseFloat(b.profit),
      profitPercent: parseFloat(b.profitPercent), status: b.status, server: b.server, isConnected: b.isConnected,
    })));
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
