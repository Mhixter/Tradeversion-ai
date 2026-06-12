import { pgTable, text, serial, timestamp, numeric, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const performanceSnapshotsTable = pgTable("performance_snapshots", {
  id: serial("id").primaryKey(),
  botId: integer("bot_id"),
  brokerId: integer("broker_id"),
  snapshotDate: text("snapshot_date").notNull(),
  equity: numeric("equity", { precision: 18, scale: 2 }).notNull(),
  balance: numeric("balance", { precision: 18, scale: 2 }).notNull(),
  dailyPnl: numeric("daily_pnl", { precision: 18, scale: 2 }).notNull().default("0"),
  weeklyPnl: numeric("weekly_pnl", { precision: 18, scale: 2 }).notNull().default("0"),
  monthlyPnl: numeric("monthly_pnl", { precision: 18, scale: 2 }).notNull().default("0"),
  winRate: numeric("win_rate", { precision: 8, scale: 2 }).notNull().default("0"),
  avgWin: numeric("avg_win", { precision: 18, scale: 2 }).notNull().default("0"),
  avgLoss: numeric("avg_loss", { precision: 18, scale: 2 }).notNull().default("0"),
  profitFactor: numeric("profit_factor", { precision: 8, scale: 4 }).notNull().default("0"),
  sharpeRatio: numeric("sharpe_ratio", { precision: 8, scale: 4 }).notNull().default("0"),
  sortinoRatio: numeric("sortino_ratio", { precision: 8, scale: 4 }).notNull().default("0"),
  recoveryFactor: numeric("recovery_factor", { precision: 8, scale: 4 }).notNull().default("0"),
  maxDrawdown: numeric("max_drawdown", { precision: 8, scale: 2 }).notNull().default("0"),
  totalTrades: integer("total_trades").notNull().default(0),
  openTrades: integer("open_trades").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertPerformanceSnapshotSchema = createInsertSchema(performanceSnapshotsTable).omit({ id: true, createdAt: true });
export type InsertPerformanceSnapshot = z.infer<typeof insertPerformanceSnapshotSchema>;
export type PerformanceSnapshot = typeof performanceSnapshotsTable.$inferSelect;
