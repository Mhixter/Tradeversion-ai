import { pgTable, text, serial, timestamp, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const tradesTable = pgTable("trades", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull(),
  type: text("type").notNull(),
  size: numeric("size", { precision: 10, scale: 2 }).notNull(),
  profit: numeric("profit", { precision: 18, scale: 2 }).notNull(),
  time: text("time").notNull(),
  entryPrice: numeric("entry_price", { precision: 12, scale: 5 }),
  exitPrice: numeric("exit_price", { precision: 12, scale: 5 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertTradeSchema = createInsertSchema(tradesTable).omit({ id: true, createdAt: true });
export type InsertTrade = z.infer<typeof insertTradeSchema>;
export type Trade = typeof tradesTable.$inferSelect;
