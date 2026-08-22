import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { Agent } from "undici";

export type CatalogProxyContext = {
  params: Promise<{
    path?: string[];
  }>;
};

interface KeycloakTokenResponse {
  access_token: string;
  refresh_token?: string;
  id_token?: string;
  expires_in: number;
  refresh_expires_in?: number;
  token_type?: string;
}

const catalogDispatcher = new Agent({
  connect: {
    timeout: 30000,
  },
  headersTimeout: 30000,
  bodyTimeout: 30000,
});

function normalizeBaseUrl(value: string): string {
  return value.trim().replace(/\/+$/, "");
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
    backendApiUrl: normalizeBaseUrl(backendApiUrl),
    keycloakUrl: normalizeBaseUrl(keycloakUrl),
    realm,
    clientId,
    clientSecret,
  };
}

function getBackendApiBaseUrl(): string {
  const { backendApiUrl } = getConfig();
  if (backendApiUrl.endsWith("/api/v1")) {
    return backendApiUrl;
  }
  return `${backendApiUrl}/api/v1`;
}

async function refreshAccessToken(
  refreshToken: string,
): Promise<KeycloakTokenResponse | null> {
  const { keycloakUrl, realm, clientId, clientSecret } = getConfig();

  if (!clientId) {
    console.error("[CATALOG PROXY] Missing KEYCLOAK_CLIENT_ID");
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
    const init: RequestInit & { dispatcher?: unknown } = {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
      cache: "no-store",
      dispatcher: catalogDispatcher,
    };

    const response = await fetch(endpoint, init as RequestInit);

    if (!response.ok) {
      console.error("[CATALOG PROXY] Token refresh rejected", {
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
    console.error("[CATALOG PROXY] Token refresh connection error", error);
    return null;
  }
}

export function buildTargetUrl(
  request: NextRequest,
  resource: string,
  path: string[],
  prefixMode: "admin" | "catalog" | "direct" = "admin",
): URL {
  const suffix = path.length
    ? `/${path
        .map((segment) => encodeURIComponent(decodeURIComponent(segment)))
        .join("/")}`
    : "";

  const baseUrl = getBackendApiBaseUrl();
  let prefix = "";

  if (resource === "menu-items") {
    prefix = prefixMode === "catalog" ? "catalog/menu-items" : "admin/menu-items";
  } else if (prefixMode === "admin") {
    prefix = `admin/${resource}`;
  } else if (prefixMode === "catalog") {
    prefix = `catalog/${resource}`;
  } else {
    prefix = resource;
  }

  const target = new URL(`${baseUrl}/${prefix}${suffix}`);

  request.nextUrl.searchParams.forEach((value, key) => {
    target.searchParams.append(key, value);
  });

  return target;
}

function copyUsefulResponseHeaders(source: Headers): Headers {
  const headers = new Headers();

  for (const name of [
    "content-type",
    "content-disposition",
    "cache-control",
    "etag",
    "last-modified",
    "location",
  ]) {
    const value = source.get(name);
    if (value) {
      headers.set(name, value);
    }
  }

  return headers;
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

async function callBackend(
  target: URL,
  method: string,
  headers: Headers,
  body: ArrayBuffer | undefined,
): Promise<Response> {
  const init: RequestInit & { dispatcher?: unknown } = {
    method,
    headers,
    body,
    cache: "no-store",
    redirect: "manual",
    dispatcher: catalogDispatcher,
  };

  let lastError: unknown = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      return await fetch(target, init as RequestInit);
    } catch (err) {
      lastError = err;
      console.warn(`[CATALOG PROXY] Attempt ${attempt + 1} failed for ${target.toString()}, retrying...`, err);
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
  throw lastError;
}

export async function proxyCatalogRequest(
  request: NextRequest,
  context: CatalogProxyContext,
  resource: string,
) {
  const { path = [] } = await context.params;
  const target = buildTargetUrl(request, resource, path);

  const headers = new Headers();
  headers.set("Accept", request.headers.get("accept") ?? "application/json");

  const contentType = request.headers.get("content-type");
  if (contentType) {
    headers.set("Content-Type", contentType);
  }

  let accessToken = request.cookies.get("foodhub_access_token")?.value;
  const refreshToken = request.cookies.get("foodhub_refresh_token")?.value;

  let refreshedTokens: KeycloakTokenResponse | null = null;
  if (!accessToken && refreshToken) {
    refreshedTokens = await refreshAccessToken(refreshToken);
    accessToken = refreshedTokens?.access_token;
  }

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const method = request.method.toUpperCase();
  const body =
    method === "GET" || method === "HEAD"
      ? undefined
      : await request.arrayBuffer();

  console.log("[CATALOG PROXY REQUEST]", {
    method,
    frontendUrl: request.url,
    backendUrl: target.toString(),
    contentType: headers.get("content-type"),
  });

  if (body) {
    try {
      const text = new TextDecoder().decode(body);
      console.log("[CATALOG PROXY REQUEST BODY]", text.slice(0, 1500));
    } catch {}
  }

  try {
    let backendResponse = await callBackend(target, method, headers, body);

    // Fallback between admin, catalog, and direct endpoints on 404 (no
    // handler for this path at all), and on 405 for GET only: some catalog
    // resources (e.g. foods, food-categories, cuisines, meal-types) are
    // registered under /api/v1/admin/{resource} for POST/PATCH mutations
    // only (see CatalogController) — a GET there is a real path match with
    // no GET handler, so Spring returns 405, not 404. Only GET is retried
    // here since a 405 on a mutating request must not be silently replayed
    // against a different endpoint that may expect a different body shape.
    if (
      backendResponse.status === 404 ||
      (backendResponse.status === 405 && method === "GET")
    ) {
      const fallbackModes: Array<"admin" | "catalog" | "direct"> =
        resource === "menu-items" ? ["catalog", "admin"] : ["direct", "catalog"];

      for (const mode of fallbackModes) {
        const altTarget = buildTargetUrl(request, resource, path, mode);
        if (altTarget.toString() !== target.toString()) {
          try {
            const altResponse = await callBackend(altTarget, method, headers, body);
            if (altResponse.ok || altResponse.status < 400) {
              backendResponse = altResponse;
              break;
            }
          } catch {}
        }
      }
    }

    // If 401 and we have a refresh token, refresh and retry once
    if (backendResponse.status === 401 && refreshToken) {
      const nextTokens = await refreshAccessToken(refreshToken);
      if (nextTokens?.access_token) {
        refreshedTokens = nextTokens;
        headers.set("Authorization", `Bearer ${nextTokens.access_token}`);
        backendResponse = await callBackend(target, method, headers, body);
      }
    }

    const responseBody = await backendResponse.arrayBuffer();
    const responseText = new TextDecoder().decode(responseBody);

    console.log("[CATALOG PROXY RESPONSE]", {
      method,
      backendUrl: target.toString(),
      status: backendResponse.status,
      body: responseText.slice(0, 2000),
    });

    const response = new NextResponse(
      responseBody.byteLength ? responseBody : null,
      {
        status: backendResponse.status,
        headers: copyUsefulResponseHeaders(backendResponse.headers),
      },
    );

    if (refreshedTokens) {
      applyRefreshedCookies(response, refreshedTokens);
    }

    return response;
  } catch (error) {
    console.error("[CATALOG PROXY ERROR]", {
      method,
      backendUrl: target.toString(),
      error,
    });

    return NextResponse.json(
      {
        status: 502,
        message: "Could not connect to the FoodHub catalog backend.",
        error: error instanceof Error ? error.message : "Service unavailable",
      },
      { status: 502 },
    );
  }
}
