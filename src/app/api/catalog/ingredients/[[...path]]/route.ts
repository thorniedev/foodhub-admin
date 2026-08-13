import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    path?: string[];
  }>;
};

function getBackendApiBaseUrl(): string {
  const configured =
    process.env.BACKEND_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "http://localhost:7070/api/v1";

  const baseUrl = configured.replace(/\/+$/, "");

  if (baseUrl.endsWith("/api/v1")) {
    return baseUrl;
  }

  return `${baseUrl}/api/v1`;
}

async function proxyIngredientRequest(
  request: NextRequest,
  context: RouteContext,
) {
  const { path = [] } = await context.params;

  const suffix =
    path.length > 0
      ? `/${path
          .map((segment) => encodeURIComponent(segment))
          .join("/")}`
      : "";

  const backendUrl = new URL(
    `${getBackendApiBaseUrl()}/catalog/ingredients${suffix}`,
  );

  request.nextUrl.searchParams.forEach((value, key) => {
    backendUrl.searchParams.append(key, value);
  });

  const accessToken =
    request.cookies.get("foodhub_access_token")?.value;

  const headers = new Headers();

  headers.set("Accept", "application/json");

  if (accessToken) {
    headers.set(
      "Authorization",
      `Bearer ${accessToken}`,
    );
  }

  console.log("[INGREDIENT CATALOG PROXY]", {
    method: request.method,
    backendUrl: backendUrl.toString(),
  });

  try {
    const response = await fetch(backendUrl, {
      method: "GET",
      headers,
      cache: "no-store",
      redirect: "manual",
    });

    const body = await response.arrayBuffer();

    const responseHeaders = new Headers();

    const contentType =
      response.headers.get("content-type");

    if (contentType) {
      responseHeaders.set(
        "Content-Type",
        contentType,
      );
    }

    if (!response.ok) {
      const errorText = new TextDecoder().decode(body);

      console.error("[INGREDIENT CATALOG ERROR]", {
        backendUrl: backendUrl.toString(),
        status: response.status,
        response: errorText,
      });
    }

    return new NextResponse(
      body.byteLength ? body : null,
      {
        status: response.status,
        headers: responseHeaders,
      },
    );
  } catch (error) {
    console.error(
      "[INGREDIENT CATALOG CONNECTION ERROR]",
      error,
    );

    return NextResponse.json(
      {
        status: 502,
        message:
          "Could not connect to Ingredient API.",
      },
      {
        status: 502,
      },
    );
  }
}

export function GET(
  request: NextRequest,
  context: RouteContext,
) {
  return proxyIngredientRequest(
    request,
    context,
  );
}