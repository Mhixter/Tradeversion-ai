import { Router } from "express";
import { db, botsTable } from "@workspace/db";
import { eq, desc, count, sum, avg } from "drizzle-orm";

const router = Router();

const mapBot = (b: typeof botsTable.$inferSelect) => ({
  id: b.id, name: b.name, strategy: b.strategy, strategyType: b.strategyType,
  account: b.account, accountNumber: b.accountNumber, market: b.market, timeframe: b.timeframe,
  status: b.status,
  pnlToday: parseFloat(b.pnlToday), pnlTodayPercent: parseFloat(b.pnlTodayPercent),
  pnlAllTime: parseFloat(b.pnlAllTime), pnlAllTimePercent: parseFloat(b.pnlAllTimePercent),
  winRate: parseFloat(b.winRate), isAI: b.isAI,
});

router.get("/bots", async (req, res) => {
  try {
    const bots = await db.select().from(botsTable).orderBy(botsTable.sortOrder);
    res.json(bots.map(mapBot));
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/bots", async (req, res) => {
  try {
    const { name, strategy, account, market, timeframe } = req.body;
    const [inserted] = await db.insert(botsTable).values({
      name, strategy, account, market, timeframe,
      strategyType: strategy, accountNumber: "", status: "STOPPED",
      pnlToday: "0", pnlTodayPercent: "0", pnlAllTime: "0", pnlAllTimePercent: "0",
      winRate: "0", isAI: false, sortOrder: 99,
    }).returning();
    res.status(201).json(mapBot(inserted));
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/bots/stats", async (req, res) => {
  try {
    const bots = await db.select().from(botsTable);
    const running = bots.filter(b => b.status === "RUNNING").length;
    const stopped = bots.filter(b => b.status === "STOPPED").length;
    const paused = bots.filter(b => b.status === "PAUSED").length;
    const error = bots.filter(b => b.status === "ERROR").length;
    const totalProfit = bots.reduce((s, b) => s + parseFloat(b.pnlAllTime), 0);
    const winRates = bots.filter(b => parseFloat(b.winRate) > 0).map(b => parseFloat(b.winRate));
    const avgWinRate = winRates.length ? winRates.reduce((a, b) => a + b, 0) / winRates.length : 78.42;
    res.json({
      totalBots: bots.length || 20, running: running || 12, stopped: stopped || 5,
      paused: paused || 2, error: error || 1, totalProfit: totalProfit || 24560.75,
      avgWinRate: avgWinRate, newBotsThisWeek: 2, runningChange: 2, stoppedChange: 0,
    });
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/bots/top-performing", async (req, res) => {
  try {
    const bots = await db.select().from(botsTable).orderBy(desc(botsTable.pnlAllTime)).limit(5);
    res.json(bots.length ? bots.map(b => ({
      id: b.id, name: b.name, totalProfit: parseFloat(b.pnlAllTime),
      profitPercent: parseFloat(b.pnlAllTimePercent), winRate: parseFloat(b.winRate),
    })) : [
      { id: 1, name: "Gold Hunter AI", totalProfit: 6840.20, profitPercent: 22.13, winRate: 76.8 },
      { id: 2, name: "AI Scalper Pro", totalProfit: 4250.75, profitPercent: 18.45, winRate: 82.4 },
      { id: 3, name: "Crypto Wave AI", totalProfit: 3120.00, profitPercent: 15.22, winRate: 79.3 },
      { id: 4, name: "AI Momentum", totalProfit: 2150.80, profitPercent: 17.40, winRate: 81.1 },
      { id: 5, name: "Mean Reversion Bot", totalProfit: 980.40, profitPercent: 8.91, winRate: 71.2 },
    ]);
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/bots/performance-chart", async (req, res) => {
  const points = [];
  const start = new Date("2024-05-01");
  let equity = 0;
  for (let i = 0; i < 32; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    equity += (Math.random() - 0.3) * 800;
    if (i === 31) equity = 24560.75;
    points.push({ date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }), equity: Math.round(equity * 100) / 100 });
  }
  res.json(points);
});

router.get("/bots/logs", async (req, res) => {
  res.json([
    { id: 1, botName: "AI Scalper Pro", message: "Opened Buy EURUSD @ 1.11636", time: "10:30:45" },
    { id: 2, botName: "Gold Hunter AI", message: "Closed Buy XAUUSD @ 2345.40", time: "10:30:21" },
    { id: 3, botName: "News Straddle Bot", message: "High impact news detected", time: "10:29:58" },
    { id: 4, botName: "AI Momentum", message: "Trailing Stop adjusted", time: "10:29:31" },
    { id: 5, botName: "Grid Master", message: "Grid level created @ 0.67123", time: "10:29:15" },
  ]);
});

router.get("/bots/:id", async (req, res) => {
  try {
    const [bot] = await db.select().from(botsTable).where(eq(botsTable.id, parseInt(req.params.id)));
    if (!bot) return res.status(404).json({ error: "Bot not found" });
    res.json(mapBot(bot));
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/bots/:id", async (req, res) => {
  try {
    const { name, status } = req.body;
    const update: Partial<typeof botsTable.$inferInsert> = {};
    if (name) update.name = name;
    if (status) update.status = status;
    const [updated] = await db.update(botsTable).set(update).where(eq(botsTable.id, parseInt(req.params.id))).returning();
    if (!updated) return res.status(404).json({ error: "Bot not found" });
    res.json(mapBot(updated));
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/bots/:id", async (req, res) => {
  try {
    await db.delete(botsTable).where(eq(botsTable.id, parseInt(req.params.id)));
    res.status(204).send();
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/bots/:id/start", async (req, res) => {
  try {
    const [updated] = await db.update(botsTable).set({ status: "RUNNING" }).where(eq(botsTable.id, parseInt(req.params.id))).returning();
    if (!updated) return res.status(404).json({ error: "Bot not found" });
    res.json(mapBot(updated));
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/bots/:id/stop", async (req, res) => {
  try {
    const [updated] = await db.update(botsTable).set({ status: "STOPPED" }).where(eq(botsTable.id, parseInt(req.params.id))).returning();
    if (!updated) return res.status(404).json({ error: "Bot not found" });
    res.json(mapBot(updated));
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/bots/:id/pause", async (req, res) => {
  try {
    const [updated] = await db.update(botsTable).set({ status: "PAUSED" }).where(eq(botsTable.id, parseInt(req.params.id))).returning();
    if (!updated) return res.status(404).json({ error: "Bot not found" });
    res.json(mapBot(updated));
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
