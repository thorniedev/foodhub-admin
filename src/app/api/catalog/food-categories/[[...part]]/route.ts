import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic =
  "force-dynamic";

type RouteContext = {
  params: Promise<{
    part?: string[];
  }>;
};

/* =========================================================
   BACKEND URL
========================================================= */

function getBackendApiBaseUrl(): string {
  const configured =
    process.env
      .BACKEND_API_URL ||
    process.env
      .NEXT_PUBLIC_API_BASE_URL ||
    "http://localhost:7070/api/v1";

  const withoutTrailingSlash =
    configured.replace(
      /\/+$/,
      "",
    );

  if (
    withoutTrailingSlash.endsWith(
      "/api/v1",
    )
  ) {
    return withoutTrailingSlash;
  }

  return `${withoutTrailingSlash}/api/v1`;
}

/* =========================================================
   PROXY
========================================================= */

async function proxyFoodCategoryRequest(
  request: NextRequest,
  context: RouteContext,
) {
  const {
    part = [],
  } = await context.params;

  const suffix =
    part.length > 0
      ? `/${part
          .map((segment) =>
            encodeURIComponent(
              segment,
            ),
          )
          .join("/")}`
      : "";

  const backendUrl =
    new URL(
      `${getBackendApiBaseUrl()}/catalog/food-categories${suffix}`,
    );

  /* =======================================================
     QUERY PARAMETERS
  ======================================================= */

  request.nextUrl.searchParams.forEach(
    (
      value,
      key,
    ) => {
      backendUrl.searchParams.append(
        key,
        value,
      );
    },
  );

  /* =======================================================
     AUTH
  ======================================================= */

  const accessToken =
    request.cookies.get(
      "foodhub_access_token",
    )?.value;

  const headers =
    new Headers();

  headers.set(
    "Accept",
    "application/json",
  );

  const contentType =
    request.headers.get(
      "content-type",
    );

  if (contentType) {
    headers.set(
      "Content-Type",
      contentType,
    );
  }

  if (accessToken) {
    headers.set(
      "Authorization",
      `Bearer ${accessToken}`,
    );
  }

  /* =======================================================
     BODY
  ======================================================= */

  const method =
    request.method.toUpperCase();

  const body =
    method === "GET" ||
    method === "HEAD"
      ? undefined
      : await request.arrayBuffer();

  /* =======================================================
     REQUEST BACKEND
  ======================================================= */

  try {
    const response =
      await fetch(
        backendUrl,
        {
          method,

          headers,

          body,

          cache:
            "no-store",

          redirect:
            "manual",
        },
      );

    const responseBody =
      await response.arrayBuffer();

    const responseHeaders =
      new Headers();

    const responseContentType =
      response.headers.get(
        "content-type",
      );

    if (
      responseContentType
    ) {
      responseHeaders.set(
        "Content-Type",
        responseContentType,
      );
    }

    return new NextResponse(
      responseBody.byteLength
        ? responseBody
        : null,
      {
        status:
          response.status,

        headers:
          responseHeaders,
      },
    );
  } catch (error) {
    console.error(
      "[FOOD CATEGORY PROXY ERROR]",
      {
        backendUrl:
          backendUrl.toString(),

        method,

        error,
      },
    );

    return NextResponse.json(
      {
        status: 502,

        message:
          "Could not connect to the FoodHub backend.",
      },
      {
        status: 502,
      },
    );
  }
}

/* =========================================================
   METHODS
========================================================= */

export function GET(
  request: NextRequest,
  context: RouteContext,
) {
  return proxyFoodCategoryRequest(
    request,
    context,
  );
}

export function POST(
  request: NextRequest,
  context: RouteContext,
) {
  return proxyFoodCategoryRequest(
    request,
    context,
  );
}

export function PATCH(
  request: NextRequest,
  context: RouteContext,
) {
  return proxyFoodCategoryRequest(
    request,
    context,
  );
}

export function DELETE(
  request: NextRequest,
  context: RouteContext,
) {
  return proxyFoodCategoryRequest(
    request,
    context,
  );
}
