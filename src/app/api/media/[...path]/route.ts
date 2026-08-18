import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getBackendApiBaseUrl } from "@/src/lib/backendUrl";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    path: string[];
  }>;
};

function buildTarget(request: NextRequest, path: string[]): URL {
  const safePath = path
    .map((segment) => encodeURIComponent(decodeURIComponent(segment)))
    .join("/");

  const target = new URL(`${getBackendApiBaseUrl()}/media/${safePath}`);

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
    headers.set("Accept", request.headers.get("accept") ?? "*/*");

    const accessToken = request.cookies.get("foodhub_access_token")?.value;
    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
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

    const responseBuffer = await backendResponse.arrayBuffer();
    const responseHeaders = new Headers();

    const backendContentType = backendResponse.headers.get("content-type") || "";
    const isAccessUrlEndpoint = path.some((segment) => segment === "access-url");

    // Only redirect direct /api/media/{uuid} GET requests if backend returns JSON containing an image URL.
    // Never redirect /access-url requests because clients expect the JSON envelope { url, expiresAt }.
    if (
      !isAccessUrlEndpoint &&
      backendContentType.includes("application/json") &&
      request.method === "GET"
    ) {
      try {
        const text = new TextDecoder().decode(responseBuffer);
        const json = JSON.parse(text);
        const targetUrl =
          json.url ||
          json.payload?.url ||
          json.data?.url ||
          json.accessUrl ||
          json.payload?.accessUrl;

        if (
          typeof targetUrl === "string" &&
          (targetUrl.startsWith("http://") || targetUrl.startsWith("https://"))
        ) {
          return NextResponse.redirect(targetUrl, { status: 307 });
        }
      } catch {
        // Continue returning the original JSON buffer
      }
    }

    if (backendContentType) {
      responseHeaders.set("Content-Type", backendContentType);
    }

    const cacheControl = backendResponse.headers.get("cache-control");
    if (cacheControl) {
      responseHeaders.set("Cache-Control", cacheControl);
    }

    return new NextResponse(responseBuffer.byteLength ? responseBuffer : null, {
      status: backendResponse.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("[MEDIA PROXY ERROR]", error);
    return NextResponse.json(
      { message: "Failed to connect to Media Service." },
      { status: 502 },
    );
  }
}

export async function GET(request: NextRequest, context: RouteContext) {
  return handleProxy(request, context);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  return handleProxy(request, context);
}
