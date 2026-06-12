/**
 * Signals routes — generate AI/strategy signals, view history.
 * POST /api/signals/generate  — run AI engine + risk validation
 * GET  /api/signals            — list recent signals
 * GET  /api/signals/:id        — single signal detail
 */

import { Router } from "express";
import { db, signalsTable, botsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { signalService } from "../lib/executionEngine";
import { generateSignal, STRATEGY_TEMPLATES } from "../lib/strategyEngine";

const router = Router();

const mapSignal = (s: typeof signalsTable.$inferSelect) => ({
  id:                  s.id,
  botId:               s.botId,
  strategyId:          s.strategyId,
  symbol:              s.symbol,
  action:              s.action,
  confidence:          s.confidence ? parseFloat(String(s.confidence)) : 0,
  riskScore:           s.riskScore ? parseFloat(String(s.riskScore)) : 0,
  stopLoss:            s.stopLoss ? parseFloat(String(s.stopLoss)) : null,
  takeProfit:          s.takeProfit ? parseFloat(String(s.takeProfit)) : null,
  entryPrice:          s.entryPrice ? parseFloat(String(s.entryPrice)) : null,
  reason:              s.reason,
  indicators:          (() => { try { return JSON.parse(s.indicators); } catch { return {}; } })(),
  status:              s.status,
  passedRisk:          s.passedRisk,
  riskRejectionReason: s.riskRejectionReason,
  generatedAt:         s.generatedAt,
});

router.get("/signals", async (req, res) => {
  try {
    const limit = Math.min(parseInt(String(req.query.limit ?? 50)), 200);
    const rows = await db.select().from(signalsTable)
      .orderBy(desc(signalsTable.generatedAt)).limit(limit);
    res.json(rows.map(mapSignal));
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/signals/:id", async (req, res) => {
  try {
    const [row] = await db.select().from(signalsTable)
      .where(eq(signalsTable.id, parseInt(req.params.id)));
    if (!row) { res.status(404).json({ error: "Not found" }); return; }
    res.json(mapSignal(row));
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* POST /api/signals/generate
 * Body: { botId?, strategyId?, symbol, templateId? }
 * Runs the strategy engine → AI signal → risk validation → stores result
 */
router.post("/signals/generate", async (req, res) => {
  try {
    const { botId, strategyId, symbol = "EURUSD", templateId } = req.body ?? {};

    /* Build simulated candle history */
    const basePrice = 1.0850 + Math.random() * 0.02;
    const candles = Array.from({ length: 100 }, (_, i) => {
      const drift = (Math.random() - 0.49) * 0.0015;
      return {
        open: basePrice + drift * i,
        high: basePrice + drift * i + Math.random() * 0.002,
        low:  basePrice + drift * i - Math.random() * 0.002,
        close: basePrice + drift * (i + 1),
        volume: Math.floor(Math.random() * 5000 + 1000),
      };
    });

    const template = templateId
      ? STRATEGY_TEMPLATES.find(t => t.id === templateId)
      : STRATEGY_TEMPLATES[Math.floor(Math.random() * STRATEGY_TEMPLATES.length)];

    const signal = generateSignal(candles, template?.id);
    const entry = candles[candles.length - 1].close;

    const result = await signalService.generateAndStore({
      botId:      botId ?? null,
      strategyId: strategyId ?? null,
      symbol,
      action:     signal.action,
      confidence: signal.confidence,
      stopLoss:   signal.stopLoss,
      takeProfit: signal.takeProfit,
      entryPrice: entry,
      reason:     signal.reason,
      indicators: { rsi: 45 + Math.random() * 20, ema20: entry * 0.999, ema50: entry * 0.998 },
    });

    const [stored] = await db.select().from(signalsTable).where(eq(signalsTable.id, result.id));
    res.status(201).json({ ...mapSignal(stored!), passedRisk: result.passedRisk, rejectionReason: result.rejectionReason });
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
