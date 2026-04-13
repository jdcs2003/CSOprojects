import { int, json, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";
import type { ProposalSeedSection } from "../shared/proposalSeed";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const proposals = mysqlTable("proposals", {
  id: int("id").autoincrement().primaryKey(),
  publicId: varchar("publicId", { length: 40 }).notNull().unique(),
  proposalName: varchar("proposalName", { length: 255 }).notNull(),
  clientName: varchar("clientName", { length: 255 }).notNull(),
  proposalTitle: varchar("proposalTitle", { length: 255 }).notNull(),
  proposalSubtitle: varchar("proposalSubtitle", { length: 255 }).notNull(),
  preparedBy: varchar("preparedBy", { length: 255 }).notNull(),
  issueDate: varchar("issueDate", { length: 20 }).notNull(),
  effectiveDate: varchar("effectiveDate", { length: 20 }).notNull(),
  expirationDate: varchar("expirationDate", { length: 20 }).notNull(),
  introText: text("introText").notNull(),
  verificationNote: text("verificationNote").notNull(),
  brandingNote: text("brandingNote").notNull(),
  publicSummary: text("publicSummary").notNull(),
  serviceLanes: json("serviceLanes").$type<string[]>().notNull(),
  sections: json("sections").$type<ProposalSeedSection[]>().notNull(),
  logoMode: mysqlEnum("logoMode", ["wordmark", "monogram"]).default("wordmark").notNull(),
  accentColor: varchar("accentColor", { length: 24 }).notNull(),
  accentSoftColor: varchar("accentSoftColor", { length: 24 }).notNull(),
  status: mysqlEnum("status", ["draft", "published"]).default("draft").notNull(),
  publicSlug: varchar("publicSlug", { length: 255 }).notNull().unique(),
  createdByUserId: int("createdByUserId"),
  publishedAt: timestamp("publishedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Proposal = typeof proposals.$inferSelect;
export type InsertProposal = typeof proposals.$inferInsert;
