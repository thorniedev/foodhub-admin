import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/*
 * Your env may be:
 *
 * NEXT_PUBLIC_API_BASE_URL=https://food.chanthorndev.site
 *
 * or:
 *
 * NEXT_PUBLIC_API_BASE_URL=https://food.chanthorndev.site/api/v1
 *
 * This handles both.
 */
const configuredBackendUrl = (
  process.env.BACKEND_API_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "https://api.mhoubahar.store"
)?.replace(/\/+$/, "");

const backendApiUrl = configuredBackendUrl
  ? /\/api\/v1$/i.test(configuredBackendUrl)
    ? configuredBackendUrl
    : `${configuredBackendUrl}/api/v1`
  : null;

/**
 * Backend paths that the Next.js proxy allows.
 *
 * Child routes automatically use the first path segment.
 *
 * Examples:
 *
 * /api/safety/allergens
 * -> safety
 *
 * /api/profiles/{uuid}/safety/allergies
 * -> profiles
 */
const allowedRoutes: Record<string, ReadonlySet<string>> = {
  "auth/register": new Set(["POST"]),
  "auth/login": new Set(["POST"]),
  "auth/logout": new Set(["POST"]),
  "auth/refresh": new Set(["POST"]),

  "users/me": new Set(["GET", "PATCH", "DELETE"]),

  users: new Set(["GET", "POST"]),

  /*
   * We need all of these because profile child routes include:
   *
   * GET    /profiles/{uuid}
   * PATCH  /profiles/{uuid}
   * DELETE /profiles/{uuid}
   *
   * PUT /profiles/{uuid}/safety/allergies
   * PUT /profiles/{uuid}/safety/dietary-types
   * PUT /profiles/{uuid}/safety/medical-conditions
   * PUT /profiles/{uuid}/safety/ingredient-avoids
   */
  profiles: new Set(["GET", "POST", "PUT", "PATCH", "DELETE"]),

  /*
   * Safety option endpoints:
   *
   * GET /safety/allergens
   * GET /safety/dietary-types
   * GET /safety/medical-conditions
   */
  safety: new Set(["GET", "POST", "PUT", "PATCH", "DELETE"]),

  stores: new Set(["GET", "POST", "PUT", "PATCH", "DELETE"]),

  "menu-items": new Set(["GET", "POST", "PUT", "PATCH", "DELETE"]),

  admin: new Set(["GET", "POST", "PUT", "PATCH", "DELETE"]),

  catalog: new Set(["GET", "POST", "PUT", "PATCH", "DELETE"]),

  media: new Set(["GET", "POST", "PUT", "PATCH", "DELETE"]),

  discovery: new Set(["GET", "POST"]),

  recommendations: new Set(["GET", "POST"]),
};

interface RouteContext {
  params: Promise<{
    all: string[];
  }>;
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
  const keycloakUrl = (
    process.env.KEYCLOAK_URL ??
    process.env.NEXT_PUBLIC_KEYCLOAK_URL ??
    "https://auth.mhoubahar.store"
  ).replace(/\/+$/, "");

  const realm =
    process.env.KEYCLOAK_REALM ??
    process.env.NEXT_PUBLIC_KEYCLOAK_REALM ??
    "foodhub";

  const clientId =
    process.env.KEYCLOAK_CLIENT_ID ??
    process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID ??
    "mhoubahar-admin";

  const clientSecret = process.env.KEYCLOAK_CLIENT_SECRET;

  return { keycloakUrl, realm, clientId, clientSecret };
}

async function refreshAccessToken(
  refreshToken: string,
): Promise<KeycloakTokenResponse | null> {
  const { keycloakUrl, realm, clientId, clientSecret } = getKeycloakConfig();

  if (!clientId) {
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

  const endpoint = `${keycloakUrl}/realms/${encodeURIComponent(realm)}/protocol/openid-connect/token`;

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
      maxAge: tokens.refresh_expires_in ?? 30 * 24 * 60 * 60, // 30 days
    });
  }

  if (tokens.id_token) {
    response.cookies.set("foodhub_id_token", tokens.id_token, {
      ...options,
      maxAge: tokens.refresh_expires_in ?? 30 * 24 * 60 * 60, // 30 days
    });
  }
}

async function forwardRequest(
  request: NextRequest,
  context: RouteContext,
): Promise<Response> {
  if (!backendApiUrl) {
    console.error("[FOODHUB PROXY] NEXT_PUBLIC_API_BASE_URL is missing.");

    return NextResponse.json(
      {
        message: "Backend API URL is not configured.",
      },
      {
        status: 500,
      },
    );
  }

  const { all } = await context.params;

  if (!all?.length) {
    return NextResponse.json(
      {
        message: "API endpoint is required.",
      },
      {
        status: 400,
      },
    );
  }

  const backendPath = all.join("/");
  const routeRule = allowedRoutes[backendPath] ?? allowedRoutes[all[0]];

  if (!routeRule) {
    console.error("[FOODHUB PROXY] Route is not allowed:", backendPath);

    return NextResponse.json(
      {
        message: "FoodHub endpoint not found.",
        path: backendPath,
      },
      {
        status: 404,
      },
    );
  }

  if (!routeRule.has(request.method)) {
    console.error("[FOODHUB PROXY] Method not allowed:", {
      method: request.method,
      path: backendPath,
    });

    return NextResponse.json(
      {
        message: `${request.method} is not allowed for this endpoint.`,
      },
      {
        status: 405,
        headers: {
          Allow: [...routeRule].join(", "),
        },
      },
    );
  }

  const incomingUrl = new URL(request.url);

  let normalizedPath = all;
  let forwardedMethod = request.method;
  let customRequestBody: ArrayBuffer | undefined = undefined;

  if (all[0] === "menu-items") {
    normalizedPath = ["catalog", "menu-items", ...all.slice(1)];
  }

  const safeBackendPath = normalizedPath
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  const targetUrl = new URL(`${backendApiUrl}/${safeBackendPath}`);

  if (normalizedPath[0] === "discovery") {
    const page = incomingUrl.searchParams.get("page") || "0";
    const rawSize = parseInt(incomingUrl.searchParams.get("size") || "100", 10);
    const size = String(Math.min(Math.max(1, rawSize), 100));
    targetUrl.search = `?page=${encodeURIComponent(page)}&size=${encodeURIComponent(size)}`;
  } else {
    targetUrl.search = incomingUrl.search;
  }

  const requestHeaders = new Headers();

  requestHeaders.set(
    "Accept",
    request.headers.get("accept") ?? "application/json",
  );

  const contentType = request.headers.get("content-type");

  if (contentType) {
    requestHeaders.set("Content-Type", contentType);
  } else if (forwardedMethod === "POST" && customRequestBody) {
    requestHeaders.set("Content-Type", "application/json");
  }

  const incomingAuthorization = request.headers.get("authorization");
  let accessToken = request.cookies.get("foodhub_access_token")?.value;
  const refreshToken = request.cookies.get("foodhub_refresh_token")?.value;
  let refreshedTokens: KeycloakTokenResponse | null = null;

  // Silent refresh if access token missing but refresh token exists
  if (!accessToken && refreshToken && !incomingAuthorization) {
    console.log("[ADMIN PROXY] Access token missing. Attempting silent token refresh...");
    refreshedTokens = await refreshAccessToken(refreshToken);
    if (refreshedTokens?.access_token) {
      accessToken = refreshedTokens.access_token;
      console.log("[ADMIN PROXY] Silent token refresh succeeded!");
    }
  }

  if (incomingAuthorization) {
    requestHeaders.set("Authorization", incomingAuthorization);
  } else if (accessToken) {
    requestHeaders.set("Authorization", `Bearer ${accessToken}`);
  }

  const canHaveBody = forwardedMethod !== "GET" && forwardedMethod !== "HEAD";
  const requestBody = customRequestBody ?? (canHaveBody ? await request.arrayBuffer() : undefined);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, 15_000);

  try {
    console.log("[FOODHUB PROXY REQUEST]", {
      method: forwardedMethod,
      frontendUrl: request.url,
      backendUrl: targetUrl.toString(),
      path: backendPath,
      hasAuthorization: requestHeaders.has("Authorization"),
    });

    let backendResponse = await fetch(targetUrl, {
      method: forwardedMethod,
      headers: requestHeaders,
      body: requestBody && requestBody.byteLength > 0 ? requestBody : undefined,
      cache: "no-store",
      redirect: "manual",
      signal: controller.signal,
    });

    // If 401 received and we have a refresh token, perform silent refresh & retry once
    if (backendResponse.status === 401 && refreshToken && !refreshedTokens) {
      console.log("[ADMIN PROXY] 401 returned from backend. Attempting token refresh & retry...");
      refreshedTokens = await refreshAccessToken(refreshToken);
      if (refreshedTokens?.access_token) {
        accessToken = refreshedTokens.access_token;
        requestHeaders.set("Authorization", `Bearer ${accessToken}`);
        backendResponse = await fetch(targetUrl, {
          method: forwardedMethod,
          headers: requestHeaders,
          body: requestBody && requestBody.byteLength > 0 ? requestBody : undefined,
          cache: "no-store",
          redirect: "manual",
        });
      }
    }

    const responseBody = await backendResponse.arrayBuffer();
    const responseHeaders = new Headers();

    const responseContentType = backendResponse.headers.get("content-type");
    if (responseContentType) {
      responseHeaders.set("Content-Type", responseContentType);
    }

    const location = backendResponse.headers.get("location");
    if (location) {
      responseHeaders.set("Location", location);
    }

    console.log("[FOODHUB PROXY RESPONSE]", {
      method: request.method,
      backendUrl: targetUrl.toString(),
      status: backendResponse.status,
    });

    if (!backendResponse.ok) {
      if (
        backendResponse.status >= 500 &&
        forwardedMethod === "GET" &&
        normalizedPath.length === 2 &&
        normalizedPath[0] === "catalog" &&
        normalizedPath[1] === "foods"
      ) {
        console.warn("[ADMIN PROXY] Backend /api/catalog/foods threw 500, attempting resilient fallback...");
        try {
          const fallbackUrl = new URL(targetUrl.toString());
          fallbackUrl.searchParams.set("sort", "createdAt,asc");
          fallbackUrl.searchParams.set("page", "0");
          fallbackUrl.searchParams.set("size", "100");

          const rescueRes = await fetch(fallbackUrl, {
            method: "GET",
            headers: requestHeaders,
            cache: "no-store",
            redirect: "manual",
            signal: controller.signal,
          });

          if (rescueRes.ok) {
            const rescueJson = await rescueRes.json();
            if (rescueJson?.payload?.contents && Array.isArray(rescueJson.payload.contents)) {
              rescueJson.payload.contents.reverse();
              return NextResponse.json(rescueJson, {
                status: 200,
                headers: responseHeaders,
              });
            }
          }
        } catch (rescueErr) {
          console.error("[ADMIN PROXY RESCUE FAILED]", rescueErr);
        }
      }

      try {
        const errorText = new TextDecoder().decode(responseBody);
        console.error("[FOODHUB BACKEND ERROR]", {
          status: backendResponse.status,
          backendUrl: targetUrl.toString(),
          response: errorText,
        });
      } catch {
        console.error("[FOODHUB BACKEND ERROR]", {
          status: backendResponse.status,
          backendUrl: targetUrl.toString(),
        });
      }
    }

    const finalResponse = new NextResponse(responseBody.byteLength > 0 ? responseBody : null, {
      status: backendResponse.status,
      headers: responseHeaders,
    });

    if (refreshedTokens) {
      applyRefreshedCookies(finalResponse, refreshedTokens);
    }

    return finalResponse;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      console.error("[FOODHUB PROXY TIMEOUT]", targetUrl.toString());

      return NextResponse.json(
        {
          message: "The backend request timed out.",
        },
        {
          status: 504,
        },
      );
    }

    console.error(
      `[FOODHUB PROXY ERROR] ${request.method} ${targetUrl}`,
      error,
    );

    return NextResponse.json(
      {
        message: "Could not connect to FoodHub backend.",
      },
      {
        status: 502,
      },
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

export const GET = forwardRequest;
export const POST = forwardRequest;
export const PUT = forwardRequest;
export const PATCH = forwardRequest;
export const DELETE = forwardRequest;
