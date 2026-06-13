/**
 * Analytics Engine routes — performance snapshots, PnL curves, ratios.
 * GET /api/analytics/snapshots      — historical daily snapshots
 * GET /api/analytics/equity-curve   — equity curve for charting
 * GET /api/analytics/summary        — Sharpe, Sortino, recovery factor etc.
 * POST /api/analytics/snapshot      — force a snapshot now
 * GET /api/analytics/activity       — activity log
 */

import { Router } from "express";
import { db, performanceSnapshotsTable, activityLogsTable, brokersTable, botsTable } from "@workspace/db";
import { desc } from "drizzle-orm";
import {
  getSnapshots, buildEquityCurve, takeSnapshot,
  calcSharpe, calcSortino, calcRecoveryFactor, calcProfitFactor,
} from "../lib/analyticsEngine";

const router = Router();

router.get("/analytics/snapshots", async (req, res) => {
  try {
    const limit = Math.min(parseInt(String(req.query.limit ?? 30)), 365);
    const rows = await getSnapshots(limit);
    res.json(rows.map(s => ({
      id:             s.id,
      snapshotDate:   s.snapshotDate,
      equity:         parseFloat(String(s.equity)),
      balance:        parseFloat(String(s.balance)),
      dailyPnl:       parseFloat(String(s.dailyPnl)),
      weeklyPnl:      parseFloat(String(s.weeklyPnl)),
      monthlyPnl:     parseFloat(String(s.monthlyPnl)),
      winRate:        parseFloat(String(s.winRate)),
      avgWin:         parseFloat(String(s.avgWin)),
      avgLoss:        parseFloat(String(s.avgLoss)),
      profitFactor:   parseFloat(String(s.profitFactor)),
      sharpeRatio:    parseFloat(String(s.sharpeRatio)),
      sortinoRatio:   parseFloat(String(s.sortinoRatio)),
      recoveryFactor: parseFloat(String(s.recoveryFactor)),
      maxDrawdown:    parseFloat(String(s.maxDrawdown)),
      totalTrades:    s.totalTrades,
      openTrades:     s.openTrades,
    })));
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/analytics/equity-curve", async (req, res) => {
  try {
    const rows = await getSnapshots(90);
    res.json(buildEquityCurve(rows));
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/analytics/summary", async (req, res) => {
  try {
    const rows = await getSnapshots(30);
    if (rows.length === 0) {
      res.json({
        sharpeRatio: 0, sortinoRatio: 0, recoveryFactor: 0,
        profitFactor: 0, winRate: 0, maxDrawdown: 0,
        avgDailyPnl: 0, monthlyReturn: 0,
        totalTrades: 0, snapshotDays: 0,
      });
      return;
    }

    const brokers = await db.select({ equity: brokersTable.equity }).from(brokersTable);
    const totalEquity = brokers.reduce((s, b) => s + parseFloat(b.equity), 0) || 1;

    const returns    = rows.map(r => parseFloat(String(r.dailyPnl)) / totalEquity);
    const wins       = rows.filter(r => parseFloat(String(r.dailyPnl)) > 0).map(r => parseFloat(String(r.dailyPnl)));
    const losses     = rows.filter(r => parseFloat(String(r.dailyPnl)) < 0).map(r => parseFloat(String(r.dailyPnl)));
    const latest     = rows[0];
    const maxDD      = Math.max(...rows.map(r => parseFloat(String(r.maxDrawdown))));
    const netProfit  = rows.reduce((s, r) => s + parseFloat(String(r.dailyPnl)), 0);
    const avgDailyPnl = rows.length ? netProfit / rows.length : 0;

    res.json({
      sharpeRatio:    calcSharpe(returns),
      sortinoRatio:   calcSortino(returns),
      recoveryFactor: calcRecoveryFactor(netProfit, maxDD * totalEquity),
      profitFactor:   calcProfitFactor(wins, losses),
      winRate:        latest ? parseFloat(String(latest.winRate)) : 0,
      maxDrawdown:    maxDD,
      avgDailyPnl:    parseFloat(avgDailyPnl.toFixed(2)),
      monthlyReturn:  parseFloat(((netProfit / totalEquity) * 100).toFixed(2)),
      totalTrades:    latest ? latest.totalTrades : 0,
      snapshotDays:   rows.length,
    });
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/analytics/snapshot", async (req, res) => {
  try {
    const brokers = await db.select().from(brokersTable);
    const bots    = await db.select().from(botsTable);

    const equity  = brokers.reduce((s, b) => s + parseFloat(b.equity), 0);
    const balance = brokers.reduce((s, b) => s + parseFloat(b.balance), 0);
    const dailyPnl = bots.reduce((s, b) => s + parseFloat(b.pnlToday), 0);
    const allTimePnl = bots.reduce((s, b) => s + parseFloat(b.pnlAllTime), 0);
    const winRates = bots.filter(b => parseFloat(b.winRate) > 0).map(b => parseFloat(b.winRate));
    const avgWinRate = winRates.length ? winRates.reduce((a, b) => a + b, 0) / winRates.length : 0;

    const returns = [dailyPnl / (equity || 1)];
    const wins    = dailyPnl > 0 ? [dailyPnl] : [];
    const losses  = dailyPnl < 0 ? [dailyPnl] : [];

    await takeSnapshot(req.body?.botId ?? null, {
      date:           new Date().toISOString().slice(0, 10),
      equity:         req.body?.equity ?? equity,
      balance:        req.body?.balance ?? balance,
      dailyPnl:       req.body?.dailyPnl ?? dailyPnl,
      weeklyPnl:      allTimePnl / 4,
      monthlyPnl:     allTimePnl,
      winRate:        avgWinRate,
      avgWin:         wins.length ? wins.reduce((a, b) => a + b, 0) / wins.length : 0,
      avgLoss:        losses.length ? losses.reduce((a, b) => a + b, 0) / losses.length : 0,
      profitFactor:   calcProfitFactor(wins, losses),
      sharpeRatio:    calcSharpe(returns),
      sortinoRatio:   calcSortino(returns),
      recoveryFactor: calcRecoveryFactor(allTimePnl, Math.abs(dailyPnl) * 2 || 1),
      maxDrawdown:    equity > 0 && balance > 0 ? Math.max(0, (balance - equity) / balance * 100) : 0,
      totalTrades:    bots.length,
      openTrades:     bots.filter(b => b.status === "RUNNING").length,
    });
    res.json({ success: true });
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/analytics/activity", async (req, res) => {
  try {
    const limit = Math.min(parseInt(String(req.query.limit ?? 50)), 200);
    const rows = await db.select().from(activityLogsTable)
      .orderBy(desc(activityLogsTable.createdAt)).limit(limit);
    res.json(rows.map(l => ({
      id:          l.id,
      category:    l.category,
      action:      l.action,
      description: l.description,
      severity:    l.severity,
      metadata:    (() => { try { return JSON.parse(l.metadata); } catch { return {}; } })(),
      createdAt:   l.createdAt,
    })));
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
