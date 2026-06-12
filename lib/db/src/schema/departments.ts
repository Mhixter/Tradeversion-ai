import { pgTable, varchar, timestamp, pgEnum, integer } from "drizzle-orm/pg-core";
import { usersTable } from "./auth";

export const companyRoleEnum = pgEnum("company_role", ["owner","admin","manager","trader","viewer"]);
export const memberStatusEnum = pgEnum("member_status", ["active","pending","suspended"]);

export const companiesTable = pgTable("companies", {
  id:          varchar("id").primaryKey().default("gen_random_uuid()"),
  name:        varchar("name").notNull(),
  ownerId:     varchar("owner_id").notNull().references(() => usersTable.id),
  country:     varchar("country", { length: 3 }),
  industry:    varchar("industry"),
  website:     varchar("website"),
  logoUrl:     varchar("logo_url"),
  plan:        varchar("plan").notNull().default("starter"),
  createdAt:   timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt:   timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const departmentsTable = pgTable("departments", {
  id:          varchar("id").primaryKey().default("gen_random_uuid()"),
  companyId:   varchar("company_id").notNull().references(() => companiesTable.id, { onDelete: "cascade" }),
  name:        varchar("name").notNull(),
  headUserId:  varchar("head_user_id").references(() => usersTable.id),
  budget:      integer("budget"),
  createdAt:   timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const companyMembersTable = pgTable("company_members", {
  id:           varchar("id").primaryKey().default("gen_random_uuid()"),
  companyId:    varchar("company_id").notNull().references(() => companiesTable.id, { onDelete: "cascade" }),
  userId:       varchar("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  departmentId: varchar("department_id").references(() => departmentsTable.id),
  role:         companyRoleEnum("role").notNull().default("viewer"),
  status:       memberStatusEnum("status").notNull().default("pending"),
  invitedBy:    varchar("invited_by").references(() => usersTable.id),
  joinedAt:     timestamp("joined_at", { withTimezone: true }),
  createdAt:    timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt:    timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const botDepartmentAllocationsTable = pgTable("bot_department_allocations", {
  id:           varchar("id").primaryKey().default("gen_random_uuid()"),
  botId:        integer("bot_id").notNull(),
  departmentId: varchar("department_id").notNull().references(() => departmentsTable.id, { onDelete: "cascade" }),
  allocatedBy:  varchar("allocated_by").references(() => usersTable.id),
  createdAt:    timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Company = typeof companiesTable.$inferSelect;
export type Department = typeof departmentsTable.$inferSelect;
export type CompanyMember = typeof companyMembersTable.$inferSelect;
