import { NOT_ADMIN_ERR_MSG, UNAUTHED_ERR_MSG } from '@shared/const';
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";
import { hasRoleAtLeast, OWNER_EMAIL } from "@shared/permissions";
import { getUserPermissions } from "../db";
import type { PermissionKey } from "../../drizzle/schema";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

const requireUser = t.middleware(async opts => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const protectedProcedure = t.procedure.use(requireUser);

/**
 * Requires admin, super_admin, or owner role.
 * Does NOT check individual permissions — use createPermissionProcedure for that.
 */
export const adminProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;

    if (!ctx.user || !hasRoleAtLeast(ctx.user.role, 'admin')) {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  }),
);

/**
 * Requires super_admin or owner role.
 */
export const superAdminProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;

    if (!ctx.user || !hasRoleAtLeast(ctx.user.role, 'super_admin')) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Super admin access required" });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  }),
);

/**
 * Creates a procedure that requires a specific permission.
 * Super admins and owner bypass permission checks.
 * Admins need the specific permission flag set.
 */
export function createPermissionProcedure(permission: PermissionKey) {
  return t.procedure.use(
    t.middleware(async opts => {
      const { ctx, next } = opts;

      if (!ctx.user || !hasRoleAtLeast(ctx.user.role, 'admin')) {
        throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
      }

      // Super admins and owner always pass
      if (ctx.user.role === 'super_admin' || ctx.user.email === OWNER_EMAIL) {
        return next({ ctx: { ...ctx, user: ctx.user } });
      }

      // Check specific permission for admins
      const perms = await getUserPermissions(ctx.user.id, ctx.user.role, ctx.user.email);
      if (!perms[permission]) {
        throw new TRPCError({ 
          code: "FORBIDDEN", 
          message: `You do not have permission to access this section` 
        });
      }

      return next({
        ctx: {
          ...ctx,
          user: ctx.user,
        },
      });
    }),
  );
}
