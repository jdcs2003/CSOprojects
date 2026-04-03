import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, userPermissions, authorizedEmails, PERMISSION_KEYS } from "../drizzle/schema";
import type { PermissionKey } from "../drizzle/schema";
import { ENV } from './_core/env';
import { OWNER_EMAIL, ALL_PERMISSIONS, NO_PERMISSIONS, AUTO_APPROVED_DOMAINS, hasRoleAtLeast } from "@shared/permissions";
import type { PermissionMap } from "@shared/permissions";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
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
    // Check if user already exists
    const existingUsers = await db.select().from(users).where(eq(users.openId, user.openId)).limit(1);
    const isNewUser = existingUsers.length === 0;

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

    // Role assignment logic for new users
    if (isNewUser) {
      const email = user.email || values.email;
      const assignedRole = await determineRoleForNewUser(email as string | null, user.openId);
      values.role = assignedRole;
      updateSet.role = assignedRole;
    } else if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'super_admin';
      updateSet.role = 'super_admin';
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

    // Apply pre-assigned permissions for new users from authorized_emails
    if (isNewUser) {
      const email = user.email || values.email;
      if (email) {
        await applyPreAssignedPermissions(email as string);
      }
    }
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

/**
 * Apply pre-assigned permissions from the authorized_emails table to a newly registered user.
 * This runs after the user record is created, looking up their email in authorized_emails
 * and applying any stored permission profile.
 */
async function applyPreAssignedPermissions(email: string): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    // Find the authorized email entry
    const [authEntry] = await db.select().from(authorizedEmails)
      .where(eq(authorizedEmails.email, email.toLowerCase())).limit(1);
    
    if (!authEntry?.preAssignedPermissions) return;

    // Parse the pre-assigned permissions JSON
    let perms: Record<string, boolean>;
    try {
      perms = JSON.parse(authEntry.preAssignedPermissions);
    } catch {
      return;
    }

    // Find the user by email
    const [user] = await db.select().from(users)
      .where(eq(users.email, email)).limit(1);
    
    if (!user) return;

    // Apply the permissions
    const permValues: Partial<PermissionMap> = {};
    for (const key of PERMISSION_KEYS) {
      if (key in perms) {
        permValues[key as PermissionKey] = perms[key];
      }
    }

    await setUserPermissions(user.id, permValues);
    console.log(`[Auth] Applied pre-assigned permissions for ${email}`);
  } catch (error) {
    console.error(`[Auth] Failed to apply pre-assigned permissions for ${email}:`, error);
  }
}

/**
 * Determine the role for a new user based on:
 * 1. Owner email → super_admin
 * 2. Pre-authorized email → assigned role from DB
 * 3. Auto-approved domain → user (holding area, admin must provision)
 * 4. Otherwise → user (pending review)
 */
async function determineRoleForNewUser(email: string | null, openId: string): Promise<"user" | "admin" | "super_admin" | "client"> {
  // Owner always gets super_admin
  if (email === OWNER_EMAIL || openId === ENV.ownerOpenId) {
    return 'super_admin';
  }

  if (!email) return 'user';

  // Check pre-authorized emails
  const db = await getDb();
  if (db) {
    const [authorized] = await db.select().from(authorizedEmails).where(eq(authorizedEmails.email, email)).limit(1);
    if (authorized) {
      return authorized.role;
    }
  }

  // Auto-approved domains: users can register but land in holding ("user" role)
  // until an admin provisions them. Only pre-authorized emails get admin automatically.
  const domain = email.split('@')[1]?.toLowerCase();
  if (domain && AUTO_APPROVED_DOMAINS.includes(domain)) {
    return 'user'; // Holding area — admin must provision them
  }

  return 'user';
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

/**
 * Get permissions for a user based on their role and email.
 * Owner and super_admins always get full access.
 * Regular admins get their configured permissions.
 * Users/clients get no admin permissions.
 */
export async function getUserPermissions(userId: number, role: string, email: string | null): Promise<PermissionMap> {
  // Owner and super_admins always get full access
  if (email === OWNER_EMAIL || role === 'super_admin') {
    return ALL_PERMISSIONS;
  }

  // Regular users and clients get no admin permissions
  if (!hasRoleAtLeast(role, 'admin')) {
    return NO_PERMISSIONS;
  }

  // Admins get their configured permissions
  const db = await getDb();
  if (!db) return NO_PERMISSIONS;

  const [perms] = await db.select().from(userPermissions).where(eq(userPermissions.userId, userId)).limit(1);
  if (!perms) return NO_PERMISSIONS;

  const result: PermissionMap = { ...NO_PERMISSIONS };
  for (const key of PERMISSION_KEYS) {
    result[key] = (perms as any)[key] === 1;
  }
  return result;
}

/**
 * Set permissions for a user (upsert).
 */
export async function setUserPermissions(userId: number, permissions: Partial<PermissionMap>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const dbValues: Record<string, number> = {};
  for (const key of PERMISSION_KEYS) {
    if (key in permissions) {
      dbValues[key] = permissions[key as PermissionKey] ? 1 : 0;
    }
  }

  const existing = await db.select().from(userPermissions).where(eq(userPermissions.userId, userId)).limit(1);
  if (existing.length > 0) {
    await db.update(userPermissions).set(dbValues).where(eq(userPermissions.userId, userId));
  } else {
    await db.insert(userPermissions).values({ userId, ...dbValues } as any);
  }
}
