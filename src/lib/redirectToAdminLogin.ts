"use client";

import { getSafeAuthReturnPath } from "./authRedirect";

let loginRedirectStarted = false;

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
