import { Router } from "express";
import { db, strategiesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

const mapStrategy = (s: typeof strategiesTable.$inferSelect) => ({
  id: s.id, name: s.name, status: s.status, market: s.market, symbol: s.symbol,
  timeframe: s.timeframe, description: s.description,
  riskPerTrade: parseFloat(s.riskPerTrade), takeProfit: parseFloat(s.takeProfit),
  stopLoss: parseFloat(s.stopLoss), trailingStop: parseFloat(s.trailingStop),
  magicNumber: s.magicNumber,
});

router.get("/strategies", async (req, res) => {
  try {
    const rows = await db.select().from(strategiesTable);
    res.json(rows.map(mapStrategy));
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/strategies", async (req, res) => {
  try {
    const { name, market, symbol, timeframe, description } = req.body;
    const [inserted] = await db.insert(strategiesTable).values({
      name, market, symbol, timeframe,
      description: description || "",
      status: "DRAFT",
      riskPerTrade: "2", takeProfit: "50", stopLoss: "25", trailingStop: "15",
    }).returning();
    res.status(201).json(mapStrategy(inserted));
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/strategies/:id", async (req, res) => {
  try {
    const [row] = await db.select().from(strategiesTable).where(eq(strategiesTable.id, parseInt(req.params.id)));
    if (!row) return res.status(404).json({ error: "Strategy not found" });
    res.json(mapStrategy(row));
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/strategies/:id", async (req, res) => {
  try {
    const { name, description, riskPerTrade, takeProfit, stopLoss } = req.body;
    const update: Partial<typeof strategiesTable.$inferInsert> = {};
    if (name) update.name = name;
    if (description !== undefined) update.description = description;
    if (riskPerTrade !== undefined) update.riskPerTrade = String(riskPerTrade);
    if (takeProfit !== undefined) update.takeProfit = String(takeProfit);
    if (stopLoss !== undefined) update.stopLoss = String(stopLoss);
    const [updated] = await db.update(strategiesTable).set(update).where(eq(strategiesTable.id, parseInt(req.params.id))).returning();
    if (!updated) return res.status(404).json({ error: "Strategy not found" });
    res.json(mapStrategy(updated));
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/strategies/:id/deploy", async (req, res) => {
  try {
    const [updated] = await db.update(strategiesTable).set({ status: "DEPLOYED" }).where(eq(strategiesTable.id, parseInt(req.params.id))).returning();
    if (!updated) return res.status(404).json({ error: "Strategy not found" });
    res.json(mapStrategy(updated));
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/strategies/:id/backtest-preview", async (req, res) => {
  res.json({
    netProfit: 12540.75, totalReturn: 25.08, profitFactor: 1.87,
    winRate: 78.57, totalTrades: 126, sharpeRatio: 2.14, maxDrawdown: 4.12, expectancy: 99.53,
  });
});

export default router;
