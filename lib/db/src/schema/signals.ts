import { pgTable, text, serial, timestamp, numeric, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const signalsTable = pgTable("signals", {
  id: serial("id").primaryKey(),
  botId: integer("bot_id"),
  strategyId: integer("strategy_id"),
  symbol: text("symbol").notNull(),
  action: text("action").notNull(),
  confidence: numeric("confidence", { precision: 5, scale: 2 }).notNull().default("0"),
  riskScore: numeric("risk_score", { precision: 5, scale: 2 }).notNull().default("0"),
  stopLoss: numeric("stop_loss", { precision: 12, scale: 5 }),
  takeProfit: numeric("take_profit", { precision: 12, scale: 5 }),
  entryPrice: numeric("entry_price", { precision: 12, scale: 5 }),
  reason: text("reason").notNull().default(""),
  indicators: text("indicators").notNull().default("{}"),
  status: text("status").notNull().default("PENDING"),
  passedRisk: boolean("passed_risk").notNull().default(false),
  riskRejectionReason: text("risk_rejection_reason"),
  executionId: integer("execution_id"),
  generatedAt: timestamp("generated_at", { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertSignalSchema = createInsertSchema(signalsTable).omit({ id: true, createdAt: true });
export type InsertSignal = z.infer<typeof insertSignalSchema>;
export type Signal = typeof signalsTable.$inferSelect;
