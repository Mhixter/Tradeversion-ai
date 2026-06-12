import { Router } from "express";
import { db, strategiesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { STRATEGY_TEMPLATES } from "../lib/strategyEngine";

const router = Router();

const mapStrategy = (s: typeof strategiesTable.$inferSelect) => ({
  id: s.id, name: s.name, status: s.status, market: s.market, symbol: s.symbol,
  timeframe: s.timeframe, description: s.description,
  riskPerTrade: parseFloat(s.riskPerTrade), takeProfit: parseFloat(s.takeProfit),
  stopLoss: parseFloat(s.stopLoss), trailingStop: parseFloat(s.trailingStop),
  magicNumber: s.magicNumber,
});

// GET /api/strategies — DB strategies
router.get("/strategies", async (req, res) => {
  try {
    const rows = await db.select().from(strategiesTable);
    res.json(rows.map(mapStrategy));
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/strategies/templates — Professional strategy templates
router.get("/strategies/templates", (_req, res) => {
  res.json(STRATEGY_TEMPLATES);
});

// GET /api/strategies/templates/:id — Single template
router.get("/strategies/templates/:id", (req, res) => {
  const template = STRATEGY_TEMPLATES.find(t => t.id === req.params.id);
  if (!template) {
    res.status(404).json({ error: "Template not found" });
    return;
  }
  res.json(template);
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
    if (isNaN(parseInt(req.params.id))) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    const [row] = await db.select().from(strategiesTable).where(eq(strategiesTable.id, parseInt(req.params.id)));
    if (!row) { res.status(404).json({ error: "Strategy not found" }); return; }
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
    res.json(mapStrategy(updated));
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/strategies/:id", async (req, res) => {
  try {
    await db.delete(strategiesTable).where(eq(strategiesTable.id, parseInt(req.params.id)));
    res.status(204).send();
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
