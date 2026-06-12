import { pgTable, text, serial, timestamp, numeric, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const executionsTable = pgTable("executions", {
  id: serial("id").primaryKey(),
  signalId: integer("signal_id"),
  positionId: integer("position_id"),
  botId: integer("bot_id"),
  brokerId: integer("broker_id"),
  symbol: text("symbol").notNull(),
  side: text("side").notNull(),
  volume: numeric("volume", { precision: 10, scale: 2 }).notNull(),
  requestPrice: numeric("request_price", { precision: 12, scale: 5 }),
  fillPrice: numeric("fill_price", { precision: 12, scale: 5 }),
  slippage: numeric("slippage", { precision: 8, scale: 5 }).notNull().default("0"),
  status: text("status").notNull().default("PENDING"),
  brokerTicket: text("broker_ticket"),
  latencyMs: integer("latency_ms"),
  signalTime: timestamp("signal_time", { withTimezone: true }),
  executionTime: timestamp("execution_time", { withTimezone: true }),
  fillTime: timestamp("fill_time", { withTimezone: true }),
  rejectReason: text("reject_reason"),
  rawResponse: text("raw_response"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertExecutionSchema = createInsertSchema(executionsTable).omit({ id: true, createdAt: true });
export type InsertExecution = z.infer<typeof insertExecutionSchema>;
export type Execution = typeof executionsTable.$inferSelect;
