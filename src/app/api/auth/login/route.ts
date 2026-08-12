import { createHash, randomBytes } from "node:crypto";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getSafeAuthReturnPath } from "@/src/lib/authRedirect";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function normalizeBaseUrl(url: string): string {
  return url.trim().replace(/\/+$/, "");
}

function generateCodeVerifier(): string {
  return randomBytes(64).toString("base64url");
}

function generateCodeChallenge(codeVerifier: string): string {
  return createHash("sha256").update(codeVerifier).digest("base64url");
}

function redirectToConfigurationError(
  request: NextRequest,
  returnTo: string,
): NextResponse {
  const loginUrl = new URL("/login", request.url);

  loginUrl.searchParams.set("error", "server_configuration_error");
  loginUrl.searchParams.set(
    "error_description",
    "The authentication server configuration is incomplete or invalid.",
  );
  loginUrl.searchParams.set("returnTo", returnTo);

  return NextResponse.redirect(loginUrl);
}

export async function GET(request: NextRequest) {
  const returnTo = getSafeAuthReturnPath(
    request.nextUrl.searchParams.get("returnTo"),
  );

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
    console.error("KEYCLOAK LOGIN CONFIGURATION ERROR:", {
      hasKeycloakUrl: Boolean(keycloakUrl),
      hasRealm: Boolean(realm),
      hasClientId: Boolean(clientId),
      hasClientSecret: Boolean(clientSecret),
      hasAppUrl: Boolean(appUrl),
    });

    return redirectToConfigurationError(request, returnTo);
  }

  const normalizedKeycloakUrl = normalizeBaseUrl(keycloakUrl);
  const normalizedAppUrl = normalizeBaseUrl(appUrl);
  const redirectUri = `${normalizedAppUrl}/api/auth/callback`;

  let authorizationUrl: URL;

  try {
    new URL(normalizedAppUrl);
    authorizationUrl = new URL(
      `${normalizedKeycloakUrl}/realms/${encodeURIComponent(
        realm,
      )}/protocol/openid-connect/auth`,
    );
  } catch (error) {
    console.error("KEYCLOAK LOGIN URL ERROR:", error);
    return redirectToConfigurationError(request, returnTo);
  }

  const state = randomBytes(32).toString("base64url");
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);

  authorizationUrl.searchParams.set("client_id", clientId);
  authorizationUrl.searchParams.set("response_type", "code");
  authorizationUrl.searchParams.set("response_mode", "query");
  authorizationUrl.searchParams.set("scope", "openid profile email");
  authorizationUrl.searchParams.set("redirect_uri", redirectUri);
  authorizationUrl.searchParams.set("state", state);
  authorizationUrl.searchParams.set("code_challenge", codeChallenge);
  authorizationUrl.searchParams.set("code_challenge_method", "S256");

  if (request.nextUrl.searchParams.get("prompt") === "login") {
    authorizationUrl.searchParams.set("prompt", "login");
  }

  console.log("KEYCLOAK LOGIN:", {
    clientId,
    realm,
    redirectUri,
    returnTo,
    authorizationEndpoint:
      authorizationUrl.origin + authorizationUrl.pathname,
  });

  const response = NextResponse.redirect(authorizationUrl);
  const temporaryCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 10 * 60,
  };

  response.cookies.set("foodhub_oauth_state", state, temporaryCookieOptions);
  response.cookies.set(
    "foodhub_code_verifier",
    codeVerifier,
    temporaryCookieOptions,
  );
  response.cookies.set("foodhub_return_to", returnTo, temporaryCookieOptions);
  response.headers.set("Cache-Control", "no-store");

  return response;
}
