"use client";

import { getSafeAuthReturnPath } from "./authRedirect";

let loginRedirectStarted = false;

const LOGOUT_FLAG = "foodhub_logout_pending";

/**
 * Mark that a logout is in progress.
 *
 * Call this before submitting the logout form so that
 * in-flight 401 responses do not race with the logout
 * redirect chain by starting their own OAuth flow.
 */
export function markLogoutPending(): void {
  if (typeof window === "undefined") {
    return;
  }

  loginRedirectStarted = true;

  try {
    sessionStorage.setItem(LOGOUT_FLAG, "1");
  } catch {
    // Private browsing or storage full – the module guard is enough.
  }
}

/**
 * Redirect away from a stale dashboard after the server has exhausted token
 * refresh.
 * A module-level guard prevents several failed queries from starting several
 * OAuth transactions at the same time.
 */
export function redirectToAdminLogin(): void {
  if (typeof window === "undefined" || loginRedirectStarted) {
    return;
  }

  // If a logout is in progress, do not start a competing OAuth flow.
  try {
    if (sessionStorage.getItem(LOGOUT_FLAG)) {
      return;
    }
  } catch {
    // Ignore storage errors.
  }

  loginRedirectStarted = true;

  const returnTo = getSafeAuthReturnPath(
    `${window.location.pathname}${window.location.search}`,
  );
  const loginParams = new URLSearchParams({
    returnTo,
    prompt: "login",
  });

  window.location.replace(`/api/auth/login?${loginParams.toString()}`);
}
