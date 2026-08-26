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

async function forwardBackendResponse(
  backendResponse: Response,
  accessToken?: string,
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
  }

  return response;
}

export async function GET(request: NextRequest): Promise<Response> {
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
    const backendResponse = await fetch(`${backendApiUrl}/users/me`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    return forwardBackendResponse(backendResponse, accessToken);
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
