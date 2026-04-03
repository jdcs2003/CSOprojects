import { int, double, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "super_admin", "client"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  tutorialCompleted: int("tutorialCompleted").default(0).notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Per-user granular permissions for admin sections.
 * Adapted for pricing dashboard features.
 */
export const userPermissions = mysqlTable("user_permissions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().unique(), // references users.id
  // Admin section permissions (1 = has access, 0 = no access)
  pricing: int("pricing").default(0).notNull(),               // Pricing Calculator & Quotes
  pipeline: int("pipeline").default(0).notNull(),              // Sales Pipeline Management
  capacity: int("capacity").default(0).notNull(),              // Capacity Tracking
  proposals: int("proposals").default(0).notNull(),            // Locked Proposals (view)
  userManagement: int("user_management").default(0).notNull(), // User Management
  integrations: int("integrations").default(0).notNull(),      // Integrations
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type UserPermission = typeof userPermissions.$inferSelect;
export type InsertUserPermission = typeof userPermissions.$inferInsert;

// Permission keys for iteration
export const PERMISSION_KEYS = [
  "pricing",
  "pipeline",
  "capacity",
  "proposals",
  "userManagement",
  "integrations",
] as const;

export type PermissionKey = typeof PERMISSION_KEYS[number];

/**
 * Pre-authorized emails for automatic role assignment.
 * Super admins can add emails before users log in.
 */
export const authorizedEmails = mysqlTable("authorized_emails", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  role: mysqlEnum("role", ["user", "admin", "super_admin", "client"]).default("user").notNull(),
  preAssignedPermissions: text("pre_assigned_permissions"), // JSON string of permission profile
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdBy: varchar("created_by", { length: 320 }).notNull(),
});

export type AuthorizedEmail = typeof authorizedEmails.$inferSelect;
export type InsertAuthorizedEmail = typeof authorizedEmails.$inferInsert;

/**
 * Integrations table for HubSpot, QuickBooks, etc.
 * Stores connection config and status.
 */
export const integrations = mysqlTable("integrations", {
  id: int("id").autoincrement().primaryKey(),
  type: varchar("type", { length: 50 }).notNull(), // hubspot, quickbooks
  name: varchar("name", { length: 255 }).notNull(),
  config: text("config"), // JSON config
  status: varchar("status", { length: 20 }).notNull().default("pending"), // pending, active, error
  installedBy: varchar("installed_by", { length: 255 }),
  lastSynced: timestamp("last_synced"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type Integration = typeof integrations.$inferSelect;
export type InsertIntegration = typeof integrations.$inferInsert;

/**
 * Facility capacity tracking table
 * Stores monthly available square footage for each L&M facility
 */
export const facilityCapacity = mysqlTable("facilityCapacity", {
  id: int("id").autoincrement().primaryKey(),
  facilityCode: varchar("facilityCode", { length: 20 }).notNull(),
  facilityName: varchar("facilityName", { length: 100 }).notNull(),
  month: varchar("month", { length: 7 }).notNull(), // Format: YYYY-MM
  totalSquareFeet: int("totalSquareFeet").notNull(),
  availableSquareFeet: int("availableSquareFeet").notNull(),
  notes: text("notes"),
  updatedBy: varchar("updatedBy", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FacilityCapacity = typeof facilityCapacity.$inferSelect;
export type InsertFacilityCapacity = typeof facilityCapacity.$inferInsert;

/**
 * Saved quotes table
 * Stores all calculator inputs for retrieval and editing
 */
export const savedQuotes = mysqlTable("savedQuotes", {
  id: int("id").autoincrement().primaryKey(),
  quoteName: varchar("quoteName", { length: 200 }).notNull(),
  company: mysqlEnum("company", ["L&M", "Peach"]).notNull(),
  
  // Client Information
  clientCompany: varchar("clientCompany", { length: 200 }),
  clientContact: varchar("clientContact", { length: 100 }),
  clientAddress1: varchar("clientAddress1", { length: 200 }),
  clientAddress2: varchar("clientAddress2", { length: 100 }),
  clientCity: varchar("clientCity", { length: 100 }),
  clientState: varchar("clientState", { length: 2 }),
  clientZip: varchar("clientZip", { length: 10 }),
  clientPhone: varchar("clientPhone", { length: 20 }),
  clientEmail: varchar("clientEmail", { length: 320 }),
  
  // Facility & Volume
  facilityId: varchar("facilityId", { length: 50 }).notNull(),
  selectedFacility: varchar("selectedFacility", { length: 50 }).notNull(),
  monthlyPallets: int("monthlyPallets").notNull(),
  monthlyTurns: int("monthlyTurns").notNull(), // Store as integer (multiply by 100)
  sqFtPerPallet: int("sqFtPerPallet").notNull(),
  stackHeight: int("stackHeight").notNull(),
  
  // Labor & Margins
  laborRate: int("laborRate").notNull(),
  taxRate: int("taxRate").notNull(),
  fullyLoadedLaborRate: int("fullyLoadedLaborRate").notNull(), // Store as cents
  inboundMinutes: int("inboundMinutes").notNull(),
  outboundMinutes: int("outboundMinutes").notNull(),
  storageMargin: int("storageMargin").notNull(),
  handlingInMargin: int("handlingInMargin").notNull(),
  handlingOutMargin: int("handlingOutMargin").notNull(),
  monthlyStorageMinimum: int("monthlyStorageMinimum"), // Store as cents
  
  // Value-Added Services
  pickType: mysqlEnum("pickType", ["full", "layer", "case"]).notNull(),
  monthlyOrders: int("monthlyOrders").notNull(),
  casesPerOrder: int("casesPerOrder").notNull(),
  labelsPerOrder: int("labelsPerOrder").notNull(),
  casePickRate: double("casePickRate").notNull(), // Dollar amount (e.g., 0.40)
  layerPickRate: double("layerPickRate").notNull(),
  palletSupplyFee: double("palletSupplyFee").notNull(),
  shrinkWrapFee: double("shrinkWrapFee").notNull(),
  labelingFee: double("labelingFee").notNull(),
  orderProcessingFee: double("orderProcessingFee").notNull(),
  cancellationFee: double("cancellationFee").notNull(),
  palletPickRate: double("palletPickRate"),
  newAccountSetupFee: double("newAccountSetupFee"),
  casePickMargin: int("casePickMargin").notNull(),
  palletSupplyMargin: int("palletSupplyMargin").notNull(),
  shrinkWrapMargin: int("shrinkWrapMargin").notNull(),
  labelingMargin: int("labelingMargin").notNull(),
  orderProcessingMargin: int("orderProcessingMargin").notNull(),
  cancellationMargin: int("cancellationMargin").notNull(),
  
  // Contract Discounts
  tier1Name: varchar("tier1Name", { length: 50 }),
  tier1Length: varchar("tier1Length", { length: 50 }),
  tier1Discount: int("tier1Discount"),
  tier1Enabled: int("tier1Enabled").default(1), // 1 = enabled, 0 = disabled
  tier2Name: varchar("tier2Name", { length: 50 }),
  tier2Length: varchar("tier2Length", { length: 50 }),
  tier2Discount: int("tier2Discount"),
  tier2Enabled: int("tier2Enabled").default(1),
  tier3Name: varchar("tier3Name", { length: 50 }),
  tier3Length: varchar("tier3Length", { length: 50 }),
  tier3Discount: int("tier3Discount"),
  tier3Enabled: int("tier3Enabled").default(1),
  tier4Name: varchar("tier4Name", { length: 50 }),
  tier4Length: varchar("tier4Length", { length: 50 }),
  tier4Discount: int("tier4Discount"),
  tier4Enabled: int("tier4Enabled").default(1),
  selectedDiscountTier: varchar("selectedDiscountTier", { length: 20 }),
  
  // Rate Overrides (nullable, store as cents)
  storageRateOverride: int("storageRateOverride"),
  handlingInRateOverride: int("handlingInRateOverride"),
  handlingOutRateOverride: int("handlingOutRateOverride"),
  
  // Transportation/Freight Lanes (JSON stored as text)
  freightLanes: text("freightLanes"), // JSON array of freight lane objects
  
  // Proposal Details
  productDescription: varchar("productDescription", { length: 500 }),
  accountOverview: text("accountOverview"),
  palletStacking: varchar("palletStacking", { length: 50 }),
  orderProcessingTime: varchar("orderProcessingTime", { length: 50 }),
  
  // VAS Toggles (JSON)
  vasToggles: text("vasToggles"),
  
  // Locked PDF
  lockedPdfUrl: text("lockedPdfUrl"),
  
  // Terms & Disclosures
  quoteValidDays: int("quoteValidDays"),
  paymentTerms: varchar("paymentTerms", { length: 100 }),
  minimumCommitment: varchar("minimumCommitment", { length: 100 }),
  customDisclosures: text("customDisclosures"),
  
  createdBy: varchar("createdBy", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SavedQuote = typeof savedQuotes.$inferSelect;
export type InsertSavedQuote = typeof savedQuotes.$inferInsert;

/**
 * Pipeline deals table
 * Tracks all proposals/deals through sales pipeline stages
 */
export const pipelineDeals = mysqlTable("pipelineDeals", {
  id: int("id").autoincrement().primaryKey(),
  
  // Client info
  clientName: varchar("clientName", { length: 200 }).notNull(),
  clientContact: varchar("clientContact", { length: 200 }),
  clientEmail: varchar("clientEmail", { length: 320 }),
  clientPhone: varchar("clientPhone", { length: 20 }),
  
  // Deal info
  dealName: varchar("dealName", { length: 300 }).notNull(),
  serviceType: mysqlEnum("serviceType", ["warehousing", "transportation", "ecommerce", "crossdock", "rework", "mixed"]).notNull(),
  facility: varchar("facility", { length: 100 }),
  company: mysqlEnum("company", ["L&M", "Peach"]).default("L&M").notNull(),
  
  // Pipeline stage
  stage: mysqlEnum("stage", ["lead", "proposal_sent", "under_review", "negotiating", "signed", "active", "lost"]).default("lead").notNull(),
  
  // Financials
  estimatedMonthlyRevenue: int("estimatedMonthlyRevenue"), // Store as cents
  estimatedAnnualRevenue: int("estimatedAnnualRevenue"), // Store as cents
  estimatedPallets: int("estimatedPallets"),
  estimatedLoads: int("estimatedLoads"), // For transportation deals
  
  // Dates
  proposalDate: timestamp("proposalDate"),
  expectedCloseDate: timestamp("expectedCloseDate"),
  actualCloseDate: timestamp("actualCloseDate"),
  
  // Linked quote (optional)
  savedQuoteId: int("savedQuoteId"),
  
  // Notes & details
  keyServices: text("keyServices"), // JSON array of service descriptions
  notes: text("notes"),
  probability: int("probability"), // 0-100 percent
  
  createdBy: varchar("createdBy", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PipelineDeal = typeof pipelineDeals.$inferSelect;
export type InsertPipelineDeal = typeof pipelineDeals.$inferInsert;
