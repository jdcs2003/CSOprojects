import { and, desc, eq, ne } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { nanoid } from "nanoid";
import { InsertProposal, InsertUser, Proposal, proposals, users } from "../drizzle/schema";
import { liquidDeathProposalSeed, ProposalSeedSection } from "../shared/proposalSeed";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export type ProposalRecord = Proposal & {
  sections: ProposalSeedSection[];
  serviceLanes: string[];
};

export type ProposalMutationInput = {
  id: number;
  proposalName: string;
  clientName: string;
  proposalTitle: string;
  proposalSubtitle: string;
  preparedBy: string;
  issueDate: string;
  effectiveDate: string;
  expirationDate: string;
  introText: string;
  verificationNote: string;
  brandingNote: string;
  publicSummary: string;
  logoMode: "wordmark" | "monogram";
  accentColor: string;
  accentSoftColor: string;
  publicSlug: string;
  sections: ProposalSeedSection[];
};

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

function collectServiceLanes(sections: ProposalSeedSection[]) {
  const lanes = new Set<string>();

  sections.forEach(section => {
    if (section.laneLabel) {
      lanes.add(section.laneLabel);
    }

    section.lines.forEach(line => {
      if (line.laneLabel) {
        lanes.add(line.laneLabel);
      }
    });
  });

  return Array.from(lanes);
}

function createSeedProposal(userId?: number): InsertProposal {
  return {
    publicId: nanoid(16),
    proposalName: liquidDeathProposalSeed.proposalName,
    clientName: liquidDeathProposalSeed.clientName,
    proposalTitle: liquidDeathProposalSeed.proposalTitle,
    proposalSubtitle: liquidDeathProposalSeed.proposalSubtitle,
    preparedBy: liquidDeathProposalSeed.preparedBy,
    issueDate: liquidDeathProposalSeed.issueDate,
    effectiveDate: liquidDeathProposalSeed.effectiveDate,
    expirationDate: liquidDeathProposalSeed.expirationDate,
    introText: liquidDeathProposalSeed.introText,
    verificationNote: liquidDeathProposalSeed.verificationNote,
    brandingNote: liquidDeathProposalSeed.brandingNote,
    publicSummary: liquidDeathProposalSeed.publicSummary,
    serviceLanes: collectServiceLanes(liquidDeathProposalSeed.sections),
    sections: liquidDeathProposalSeed.sections,
    logoMode: liquidDeathProposalSeed.logoMode,
    accentColor: liquidDeathProposalSeed.accentColor,
    accentSoftColor: liquidDeathProposalSeed.accentSoftColor,
    status: liquidDeathProposalSeed.status,
    publicSlug: liquidDeathProposalSeed.slug,
    createdByUserId: userId,
    publishedAt: liquidDeathProposalSeed.status === "published" ? new Date() : null,
  };
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }

    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function ensureSeedProposal(userId?: number) {
  const db = await getDb();
  if (!db) return;

  const existing = await db.select().from(proposals).limit(1);
  if (existing.length > 0) return;

  await db.insert(proposals).values(createSeedProposal(userId));
}

export async function listProposals() {
  const db = await getDb();
  if (!db) {
    return [] as ProposalRecord[];
  }

  await ensureSeedProposal();
  const rows = await db.select().from(proposals).orderBy(desc(proposals.updatedAt));
  return rows as ProposalRecord[];
}

export async function getProposalById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  await ensureSeedProposal();
  const rows = await db.select().from(proposals).where(eq(proposals.id, id)).limit(1);
  return rows[0] as ProposalRecord | undefined;
}

export async function getProposalBySlug(publicSlug: string, includeDraft = false) {
  const db = await getDb();
  if (!db) return undefined;

  await ensureSeedProposal();
  const filters = includeDraft
    ? eq(proposals.publicSlug, publicSlug)
    : and(eq(proposals.publicSlug, publicSlug), eq(proposals.status, "published"));

  const rows = await db.select().from(proposals).where(filters).limit(1);
  return rows[0] as ProposalRecord | undefined;
}

export async function createProposal(userId?: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const cloneName = `New Proposal ${new Date().toISOString().slice(0, 10)}`;
  const publicSlug = `proposal-${nanoid(8).toLowerCase()}`;
  const values = createSeedProposal(userId);

  values.publicId = nanoid(16);
  values.proposalName = cloneName;
  values.clientName = "New Client";
  values.proposalTitle = "Client Renewal Proposal";
  values.proposalSubtitle = "Presentation Layout and Rate Card";
  values.status = "draft";
  values.publicSlug = publicSlug;
  values.publishedAt = null;
  values.createdByUserId = userId;

  await db.insert(proposals).values(values);
  const rows = await db.select().from(proposals).where(eq(proposals.publicSlug, publicSlug)).limit(1);
  return rows[0] as ProposalRecord;
}

export async function duplicateProposal(id: number, userId?: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const existing = await getProposalById(id);
  if (!existing) {
    throw new Error("Proposal not found");
  }

  const publicSlug = `${existing.publicSlug}-${nanoid(4).toLowerCase()}`;

  await db.insert(proposals).values({
    publicId: nanoid(16),
    proposalName: `${existing.proposalName} Copy`,
    clientName: existing.clientName,
    proposalTitle: existing.proposalTitle,
    proposalSubtitle: existing.proposalSubtitle,
    preparedBy: existing.preparedBy,
    issueDate: existing.issueDate,
    effectiveDate: existing.effectiveDate,
    expirationDate: existing.expirationDate,
    introText: existing.introText,
    verificationNote: existing.verificationNote,
    brandingNote: existing.brandingNote,
    publicSummary: existing.publicSummary,
    serviceLanes: existing.serviceLanes,
    sections: existing.sections,
    logoMode: existing.logoMode,
    accentColor: existing.accentColor,
    accentSoftColor: existing.accentSoftColor,
    status: "draft",
    publicSlug,
    createdByUserId: userId,
    publishedAt: null,
  });

  const rows = await db.select().from(proposals).where(eq(proposals.publicSlug, publicSlug)).limit(1);
  return rows[0] as ProposalRecord;
}

export async function updateProposal(input: ProposalMutationInput) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const existingSlug = await db
    .select({ id: proposals.id })
    .from(proposals)
    .where(and(eq(proposals.publicSlug, input.publicSlug), ne(proposals.id, input.id)))
    .limit(1);

  if (existingSlug.length > 0) {
    throw new Error("Public slug already in use");
  }

  await db
    .update(proposals)
    .set({
      proposalName: input.proposalName,
      clientName: input.clientName,
      proposalTitle: input.proposalTitle,
      proposalSubtitle: input.proposalSubtitle,
      preparedBy: input.preparedBy,
      issueDate: input.issueDate,
      effectiveDate: input.effectiveDate,
      expirationDate: input.expirationDate,
      introText: input.introText,
      verificationNote: input.verificationNote,
      brandingNote: input.brandingNote,
      publicSummary: input.publicSummary,
      logoMode: input.logoMode,
      accentColor: input.accentColor,
      accentSoftColor: input.accentSoftColor,
      publicSlug: input.publicSlug,
      sections: input.sections,
      serviceLanes: collectServiceLanes(input.sections),
    })
    .where(eq(proposals.id, input.id));

  return getProposalById(input.id);
}

export async function setProposalPublishState(id: number, nextStatus: "draft" | "published") {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db
    .update(proposals)
    .set({
      status: nextStatus,
      publishedAt: nextStatus === "published" ? new Date() : null,
    })
    .where(eq(proposals.id, id));

  return getProposalById(id);
}
