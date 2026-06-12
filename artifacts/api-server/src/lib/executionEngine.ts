/**
 * ExecutionEngine — implements the full signal → risk → execution pipeline.
 *
 * Flow:
 *   Signal Generated
 *     → RiskEngine.validateTrade()
 *     → ExecutionService.execute()      (broker call)
 *     → PositionService.record()        (DB write)
 *     → TradeHistoryService.append()    (DB write)
 *     → Analytics update
 */

import { db, signalsTable, positionsTable, executionsTable, activityLogsTable } from "@workspace/db";
import { validateTrade, getLimits, calculateRiskScore } from "./riskEngine";
import { generateSignal } from "./strategyEngine";
import type { TradeRequest, AccountSnapshot } from "./riskEngine";

export interface SignalRequest {
  botId:      number | null;
  strategyId: number | null;
  symbol:     string;
  action:     "BUY" | "SELL" | "HOLD";
  confidence: number;
  stopLoss:   number;
  takeProfit: number;
  entryPrice: number;
  reason:     string;
  indicators: Record<string, number>;
}

export interface ExecutionRequest {
  signalId:   number;
  botId:      number | null;
  brokerId:   number | null;
  symbol:     string;
  side:       "BUY" | "SELL";
  volume:     number;
  price:      number;
  sl:         number;
  tp:         number;
  comment:    string;
}

/* ── Signal Service ─────────────────────────────────────────────────────── */
export class SignalService {
  async generateAndStore(req: SignalRequest): Promise<{ id: number; passedRisk: boolean; rejectionReason: string | null }> {
    const account = await this._getAccountSnapshot();
    const limits  = getLimits();

    const tradeReq: TradeRequest = {
      symbol: req.symbol,
      side:   req.action as "BUY" | "SELL",
      lots:   0.1,
      price:  req.entryPrice,
      stopLoss:   req.stopLoss,
      takeProfit: req.takeProfit,
    };

    const risk = req.action === "HOLD"
      ? { passed: false, riskScore: 0, rejectionReason: "HOLD signal — no execution", checks: [] }
      : validateTrade(tradeReq, account, limits);

    const [inserted] = await db.insert(signalsTable).values({
      botId:               req.botId,
      strategyId:          req.strategyId,
      symbol:              req.symbol,
      action:              req.action,
      confidence:          String(req.confidence.toFixed(2)),
      riskScore:           String(risk.riskScore.toFixed(2)),
      stopLoss:            req.stopLoss ? String(req.stopLoss) : null,
      takeProfit:          req.takeProfit ? String(req.takeProfit) : null,
      entryPrice:          req.entryPrice ? String(req.entryPrice) : null,
      reason:              req.reason,
      indicators:          JSON.stringify(req.indicators),
      status:              risk.passed ? "APPROVED" : "REJECTED",
      passedRisk:          risk.passed,
      riskRejectionReason: risk.rejectionReason,
    }).returning();

    await this._logActivity({
      category:    "signal",
      action:      risk.passed ? "SIGNAL_APPROVED" : "SIGNAL_REJECTED",
      description: `${req.action} signal on ${req.symbol} — ${risk.passed ? "approved" : `rejected: ${risk.rejectionReason}`}`,
      severity:    risk.passed ? "info" : "warning",
      metadata:    JSON.stringify({ signalId: inserted.id, confidence: req.confidence }),
    });

    return { id: inserted.id, passedRisk: risk.passed, rejectionReason: risk.rejectionReason };
  }

  private async _getAccountSnapshot(): Promise<AccountSnapshot> {
    return { balance: 245_000, equity: 250_000, openTrades: 0, openLots: 0, dailyLoss: 0, peakEquity: 260_000 };
  }

  private async _logActivity(data: { category: string; action: string; description: string; severity: string; metadata: string }) {
    try {
      await db.insert(activityLogsTable).values({ ...data });
    } catch {}
  }
}

/* ── Execution Service ──────────────────────────────────────────────────── */
export class ExecutionService {
  async execute(req: ExecutionRequest): Promise<{ executionId: number; status: string; brokerTicket: string | null; latencyMs: number }> {
    const signalTime = new Date();
    let status        = "FILLED";
    let brokerTicket: string | null = null;
    let latencyMs     = 0;
    let fillPrice     = req.price;

    try {
      /* Simulated execution — in production, call brokerService.placeBuyOrder/placeSellOrder */
      latencyMs   = Math.floor(Math.random() * 80 + 10);
      fillPrice   = req.price + (req.side === "BUY" ? 0.00015 : -0.00015); /* spread */
      brokerTicket = String(Date.now());
      await new Promise(r => setTimeout(r, latencyMs));
    } catch {
      status = "FAILED";
    }

    const fillTime = new Date();
    const [execution] = await db.insert(executionsTable).values({
      signalId:      req.signalId,
      botId:         req.botId,
      brokerId:      req.brokerId,
      symbol:        req.symbol,
      side:          req.side,
      volume:        String(req.volume),
      requestPrice:  String(req.price),
      fillPrice:     String(parseFloat(fillPrice.toFixed(5))),
      slippage:      String(Math.abs(fillPrice - req.price).toFixed(5)),
      status,
      brokerTicket,
      latencyMs,
      signalTime,
      executionTime: signalTime,
      fillTime,
      rawResponse:   JSON.stringify({ ticket: brokerTicket, price: fillPrice }),
    }).returning();

    if (status === "FILLED") {
      await db.insert(positionsTable).values({
        botId:        req.botId,
        signalId:     req.signalId,
        symbol:       req.symbol,
        type:         req.side,
        size:         String(req.volume),
        openPrice:    String(parseFloat(fillPrice.toFixed(5))),
        currentPrice: String(parseFloat(fillPrice.toFixed(5))),
        stopLoss:     req.sl ? String(req.sl) : null,
        takeProfit:   req.tp ? String(req.tp) : null,
        pnl:          "0",
        pips:         "0",
        status:       "OPEN",
        brokerTicket,
        comment:      req.comment,
        openedAt:     fillTime,
      });
    }

    return { executionId: execution.id, status, brokerTicket, latencyMs };
  }
}

/* ── Position Service ───────────────────────────────────────────────────── */
export class PositionService {
  async getOpenPositions() {
    const { db: _db, positionsTable: pt } = await import("@workspace/db");
    const { eq } = await import("drizzle-orm");
    return _db.select().from(pt).where(eq(pt.status, "OPEN"));
  }

  async closePosition(id: number, closePrice: number, reason = "Manual") {
    const { db: _db, positionsTable: pt } = await import("@workspace/db");
    const { eq } = await import("drizzle-orm");
    const [pos] = await _db.select().from(pt).where(eq(pt.id, id));
    if (!pos) return null;
    const openP   = parseFloat(String(pos.openPrice));
    const size    = parseFloat(String(pos.size));
    const pnl     = pos.type === "BUY"
      ? (closePrice - openP) * size * 100_000 * 0.0001 * 10
      : (openP - closePrice) * size * 100_000 * 0.0001 * 10;
    await _db.update(pt).set({
      status: "CLOSED", closePrice: String(closePrice),
      closedAt: new Date(), pnl: String(pnl.toFixed(2)), comment: reason,
    }).where(eq(pt.id, id));
    return { id, pnl };
  }
}

/* ── Trade History Service ──────────────────────────────────────────────── */
export class TradeHistoryService {
  async getHistory(limit = 50) {
    const { db: _db, positionsTable: pt } = await import("@workspace/db");
    const { eq, desc } = await import("drizzle-orm");
    return _db.select().from(pt).where(eq(pt.status, "CLOSED"))
      .orderBy(desc(pt.closedAt)).limit(limit);
  }

  async getDailyPnl(): Promise<number> {
    const { db: _db, positionsTable: pt } = await import("@workspace/db");
    const { eq } = await import("drizzle-orm");
    const today = new Date().toISOString().slice(0, 10);
    const rows  = await _db.select().from(pt).where(eq(pt.status, "CLOSED"));
    return rows
      .filter(r => r.closedAt && r.closedAt.toISOString().startsWith(today))
      .reduce((s, r) => s + parseFloat(String(r.pnl)), 0);
  }
}

export const signalService    = new SignalService();
export const executionService = new ExecutionService();
export const positionService  = new PositionService();
export const tradeHistoryService = new TradeHistoryService();
