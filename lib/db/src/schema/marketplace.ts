import { pgTable, text, serial, timestamp, numeric, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const marketplaceTable = pgTable("marketplace", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  description: text("description").notNull().default(""),
  winRate: numeric("win_rate", { precision: 8, scale: 2 }).notNull().default("0"),
  profitFactor: numeric("profit_factor", { precision: 8, scale: 2 }).notNull().default("0"),
  maxDrawdown: numeric("max_drawdown", { precision: 8, scale: 2 }).notNull().default("0"),
  price: numeric("price", { precision: 10, scale: 2 }).notNull().default("0"),
  author: text("author").notNull(),
  authorRating: numeric("author_rating", { precision: 4, scale: 2 }).notNull().default("4.5"),
  rating: numeric("rating", { precision: 4, scale: 2 }).notNull().default("4.5"),
  subscribers: integer("subscribers").notNull().default(0),
  isSubscribed: boolean("is_subscribed").notNull().default(false),
  isPremium: boolean("is_premium").notNull().default(false),
  isNew: boolean("is_new").notNull().default(false),
  market: text("market").notNull().default("Forex"),
  timeframe: text("timeframe").notNull().default("M15"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertMarketplaceSchema = createInsertSchema(marketplaceTable).omit({ id: true, createdAt: true });
export type InsertMarketplace = z.infer<typeof insertMarketplaceSchema>;
export type Marketplace = typeof marketplaceTable.$inferSelect;
