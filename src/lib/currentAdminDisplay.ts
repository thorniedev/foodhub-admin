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