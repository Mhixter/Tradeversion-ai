import { pgTable, varchar, date, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { usersTable } from "./auth";

export const kycStatusEnum    = pgEnum("kyc_status",    ["not_started","pending","under_review","approved","rejected","requires_resubmission"]);
export const kycDocTypeEnum   = pgEnum("kyc_doc_type",  ["passport","national_id","drivers_license","residence_permit"]);
export const kycAddressDocEnum= pgEnum("kyc_address_doc",["utility_bill","bank_statement","government_letter"]);
export const riskLevelEnum    = pgEnum("risk_level",    ["low","medium","high","pep"]);

export const kycVerificationsTable = pgTable("kyc_verifications", {
  id:               varchar("id").primaryKey().default("gen_random_uuid()"),
  userId:           varchar("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  status:           kycStatusEnum("status").notNull().default("not_started"),
  riskLevel:        riskLevelEnum("risk_level").default("low"),

  // Personal details
  firstName:        varchar("first_name"),
  lastName:         varchar("last_name"),
  middleName:       varchar("middle_name"),
  dateOfBirth:      date("date_of_birth"),
  nationality:      varchar("nationality", { length: 3 }),  // ISO 3166-1 alpha-3
  countryOfResidence: varchar("country_of_residence", { length: 3 }),
  taxId:            varchar("tax_id"),

  // Address
  addressLine1:     varchar("address_line1"),
  addressLine2:     varchar("address_line2"),
  city:             varchar("city"),
  state:            varchar("state"),
  postalCode:       varchar("postal_code"),
  country:          varchar("country", { length: 3 }),

  // Identity document
  docType:          kycDocTypeEnum("doc_type"),
  docNumber:        varchar("doc_number"),
  docIssuingCountry:varchar("doc_issuing_country", { length: 3 }),
  docExpiryDate:    date("doc_expiry_date"),
  docFrontUrl:      varchar("doc_front_url"),
  docBackUrl:       varchar("doc_back_url"),
  selfieUrl:        varchar("selfie_url"),

  // Proof of address
  addressDocType:   kycAddressDocEnum("address_doc_type"),
  addressDocUrl:    varchar("address_doc_url"),

  // Declarations
  isPep:            varchar("is_pep"),           // politically exposed person
  isUsCitizen:      varchar("is_us_citizen"),
  sourceOfFunds:    varchar("source_of_funds"),
  employmentStatus: varchar("employment_status"),
  annualIncome:     varchar("annual_income"),

  // Review
  reviewerNotes:    text("reviewer_notes"),
  rejectionReason:  text("rejection_reason"),
  submittedAt:      timestamp("submitted_at", { withTimezone: true }),
  reviewedAt:       timestamp("reviewed_at", { withTimezone: true }),
  createdAt:        timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt:        timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type KycVerification = typeof kycVerificationsTable.$inferSelect;
export type InsertKycVerification = typeof kycVerificationsTable.$inferInsert;
