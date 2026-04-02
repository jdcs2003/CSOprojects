import { router, protectedProcedure, adminProcedure, superAdminProcedure, createPermissionProcedure } from "./_core/trpc";
import { z } from "zod";
import { getDb, getUserPermissions, setUserPermissions } from "./db";
import { users, authorizedEmails, userPermissions, PERMISSION_KEYS } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { hasRoleAtLeast, OWNER_EMAIL, type PermissionMap } from "@shared/permissions";

export const adminRouter = router({
  // Check if user has admin access and return their permissions
  checkAdminAccess: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx.user;
    const isAdmin = hasRoleAtLeast(user.role, "admin");
    
    if (!isAdmin) {
      return { hasAccess: false, user, permissions: null, role: user.role, tutorialCompleted: false };
    }

    const permissions = await getUserPermissions(user.id, user.role, user.email);
    
    // Check tutorial completion status
    const db = await getDb();
    let tutorialCompleted = false;
    if (db) {
      const [dbUser] = await db.select({ tutorialCompleted: users.tutorialCompleted }).from(users).where(eq(users.id, user.id)).limit(1);
      tutorialCompleted = dbUser?.tutorialCompleted === 1;
    }
    // Owner always bypasses tutorial
    if (user.email === OWNER_EMAIL) tutorialCompleted = true;
    
    return { 
      hasAccess: true, 
      user, 
      permissions,
      role: user.role,
      isOwner: user.email === OWNER_EMAIL,
      isSuperAdmin: hasRoleAtLeast(user.role, "super_admin"),
      tutorialCompleted,
    };
  }),

  // ===== USER MANAGEMENT =====
  
  getAllUsers: adminProcedure.query(async ({ ctx }) => {
    const perms = await getUserPermissions(ctx.user.id, ctx.user.role, ctx.user.email);
    if (!perms.userManagement) {
      return [];
    }
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const allUsers = await db.select().from(users);
    
    // Also fetch permissions for each user
    const allPerms = await db.select().from(userPermissions);
    const permsMap = new Map(allPerms.map(p => [p.userId, p]));
    
    return allUsers.map(u => ({
      ...u,
      permissions: permsMap.get(u.id) || null,
    }));
  }),

  updateUserRole: superAdminProcedure
    .input(
      z.object({
        userId: z.number(),
        role: z.enum(["user", "admin", "super_admin", "client"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const [targetUser] = await db.select().from(users).where(eq(users.id, input.userId)).limit(1);
      if (!targetUser) throw new Error("User not found");
      
      if (targetUser.email === OWNER_EMAIL) {
        throw new Error("Cannot change the owner's role");
      }
      
      if (targetUser.role === 'super_admin' && ctx.user.email !== OWNER_EMAIL) {
        throw new Error("Only the owner can modify super admin roles");
      }
      if (input.role === 'super_admin' && ctx.user.email !== OWNER_EMAIL) {
        throw new Error("Only the owner can promote users to super admin");
      }
      
      await db
        .update(users)
        .set({ role: input.role })
        .where(eq(users.id, input.userId));
      return { success: true };
    }),

  updateUserPermissions: adminProcedure
    .input(
      z.object({
        userId: z.number(),
        permissions: z.object({
          pricing: z.boolean().optional(),
          pipeline: z.boolean().optional(),
          capacity: z.boolean().optional(),
          proposals: z.boolean().optional(),
          userManagement: z.boolean().optional(),
          integrations: z.boolean().optional(),
        }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const [targetUser] = await db.select().from(users).where(eq(users.id, input.userId)).limit(1);
      if (!targetUser) throw new Error("User not found");
      
      if (targetUser.email === OWNER_EMAIL || targetUser.role === 'super_admin') {
        throw new Error("Cannot modify permissions for owner or super admin — they always have full access");
      }
      
      const assignerPerms = await getUserPermissions(ctx.user.id, ctx.user.role, ctx.user.email);
      
      if (!hasRoleAtLeast(ctx.user.role, 'super_admin') && ctx.user.email !== OWNER_EMAIL) {
        if (!assignerPerms.userManagement) {
          throw new Error("You need User Management permission to assign permissions");
        }
        for (const [key, value] of Object.entries(input.permissions)) {
          if (value === true && !(assignerPerms as any)[key]) {
            throw new Error(`You cannot grant '${key}' permission because you don't have it yourself`);
          }
        }
      }
      
      await setUserPermissions(input.userId, input.permissions as Partial<PermissionMap>);
      return { success: true };
    }),

  // Complete tutorial for the current user
  completeTutorial: protectedProcedure
    .input(z.object({ score: z.number().min(0).max(100) }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      if (input.score < 80) {
        throw new Error("You need at least 80% to pass the tutorial. Please try again.");
      }
      
      await db
        .update(users)
        .set({ tutorialCompleted: 1 })
        .where(eq(users.id, ctx.user.id));
      return { success: true };
    }),

  // Get tutorial status for current user
  getTutorialStatus: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const [user] = await db.select().from(users).where(eq(users.id, ctx.user.id)).limit(1);
    return { completed: user?.tutorialCompleted === 1 };
  }),

  // Authorized Emails Management
  getAllAuthorizedEmails: superAdminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    return await db.select().from(authorizedEmails);
  }),

  addAuthorizedEmail: superAdminProcedure
    .input(
      z.object({
        email: z.string().email(),
        role: z.enum(["user", "admin", "super_admin", "client"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      if (input.role === 'super_admin' && ctx.user.email !== OWNER_EMAIL) {
        throw new Error("Only the owner can pre-authorize super admin roles");
      }
      
      await db.insert(authorizedEmails).values({
        email: input.email,
        role: input.role,
        createdBy: ctx.user.email || "admin",
      });
      return { success: true };
    }),

  removeAuthorizedEmail: superAdminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(authorizedEmails).where(eq(authorizedEmails.id, input.id));
      return { success: true };
    }),
});
