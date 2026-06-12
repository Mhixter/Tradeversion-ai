/**
 * Execution Monitor routes — real-time execution tracking.
 * GET /api/executions          — list recent executions
 * GET /api/executions/stats    — latency + fill stats
 * GET /api/executions/:id      — single execution
 */

import { Router } from "express";
import { db, executionsTable } from "@workspace/db";
import { eq, desc, and, gte } from "drizzle-orm";

const router = Router();

const mapExec = (e: typeof executionsTable.$inferSelect) => ({
  id:            e.id,
  signalId:      e.signalId,
  positionId:    e.positionId,
  botId:         e.botId,
  brokerId:      e.brokerId,
  symbol:        e.symbol,
  side:          e.side,
  volume:        parseFloat(String(e.volume)),
  requestPrice:  e.requestPrice ? parseFloat(String(e.requestPrice)) : null,
  fillPrice:     e.fillPrice ? parseFloat(String(e.fillPrice)) : null,
  slippage:      e.slippage ? parseFloat(String(e.slippage)) : 0,
  status:        e.status,
  brokerTicket:  e.brokerTicket,
  latencyMs:     e.latencyMs,
  signalTime:    e.signalTime,
  executionTime: e.executionTime,
  fillTime:      e.fillTime,
  rejectReason:  e.rejectReason,
  createdAt:     e.createdAt,
});

router.get("/executions", async (req, res) => {
  try {
    const limit = Math.min(parseInt(String(req.query.limit ?? 50)), 200);
    const rows = await db.select().from(executionsTable)
      .orderBy(desc(executionsTable.createdAt)).limit(limit);
    res.json(rows.map(mapExec));
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/executions/stats", async (req, res) => {
  try {
    const rows = await db.select().from(executionsTable)
      .orderBy(desc(executionsTable.createdAt)).limit(1000);

    const filled  = rows.filter(r => r.status === "FILLED");
    const failed  = rows.filter(r => r.status === "FAILED");
    const pending = rows.filter(r => r.status === "PENDING");

    const latencies = filled.filter(r => r.latencyMs != null).map(r => r.latencyMs!);
    const avgLatency = latencies.length > 0
      ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length)
      : 0;
    const minLatency = latencies.length > 0 ? Math.min(...latencies) : 0;
    const maxLatency = latencies.length > 0 ? Math.max(...latencies) : 0;

    const slippages = filled.filter(r => r.slippage != null).map(r => parseFloat(String(r.slippage)));
    const avgSlippage = slippages.length > 0
      ? parseFloat((slippages.reduce((a, b) => a + b, 0) / slippages.length).toFixed(5))
      : 0;

    res.json({
      total:       rows.length,
      filled:      filled.length,
      failed:      failed.length,
      pending:     pending.length,
      fillRate:    rows.length > 0 ? parseFloat(((filled.length / rows.length) * 100).toFixed(1)) : 0,
      avgLatencyMs: avgLatency,
      minLatencyMs: minLatency,
      maxLatencyMs: maxLatency,
      avgSlippage,
    });
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/executions/:id", async (req, res) => {
  try {
    const [row] = await db.select().from(executionsTable)
      .where(eq(executionsTable.id, parseInt(req.params.id)));
    if (!row) { res.status(404).json({ error: "Not found" }); return; }
    res.json(mapExec(row));
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
