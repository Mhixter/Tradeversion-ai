import { pgTable, varchar, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { usersTable } from "./auth";

export const planEnum = pgEnum("plan", ["free","starter","pro","enterprise"]);
export const billingCycleEnum = pgEnum("billing_cycle", ["monthly","annual"]);
export const subStatusEnum = pgEnum("sub_status", ["active","trialing","past_due","canceled","paused"]);

export const subscriptionsTable = pgTable("subscriptions", {
  id:                  varchar("id").primaryKey().default("gen_random_uuid()"),
  userId:              varchar("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  plan:                planEnum("plan").notNull().default("free"),
  status:              subStatusEnum("status").notNull().default("trialing"),
  billingCycle:        billingCycleEnum("billing_cycle").notNull().default("monthly"),
  amountCents:         integer("amount_cents").notNull().default(0),
  trialEndsAt:         timestamp("trial_ends_at", { withTimezone: true }),
  currentPeriodStart:  timestamp("current_period_start", { withTimezone: true }),
  currentPeriodEnd:    timestamp("current_period_end", { withTimezone: true }),
  cancelAtPeriodEnd:   boolean("cancel_at_period_end").notNull().default(false),
  stripeCustomerId:    varchar("stripe_customer_id"),
  stripeSubscriptionId:varchar("stripe_subscription_id"),
  createdAt:           timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt:           timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Subscription = typeof subscriptionsTable.$inferSelect;
export type InsertSubscription = typeof subscriptionsTable.$inferInsert;
