import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface KeycloakUser {
  sub: string;
  name?: string;
  preferred_username?: string;
  email?: string;
  email_verified?: boolean;
  given_name?: string;
  family_name?: string;
  role?: string | null;
  roles?: string[];
}

interface KeycloakAccessTokenClaims {
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

function clearAuthCookies(response: NextResponse) {
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
  };

  response.cookies.set("foodhub_access_token", "", options);
  response.cookies.set("foodhub_refresh_token", "", options);
  response.cookies.set("foodhub_id_token", "", options);
}

function decodeAccessToken(token: string): KeycloakAccessTokenClaims | null {
  try {
    const parts = token.split(".");

    if (parts.length < 2) {
      return null;
    }

    return JSON.parse(
      Buffer.from(parts[1], "base64url").toString("utf8"),
    ) as KeycloakAccessTokenClaims;
  } catch {
    return null;
  }
}

function normalizeRole(role: unknown): string {
  if (typeof role !== "string") {
    return "";
  }

  const normalized = role.trim().toUpperCase();
  return normalized.startsWith("ROLE_")
    ? normalized.slice("ROLE_".length)
    : normalized;
}

function getRolesFromToken(accessToken: string): string[] {
  const claims = decodeAccessToken(accessToken);

  if (!claims) {
    return [];
  }

  const roles = [
    ...(claims.realm_access?.roles ?? []),
    ...Object.values(claims.resource_access ?? {}).flatMap((access) =>
      Array.isArray(access.roles) ? access.roles : [],
    ),
  ];

  return [...new Set(roles.map(normalizeRole).filter(Boolean))];
}

function getPrimaryRole(roles: string[]): string | null {
  if (roles.includes("SUPER_ADMIN")) return "SUPER_ADMIN";
  if (roles.includes("ADMIN")) return "ADMIN";
  if (roles.includes("USER")) return "USER";
  return roles[0] ?? null;
}

interface KeycloakTokenResponse {
  access_token: string;
  refresh_token?: string;
  id_token?: string;
  expires_in: number;
  refresh_expires_in?: number;
  token_type?: string;
}

function getConfig() {
  const keycloakUrl =
    process.env.KEYCLOAK_URL ??
    process.env.NEXT_PUBLIC_KEYCLOAK_URL ??
    "https://auth.mhoubahar.store";

  const realm =
    process.env.KEYCLOAK_REALM ??
    process.env.NEXT_PUBLIC_KEYCLOAK_REALM ??
    "foodhub";

  const clientId =
    process.env.KEYCLOAK_CLIENT_ID ??
    process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID ??
    "mhoubahar-admin";

  const clientSecret = process.env.KEYCLOAK_CLIENT_SECRET;

  return {
    keycloakUrl: keycloakUrl.trim().replace(/\/+$/, ""),
    realm,
    clientId,
    clientSecret,
  };
}

async function refreshAccessToken(
  refreshToken: string,
): Promise<KeycloakTokenResponse | null> {
  const { keycloakUrl, realm, clientId, clientSecret } = getConfig();

  if (!clientId) {
    console.error("[SESSION] Missing KEYCLOAK_CLIENT_ID");
    return null;
  }

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: clientId,
    refresh_token: refreshToken,
  });

  if (clientSecret) {
    body.set("client_secret", clientSecret);
  }

  const endpoint =
    `${keycloakUrl}/realms/${encodeURIComponent(realm)}` +
    "/protocol/openid-connect/token";

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("[SESSION] Token refresh rejected", {
        status: response.status,
      });
      return null;
    }

    const tokens = (await response.json()) as KeycloakTokenResponse;
    if (!tokens.access_token) {
      return null;
    }

    return tokens;
  } catch (error) {
    console.error("[SESSION] Token refresh connection error", error);
    return null;
  }
}

function applyRefreshedCookies(
  response: NextResponse,
  tokens?: KeycloakTokenResponse | null,
) {
  if (!tokens) return;

  const secure = process.env.NODE_ENV === "production";

  const options = {
    httpOnly: true,
    secure,
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
      maxAge: tokens.refresh_expires_in ?? 30 * 24 * 60 * 60,
    });
  }

  if (tokens.id_token) {
    response.cookies.set("foodhub_id_token", tokens.id_token, {
      ...options,
      maxAge: tokens.refresh_expires_in ?? 30 * 24 * 60 * 60,
    });
  }
}

export async function GET(request: NextRequest) {
  const { keycloakUrl, realm } = getConfig();

  if (!keycloakUrl || !realm) {
    return NextResponse.json(
      {
        authenticated: false,
        user: null,
        message: "Keycloak configuration is missing",
      },
      { status: 500 },
    );
  }

  let accessToken = request.cookies.get("foodhub_access_token")?.value;
  const refreshToken = request.cookies.get("foodhub_refresh_token")?.value;

  let refreshedTokens: KeycloakTokenResponse | null = null;

  if (!accessToken && refreshToken) {
    refreshedTokens = await refreshAccessToken(refreshToken);
    accessToken = refreshedTokens?.access_token;
  }

  if (!accessToken) {
    return NextResponse.json({
      authenticated: false,
      user: null,
    });
  }

  let userInfoUrl: URL;

  try {
    userInfoUrl = new URL(
      `${keycloakUrl}/realms/${encodeURIComponent(realm)}` +
        "/protocol/openid-connect/userinfo",
    );
  } catch {
    return NextResponse.json(
      {
        authenticated: false,
        user: null,
        message: "Keycloak configuration is invalid",
      },
      { status: 500 },
    );
  }

  try {
    let userResponse = await fetch(userInfoUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    if (!userResponse.ok && refreshToken) {
      refreshedTokens = await refreshAccessToken(refreshToken);
      if (refreshedTokens?.access_token) {
        accessToken = refreshedTokens.access_token;
        userResponse = await fetch(userInfoUrl, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          cache: "no-store",
        });
      }
    }

    if (!userResponse.ok) {
      const response = NextResponse.json(
        {
          authenticated: false,
          user: null,
        },
        { status: 401 },
      );

      clearAuthCookies(response);
      return response;
    }

    const roles = getRolesFromToken(accessToken);
    const user = (await userResponse.json()) as KeycloakUser;

    const response = NextResponse.json({
      authenticated: true,
      user: {
        ...user,
        role: getPrimaryRole(roles),
        roles,
      },
    });

    if (refreshedTokens) {
      applyRefreshedCookies(response, refreshedTokens);
    }

    return response;
  } catch (error) {
    console.error("Failed to check authentication:", error);

    return NextResponse.json(
      {
        authenticated: false,
        user: null,
        message: "Unable to connect to Keycloak",
      },
      { status: 500 },
    );
  }
}
