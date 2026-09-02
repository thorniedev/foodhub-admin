import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

function getBackendApiBaseUrl(): string {
  const configured = (
    process.env.BACKEND_API_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    "https://api.mhoubahar.store"
  ).replace(/\/+$/, "");

  return /\/api\/v1$/i.test(configured) ? configured : `${configured}/api/v1`;
}

const backendApiUrl = getBackendApiBaseUrl();

function getAccessToken(request: NextRequest): string | null {
  return request.cookies.get("foodhub_access_token")?.value ?? null;
}

function clearAuthCookies(response: NextResponse): void {
  response.cookies.delete("foodhub_access_token");
  response.cookies.delete("foodhub_refresh_token");
  response.cookies.delete("foodhub_id_token");
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

function enrichCurrentUserResponse(
  response: unknown,
  roles: string[],
): unknown {
  if (!roles.length || !response || typeof response !== "object") {
    return response;
  }

  const root = response as Record<string, unknown>;
  const role = getPrimaryRole(roles);
  const enrich = (value: unknown) =>
    value && typeof value === "object"
      ? {
          ...(value as Record<string, unknown>),
          role,
          roles,
        }
      : value;

  if (root.payload && typeof root.payload === "object") {
    return {
      ...root,
      payload: enrich(root.payload),
    };
  }

  if (root.data && typeof root.data === "object") {
    return {
      ...root,
      data: enrich(root.data),
    };
  }

  if (root.user && typeof root.user === "object") {
    return {
      ...root,
      user: enrich(root.user),
    };
  }

  return enrich(root);
}

interface KeycloakTokenResponse {
  access_token: string;
  refresh_token?: string;
  id_token?: string;
  expires_in: number;
  refresh_expires_in?: number;
  token_type?: string;
}

function getKeycloakConfig() {
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
  const { keycloakUrl, realm, clientId, clientSecret } = getKeycloakConfig();

  if (!clientId) {
    console.error("[USERS_ME] Missing KEYCLOAK_CLIENT_ID");
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
      console.error("[USERS_ME] Token refresh rejected", {
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
    console.error("[USERS_ME] Token refresh connection error", error);
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

async function forwardBackendResponse(
  backendResponse: Response,
  accessToken?: string,
  refreshedTokens?: KeycloakTokenResponse | null,
): Promise<NextResponse> {
  const headers = new Headers();
  const contentType = backendResponse.headers.get("content-type");

  if (contentType) {
    headers.set("Content-Type", contentType);
  }

  const responseText = await backendResponse.text();
  let responseBody = responseText;

  if (
    accessToken &&
    backendResponse.ok &&
    contentType?.toLowerCase().includes("application/json")
  ) {
    try {
      responseBody = JSON.stringify(
        enrichCurrentUserResponse(
          JSON.parse(responseText) as unknown,
          getRolesFromToken(accessToken),
        ),
      );
    } catch {
      responseBody = responseText;
    }
  }

  const response = new NextResponse(
    responseBody.length > 0 ? responseBody : null,
    {
      status: backendResponse.status,
      headers,
    },
  );

  if (backendResponse.status === 401) {
    clearAuthCookies(response);
  } else if (refreshedTokens) {
    applyRefreshedCookies(response, refreshedTokens);
  }

  return response;
}

export async function GET(request: NextRequest): Promise<Response> {
  let accessToken = getAccessToken(request);
  const refreshToken = request.cookies.get("foodhub_refresh_token")?.value;

  let refreshedTokens: KeycloakTokenResponse | null = null;

  if (!accessToken && refreshToken) {
    refreshedTokens = await refreshAccessToken(refreshToken);
    accessToken = refreshedTokens?.access_token ?? null;
  }

  if (!accessToken) {
    return NextResponse.json(
      {
        message: "Not authenticated.",
      },
      {
        status: 401,
      },
    );
  }

  try {
    let backendResponse = await fetch(`${backendApiUrl}/users/me`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    if (backendResponse.status === 401 && refreshToken) {
      const nextTokens = await refreshAccessToken(refreshToken);
      if (nextTokens?.access_token) {
        refreshedTokens = nextTokens;
        accessToken = nextTokens.access_token;
        backendResponse = await fetch(`${backendApiUrl}/users/me`, {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          cache: "no-store",
        });
      }
    }

    return forwardBackendResponse(backendResponse, accessToken, refreshedTokens);
  } catch (error) {
    console.error("[GET CURRENT USER ERROR]", error);

    return NextResponse.json(
      {
        message: "Could not connect to FoodHub backend.",
      },
      {
        status: 502,
      },
    );
  }
}

export async function PATCH(request: NextRequest): Promise<Response> {
  const accessToken = getAccessToken(request);

  if (!accessToken) {
    return NextResponse.json(
      {
        message: "Not authenticated.",
      },
      {
        status: 401,
      },
    );
  }

  try {
    const requestBody = await request.text();

    const backendResponse = await fetch(`${backendApiUrl}/users/me`, {
      method: "PATCH",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: requestBody,
      cache: "no-store",
    });

    console.log("[UPDATE CURRENT USER]", {
      status: backendResponse.status,
      backendUrl: `${backendApiUrl}/users/me`,
    });

    return forwardBackendResponse(backendResponse);
  } catch (error) {
    console.error("[UPDATE CURRENT USER ERROR]", error);

    return NextResponse.json(
      {
        message: "Could not connect to FoodHub backend.",
      },
      {
        status: 502,
      },
    );
  }
}
