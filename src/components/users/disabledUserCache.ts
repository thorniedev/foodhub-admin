
import type { AdminUser } from "@/src/types/userProfile";

const STORAGE_KEY = "foodhub-admin-disabled-users";

function isDisabledUser(user: AdminUser) {
  return user.status === "DISABLED" || user.status === "DELETED";
}

export function readDisabledUserCache(): AdminUser[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as unknown;

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (user): user is AdminUser =>
        Boolean(user) &&
        typeof user === "object" &&
        typeof (user as AdminUser).uuid === "string",
    );
  } catch {
    return [];
  }
}

export function writeDisabledUserCache(users: AdminUser[]) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  } catch {
    // Ignore storage failures. The backend remains the source of truth.
  }
}

export function upsertDisabledUserCache(user: AdminUser) {
  const disabledUser: AdminUser = {
    ...user,
    status: "DISABLED" as AdminUser["status"],
  };

  const current = readDisabledUserCache();
  const withoutCurrentUser = current.filter((item) => item.uuid !== user.uuid);

  writeDisabledUserCache([disabledUser, ...withoutCurrentUser]);

  return disabledUser;
}

export function removeDisabledUserCache(userUuid: string) {
  const current = readDisabledUserCache();
  writeDisabledUserCache(current.filter((user) => user.uuid !== userUuid));
}

export function mergeUsersWithDisabledCache(
  apiUsers: AdminUser[],
  cachedDisabledUsers: AdminUser[],
) {
  const merged = new Map<string, AdminUser>();

  // Cache first, API second. If the API returns the same user again,
  // the API version wins because it is the newest source of truth.
  cachedDisabledUsers.forEach((user) => {
    if (isDisabledUser(user)) {
      merged.set(user.uuid, user);
    }
  });

  apiUsers.forEach((user) => {
    merged.set(user.uuid, user);
  });

  return Array.from(merged.values());
}
