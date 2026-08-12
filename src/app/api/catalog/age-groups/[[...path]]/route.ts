import {
  type NextRequest,
  NextResponse,
} from "next/server";

export const runtime = "nodejs";

export const dynamic =
  "force-dynamic";

/* =========================================================
   BACKEND URL
========================================================= */

function getBackendBaseUrl() {
  const configured =
    process.env.BACKEND_API_URL ??
    process.env
      .NEXT_PUBLIC_API_BASE_URL ??
    "http://localhost:7070/api/v1";

  let base =
    configured
      .trim()
      .replace(/\/+$/, "");

  /*
   * Support:
   *
   * http://localhost:7070
   * http://localhost:7070/api/v1
   */
  if (
    !base
      .toLowerCase()
      .endsWith(
        "/api/v1",
      )
  ) {
    base += "/api/v1";
  }

  return base;
}

/* =========================================================
   TYPES
========================================================= */

type RouteContext = {
  params: Promise<{
    path?: string[];
  }>;
};

/* =========================================================
   PROXY
========================================================= */

async function proxyAgeGroupRequest(
  request: NextRequest,
  context: RouteContext,
) {
  try {
    const { path = [] } =
      await context.params;

    /*
     * Protect the path from invalid segments.
     */
    if (
      path.some(
        (segment) =>
          !segment ||
          segment === "." ||
          segment === "..",
      )
    ) {
      return NextResponse.json(
        {
          message:
            "Invalid Age Group path.",
        },
        {
          status: 400,
        },
      );
    }

    const backendBase =
      getBackendBaseUrl();

    const suffix =
      path.length > 0
        ? `/${path
            .map((segment) =>
              encodeURIComponent(
                segment,
              ),
            )
            .join("/")}`
        : "";

    const targetUrl =
      new URL(
        `${backendBase}/catalog/age-groups${suffix}`,
      );

    /*
     * Keep page, size and sort.
     */
    targetUrl.search =
      request.nextUrl.search;

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

    /*
     * Forward token when available.
     * GET endpoint can still work without auth
     * if backend marks it public.
     */
    const incomingAuthorization =
      request.headers.get(
        "authorization",
      );

    const accessToken =
      request.cookies.get(
        "foodhub_access_token",
      )?.value;

    if (
      incomingAuthorization
    ) {
      headers.set(
        "Authorization",
        incomingAuthorization,
      );
    } else if (accessToken) {
      headers.set(
        "Authorization",
        `Bearer ${accessToken}`,
      );
    }

    const method =
      request.method
        .toUpperCase();

    let body:
      | ArrayBuffer
      | undefined;

    if (
      method !== "GET" &&
      method !== "HEAD"
    ) {
      const buffer =
        await request.arrayBuffer();

      if (
        buffer.byteLength >
        0
      ) {
        body = buffer;
      }
    }

    console.log(
      "[AGE GROUP PROXY]",
      {
        method,

        target:
          targetUrl.toString(),

        hasAuthorization:
          headers.has(
            "Authorization",
          ),
      },
    );

    const response =
      await fetch(
        targetUrl,
        {
          method,

          headers,

          body,

          cache: "no-store",
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
      responseBody,
      {
        status:
          response.status,

        statusText:
          response.statusText,

        headers:
          responseHeaders,
      },
    );
  } catch (error) {
    console.error(
      "[AGE GROUP PROXY ERROR]",
      error,
    );

    return NextResponse.json(
      {
        message:
          "Could not connect to the Age Group backend API.",
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

export async function GET(
  request: NextRequest,
  context: RouteContext,
) {
  return proxyAgeGroupRequest(
    request,
    context,
  );
}

export async function POST(
  request: NextRequest,
  context: RouteContext,
) {
  return proxyAgeGroupRequest(
    request,
    context,
  );
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext,
) {
  return proxyAgeGroupRequest(
    request,
    context,
  );
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext,
) {
  return proxyAgeGroupRequest(
    request,
    context,
  );
}