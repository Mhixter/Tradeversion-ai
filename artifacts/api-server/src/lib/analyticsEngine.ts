/**
 * AnalyticsEngine — daily PnL snapshots, Sharpe, Sortino, recovery factor.
 * Snapshots are stored in performance_snapshots table once per day.
 * NOTE: Auto-seeding is intentionally disabled — snapshots are only written
 * when real broker/trading data exists.
 */

import { db, performanceSnapshotsTable } from "@workspace/db";
import { desc, eq } from "drizzle-orm";

export interface DailyMetrics {
  date:           string;
  equity:         number;
  balance:        number;
  dailyPnl:       number;
  weeklyPnl:      number;
  monthlyPnl:     number;
  winRate:        number;
  avgWin:         number;
  avgLoss:        number;
  profitFactor:   number;
  sharpeRatio:    number;
  sortinoRatio:   number;
  recoveryFactor: number;
  maxDrawdown:    number;
  totalTrades:    number;
  openTrades:     number;
}

export function calcSharpe(returns: number[], riskFreeRate = 0.05): number {
  if (returns.length < 2) return 0;
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((s, r) => s + Math.pow(r - mean, 2), 0) / (returns.length - 1);
  const std = Math.sqrt(variance);
  if (std === 0) return 0;
  const annualized = (mean - riskFreeRate / 252) / std * Math.sqrt(252);
  return parseFloat(annualized.toFixed(4));
}

export function calcSortino(returns: number[], riskFreeRate = 0.05): number {
  if (returns.length < 2) return 0;
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const downsideReturns = returns.filter(r => r < riskFreeRate / 252);
  if (downsideReturns.length === 0) return 3.0;
  const downsideVariance = downsideReturns.reduce((s, r) => s + Math.pow(r - riskFreeRate / 252, 2), 0) / downsideReturns.length;
  const downsideStd = Math.sqrt(downsideVariance);
  if (downsideStd === 0) return 3.0;
  const annualized = (mean - riskFreeRate / 252) / downsideStd * Math.sqrt(252);
  return parseFloat(annualized.toFixed(4));
}

export function calcRecoveryFactor(netProfit: number, maxDrawdown: number): number {
  if (maxDrawdown <= 0) return 0;
  return parseFloat((netProfit / maxDrawdown).toFixed(4));
}

export function calcProfitFactor(wins: number[], losses: number[]): number {
  const grossWin  = wins.reduce((a, b) => a + b, 0);
  const grossLoss = Math.abs(losses.reduce((a, b) => a + b, 0));
  if (grossLoss === 0) return grossWin > 0 ? 9.99 : 0;
  return parseFloat((grossWin / grossLoss).toFixed(4));
}

export async function takeSnapshot(botId: number | null, metrics: DailyMetrics): Promise<void> {
  const today = new Date().toISOString().slice(0, 10);
  const existing = await db.select().from(performanceSnapshotsTable)
    .where(eq(performanceSnapshotsTable.snapshotDate, today)).limit(1);

  const values = {
    botId,
    snapshotDate:    today,
    equity:          String(metrics.equity),
    balance:         String(metrics.balance),
    dailyPnl:        String(metrics.dailyPnl),
    weeklyPnl:       String(metrics.weeklyPnl),
    monthlyPnl:      String(metrics.monthlyPnl),
    winRate:         String(metrics.winRate),
    avgWin:          String(metrics.avgWin),
    avgLoss:         String(metrics.avgLoss),
    profitFactor:    String(metrics.profitFactor),
    sharpeRatio:     String(metrics.sharpeRatio),
    sortinoRatio:    String(metrics.sortinoRatio),
    recoveryFactor:  String(metrics.recoveryFactor),
    maxDrawdown:     String(metrics.maxDrawdown),
    totalTrades:     metrics.totalTrades,
    openTrades:      metrics.openTrades,
  };

  if (existing.length === 0) {
    await db.insert(performanceSnapshotsTable).values(values);
  } else {
    await db.update(performanceSnapshotsTable).set(values)
      .where(eq(performanceSnapshotsTable.id, existing[0].id));
  }
}

export async function getSnapshots(limit = 30) {
  return db.select().from(performanceSnapshotsTable)
    .orderBy(desc(performanceSnapshotsTable.snapshotDate)).limit(limit);
}

export function buildEquityCurve(snapshots: typeof performanceSnapshotsTable.$inferSelect[]) {
  return snapshots.reverse().map(s => ({
    date:      s.snapshotDate,
    equity:    parseFloat(String(s.equity)),
    balance:   parseFloat(String(s.balance)),
    dailyPnl:  parseFloat(String(s.dailyPnl)),
  }));
}
