import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function normalizeBaseUrl(value: string): string {
  return value.trim().replace(/\/+$/, "");
}

export async function GET(request: NextRequest) {
  const keycloakUrl =
    process.env.KEYCLOAK_URL ?? process.env.NEXT_PUBLIC_KEYCLOAK_URL;
  const realm =
    process.env.KEYCLOAK_REALM ?? process.env.NEXT_PUBLIC_KEYCLOAK_REALM;
  const clientId =
    process.env.KEYCLOAK_CLIENT_ID ??
    process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID;

  const configuredAppUrl = process.env.ADMIN_APP_URL ?? request.nextUrl.origin;
  const appUrl =
    process.env.NODE_ENV === "development"
      ? request.nextUrl.origin
      : configuredAppUrl;

  const idToken = request.cookies.get("foodhub_id_token")?.value;

  const normalizedAppUrl = normalizeBaseUrl(appUrl);
  const postLogoutRedirectUri = `${normalizedAppUrl}/login?loggedOut=true`;

  let redirectUrl = new URL(postLogoutRedirectUri);

  /*
   * Log out from Keycloak SSO as well as FoodHub.
   */
  if (keycloakUrl && realm && clientId) {
    redirectUrl = new URL(
      `${normalizeBaseUrl(keycloakUrl)}` +
        `/realms/${encodeURIComponent(realm)}` +
        `/protocol/openid-connect/logout`,
    );

    redirectUrl.searchParams.set(
      "post_logout_redirect_uri",
      postLogoutRedirectUri,
    );

    redirectUrl.searchParams.set("client_id", clientId);

    /*
     * Supplying id_token_hint allows Keycloak
     * to identify the current login session.
     */
    if (idToken) {
      redirectUrl.searchParams.set("id_token_hint", idToken);
    }
  }

  // The dashboard submits logout with POST. A 303 makes the browser follow
  // Keycloak's end-session URL with GET instead of replaying that POST.
  const response = NextResponse.redirect(
    redirectUrl,
    request.method === "POST" ? 303 : 307,
  );

  const expiredCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
  };

  response.cookies.set("foodhub_access_token", "", expiredCookieOptions);

  response.cookies.set("foodhub_refresh_token", "", expiredCookieOptions);

  response.cookies.set("foodhub_id_token", "", expiredCookieOptions);

  response.cookies.set("foodhub_oauth_state", "", expiredCookieOptions);

  response.cookies.set("foodhub_code_verifier", "", expiredCookieOptions);

  response.cookies.set("foodhub_return_to", "", expiredCookieOptions);

  response.headers.set("Cache-Control", "no-store");

  return response;
}

export const POST = GET;
