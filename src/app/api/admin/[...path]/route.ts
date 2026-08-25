import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import fs from "node:fs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface KeycloakTokenResponse {
  access_token: string;
  refresh_token?: string;
  id_token?: string;
  expires_in: number;
  refresh_expires_in?: number;
  token_type?: string;
}

interface ProxyContext {
  params: Promise<{
    path: string[];
  }>;
}

function normalizeBaseUrl(value: string): string {
  return value.trim().replace(/\/+$/, "");
}

function normalizeBackendUrl(value: string): string {
  const trimmed = normalizeBaseUrl(value);
  return /\/api\/v1$/i.test(trimmed) ? trimmed : `${trimmed}/api/v1`;
}

function getConfig() {
  const backendApiUrl =
    process.env.BACKEND_API_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    "https://api.mhoubahar.store";

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
    backendApiUrl: normalizeBackendUrl(backendApiUrl),
    keycloakUrl: normalizeBaseUrl(keycloakUrl),
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
    console.error("[ADMIN PROXY] Missing KEYCLOAK_CLIENT_ID");
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
      console.error("[ADMIN PROXY] Token refresh rejected", {
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
    console.error("[ADMIN PROXY] Token refresh connection error", error);
    return null;
  }
}

function buildBackendUrl(
  request: NextRequest,
  path: string[],
): URL {
  const { backendApiUrl } = getConfig();
  const safePath = path
    .map((segment) => encodeURIComponent(decodeURIComponent(segment)))
    .join("/");

  const target = new URL(`${backendApiUrl}/admin/${safePath}`);

  request.nextUrl.searchParams.forEach((value, key) => {
    target.searchParams.append(key, value);
  });

  return target;
}

async function readRequestBody(request: NextRequest): Promise<ArrayBuffer | undefined> {
  if (request.method === "GET" || request.method === "HEAD") {
    return undefined;
  }

  const body = await request.arrayBuffer();
  return body.byteLength > 0 ? body : undefined;
}

async function callBackend(
  request: NextRequest,
  target: URL,
  accessToken: string,
  body: ArrayBuffer | undefined,
): Promise<Response> {
  const headers = new Headers();

  headers.set("Accept", request.headers.get("accept") ?? "application/json");
  headers.set("Authorization", `Bearer ${accessToken}`);

  const contentType = request.headers.get("content-type");
  if (contentType) {
    headers.set("Content-Type", contentType);
  }

  return fetch(target, {
    method: request.method,
    headers,
    body,
    cache: "no-store",
  });
}

function copyResponse(
  backendResponse: Response,
  refreshedTokens?: KeycloakTokenResponse | null,
): Promise<NextResponse> {
  return (async () => {
    if (backendResponse.status === 204) {
      const response = new NextResponse(null, {
        status: 204,
      });

      applyRefreshedCookies(response, refreshedTokens);
      return response;
    }

    const responseText = await backendResponse.text();
    const headers = new Headers();

    const contentType = backendResponse.headers.get("content-type");
    if (contentType) {
      headers.set("Content-Type", contentType);
    }

    const response = new NextResponse(responseText || null, {
      status: backendResponse.status,
      headers,
    });

    applyRefreshedCookies(response, refreshedTokens);
    return response;
  })();
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

function clearAuthCookies(response: NextResponse) {
  response.cookies.delete("foodhub_access_token");
  response.cookies.delete("foodhub_refresh_token");
  response.cookies.delete("foodhub_id_token");
}

async function proxyAdminRequest(
  request: NextRequest,
  context: ProxyContext,
) {
  const { path } = await context.params;
  const target = buildBackendUrl(request, path);
  const body = await readRequestBody(request);

  let accessToken = request.cookies.get("foodhub_access_token")?.value;
  const refreshToken = request.cookies.get("foodhub_refresh_token")?.value;

  let refreshedTokens: KeycloakTokenResponse | null = null;

  if (!accessToken && refreshToken) {
    refreshedTokens = await refreshAccessToken(refreshToken);
    accessToken = refreshedTokens?.access_token;
  }

  if (!accessToken) {
    const response = NextResponse.json(
      {
        message: "Admin access token is missing or expired.",
      },
      { status: 401 },
    );

    clearAuthCookies(response);
    return response;
  }

  try {
    let backendResponse = await callBackend(
      request,
      target,
      accessToken,
      body,
    );

    // The access token may have expired between page load and this request.
    // Refresh once and retry the exact backend request.
    if (backendResponse.status === 401 && refreshToken) {
      const nextTokens = await refreshAccessToken(refreshToken);

      if (nextTokens?.access_token) {
        refreshedTokens = nextTokens;
        backendResponse = await callBackend(
          request,
          target,
          nextTokens.access_token,
          body,
        );
      }
    }

    const unauthorized = backendResponse.status === 401;
    const response = await copyResponse(
      backendResponse,
      unauthorized ? null : refreshedTokens,
    );

    if (unauthorized) {
      clearAuthCookies(response);
    }

    return response;
  } catch (error) {
    console.error("[ADMIN PROXY] Backend connection failed", {
      target: target.toString(),
      error,
    });

    return NextResponse.json(
      {
        message: "Could not connect to the FoodHub backend.",
      },
      { status: 502 },
    );
  }
}

export async function GET(
  request: NextRequest,
  context: ProxyContext,
) {
  return proxyAdminRequest(request, context);
}

export async function POST(
  request: NextRequest,
  context: ProxyContext,
) {
  return proxyAdminRequest(request, context);
}

export async function PUT(
  request: NextRequest,
  context: ProxyContext,
) {
  return proxyAdminRequest(request, context);
}

export async function PATCH(
  request: NextRequest,
  context: ProxyContext,
) {
  return proxyAdminRequest(request, context);
}

export async function DELETE(
  request: NextRequest,
  context: ProxyContext,
) {
  return proxyAdminRequest(request, context);
}
