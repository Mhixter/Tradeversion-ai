import { pgTable, text, serial, timestamp, numeric, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const backtestsTable = pgTable("backtests", {
  id: serial("id").primaryKey(),
  strategyName: text("strategy_name").notNull(),
  account: text("account").notNull(),
  symbol: text("symbol").notNull(),
  timeframe: text("timeframe").notNull(),
  fromDate: text("from_date").notNull(),
  toDate: text("to_date").notNull(),
  status: text("status").notNull().default("COMPLETE"),
  netProfit: numeric("net_profit", { precision: 18, scale: 2 }),
  totalReturn: numeric("total_return", { precision: 8, scale: 4 }),
  profitFactor: numeric("profit_factor", { precision: 8, scale: 4 }),
  winRate: numeric("win_rate", { precision: 8, scale: 4 }),
  totalTrades: integer("total_trades"),
  sharpeRatio: numeric("sharpe_ratio", { precision: 8, scale: 4 }),
  maxDrawdown: numeric("max_drawdown", { precision: 8, scale: 4 }),
  expectancy: numeric("expectancy", { precision: 18, scale: 2 }),
  totalDays: integer("total_days"),
  totalBars: integer("total_bars"),
  dataQuality: numeric("data_quality", { precision: 8, scale: 4 }),
  initialBalance: numeric("initial_balance", { precision: 18, scale: 2 }).notNull().default("10000"),
  leverage: text("leverage").notNull().default("1:100"),
  commission: numeric("commission", { precision: 8, scale: 2 }).notNull().default("7"),
  spread: numeric("spread", { precision: 8, scale: 2 }).notNull().default("1.0"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertBacktestSchema = createInsertSchema(backtestsTable).omit({ id: true, createdAt: true });
export type InsertBacktest = z.infer<typeof insertBacktestSchema>;
export type Backtest = typeof backtestsTable.$inferSelect;
