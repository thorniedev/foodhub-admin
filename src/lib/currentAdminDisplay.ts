import type { CurrentAdmin } from "@/src/types/currentAdmin";

export function getAdminDisplayName(
  admin: CurrentAdmin | null,
): string {
  if (!admin) {
    return "Admin";
  }

  const fullName = [
    admin.firstName,
    admin.lastName,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return (
    fullName ||
    admin.username ||
    "Admin"
  );
}

export function getAdminEmail(
  admin: CurrentAdmin | null,
): string {
  return (
    admin?.email ||
    admin?.primaryEmail ||
    ""
  );
}

export function getAdminInitials(
  admin: CurrentAdmin | null,
): string {
  if (!admin) {
    return "A";
  }

  if (
    admin.firstName ||
    admin.lastName
  ) {
    const first =
      admin.firstName?.trim().charAt(0) ??
      "";

    const last =
      admin.lastName?.trim().charAt(0) ??
      "";

    const initials =
      `${first}${last}`.toUpperCase();

    if (initials) {
      return initials;
    }
  }

  const username =
    admin.username?.trim();

  if (username) {
    return username
      .charAt(0)
      .toUpperCase();
  }

  return "A";
}

export function getAdminUsername(
  admin: CurrentAdmin | null,
): string {
  if (!admin) {
    return "Admin";
  }

  return (
    admin.username ||
    getAdminDisplayName(admin)
  );
}

export function getAdminRole(
  admin: CurrentAdmin | null,
): string {
  if (!admin) {
    return "ADMIN";
  }

  const raw =
    (admin as any).role ||
    (admin as any).roles?.[0] ||
    (admin as any).realm_access?.roles?.find((r: string) =>
      r.toUpperCase().includes("ADMIN"),
    ) ||
    (admin as any).userType ||
    "ADMIN";

  return String(raw).toUpperCase().replace(/^ROLE_/, "");
}

export function getAdminAvatarCandidate(
  admin: CurrentAdmin | null,
): { mediaUuid: string | null; directUrl: string | null } {
  if (!admin) {
    return { mediaUuid: null, directUrl: null };
  }

  const candidates = [
    (admin as any).avatarUrl,
    (admin as any).profileImageUrl,
    (admin as any).picture,
    (admin as any).photoUrl,
    (admin as any).imageUrl,
    (admin as any).avatar,
    (admin as any).avatarMediaUuid,
    (admin as any).profilePictureMediaUuid,
  ];

  for (const c of candidates) {
    if (typeof c === "string" && c.trim()) {
      const trimmed = c.trim();
      if (
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          trimmed,
        )
      ) {
        return { mediaUuid: trimmed, directUrl: null };
      }
      return { mediaUuid: null, directUrl: trimmed };
    }
  }

  return { mediaUuid: null, directUrl: null };
}