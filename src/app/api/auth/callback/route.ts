import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  createAuthReturnUrl,
  getSafeAuthReturnPath,
} from "@/src/lib/authRedirect";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface KeycloakTokenResponse {
  access_token: string;
  refresh_token?: string;
  id_token?: string;
  expires_in: number;
  refresh_expires_in?: number;
  token_type?: string;
  scope?: string;
}

interface KeycloakErrorResponse {
  error?: string;
  error_description?: string;
}

interface KeycloakAccessTokenPayload {
  sub?: string;
  preferred_username?: string;
  email?: string;
  realm_access?: {
    roles?: string[];
  };
  resource_access?: Record<
    string,
    {
      roles?: string[];
    }
  >;
}

function normalizeBaseUrl(url: string): string {
  return url.trim().replace(/\/+$/, "");
}

function clearOAuthCookies(response: NextResponse): void {
  response.cookies.delete("foodhub_oauth_state");
  response.cookies.delete("foodhub_code_verifier");
  response.cookies.delete("foodhub_return_to");
}

const MAX_OAUTH_RETRIES = 1;

/**
 * Restart the OAuth flow instead of showing an error page.
 *
 * Uses a short-lived `oauth_retry` cookie as a counter so we only
 * retry once.  If the retry also fails the caller falls through to
 * the normal error page.
 */
function retryOAuthFlow(
  request: NextRequest,
  returnTo: string,
): NextResponse | null {
  const retryCount = Number(request.cookies.get("oauth_retry")?.value) || 0;

  if (retryCount >= MAX_OAUTH_RETRIES) {
    return null;
  }

  const loginUrl = new URL("/api/auth/login", request.url);
  loginUrl.searchParams.set("returnTo", returnTo);
  loginUrl.searchParams.set("prompt", "login");

  const response = NextResponse.redirect(loginUrl);

  clearOAuthCookies(response);

  response.cookies.set("oauth_retry", String(retryCount + 1), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 2 * 60,
  });

  response.headers.set("Cache-Control", "no-store");

  return response;
}

function clearSessionCookies(response: NextResponse): void {
  response.cookies.delete("foodhub_access_token");
  response.cookies.delete("foodhub_refresh_token");
  response.cookies.delete("foodhub_id_token");
}

function setSessionCookies(
  response: NextResponse,
  tokens: KeycloakTokenResponse,
): void {
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
  };

  response.cookies.set("foodhub_access_token", tokens.access_token, {
    ...options,
    maxAge: tokens.expires_in,
  });

  if (tokens.refresh_token) {
    response.cookies.set("foodhub_refresh_token", tokens.refresh_token, {
      ...options,
      maxAge: tokens.refresh_expires_in ?? 30 * 60,
    });
  }

  if (tokens.id_token) {
    response.cookies.set("foodhub_id_token", tokens.id_token, {
      ...options,
      maxAge: tokens.expires_in,
    });
  }
}

function redirectToLogin(
  request: NextRequest,
  error: string,
  description?: string,
  clearSession = false,
): NextResponse {
  const loginUrl = new URL("/login", request.url);
  const returnTo = getSafeAuthReturnPath(
    request.cookies.get("foodhub_return_to")?.value,
  );

  loginUrl.searchParams.set("error", error);
  loginUrl.searchParams.set("returnTo", returnTo);

  if (description) {
    loginUrl.searchParams.set("error_description", description);
  }

  const response = NextResponse.redirect(loginUrl);

  clearOAuthCookies(response);

  if (clearSession) {
    clearSessionCookies(response);
  }

  response.headers.set("Cache-Control", "no-store");

  return response;
}

function decodeAccessToken(token: string): KeycloakAccessTokenPayload | null {
  try {
    const tokenParts = token.split(".");

    if (tokenParts.length < 2) {
      return null;
    }

    const payload = Buffer.from(tokenParts[1], "base64url").toString("utf8");

    return JSON.parse(payload) as KeycloakAccessTokenPayload;
  } catch (error) {
    console.error("ACCESS TOKEN DECODE ERROR:", error);
    return null;
  }
}

function getUserRoles(
  tokenPayload: KeycloakAccessTokenPayload,
  clientId: string,
): string[] {
  const realmRoles = tokenPayload.realm_access?.roles ?? [];
  const clientRoles = tokenPayload.resource_access?.[clientId]?.roles ?? [];

  return [...new Set([...realmRoles, ...clientRoles])];
}

function hasAdminRole(roles: string[]): boolean {
  const normalizedRoles = roles.map((role) => role.toUpperCase());

  return ["ADMIN", "ROLE_ADMIN", "SUPER_ADMIN", "ROLE_SUPER_ADMIN"].some(
    (role) => normalizedRoles.includes(role),
  );
}

function parseTokenResponse(value: string): KeycloakTokenResponse | null {
  try {
    const tokens = JSON.parse(value) as Partial<KeycloakTokenResponse>;

    if (
      typeof tokens.access_token !== "string" ||
      tokens.access_token.length === 0 ||
      typeof tokens.expires_in !== "number" ||
      !Number.isFinite(tokens.expires_in) ||
      tokens.expires_in <= 0
    ) {
      return null;
    }

    return tokens as KeycloakTokenResponse;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const keycloakUrl =
    process.env.KEYCLOAK_URL ?? process.env.NEXT_PUBLIC_KEYCLOAK_URL;
  const realm =
    process.env.KEYCLOAK_REALM ?? process.env.NEXT_PUBLIC_KEYCLOAK_REALM;
  const clientId =
    process.env.KEYCLOAK_CLIENT_ID ??
    process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID;
  const clientSecret = process.env.KEYCLOAK_CLIENT_SECRET;
  const configuredAppUrl = process.env.ADMIN_APP_URL ?? request.nextUrl.origin;
  const appUrl =
    process.env.NODE_ENV === "development"
      ? request.nextUrl.origin
      : configuredAppUrl;

  if (!keycloakUrl || !realm || !clientId || !clientSecret) {
    console.error("Missing callback configuration:", {
      hasKeycloakUrl: Boolean(keycloakUrl),
      hasRealm: Boolean(realm),
      hasClientId: Boolean(clientId),
      hasClientSecret: Boolean(clientSecret),
      hasAppUrl: Boolean(appUrl),
    });

    return redirectToLogin(
      request,
      "server_configuration_error",
      "The authentication server configuration is incomplete.",
    );
  }

  const authorizationError = request.nextUrl.searchParams.get("error");

  if (authorizationError) {
    const description = request.nextUrl.searchParams.get("error_description");

    console.error("KEYCLOAK AUTHORIZATION ERROR:", {
      error: authorizationError,
      description,
    });

    return redirectToLogin(
      request,
      authorizationError,
      description ?? undefined,
    );
  }

  const code = request.nextUrl.searchParams.get("code");
  const receivedState = request.nextUrl.searchParams.get("state");
  const expectedState = request.cookies.get("foodhub_oauth_state")?.value;
  const codeVerifier = request.cookies.get("foodhub_code_verifier")?.value;
  const storedReturnTo = getSafeAuthReturnPath(
    request.cookies.get("foodhub_return_to")?.value,
  );

  console.log("KEYCLOAK CALLBACK:", {
    hasCode: Boolean(code),
    hasReceivedState: Boolean(receivedState),
    hasExpectedState: Boolean(expectedState),
    stateMatches: Boolean(receivedState) && receivedState === expectedState,
    hasCodeVerifier: Boolean(codeVerifier),
    returnTo: storedReturnTo,
  });

  if (!code) {
    return redirectToLogin(
      request,
      "missing_authorization_code",
      "Keycloak did not return an authorization code.",
    );
  }

  if (!receivedState || !expectedState) {
    console.warn("OAUTH STATE MISSING – attempting retry", {
      hasReceivedState: Boolean(receivedState),
      hasExpectedState: Boolean(expectedState),
    });

    const retry = retryOAuthFlow(request, storedReturnTo);
    if (retry) return retry;

    return redirectToLogin(
      request,
      "missing_oauth_state",
      "The login state cookie is missing or expired.",
    );
  }

  if (receivedState !== expectedState) {
    console.warn("OAUTH STATE MISMATCH – attempting retry");

    const retry = retryOAuthFlow(request, storedReturnTo);
    if (retry) return retry;

    return redirectToLogin(
      request,
      "invalid_oauth_state",
      "The login state does not match.",
    );
  }

  if (!codeVerifier) {
    console.warn("PKCE VERIFIER MISSING – attempting retry");

    const retry = retryOAuthFlow(request, storedReturnTo);
    if (retry) return retry;

    return redirectToLogin(
      request,
      "missing_code_verifier",
      "The PKCE verifier cookie is missing or expired.",
    );
  }

  const normalizedKeycloakUrl = normalizeBaseUrl(keycloakUrl);
  const normalizedAppUrl = normalizeBaseUrl(appUrl);
  const redirectUri = `${normalizedAppUrl}/api/auth/callback`;
  const tokenEndpoint =
    `${normalizedKeycloakUrl}/realms/${encodeURIComponent(realm)}` +
    "/protocol/openid-connect/token";

  try {
    new URL(normalizedAppUrl);
    new URL(tokenEndpoint);
  } catch (error) {
    console.error("KEYCLOAK CALLBACK URL ERROR:", error);
    return redirectToLogin(
      request,
      "server_configuration_error",
      "The authentication server URL is invalid.",
    );
  }

  const tokenRequestBody = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: clientId,
    client_secret: clientSecret,
    code,
    redirect_uri: redirectUri,
    code_verifier: codeVerifier,
  });

  let tokenResponse: Response;

  try {
    tokenResponse = await fetch(tokenEndpoint, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: tokenRequestBody,
      cache: "no-store",
    });
  } catch (error) {
    console.error("KEYCLOAK TOKEN CONNECTION ERROR:", {
      error,
      tokenEndpoint,
    });

    return redirectToLogin(
      request,
      "keycloak_connection_failed",
      "Could not connect to the Keycloak server.",
    );
  }

  const tokenResponseText = await tokenResponse.text();

  if (!tokenResponse.ok) {
    let keycloakError: KeycloakErrorResponse = {};

    try {
      keycloakError = JSON.parse(tokenResponseText) as KeycloakErrorResponse;
    } catch {
      // Keycloak can return a non-JSON reverse-proxy error response.
    }

    console.error("KEYCLOAK TOKEN ERROR:", {
      status: tokenResponse.status,
      statusText: tokenResponse.statusText,
      error: keycloakError.error,
      description: keycloakError.error_description,
      redirectUri,
      tokenEndpoint,
    });

    return redirectToLogin(
      request,
      keycloakError.error ?? "token_exchange_failed",
      keycloakError.error_description ??
        "Keycloak could not exchange the authorization code.",
    );
  }

  const tokens = parseTokenResponse(tokenResponseText);

  if (!tokens) {
    console.error("INVALID KEYCLOAK TOKEN RESPONSE");
    return redirectToLogin(
      request,
      "invalid_token_response",
      "Keycloak returned an invalid token response.",
    );
  }

  const tokenPayload = decodeAccessToken(tokens.access_token);

  if (!tokenPayload) {
    return redirectToLogin(
      request,
      "invalid_access_token",
      "Could not read the authenticated user.",
      true,
    );
  }

  const userRoles = getUserRoles(tokenPayload, clientId);

  if (!hasAdminRole(userRoles)) {
    console.warn("KEYCLOAK ADMIN ACCESS DENIED:", {
      username: tokenPayload.preferred_username,
      roles: userRoles,
    });

    return redirectToLogin(
      request,
      "admin_role_required",
      "Only FoodHub administrators can access this dashboard.",
      true,
    );
  }

  const response = NextResponse.redirect(
    createAuthReturnUrl(storedReturnTo, normalizedAppUrl),
  );

  clearSessionCookies(response);
  setSessionCookies(response, tokens);
  clearOAuthCookies(response);
  response.cookies.delete("oauth_retry");
  response.headers.set("Cache-Control", "no-store");

  console.log("ADMIN LOGIN SUCCESS:", {
    username: tokenPayload.preferred_username,
    returnTo: storedReturnTo,
    tokenType: tokens.token_type,
    expiresIn: tokens.expires_in,
  });

  return response;
}
