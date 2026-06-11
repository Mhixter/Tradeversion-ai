import { pgTable, text, serial, timestamp, numeric, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const botsTable = pgTable("bots", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  strategy: text("strategy").notNull(),
  strategyType: text("strategy_type").notNull().default("Scalping"),
  account: text("account").notNull(),
  accountNumber: text("account_number").notNull().default(""),
  market: text("market").notNull(),
  timeframe: text("timeframe").notNull(),
  status: text("status").notNull().default("STOPPED"),
  pnlToday: numeric("pnl_today", { precision: 18, scale: 2 }).notNull().default("0"),
  pnlTodayPercent: numeric("pnl_today_percent", { precision: 8, scale: 2 }).notNull().default("0"),
  pnlAllTime: numeric("pnl_all_time", { precision: 18, scale: 2 }).notNull().default("0"),
  pnlAllTimePercent: numeric("pnl_all_time_percent", { precision: 8, scale: 2 }).notNull().default("0"),
  winRate: numeric("win_rate", { precision: 8, scale: 2 }).notNull().default("0"),
  isAI: boolean("is_ai").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertBotSchema = createInsertSchema(botsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertBot = z.infer<typeof insertBotSchema>;
export type Bot = typeof botsTable.$inferSelect;
