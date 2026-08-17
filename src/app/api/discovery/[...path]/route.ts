import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    path: string[];
  }>;
};

function getBackendApiBaseUrl(): string {
  const configured =
    process.env.BACKEND_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "http://localhost:7070/api/v1";

  const clean = configured.trim().replace(/\/+$/, "");

  if (clean.endsWith("/api/v1")) {
    return clean;
  }

  return `${clean}/api/v1`;
}

function buildTarget(request: NextRequest, path: string[]): URL {
  const safePath = path
    .map((segment) => encodeURIComponent(decodeURIComponent(segment)))
    .join("/");

  const target = new URL(`${getBackendApiBaseUrl()}/discovery/${safePath}`);

  request.nextUrl.searchParams.forEach((value, key) => {
    target.searchParams.append(key, value);
  });

  return target;
}

async function handleProxy(
  request: NextRequest,
  context: RouteContext,
): Promise<Response> {
  try {
    const { path } = await context.params;
    const target = buildTarget(request, path);

    const headers = new Headers();
    headers.set("Accept", request.headers.get("accept") ?? "application/json");

    const authHeader = request.headers.get("authorization");
    if (authHeader) {
      headers.set("Authorization", authHeader);
    }

    const contentType = request.headers.get("content-type");
    if (contentType) {
      headers.set("Content-Type", contentType);
    }

    let body: ArrayBuffer | undefined;
    if (request.method !== "GET" && request.method !== "HEAD") {
      const buffer = await request.arrayBuffer();
      if (buffer.byteLength > 0) {
        body = buffer;
      }
    }

    const backendResponse = await fetch(target, {
      method: request.method,
      headers,
      body,
      cache: "no-store",
    });

    const responseText = await backendResponse.text();
    const responseHeaders = new Headers();

    const backendContentType = backendResponse.headers.get("content-type");
    if (backendContentType) {
      responseHeaders.set("Content-Type", backendContentType);
    }

    return new NextResponse(responseText || null, {
      status: backendResponse.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("[DISCOVERY PROXY ERROR]", error);
    return NextResponse.json(
      { message: "Failed to connect to Discovery Service." },
      { status: 502 },
    );
  }
}

export async function GET(request: NextRequest, context: RouteContext) {
  return handleProxy(request, context);
}

export async function POST(request: NextRequest, context: RouteContext) {
  return handleProxy(request, context);
}
