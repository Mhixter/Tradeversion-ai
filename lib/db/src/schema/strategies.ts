import { pgTable, text, serial, timestamp, numeric, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const strategiesTable = pgTable("strategies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  status: text("status").notNull().default("DRAFT"),
  market: text("market").notNull(),
  symbol: text("symbol").notNull(),
  timeframe: text("timeframe").notNull(),
  description: text("description").notNull().default(""),
  riskPerTrade: numeric("risk_per_trade", { precision: 8, scale: 2 }).notNull().default("2"),
  takeProfit: numeric("take_profit", { precision: 8, scale: 2 }).notNull().default("50"),
  stopLoss: numeric("stop_loss", { precision: 8, scale: 2 }).notNull().default("25"),
  trailingStop: numeric("trailing_stop", { precision: 8, scale: 2 }).notNull().default("15"),
  magicNumber: integer("magic_number"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertStrategySchema = createInsertSchema(strategiesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertStrategy = z.infer<typeof insertStrategySchema>;
export type Strategy = typeof strategiesTable.$inferSelect;
