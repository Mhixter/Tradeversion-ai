/**
 * Positions routes — open/closed trade positions.
 * GET  /api/positions         — open positions
 * GET  /api/positions/history — closed positions
 * POST /api/positions/:id/close
 */

import { Router } from "express";
import { db, positionsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { executionService, positionService } from "../lib/executionEngine";
import { getLimits } from "../lib/riskEngine";

const router = Router();

const mapPos = (p: typeof positionsTable.$inferSelect) => ({
  id:           p.id,
  botId:        p.botId,
  signalId:     p.signalId,
  symbol:       p.symbol,
  type:         p.type,
  size:         parseFloat(String(p.size)),
  openPrice:    parseFloat(String(p.openPrice)),
  currentPrice: p.currentPrice ? parseFloat(String(p.currentPrice)) : null,
  closePrice:   p.closePrice ? parseFloat(String(p.closePrice)) : null,
  stopLoss:     p.stopLoss ? parseFloat(String(p.stopLoss)) : null,
  takeProfit:   p.takeProfit ? parseFloat(String(p.takeProfit)) : null,
  pnl:          parseFloat(String(p.pnl)),
  pips:         parseFloat(String(p.pips)),
  commission:   parseFloat(String(p.commission)),
  swap:         parseFloat(String(p.swap)),
  status:       p.status,
  brokerTicket: p.brokerTicket,
  comment:      p.comment,
  openedAt:     p.openedAt,
  closedAt:     p.closedAt,
});

router.get("/positions", async (req, res) => {
  try {
    const rows = await db.select().from(positionsTable)
      .where(eq(positionsTable.status, "OPEN"))
      .orderBy(desc(positionsTable.openedAt));
    res.json(rows.map(mapPos));
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/positions/history", async (req, res) => {
  try {
    const limit = Math.min(parseInt(String(req.query.limit ?? 100)), 500);
    const rows = await db.select().from(positionsTable)
      .where(eq(positionsTable.status, "CLOSED"))
      .orderBy(desc(positionsTable.closedAt)).limit(limit);
    res.json(rows.map(mapPos));
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/positions/stats", async (req, res) => {
  try {
    const all    = await db.select().from(positionsTable).where(eq(positionsTable.status, "CLOSED"));
    const open   = await db.select().from(positionsTable).where(eq(positionsTable.status, "OPEN"));
    const wins   = all.filter(p => parseFloat(String(p.pnl)) > 0);
    const losses = all.filter(p => parseFloat(String(p.pnl)) < 0);
    const totalPnl    = all.reduce((s, p) => s + parseFloat(String(p.pnl)), 0);
    const totalOpenPnl = open.reduce((s, p) => s + parseFloat(String(p.pnl)), 0);
    const grossWin  = wins.reduce((s, p) => s + parseFloat(String(p.pnl)), 0);
    const grossLoss = Math.abs(losses.reduce((s, p) => s + parseFloat(String(p.pnl)), 0));
    res.json({
      openPositions:  open.length,
      closedTrades:   all.length,
      winningTrades:  wins.length,
      losingTrades:   losses.length,
      winRate:        all.length > 0 ? parseFloat(((wins.length / all.length) * 100).toFixed(1)) : 0,
      totalPnl:       parseFloat(totalPnl.toFixed(2)),
      totalOpenPnl:   parseFloat(totalOpenPnl.toFixed(2)),
      profitFactor:   grossLoss > 0 ? parseFloat((grossWin / grossLoss).toFixed(2)) : 0,
      avgWin:         wins.length > 0 ? parseFloat((grossWin / wins.length).toFixed(2)) : 0,
      avgLoss:        losses.length > 0 ? parseFloat((-grossLoss / losses.length).toFixed(2)) : 0,
    });
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/positions/:id/close", async (req, res) => {
  try {
    const id        = parseInt(req.params.id);
    const closePrice = parseFloat(req.body?.closePrice ?? 0);
    const reason     = req.body?.reason ?? "Manual close";
    if (!closePrice) { res.status(400).json({ error: "closePrice required" }); return; }
    const result = await positionService.closePosition(id, closePrice, reason);
    if (!result) { res.status(404).json({ error: "Position not found" }); return; }
    res.json({ success: true, ...result });
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* Open new position via execution engine */
router.post("/positions/open", async (req, res) => {
  try {
    const { botId, signalId, brokerId, symbol, side, volume, price, sl, tp, comment } = req.body ?? {};
    if (!symbol || !side || !volume || !price) {
      res.status(400).json({ error: "symbol, side, volume, price required" }); return;
    }
    const result = await executionService.execute({
      signalId: signalId ?? 0, botId: botId ?? null, brokerId: brokerId ?? null,
      symbol, side, volume: parseFloat(volume), price: parseFloat(price),
      sl: sl ? parseFloat(sl) : 0, tp: tp ? parseFloat(tp) : 0,
      comment: comment ?? "",
    });
    res.status(201).json(result);
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
