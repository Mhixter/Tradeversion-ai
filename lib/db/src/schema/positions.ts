import { pgTable, text, serial, timestamp, numeric, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const positionsTable = pgTable("positions", {
  id: serial("id").primaryKey(),
  botId: integer("bot_id"),
  signalId: integer("signal_id"),
  brokerId: integer("broker_id"),
  symbol: text("symbol").notNull(),
  type: text("type").notNull(),
  size: numeric("size", { precision: 10, scale: 2 }).notNull(),
  openPrice: numeric("open_price", { precision: 12, scale: 5 }).notNull(),
  currentPrice: numeric("current_price", { precision: 12, scale: 5 }),
  closePrice: numeric("close_price", { precision: 12, scale: 5 }),
  stopLoss: numeric("stop_loss", { precision: 12, scale: 5 }),
  takeProfit: numeric("take_profit", { precision: 12, scale: 5 }),
  pnl: numeric("pnl", { precision: 18, scale: 2 }).notNull().default("0"),
  pips: numeric("pips", { precision: 10, scale: 1 }).notNull().default("0"),
  commission: numeric("commission", { precision: 10, scale: 2 }).notNull().default("0"),
  swap: numeric("swap", { precision: 10, scale: 2 }).notNull().default("0"),
  status: text("status").notNull().default("OPEN"),
  brokerTicket: text("broker_ticket"),
  magicNumber: integer("magic_number"),
  comment: text("comment").notNull().default(""),
  openedAt: timestamp("opened_at", { withTimezone: true }).notNull().defaultNow(),
  closedAt: timestamp("closed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertPositionSchema = createInsertSchema(positionsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertPosition = z.infer<typeof insertPositionSchema>;
export type Position = typeof positionsTable.$inferSelect;
