import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

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
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

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
  casePickRate: int("casePickRate").notNull(), // Store as cents
  layerPickRate: int("layerPickRate").notNull(),
  palletSupplyFee: int("palletSupplyFee").notNull(),
  shrinkWrapFee: int("shrinkWrapFee").notNull(),
  labelingFee: int("labelingFee").notNull(),
  orderProcessingFee: int("orderProcessingFee").notNull(),
  cancellationFee: int("cancellationFee").notNull(),
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
  tier2Name: varchar("tier2Name", { length: 50 }),
  tier2Length: varchar("tier2Length", { length: 50 }),
  tier2Discount: int("tier2Discount"),
  tier3Name: varchar("tier3Name", { length: 50 }),
  tier3Length: varchar("tier3Length", { length: 50 }),
  tier3Discount: int("tier3Discount"),
  tier4Name: varchar("tier4Name", { length: 50 }),
  tier4Length: varchar("tier4Length", { length: 50 }),
  tier4Discount: int("tier4Discount"),
  selectedDiscountTier: varchar("selectedDiscountTier", { length: 20 }),
  
  // Rate Overrides (nullable, store as cents)
  storageRateOverride: int("storageRateOverride"),
  handlingInRateOverride: int("handlingInRateOverride"),
  handlingOutRateOverride: int("handlingOutRateOverride"),
  
  // Transportation/Freight Lanes (JSON stored as text)
  freightLanes: text("freightLanes"), // JSON array of freight lane objects
  
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