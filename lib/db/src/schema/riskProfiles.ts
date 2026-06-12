import { pgTable, text, serial, timestamp, numeric, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const riskProfilesTable = pgTable("risk_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  name: text("name").notNull().default("Default"),
  maxDailyLoss: numeric("max_daily_loss", { precision: 8, scale: 2 }).notNull().default("5"),
  maxDrawdown: numeric("max_drawdown", { precision: 8, scale: 2 }).notNull().default("10"),
  maxPositionSize: numeric("max_position_size", { precision: 10, scale: 2 }).notNull().default("10"),
  maxOpenTrades: integer("max_open_trades").notNull().default(20),
  maxExposurePercent: numeric("max_exposure_percent", { precision: 8, scale: 2 }).notNull().default("80"),
  maxLeverage: numeric("max_leverage", { precision: 8, scale: 2 }).notNull().default("1.5"),
  maxConcentration: numeric("max_concentration", { precision: 8, scale: 2 }).notNull().default("30"),
  tradingEnabled: boolean("trading_enabled").notNull().default(true),
  killSwitchActive: boolean("kill_switch_active").notNull().default(false),
  killSwitchReason: text("kill_switch_reason"),
  killSwitchAt: timestamp("kill_switch_at", { withTimezone: true }),
  dailyLossToday: numeric("daily_loss_today", { precision: 18, scale: 2 }).notNull().default("0"),
  currentDrawdown: numeric("current_drawdown", { precision: 8, scale: 2 }).notNull().default("0"),
  peakEquity: numeric("peak_equity", { precision: 18, scale: 2 }).notNull().default("0"),
  riskScore: integer("risk_score").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertRiskProfileSchema = createInsertSchema(riskProfilesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertRiskProfile = z.infer<typeof insertRiskProfileSchema>;
export type RiskProfile = typeof riskProfilesTable.$inferSelect;
