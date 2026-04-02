/**
 * Permission system constants and helpers.
 * Used by both server and client.
 * Adapted for CSO Pricing Dashboard.
 */

export const PERMISSION_LABELS: Record<string, string> = {
  pricing: "Pricing Calculator & Quotes",
  pipeline: "Sales Pipeline Management",
  capacity: "Capacity Tracking",
  proposals: "Locked Proposals",
  userManagement: "User Management",
  integrations: "Integrations",
};

export const PERMISSION_DESCRIPTIONS: Record<string, string> = {
  pricing: "Create and manage pricing calculator quotes",
  pipeline: "View and manage the sales pipeline and deal tracking",
  capacity: "View and manage facility capacity tracking",
  proposals: "View locked proposals and generated PDFs",
  userManagement: "Manage user roles and permissions",
  integrations: "Manage integrations (HubSpot, QuickBooks)",
};

// Role hierarchy (higher number = more access)
export const ROLE_HIERARCHY = {
  user: 0,
  client: 1,
  admin: 2,
  super_admin: 3,
} as const;

export type RoleName = keyof typeof ROLE_HIERARCHY;

export const ROLE_LABELS: Record<RoleName, string> = {
  user: "User",
  client: "Client",
  admin: "Admin",
  super_admin: "Super Admin",
};

// Owner email — hardcoded, cannot be demoted
export const OWNER_EMAIL = "j.stenson@summitskiesinc.com";

// Auto-approved domains (users from these domains get auto-promoted to admin on first login)
export const AUTO_APPROVED_DOMAINS = [
  "lmwarehousing.com",
  "summitskiesinc.com",
];

/**
 * Check if a role has higher or equal privilege than another.
 */
export function hasRoleAtLeast(userRole: string, requiredRole: RoleName): boolean {
  const userLevel = ROLE_HIERARCHY[userRole as RoleName] ?? 0;
  const requiredLevel = ROLE_HIERARCHY[requiredRole];
  return userLevel >= requiredLevel;
}

/**
 * Check if user is the hardcoded owner.
 */
export function isOwner(email: string | null | undefined): boolean {
  return email === OWNER_EMAIL;
}

/**
 * Check if user has super_admin or higher privileges.
 */
export function isSuperAdmin(role: string): boolean {
  return hasRoleAtLeast(role, "super_admin");
}

/**
 * Permission map type — boolean version for frontend use.
 */
export type PermissionMap = {
  pricing: boolean;
  pipeline: boolean;
  capacity: boolean;
  proposals: boolean;
  userManagement: boolean;
  integrations: boolean;
};

/**
 * All permissions granted (for super_admin / owner).
 */
export const ALL_PERMISSIONS: PermissionMap = {
  pricing: true,
  pipeline: true,
  capacity: true,
  proposals: true,
  userManagement: true,
  integrations: true,
};

/**
 * No permissions (default for new users).
 */
export const NO_PERMISSIONS: PermissionMap = {
  pricing: false,
  pipeline: false,
  capacity: false,
  proposals: false,
  userManagement: false,
  integrations: false,
};
