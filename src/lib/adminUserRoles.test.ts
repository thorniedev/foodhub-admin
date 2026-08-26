import { describe, expect, it } from "vitest";

import {
  canManageAdminUser,
  getAdminUserPrimaryRole,
  getAdminUserRoles,
  normalizeRoleName,
} from "./adminUserRoles";
import type { AdminUser } from "@/src/types/userProfile";

function adminUser(roles: string[]): AdminUser {
  return {
    uuid: "user-1",
    username: "demo",
    firstName: null,
    lastName: null,
    primaryEmail: null,
    emailVerified: true,
    status: "ACTIVE",
    lastLoginAt: null,
    createdAt: "2026-08-25T00:00:00Z",
    updatedAt: "2026-08-25T00:00:00Z",
    role: roles[0] ?? null,
    roles,
  };
}

describe("admin user roles", () => {
  it("normalizes Keycloak role names", () => {
    expect(normalizeRoleName("ROLE_super_admin")).toBe("SUPER_ADMIN");
    expect(normalizeRoleName(" admin ")).toBe("ADMIN");
    expect(normalizeRoleName("default-roles-foodhub")).toBe("USER");
    expect(normalizeRoleName(null)).toBe("");
  });

  it("prioritizes privileged roles for display", () => {
    expect(getAdminUserRoles(adminUser(["USER", "ADMIN"]))).toEqual([
      "ADMIN",
      "USER",
    ]);
    expect(getAdminUserPrimaryRole(adminUser(["USER", "SUPER_ADMIN"]))).toBe(
      "SUPER_ADMIN",
    );
  });

  it("allows super admins to manage admins and normal users but not super admins", () => {
    expect(canManageAdminUser("SUPER_ADMIN", adminUser(["ADMIN"]))).toBe(true);
    expect(canManageAdminUser("SUPER_ADMIN", adminUser(["USER"]))).toBe(true);
    expect(canManageAdminUser("SUPER_ADMIN", adminUser(["SUPER_ADMIN"]))).toBe(
      false,
    );
  });

  it("allows admins to manage only normal users", () => {
    expect(canManageAdminUser("ADMIN", adminUser(["USER"]))).toBe(true);
    expect(canManageAdminUser("ADMIN", adminUser(["ADMIN"]))).toBe(false);
    expect(canManageAdminUser("ADMIN", adminUser(["SUPER_ADMIN"]))).toBe(false);
  });
});
