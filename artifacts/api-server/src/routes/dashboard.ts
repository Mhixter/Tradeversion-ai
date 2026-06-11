import { Router } from "express";
import { db, botsTable, brokersTable, tradesTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router = Router();

router.get("/dashboard/summary", async (req, res) => {
  try {
    const brokers = await db.select().from(brokersTable);
    const bots = await db.select().from(botsTable);
    const running = bots.filter(b => b.status === "RUNNING").length;
    const totalEquity = brokers.reduce((s, b) => s + parseFloat(b.equity), 0);
    const dailyProfit = bots.reduce((s, b) => s + parseFloat(b.pnlToday), 0);
    const winRates = bots.filter(b => parseFloat(b.winRate) > 0).map(b => parseFloat(b.winRate));
    const avgWinRate = winRates.length ? winRates.reduce((a, b) => a + b, 0) / winRates.length : 78.4;
    res.json({
      totalEquity: totalEquity || 245000,
      dailyProfit: dailyProfit || 3540,
      activeBots: running || 12,
      winRate: avgWinRate,
      totalReturn: 18.45,
      sharpeRatio: 2.14,
      maxDrawdown: 4.12,
      equityChange24h: 4.8,
      profitChange: 2.15,
      newBots: 2,
      winRateChange: 5.6,
    });
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/dashboard/equity-curve", async (req, res) => {
  try {
    const points = [];
    const start = new Date("2024-05-01");
    let equity = 152640;
    let buyHold = 140000;
    for (let i = 0; i < 31; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      equity += (Math.random() - 0.35) * 3000;
      buyHold += (Math.random() - 0.4) * 2000;
      if (i === 30) equity = 245000;
      points.push({
        date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        equity: Math.round(equity),
        buyHold: Math.round(buyHold),
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
    res.json(trades.length ? trades.map(t => ({
      id: t.id, symbol: t.symbol, type: t.type,
      size: parseFloat(t.size), profit: parseFloat(t.profit), time: t.time,
      entryPrice: t.entryPrice ? parseFloat(t.entryPrice) : null,
      exitPrice: t.exitPrice ? parseFloat(t.exitPrice) : null,
    })) : [
      { id: 1, symbol: "EURUSD", type: "BUY", size: 1.00, profit: 125.50, time: "10:24 AM", entryPrice: 1.08345, exitPrice: 1.08567 },
      { id: 2, symbol: "XAUUSD", type: "SELL", size: 0.50, profit: -230.40, time: "10:15 AM", entryPrice: 2345.40, exitPrice: 2340.20 },
      { id: 3, symbol: "GBPUSD", type: "BUY", size: 1.50, profit: 98.20, time: "10:10 AM", entryPrice: 1.26500, exitPrice: 1.26712 },
      { id: 4, symbol: "BTCUSD", type: "BUY", size: 0.10, profit: 540.30, time: "10:05 AM", entryPrice: 61250.00, exitPrice: 66800.00 },
      { id: 5, symbol: "USDJPY", type: "SELL", size: 1.00, profit: -45.20, time: "09:58 AM", entryPrice: 156.245, exitPrice: 156.567 },
    ]);
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/dashboard/signals", async (req, res) => {
  res.json([
    { id: 1, symbol: "EURUSD", direction: "BUY", confidence: 92, price: 1.11835, change: 0.25, assetClass: "Major" },
    { id: 2, symbol: "XAUUSD", direction: "SELL", confidence: 84, price: 2345.40, change: -0.35, assetClass: "Metals" },
    { id: 3, symbol: "BTCUSD", direction: "BUY", confidence: 87, price: 68540.00, change: 1.25, assetClass: "Crypto" },
    { id: 4, symbol: "GBPUSD", direction: "BUY", confidence: 76, price: 1.33485, change: 0.15, assetClass: "Major" },
  ]);
});

router.get("/dashboard/active-bots", async (req, res) => {
  try {
    const bots = await db.select().from(botsTable).where(eq(botsTable.status, "RUNNING")).limit(5);
    res.json(bots.length ? bots.map(b => ({
      id: b.id, name: b.name, strategy: b.strategy, symbol: b.market,
      status: b.status, pnlToday: parseFloat(b.pnlToday), pnlAllTime: parseFloat(b.pnlAllTime),
    })) : [
      { id: 1, name: "AI Scalper V3", strategy: "Scalping", symbol: "EURUSD, M15", status: "RUNNING", pnlToday: 1240.50, pnlAllTime: 4250.75 },
      { id: 2, name: "Gold Hunter AI", strategy: "Trend Following", symbol: "XAUUSD, M30", status: "RUNNING", pnlToday: 980.30, pnlAllTime: 6840.20 },
      { id: 3, name: "London Breakout", strategy: "Breakout", symbol: "GBPUSD, H1", status: "STOPPED", pnlToday: -120.30, pnlAllTime: -3128.40 },
      { id: 4, name: "Crypto Wave AI", strategy: "Swing Trading", symbol: "BTCUSD, H4", status: "RUNNING", pnlToday: 1439.20, pnlAllTime: 3120.00 },
    ]);
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/dashboard/connected-accounts", async (req, res) => {
  try {
    const brokers = await db.select().from(brokersTable).limit(5);
    res.json(brokers.length ? brokers.map(b => ({
      id: b.id, broker: b.broker, platform: b.platform, accountNumber: b.accountNumber,
      equity: parseFloat(b.equity), balance: parseFloat(b.balance), profit: parseFloat(b.profit),
      profitPercent: parseFloat(b.profitPercent), status: b.status, server: b.server, isConnected: b.isConnected,
    })) : [
      { id: 1, broker: "MT5 IC Markets", platform: "MT5", accountNumber: "12345678", equity: 82540, balance: 80000, profit: 2540, profitPercent: 12.45, status: "LIVE", server: "ICMarkets-Live", isConnected: true },
      { id: 2, broker: "MT5 Exness", platform: "MT5", accountNumber: "87654321", equity: 65430, balance: 60000, profit: 5430, profitPercent: 8.32, status: "LIVE", server: "Exness-Live", isConnected: true },
      { id: 3, broker: "MT4 Deriv", platform: "MT4", accountNumber: "11223344", equity: 12340, balance: 12000, profit: 340, profitPercent: 2.83, status: "DEMO", server: "Deriv-Demo", isConnected: true },
    ]);
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
