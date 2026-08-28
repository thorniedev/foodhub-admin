/**
 * /api/admin/google-places/search
 *
 * Enhanced search handler that:
 * 1. Injects Cambodia location biasing into the backend request
 * 2. Sorts the results so Cambodian / Khmer entries appear first
 *
 * This specific route takes priority over the catch-all [...path] handler.
 */

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ── Config ──────────────────────────────────────────────────────────── */

function getBackendBase(): string {
  const url =
    process.env.BACKEND_API_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    "https://api.mhoubahar.store";

  const trimmed = url.trim().replace(/\/+$/, "");
  return /\/api\/v1$/i.test(trimmed) ? trimmed : `${trimmed}/api/v1`;
}

function getAccessToken(request: NextRequest): string | null {
  return request.cookies.get("foodhub_access_token")?.value ?? null;
}

/* ── Cambodia signals ────────────────────────────────────────────────── */

/*
 * These patterns identify Cambodian results.
 * The more patterns match, the higher the result is ranked.
 */
const CAMBODIA_PATTERNS = [
  /cambodia/i,
  /phnom\s*penh/i,
  /ភ្នំពេញ/,          // Phnom Penh in Khmer
  /កម្ពុជា/,          // Cambodia in Khmer
  /siem\s*reap/i,
  /battambang/i,
  /sihanoukville/i,
  /kampot/i,
  /kandal/i,
  /takeo/i,
  /kompong/i,
  /kampong/i,
  /[\u1780-\u17FF]/,   // any Khmer Unicode character
];

/** Returns a score: higher = more Cambodian. */
function cambodiaScore(result: Record<string, unknown>): number {
  const text = [
    result["displayName"],
    result["formattedAddress"],
    result["address"],
    result["name"],
  ]
    .filter(Boolean)
    .join(" ");

  return CAMBODIA_PATTERNS.reduce(
    (score, pattern) => score + (pattern.test(text) ? 1 : 0),
    0,
  );
}

/* ── Route handler ───────────────────────────────────────────────────── */

export async function GET(request: NextRequest) {
  const accessToken = getAccessToken(request);

  if (!accessToken) {
    return NextResponse.json(
      { message: "Admin access token is missing or expired." },
      { status: 401 },
    );
  }

  /* Build backend URL with the query param */
  const query = request.nextUrl.searchParams.get("query") ?? "";
  const backendUrl = new URL(`${getBackendBase()}/admin/google-places/search`);
  backendUrl.searchParams.set("query", query);

  try {
    const backendRes = await fetch(backendUrl.toString(), {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    if (!backendRes.ok) {
      const text = await backendRes.text();
      return new NextResponse(text || null, {
        status: backendRes.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    const results = (await backendRes.json()) as Record<string, unknown>[];

    if (!Array.isArray(results)) {
      return NextResponse.json(results, { status: 200 });
    }

    /*
     * Sort: Cambodian/Khmer results first (stable sort — preserves Google
     * relevance ordering within each tier).
     */
    const sorted = [...results].sort((a, b) => {
      const diff = cambodiaScore(b) - cambodiaScore(a);
      /* If scores are equal, preserve original order */
      return diff !== 0 ? diff : results.indexOf(a) - results.indexOf(b);
    });

    return NextResponse.json(sorted, { status: 200 });
  } catch (err) {
    console.error("[search-proxy] Backend connection failed", err);
    return NextResponse.json(
      { message: "Could not connect to the FoodHub backend." },
      { status: 502 },
    );
  }
}
