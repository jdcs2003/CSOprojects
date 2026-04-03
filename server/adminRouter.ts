import { router, protectedProcedure, adminProcedure, superAdminProcedure, createPermissionProcedure } from "./_core/trpc";
import { z } from "zod";
import { getDb, getUserPermissions, setUserPermissions } from "./db";
import { users, authorizedEmails, userPermissions, PERMISSION_KEYS } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { hasRoleAtLeast, OWNER_EMAIL, type PermissionMap } from "@shared/permissions";

// Permission profile presets for quick assignment
const PERMISSION_PROFILES: Record<string, Partial<PermissionMap>> = {
  full_admin: {
    pricing: true,
    pipeline: true,
    capacity: true,
    proposals: true,
    userManagement: true,
    integrations: true,
  },
  finance_admin: {
    pricing: false,
    pipeline: true,
    capacity: false,
    proposals: true,
    userManagement: false,
    integrations: true,
  },
  onboarding_manager: {
    pricing: false,
    pipeline: true,
    capacity: true,
    proposals: true,
    userManagement: false,
    integrations: false,
  },
  sales_rep: {
    pricing: true,
    pipeline: true,
    capacity: false,
    proposals: true,
    userManagement: false,
    integrations: false,
  },
};

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

  // Apply a permission profile preset to a user
  applyPermissionProfile: adminProcedure
    .input(
      z.object({
        userId: z.number(),
        profile: z.enum(["full_admin", "finance_admin", "onboarding_manager", "sales_rep"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const [targetUser] = await db.select().from(users).where(eq(users.id, input.userId)).limit(1);
      if (!targetUser) throw new Error("User not found");
      
      if (targetUser.email === OWNER_EMAIL || targetUser.role === 'super_admin') {
        throw new Error("Cannot modify permissions for owner or super admin");
      }
      
      const profilePerms = PERMISSION_PROFILES[input.profile];
      if (!profilePerms) throw new Error("Unknown permission profile");
      
      await setUserPermissions(input.userId, profilePerms);
      return { success: true, profile: input.profile };
    }),

  // Get available permission profiles
  getPermissionProfiles: adminProcedure.query(() => {
    return {
      full_admin: { label: "Full Admin", description: "Full access to all sections", permissions: PERMISSION_PROFILES.full_admin },
      finance_admin: { label: "Finance Admin", description: "Proposals (read-only), pipeline, QuickBooks integration", permissions: PERMISSION_PROFILES.finance_admin },
      onboarding_manager: { label: "Onboarding Manager", description: "Proposals (read-only), pipeline management, capacity tracking", permissions: PERMISSION_PROFILES.onboarding_manager },
      sales_rep: { label: "Sales Rep", description: "Pricing calculator, pipeline, proposals", permissions: PERMISSION_PROFILES.sales_rep },
    };
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
  getAllAuthorizedEmails: adminProcedure.query(async ({ ctx }) => {
    // Allow admins with userManagement permission to see authorized emails
    const perms = await getUserPermissions(ctx.user.id, ctx.user.role, ctx.user.email);
    if (!perms.userManagement && !hasRoleAtLeast(ctx.user.role, 'super_admin') && ctx.user.email !== OWNER_EMAIL) {
      return [];
    }
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    return await db.select().from(authorizedEmails);
  }),

  addAuthorizedEmail: adminProcedure
    .input(
      z.object({
        email: z.string().email(),
        role: z.enum(["user", "admin", "super_admin", "client"]),
        permissionProfile: z.enum(["full_admin", "finance_admin", "onboarding_manager", "sales_rep", "none"]).optional(),
        customPermissions: z.object({
          pricing: z.boolean().optional(),
          pipeline: z.boolean().optional(),
          capacity: z.boolean().optional(),
          proposals: z.boolean().optional(),
          userManagement: z.boolean().optional(),
          integrations: z.boolean().optional(),
        }).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      // Check if caller has userManagement permission
      const callerPerms = await getUserPermissions(ctx.user.id, ctx.user.role, ctx.user.email);
      if (!callerPerms.userManagement && !hasRoleAtLeast(ctx.user.role, 'super_admin') && ctx.user.email !== OWNER_EMAIL) {
        throw new Error("You need User Management permission to invite users");
      }
      
      if (input.role === 'super_admin' && ctx.user.email !== OWNER_EMAIL) {
        throw new Error("Only the owner can pre-authorize super admin roles");
      }
      
      // Build pre-assigned permissions from profile or custom
      let preAssignedPerms: Record<string, boolean> | null = null;
      if (input.permissionProfile && input.permissionProfile !== 'none') {
        preAssignedPerms = { ...PERMISSION_PROFILES[input.permissionProfile] } as Record<string, boolean>;
      } else if (input.customPermissions) {
        preAssignedPerms = {} as Record<string, boolean>;
        for (const key of PERMISSION_KEYS) {
          preAssignedPerms[key] = (input.customPermissions as any)[key] || false;
        }
      }
      
      // Permission cap: non-owner/non-super_admin can't grant perms they don't have
      if (preAssignedPerms && !hasRoleAtLeast(ctx.user.role, 'super_admin') && ctx.user.email !== OWNER_EMAIL) {
        for (const [key, value] of Object.entries(preAssignedPerms)) {
          if (value === true && !(callerPerms as any)[key]) {
            throw new Error(`You cannot grant '${key}' permission because you don't have it yourself`);
          }
        }
      }
      
      // Check if email already exists — update instead of failing on duplicate
      const [existing] = await db.select().from(authorizedEmails)
        .where(eq(authorizedEmails.email, input.email.toLowerCase()))
        .limit(1);
      
      if (existing) {
        // Update existing record with new role and permissions
        await db.update(authorizedEmails)
          .set({
            role: input.role,
            preAssignedPermissions: preAssignedPerms ? JSON.stringify(preAssignedPerms) : null,
            createdBy: ctx.user.email || "admin",
          })
          .where(eq(authorizedEmails.id, existing.id));
      } else {
        await db.insert(authorizedEmails).values({
          email: input.email.toLowerCase(),
          role: input.role,
          createdBy: ctx.user.email || "admin",
          preAssignedPermissions: preAssignedPerms ? JSON.stringify(preAssignedPerms) : null,
        });
      }

      return { 
        success: true, 
        permissionProfile: input.permissionProfile || "none",
      };
    }),

  removeAuthorizedEmail: superAdminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(authorizedEmails).where(eq(authorizedEmails.id, input.id));
      return { success: true };
    }),

  // Generate welcome email content for a team member
  generateWelcomeEmail: adminProcedure
    .input(
      z.object({
        email: z.string().email(),
        name: z.string().optional(),
        role: z.enum(["user", "admin", "super_admin", "client"]),
        permissionProfile: z.enum(["full_admin", "finance_admin", "onboarding_manager", "sales_rep", "none"]).optional(),
      })
    )
    .query(({ input }) => {
      const firstName = input.name || input.email.split("@")[0];
      const profileLabels: Record<string, string> = {
        full_admin: "Admin (full access to proposals, pricing, pipeline, and more)",
        finance_admin: "Finance Admin - you can view proposals (read-only), view the pipeline, export data, and install QuickBooks integration",
        onboarding_manager: "Onboarding Manager - you can view proposals (read-only), manage the onboarding pipeline, edit capacity tracking, and export data",
        sales_rep: "Sales Rep - you can create pricing quotes, manage the pipeline, and view proposals",
        none: input.role === "admin" ? "Admin" : input.role === "client" ? "Client" : "User",
      };

      const accessLevel = profileLabels[input.permissionProfile || "none"];

      const subject = "Welcome to the CSO Pricing Dashboard - Quick Start Guide";
      const content = `Hey ${firstName},

You have been set up with access to the CSO Pricing Dashboard. This is the tool we are using for pricing proposals, contract generation, and pipeline management.

When you first log in, there is a short tutorial you will need to go through before you can access everything. It is quick and covers the basics so you know where things are.

Log in here with your L&M Google account:
https://pricingdashboard.manus.space

Your access level: ${accessLevel}

Let me know if you have any questions.

- Jim`;

      return { subject, content, to: input.email };
    }),
});
