import type { AdminUser } from "@/src/types/userProfile";

const ROLE_PRIORITY = ["SUPER_ADMIN", "ADMIN", "USER", "CUSTOMER"];

export function normalizeRoleName(role: unknown): string {
  if (typeof role !== "string") {
    return "";
  }

  const normalized = role.trim().toUpperCase();
  return normalized.startsWith("ROLE_")
    ? normalized.slice("ROLE_".length)
    : normalized;
}

export function getAdminUserRoles(user: AdminUser | null): string[] {
  if (!user) {
    return [];
  }

  const rawRoles = [
    user.role,
    ...(Array.isArray(user.roles) ? user.roles : []),
    ...(((user as any).realm_access?.roles ?? []) as unknown[]),
    ...Object.values((user as any).resource_access ?? {}).flatMap((access) =>
      Array.isArray((access as any)?.roles) ? (access as any).roles : [],
    ),
  ];

  return [...new Set(rawRoles.map(normalizeRoleName).filter(Boolean))].sort(
    (first, second) => {
      const firstIndex = ROLE_PRIORITY.indexOf(first);
      const secondIndex = ROLE_PRIORITY.indexOf(second);
      const firstRank = firstIndex === -1 ? ROLE_PRIORITY.length : firstIndex;
      const secondRank = secondIndex === -1 ? ROLE_PRIORITY.length : secondIndex;

      if (firstRank !== secondRank) {
        return firstRank - secondRank;
      }

      return first.localeCompare(second);
    },
  );
}

export function getAdminUserPrimaryRole(user: AdminUser | null): string {
  return getAdminUserRoles(user)[0] ?? "USER";
}

export function canManageAdminUser(
  currentAdminRole: string,
  targetUser: AdminUser,
): boolean {
  const currentRole = normalizeRoleName(currentAdminRole);
  const targetRoles = getAdminUserRoles(targetUser);

  if (currentRole === "SUPER_ADMIN") {
    return !targetRoles.includes("SUPER_ADMIN");
  }

  if (currentRole === "ADMIN") {
    return !targetRoles.includes("ADMIN") && !targetRoles.includes("SUPER_ADMIN");
  }

  return false;
}
