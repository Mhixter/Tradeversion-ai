import { pgTable, text, serial, timestamp, numeric, boolean, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const brokersTable = pgTable("brokers", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 }),
  broker: text("broker").notNull(),
  platform: text("platform").notNull(),
  accountNumber: text("account_number").notNull(),
  equity: numeric("equity", { precision: 18, scale: 2 }).notNull().default("0"),
  balance: numeric("balance", { precision: 18, scale: 2 }).notNull().default("0"),
  profit: numeric("profit", { precision: 18, scale: 2 }).notNull().default("0"),
  profitPercent: numeric("profit_percent", { precision: 8, scale: 2 }).notNull().default("0"),
  status: text("status").notNull().default("LIVE"),
  server: text("server").notNull(),
  isConnected: boolean("is_connected").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertBrokerSchema = createInsertSchema(brokersTable).omit({ id: true, createdAt: true });
export type InsertBroker = z.infer<typeof insertBrokerSchema>;
export type Broker = typeof brokersTable.$inferSelect;
