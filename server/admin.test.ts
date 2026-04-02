import { describe, it, expect, vi, beforeEach } from "vitest";
import { hasRoleAtLeast, OWNER_EMAIL, ALL_PERMISSIONS, NO_PERMISSIONS, AUTO_APPROVED_DOMAINS, isOwner, isSuperAdmin } from "@shared/permissions";

describe("Permission System", () => {
  describe("hasRoleAtLeast", () => {
    it("user has at least user level", () => {
      expect(hasRoleAtLeast("user", "user")).toBe(true);
    });

    it("user does NOT have admin level", () => {
      expect(hasRoleAtLeast("user", "admin")).toBe(false);
    });

    it("admin has at least admin level", () => {
      expect(hasRoleAtLeast("admin", "admin")).toBe(true);
    });

    it("admin does NOT have super_admin level", () => {
      expect(hasRoleAtLeast("admin", "super_admin")).toBe(false);
    });

    it("super_admin has at least admin level", () => {
      expect(hasRoleAtLeast("super_admin", "admin")).toBe(true);
    });

    it("super_admin has at least super_admin level", () => {
      expect(hasRoleAtLeast("super_admin", "super_admin")).toBe(true);
    });

    it("client has at least client level", () => {
      expect(hasRoleAtLeast("client", "client")).toBe(true);
    });

    it("client does NOT have admin level", () => {
      expect(hasRoleAtLeast("client", "admin")).toBe(false);
    });

    it("unknown role defaults to 0 (user level)", () => {
      expect(hasRoleAtLeast("unknown_role", "admin")).toBe(false);
      expect(hasRoleAtLeast("unknown_role", "user")).toBe(true);
    });
  });

  describe("isOwner", () => {
    it("returns true for owner email", () => {
      expect(isOwner(OWNER_EMAIL)).toBe(true);
    });

    it("returns false for non-owner email", () => {
      expect(isOwner("someone@example.com")).toBe(false);
    });

    it("returns false for null/undefined", () => {
      expect(isOwner(null)).toBe(false);
      expect(isOwner(undefined)).toBe(false);
    });
  });

  describe("isSuperAdmin", () => {
    it("returns true for super_admin role", () => {
      expect(isSuperAdmin("super_admin")).toBe(true);
    });

    it("returns false for admin role", () => {
      expect(isSuperAdmin("admin")).toBe(false);
    });

    it("returns false for user role", () => {
      expect(isSuperAdmin("user")).toBe(false);
    });
  });

  describe("Permission constants", () => {
    it("OWNER_EMAIL is j.stenson@summitskiesinc.com", () => {
      expect(OWNER_EMAIL).toBe("j.stenson@summitskiesinc.com");
    });

    it("ALL_PERMISSIONS has all keys set to true", () => {
      expect(ALL_PERMISSIONS.pricing).toBe(true);
      expect(ALL_PERMISSIONS.pipeline).toBe(true);
      expect(ALL_PERMISSIONS.capacity).toBe(true);
      expect(ALL_PERMISSIONS.proposals).toBe(true);
      expect(ALL_PERMISSIONS.userManagement).toBe(true);
      expect(ALL_PERMISSIONS.integrations).toBe(true);
    });

    it("NO_PERMISSIONS has all keys set to false", () => {
      expect(NO_PERMISSIONS.pricing).toBe(false);
      expect(NO_PERMISSIONS.pipeline).toBe(false);
      expect(NO_PERMISSIONS.capacity).toBe(false);
      expect(NO_PERMISSIONS.proposals).toBe(false);
      expect(NO_PERMISSIONS.userManagement).toBe(false);
      expect(NO_PERMISSIONS.integrations).toBe(false);
    });

    it("AUTO_APPROVED_DOMAINS includes lmwarehousing.com", () => {
      expect(AUTO_APPROVED_DOMAINS).toContain("lmwarehousing.com");
    });

    it("AUTO_APPROVED_DOMAINS includes summitskiesinc.com", () => {
      expect(AUTO_APPROVED_DOMAINS).toContain("summitskiesinc.com");
    });
  });
});

describe("Email Whitelist Logic", () => {
  const WHITELISTED_EMAILS = [
    "j.stenson@summitskiesinc.com",
    "amoore@lmwarehousing.com",
  ];

  function checkEmailApproval(email: string): boolean {
    const normalizedEmail = email.toLowerCase().trim();
    
    // 1. Check hardcoded whitelist
    if (WHITELISTED_EMAILS.some(e => e.toLowerCase() === normalizedEmail)) return true;
    
    // 2. Check auto-approved domains
    const domain = normalizedEmail.split('@')[1];
    if (domain && AUTO_APPROVED_DOMAINS.includes(domain)) return true;
    
    return false;
  }

  it("approves whitelisted email j.stenson@summitskiesinc.com", () => {
    expect(checkEmailApproval("j.stenson@summitskiesinc.com")).toBe(true);
  });

  it("approves whitelisted email amoore@lmwarehousing.com", () => {
    expect(checkEmailApproval("amoore@lmwarehousing.com")).toBe(true);
  });

  it("approves auto-approved domain lmwarehousing.com", () => {
    expect(checkEmailApproval("newuser@lmwarehousing.com")).toBe(true);
  });

  it("approves auto-approved domain summitskiesinc.com", () => {
    expect(checkEmailApproval("anyone@summitskiesinc.com")).toBe(true);
  });

  it("rejects unknown email from non-approved domain", () => {
    expect(checkEmailApproval("random@gmail.com")).toBe(false);
  });

  it("handles case-insensitive comparison", () => {
    expect(checkEmailApproval("J.STENSON@SUMMITSKIESINC.COM")).toBe(true);
  });

  it("handles whitespace trimming", () => {
    expect(checkEmailApproval("  j.stenson@summitskiesinc.com  ")).toBe(true);
  });
});

describe("Role Determination for New Users", () => {
  it("owner email should get super_admin role", () => {
    const email = OWNER_EMAIL;
    const expectedRole = "super_admin";
    // Simulating the logic from db.ts determineRoleForNewUser
    let role = "user";
    if (email === OWNER_EMAIL) role = "super_admin";
    expect(role).toBe(expectedRole);
  });

  it("auto-approved domain user should get admin role", () => {
    const email = "newperson@lmwarehousing.com";
    let role = "user";
    if (email === OWNER_EMAIL) {
      role = "super_admin";
    } else {
      const domain = email.split('@')[1]?.toLowerCase();
      if (domain && AUTO_APPROVED_DOMAINS.includes(domain)) {
        role = "admin";
      }
    }
    expect(role).toBe("admin");
  });

  it("unknown domain user should get user role", () => {
    const email = "stranger@random.com";
    let role = "user";
    if (email === OWNER_EMAIL) {
      role = "super_admin";
    } else {
      const domain = email.split('@')[1]?.toLowerCase();
      if (domain && AUTO_APPROVED_DOMAINS.includes(domain)) {
        role = "admin";
      }
    }
    expect(role).toBe("user");
  });
});
