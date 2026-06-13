import { Router } from "express";
import { db, botsTable, brokersTable, tradesTable } from "@workspace/db";
import { eq, desc, gte } from "drizzle-orm";
import { generateSignal, STRATEGY_TEMPLATES } from "../lib/strategyEngine";

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
    const { name, strategy, account, market, timeframe, strategyTemplateId, isAI } = req.body;
    const template = STRATEGY_TEMPLATES.find(t => t.id === strategyTemplateId);
    const [inserted] = await db.insert(botsTable).values({
      name,
      strategy: strategy || template?.name || "Custom",
      strategyType: template?.type || strategy || "Custom",
      account: account || "Live MT5",
      accountNumber: req.body.accountNumber || "",
      market: market || template?.markets[0] || "Forex",
      timeframe: timeframe || template?.timeframes[0] || "H1",
      status: "STOPPED",
      pnlToday: "0", pnlTodayPercent: "0",
      pnlAllTime: "0", pnlAllTimePercent: "0",
      winRate: String(template?.avgWinRate || 0),
      isAI: isAI ?? (template?.type === "AI/ML" || false),
      sortOrder: 99,
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
    const avgWinRate = winRates.length ? winRates.reduce((a, b) => a + b, 0) / winRates.length : 0;
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const newBotsThisWeek = bots.filter(b => b.createdAt && new Date(b.createdAt) >= oneWeekAgo).length;
    res.json({
      totalBots: bots.length,
      running, stopped, paused, error,
      totalProfit: Math.round(totalProfit * 100) / 100,
      avgWinRate: Math.round(avgWinRate * 10) / 10,
      newBotsThisWeek, runningChange: 0, stoppedChange: 0,
    });
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/bots/top-performing", async (req, res) => {
  try {
    const bots = await db.select().from(botsTable).orderBy(desc(botsTable.pnlAllTime)).limit(5);
    res.json(bots.map(b => ({
      id: b.id, name: b.name, totalProfit: parseFloat(b.pnlAllTime),
      profitPercent: parseFloat(b.pnlAllTimePercent), winRate: parseFloat(b.winRate),
    })));
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/bots/:id", async (req, res) => {
  try {
    const [bot] = await db.select().from(botsTable).where(eq(botsTable.id, parseInt(req.params.id)));
    if (!bot) { res.status(404).json({ error: "Bot not found" }); return; }
    res.json(mapBot(bot));
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/bots/:id", async (req, res) => {
  try {
    const { name, strategy, account, market, timeframe } = req.body;
    const update: Partial<typeof botsTable.$inferInsert> = {};
    if (name) update.name = name;
    if (strategy) update.strategy = strategy;
    if (account) update.account = account;
    if (market) update.market = market;
    if (timeframe) update.timeframe = timeframe;
    const [updated] = await db.update(botsTable).set(update).where(eq(botsTable.id, parseInt(req.params.id))).returning();
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

// ─── Bot control ─────────────────────────────────────────────────────────────

router.post("/bots/:id/start", async (req, res) => {
  try {
    const [bot] = await db.update(botsTable)
      .set({ status: "RUNNING" })
      .where(eq(botsTable.id, parseInt(req.params.id)))
      .returning();
    if (!bot) { res.status(404).json({ error: "Bot not found" }); return; }
    req.log.info({ botId: bot.id, name: bot.name }, "Bot started");
    res.json({ success: true, status: "RUNNING", bot: mapBot(bot) });
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/bots/:id/stop", async (req, res) => {
  try {
    const [bot] = await db.update(botsTable)
      .set({ status: "STOPPED" })
      .where(eq(botsTable.id, parseInt(req.params.id)))
      .returning();
    if (!bot) { res.status(404).json({ error: "Bot not found" }); return; }
    res.json({ success: true, status: "STOPPED", bot: mapBot(bot) });
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/bots/:id/pause", async (req, res) => {
  try {
    const [bot] = await db.update(botsTable)
      .set({ status: "PAUSED" })
      .where(eq(botsTable.id, parseInt(req.params.id)))
      .returning();
    if (!bot) { res.status(404).json({ error: "Bot not found" }); return; }
    res.json({ success: true, status: "PAUSED", bot: mapBot(bot) });
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/bots/:id/signal — Generate real-time strategy signal (works for RUNNING and preview)
router.get("/bots/:id/signal", async (req, res) => {
  try {
    const [bot] = await db.select().from(botsTable).where(eq(botsTable.id, parseInt(req.params.id)));
    if (!bot) { res.status(404).json({ error: "Bot not found" }); return; }
    const templateId = STRATEGY_TEMPLATES.find(t => t.name === bot.strategy)?.id || "sma_crossover";
    const atrValue = parseFloat(bot.market === "Crypto" ? "250" : bot.market === "Gold" ? "8" : "0.0012");
    const signal = generateSignal(templateId, bot.market, atrValue);
    res.json({ ...signal, botId: bot.id, botName: bot.name, market: bot.market, status: bot.status });
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/bots/:id/execute — Execute a trade based on strategy signal
router.post("/bots/:id/execute", async (req, res) => {
  try {
    const [bot] = await db.select().from(botsTable).where(eq(botsTable.id, parseInt(req.params.id)));
    if (!bot) { res.status(404).json({ error: "Bot not found" }); return; }

    // Require at least one configured broker with equity
    const brokers = await db.select().from(brokersTable);
    const activeBroker = brokers.find(b => parseFloat(b.equity) > 0) || brokers[0];
    if (!activeBroker) {
      res.status(400).json({ error: "No broker configured. Please connect a broker account first." });
      return;
    }
    const brokerEquity = parseFloat(activeBroker.equity);
    if (brokerEquity === 0) {
      res.status(400).json({ error: "Broker equity is zero. Please update your broker account balance." });
      return;
    }

    const { action, size, symbol } = req.body;
    if (!["BUY","SELL"].includes(action)) {
      res.status(400).json({ error: "Invalid action" });
      return;
    }

    const tradeSymbol = symbol || bot.market;

    // Use provided price or realistic market price based on symbol
    const basePrice = parseFloat(req.body.price || "0") || (
      tradeSymbol?.includes("XAU") ? 2340 :
      tradeSymbol?.includes("BTC") ? 67500 :
      tradeSymbol?.includes("ETH") ? 3500 :
      tradeSymbol?.includes("JPY") ? 156.0 :
      tradeSymbol?.includes("GBP") ? 1.265 :
      1.0850
    );

    const slippage = basePrice * 0.00005 * (Math.random() - 0.5);
    const finalPrice = basePrice + slippage;

    // Default size = 1% of equity in lots (minimum 0.01)
    const tradeSize = parseFloat(String(size)) || Math.max(0.01, parseFloat((brokerEquity * 0.01 / (basePrice * 100000)).toFixed(2)));

    // Simulate P&L for the trade (small random profit/loss)
    const pipValue = tradeSymbol?.includes("JPY") ? 0.01 : 0.0001;
    const pips = (Math.random() - 0.45) * 20;
    const tradeProfit = parseFloat((pips * pipValue * tradeSize * 100000).toFixed(2));

    // Store trade in DB
    const now = new Date();
    await db.insert(tradesTable).values({
      symbol:     tradeSymbol,
      type:       action,
      size:       String(tradeSize),
      profit:     String(tradeProfit),
      time:       now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      entryPrice: String(Math.round(finalPrice * 100000) / 100000),
      exitPrice:  null,
    });

    // Update bot PnL
    const newPnlToday = parseFloat(bot.pnlToday) + tradeProfit;
    const newPnlAllTime = parseFloat(bot.pnlAllTime) + tradeProfit;
    await db.update(botsTable).set({
      pnlToday: String(newPnlToday),
      pnlAllTime: String(newPnlAllTime),
    }).where(eq(botsTable.id, bot.id));

    // Update broker equity
    const newEquity = brokerEquity + tradeProfit;
    const newProfit = parseFloat(activeBroker.profit) + tradeProfit;
    const balance = parseFloat(activeBroker.balance);
    const newProfitPercent = balance > 0 ? (newProfit / balance) * 100 : 0;
    await db.update(brokersTable).set({
      equity: String(Math.round(newEquity * 100) / 100),
      profit: String(Math.round(newProfit * 100) / 100),
      profitPercent: String(Math.round(newProfitPercent * 100) / 100),
    }).where(eq(brokersTable.id, activeBroker.id));

    req.log.info({ botId: bot.id, action, symbol: tradeSymbol, size: tradeSize, price: finalPrice, profit: tradeProfit }, "Trade executed");

    res.json({
      success: true,
      orderId: `ORD-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      action,
      symbol: tradeSymbol,
      size: tradeSize,
      executionPrice: Math.round(finalPrice * 100000) / 100000,
      slippage: Math.round(Math.abs(slippage) * 100000) / 100000,
      executionTime: Math.round(12 + Math.random() * 38),
      profit: tradeProfit,
      brokerEquity: Math.round(newEquity * 100) / 100,
      timestamp: now.toISOString(),
    });
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
