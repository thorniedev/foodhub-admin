import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export type CatalogProxyContext = {
  params: Promise<{
    path?: string[];
  }>;
};

function getBackendApiBaseUrl(): string {
  const configured =
    process.env.BACKEND_API_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    "http://localhost:7070/api/v1";

  const cleaned = configured.trim().replace(/\/+$/, "");

  if (cleaned.endsWith("/api/v1")) {
    return cleaned;
  }

  return `${cleaned}/api/v1`;
}

function buildTargetUrl(
  request: NextRequest,
  resource: string,
  path: string[],
): URL {
  const suffix = path.length
    ? `/${path
        .map((segment) => encodeURIComponent(decodeURIComponent(segment)))
        .join("/")}`
    : "";

  const target = new URL(
    `${getBackendApiBaseUrl()}/catalog/${resource}${suffix}`,
  );

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
  ]) {
    const value = source.get(name);
    if (value) {
      headers.set(name, value);
    }
  }

  return headers;
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

  const accessToken = request.cookies.get("foodhub_access_token")?.value;
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
  });

  try {
    const backendResponse = await fetch(target, {
      method,
      headers,
      body,
      cache: "no-store",
      redirect: "manual",
    });

    const responseBody = await backendResponse.arrayBuffer();

    console.log("[CATALOG PROXY RESPONSE]", {
      method,
      backendUrl: target.toString(),
      status: backendResponse.status,
    });

    return new NextResponse(responseBody.byteLength ? responseBody : null, {
      status: backendResponse.status,
      headers: copyUsefulResponseHeaders(backendResponse.headers),
    });
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
      },
      { status: 502 },
    );
  }
}
