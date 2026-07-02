import { pgTable, serial, varchar, text, numeric, boolean, timestamp, integer, jsonb } from "drizzle-orm/pg-core";

/* ─── Settings (singleton row id=1) ─────────────────────────────────────── */
export const rpSettingsTable = pgTable("rp_settings", {
  id:                     serial("id").primaryKey(),
  enabled:                boolean("enabled").default(false).notNull(),
  maxPositionsPerAccount: integer("max_positions_per_account").default(5).notNull(),
  maxPositionsPerSymbol:  integer("max_positions_per_symbol").default(3).notNull(),
  tradingHoursStart:      varchar("trading_hours_start", { length: 10 }).default("00:00").notNull(),
  tradingHoursEnd:        varchar("trading_hours_end",   { length: 10 }).default("23:59").notNull(),
  allowedSymbols:         text("allowed_symbols").array(),
  minAiConfidence:        numeric("min_ai_confidence",  { precision: 5,  scale: 2 }).default("65").notNull(),
  maxSpread:              numeric("max_spread",          { precision: 8,  scale: 2 }).default("5").notNull(),
  maxDailyVolume:         numeric("max_daily_volume",    { precision: 10, scale: 2 }).default("100").notNull(),
  closeAfterMinutes:      integer("close_after_minutes").default(7).notNull(),
  lotSize:                numeric("lot_size",            { precision: 6,  scale: 2 }).default("0.01").notNull(),
  directionMode:          varchar("direction_mode",      { length: 10 }).default("BUY").notNull(), // BUY | SELL
  updatedAt:              timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

/* ─── MT5 Accounts ───────────────────────────────────────────────────────── */
export const rpAccountsTable = pgTable("rp_accounts", {
  id:               serial("id").primaryKey(),
  accountName:      varchar("account_name",   { length: 255 }).notNull(),
  mt5Login:         varchar("mt5_login",       { length: 100 }).notNull(),
  investorPassword: text("investor_password"),
  tradingPassword:  text("trading_password"),
  server:           varchar("server",          { length: 255 }).notNull(),
  brokerName:       varchar("broker_name",     { length: 100 }).default("XM").notNull(),
  accountType:      varchar("account_type",    { length: 100 }).default("Ultra Low Standard").notNull(),
  leverage:         varchar("leverage",        { length: 20  }).default("1:1000").notNull(),
  status:           varchar("status",          { length: 20  }).default("inactive").notNull(),    // active|inactive|error
  connectionStatus: varchar("connection_status",{ length: 20 }).default("disconnected").notNull(), // connected|disconnected|connecting|error
  lastSyncTime:     timestamp("last_sync_time", { withTimezone: true }),
  balance:             numeric("balance",  { precision: 18, scale: 2 }).default("0"),
  equity:              numeric("equity",   { precision: 18, scale: 2 }).default("0"),
  metaApiAccountId:    varchar("meta_api_account_id", { length: 100 }),
  verificationStatus:  varchar("verification_status",  { length: 20 }).default("unverified").notNull(), // unverified|verifying|verified|failed
  createdAt:           timestamp("created_at",  { withTimezone: true }).defaultNow(),
  updatedAt:           timestamp("updated_at",  { withTimezone: true }).defaultNow(),
});

/* ─── Positions (open + closed) ──────────────────────────────────────────── */
export const rpPositionsTable = pgTable("rp_positions", {
  id:               serial("id").primaryKey(),
  accountId:        integer("account_id").notNull(),
  ticket:           varchar("ticket",       { length: 100 }).notNull(),
  symbol:           varchar("symbol",       { length: 20  }).notNull(),
  direction:        varchar("direction",    { length: 10  }).notNull(), // BUY | SELL
  lotSize:          numeric("lot_size",     { precision: 6,  scale: 2 }).notNull(),
  openPrice:        numeric("open_price",   { precision: 12, scale: 5 }).notNull(),
  closePrice:       numeric("close_price",  { precision: 12, scale: 5 }),
  currentPrice:     numeric("current_price",{ precision: 12, scale: 5 }),
  profit:           numeric("profit",       { precision: 18, scale: 2 }).default("0"),
  openTime:         timestamp("open_time",  { withTimezone: true }).notNull(),
  closeTime:        timestamp("close_time", { withTimezone: true }),
  closeAfterMinutes:integer("close_after_minutes").notNull(),
  status:           varchar("status",       { length: 20 }).default("open").notNull(), // open|closed
  closeReason:      varchar("close_reason", { length: 50 }), // timer|manual|margin|error
  aiConfidence:     numeric("ai_confidence",{ precision: 5, scale: 2 }),
  aiDetails:        jsonb("ai_details"),
  createdAt:        timestamp("created_at", { withTimezone: true }).defaultNow(),
});

/* ─── Event Logs ─────────────────────────────────────────────────────────── */
export const rpLogsTable = pgTable("rp_logs", {
  id:        serial("id").primaryKey(),
  accountId: integer("account_id"),
  event:     varchar("event",   { length: 50  }).notNull(),
  message:   text("message").notNull(),
  details:   jsonb("details"),
  level:     varchar("level",   { length: 10  }).default("info").notNull(), // info|warn|error
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

/* ─── AI Config (singleton row id=1) ─────────────────────────────────────── */
export const rpAiConfigTable = pgTable("rp_ai_config", {
  id:                     serial("id").primaryKey(),
  weightTrend:            numeric("weight_trend",             { precision: 5, scale: 2 }).default("30").notNull(),
  weightMomentum:         numeric("weight_momentum",          { precision: 5, scale: 2 }).default("20").notNull(),
  weightVolatility:       numeric("weight_volatility",        { precision: 5, scale: 2 }).default("15").notNull(),
  weightSupportResistance:numeric("weight_support_resistance",{ precision: 5, scale: 2 }).default("15").notNull(),
  weightSpread:           numeric("weight_spread",            { precision: 5, scale: 2 }).default("10").notNull(),
  weightMarketStructure:  numeric("weight_market_structure",  { precision: 5, scale: 2 }).default("10").notNull(),
  thresholdStrong:        numeric("threshold_strong",         { precision: 5, scale: 2 }).default("80").notNull(),
  thresholdMedium:        numeric("threshold_medium",         { precision: 5, scale: 2 }).default("65").notNull(),
  updatedAt:              timestamp("updated_at", { withTimezone: true }).defaultNow(),
});
