import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const staffMembersTable = pgTable("staff_members", {
  id:           serial("id").primaryKey(),
  name:         text("name").notNull(),
  email:        text("email").notNull().unique(),
  role:         text("role").notNull().default("support"),
  department:   text("department").notNull().default("Support"),
  status:       text("status").notNull().default("active"),
  phone:        text("phone"),
  bio:          text("bio"),
  invitedAt:    timestamp("invited_at",  { withTimezone: true }).notNull().defaultNow(),
  joinedAt:     timestamp("joined_at",   { withTimezone: true }),
  createdAt:    timestamp("created_at",  { withTimezone: true }).notNull().defaultNow(),
  updatedAt:    timestamp("updated_at",  { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertStaffMemberSchema = createInsertSchema(staffMembersTable)
  .omit({ id: true, createdAt: true, updatedAt: true, invitedAt: true });
export type InsertStaffMember = z.infer<typeof insertStaffMemberSchema>;
export type StaffMember = typeof staffMembersTable.$inferSelect;
