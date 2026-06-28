import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { companiesTable } from "./departments";

export const referProjectAccountStatusEnum = pgEnum("refer_project_account_status", ["running", "stopped", "error"]);
export const referProjectConnectionStatusEnum = pgEnum("refer_project_connection_status", ["connected", "disconnected", "reconnecting"]);
export const referProjectDirectionModeEnum = pgEnum("refer_project_direction_mode", ["BUY_ONLY", "SELL_ONLY"]);
export const referProjectTradeStatusEnum = pgEnum("refer_project_trade_status", ["OPEN", "CLOSED", "REJECTED", "SKIPPED"]);
export const referProjectCloseReasonEnum = pgEnum("refer_project_close_reason", ["TIMER_CLOSE", "MANUAL_CLOSE", "BROKER_REJECT", "SYSTEM_CLOSE"]);
export const referProjectLogTypeEnum = pgEnum("refer_project_log_type", [
  "LOGIN",
  "LOGOUT",
  "CONNECTION",
  "DISCONNECTION",
  "TRADE_OPEN",
  "TRADE_CLOSE",
  "AI_DECISION",
  "REJECTED_TRADE",
  "MARGIN_ERROR",
  "SPREAD_TOO_HIGH",
  "SKIPPED_TRADE",
  "TIMER_CLOSE",
  "SYSTEM_RESTART",
]);

export const referProjectSettingsTable = pgTable("refer_project_settings", {
  companyId: varchar("company_id").primaryKey().references(() => companiesTable.id, { onDelete: "cascade" }),
  enabled: boolean("enabled").notNull().default(false),
  maxOpenPositionsPerAccount: integer("max_open_positions_per_account").notNull().default(20),
  maxOpenPositionsPerSymbol: integer("max_open_positions_per_symbol").notNull().default(5),
  tradingHours: text("trading_hours").notNull().default("00:00-23:59"),
  allowedSymbols: text("allowed_symbols").array().notNull().default(sql`ARRAY['EURUSD','GBPUSD','XAUUSD']::text[]`),
  minimumAiConfidence: integer("minimum_ai_confidence").notNull().default(65),
  maximumSpread: numeric("maximum_spread", { precision: 10, scale: 2 }).notNull().default("30"),
  maximumDailyVolumeTarget: numeric("maximum_daily_volume_target", { precision: 18, scale: 2 }).notNull().default("25"),
  closeAfterMinutes: integer("close_after_minutes").notNull().default(7),
  lotSize: numeric("lot_size", { precision: 10, scale: 2 }).notNull().default("0.01"),
  directionMode: referProjectDirectionModeEnum("direction_mode").notNull().default("BUY_ONLY"),
  aiWeights: jsonb("ai_weights").notNull().default({
    trend: 30,
    momentum: 20,
    volatility: 15,
    supportResistance: 15,
    spread: 10,
    marketStructure: 10,
  }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const referProjectAccountsTable = pgTable("refer_project_accounts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companiesTable.id, { onDelete: "cascade" }),
  accountName: text("account_name").notNull(),
  mt5Login: text("mt5_login").notNull(),
  passwordEncrypted: text("password_encrypted").notNull(),
  server: text("server").notNull(),
  brokerName: text("broker_name").notNull().default("XM"),
  accountType: text("account_type").notNull().default("Ultra Low Standard"),
  leverage: text("leverage").notNull().default("1:1000"),
  status: referProjectAccountStatusEnum("status").notNull().default("stopped"),
  connectionStatus: referProjectConnectionStatusEnum("connection_status").notNull().default("disconnected"),
  lastSyncTime: timestamp("last_sync_time", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => [index("refer_project_accounts_company_idx").on(table.companyId)]);

export const referProjectTradesTable = pgTable("refer_project_trades", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companiesTable.id, { onDelete: "cascade" }),
  accountId: varchar("account_id").notNull().references(() => referProjectAccountsTable.id, { onDelete: "cascade" }),
  ticket: text("ticket").notNull(),
  symbol: text("symbol").notNull(),
  direction: text("direction").notNull(),
  lot: numeric("lot", { precision: 10, scale: 2 }).notNull().default("0.01"),
  openTime: timestamp("open_time", { withTimezone: true }).notNull().defaultNow(),
  closeTime: timestamp("close_time", { withTimezone: true }),
  status: referProjectTradeStatusEnum("status").notNull().default("OPEN"),
  closeReason: referProjectCloseReasonEnum("close_reason"),
  profitLoss: numeric("profit_loss", { precision: 18, scale: 2 }).notNull().default("0"),
  confidence: integer("confidence"),
  marketDirection: text("market_direction"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => [
  index("refer_project_trades_company_idx").on(table.companyId),
  index("refer_project_trades_account_idx").on(table.accountId),
  index("refer_project_trades_symbol_idx").on(table.symbol),
]);

export const referProjectAiDecisionsTable = pgTable("refer_project_ai_decisions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companiesTable.id, { onDelete: "cascade" }),
  accountId: varchar("account_id").notNull().references(() => referProjectAccountsTable.id, { onDelete: "cascade" }),
  symbol: text("symbol").notNull(),
  confidence: integer("confidence").notNull(),
  threshold: integer("threshold").notNull(),
  decision: text("decision").notNull(),
  reason: text("reason").notNull(),
  factors: jsonb("factors").notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [index("refer_project_ai_decisions_company_idx").on(table.companyId)]);

export const referProjectLogsTable = pgTable("refer_project_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companiesTable.id, { onDelete: "cascade" }),
  accountId: varchar("account_id").references(() => referProjectAccountsTable.id, { onDelete: "set null" }),
  eventType: referProjectLogTypeEnum("event_type").notNull(),
  message: text("message").notNull(),
  metadata: jsonb("metadata").notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [index("refer_project_logs_company_idx").on(table.companyId)]);

export type ReferProjectSettings = typeof referProjectSettingsTable.$inferSelect;
export type ReferProjectAccount = typeof referProjectAccountsTable.$inferSelect;
export type ReferProjectTrade = typeof referProjectTradesTable.$inferSelect;
