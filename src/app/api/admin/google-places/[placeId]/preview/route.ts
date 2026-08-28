/**
 * /api/admin/google-places/[placeId]/preview
 *
 * Enhanced preview handler that:
 * 1. Forwards the request to the backend (for its sanitized preview data)
 * 2. Calls Google Places API directly (server-side) to fetch addressComponents
 * 3. Merges addressComponents into the response JSON so the frontend can
 *    resolve commune / district / city / province without a backend change.
 *
 * This specific route takes priority over the catch-all [...path] handler.
 */

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ── Config helpers (mirrors route.ts) ─────────────────────────────── */

function getBackendBase(): string {
  const url =
    process.env.BACKEND_API_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    "https://api.mhoubahar.store";

  const trimmed = url.trim().replace(/\/+$/, "");
  return /\/api\/v1$/i.test(trimmed) ? trimmed : `${trimmed}/api/v1`;
}

function getGoogleApiKey(): string {
  return (
    process.env.GOOGLE_MAPS_API_KEY ??
    process.env.GOOGLE_MAP_KEY ??
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ??
    ""
  );
}

function getAccessToken(request: NextRequest): string | null {
  return request.cookies.get("foodhub_access_token")?.value ?? null;
}

/* ── Google Places API field mask for address components ────────────── */

const GOOGLE_ADDRESS_FIELD_MASK = [
  "addressComponents",
  "shortFormattedAddress",
  "formattedAddress",
].join(",");

const GOOGLE_PLACES_BASE =
  process.env.GOOGLE_PLACES_BASE_URL ??
  "https://places.googleapis.com";

/* ── Address-component fetcher (direct Google call) ─────────────────── */

interface RawAddressComponent {
  longText?: string;
  shortText?: string;
  types?: string[];
  languageCode?: string;
}

async function fetchAddressComponents(
  placeId: string,
): Promise<RawAddressComponent[] | null> {
  const apiKey = getGoogleApiKey();
  if (!apiKey) return null;

  try {
    const res = await fetch(
      `${GOOGLE_PLACES_BASE}/v1/places/${encodeURIComponent(placeId)}`,
      {
        method: "GET",
        headers: {
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": GOOGLE_ADDRESS_FIELD_MASK,
          Accept: "application/json",
        },
        cache: "no-store",
      },
    );

    if (!res.ok) {
      console.warn(
        `[preview-enricher] Google Places returned ${res.status} for placeId=${placeId}`,
      );
      return null;
    }

    const json = (await res.json()) as { addressComponents?: RawAddressComponent[] };
    return json.addressComponents ?? null;
  } catch (err) {
    console.warn("[preview-enricher] Google Places fetch failed:", err);
    return null;
  }
}

/* ── Backend preview fetcher ─────────────────────────────────────────── */

async function fetchBackendPreview(
  placeId: string,
  accessToken: string,
): Promise<{ status: number; body: string }> {
  const url = `${getBackendBase()}/admin/google-places/${encodeURIComponent(placeId)}/preview`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  const text = await res.text();
  return { status: res.status, body: text };
}

/* ── Route handler ───────────────────────────────────────────────────── */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ placeId: string }> },
) {
  const { placeId } = await params;
  const accessToken = getAccessToken(request);

  if (!accessToken) {
    return NextResponse.json(
      { message: "Admin access token is missing or expired." },
      { status: 401 },
    );
  }

  /* Run backend call and Google address fetch in parallel */
  const [backendResult, addressComponents] = await Promise.all([
    fetchBackendPreview(placeId, accessToken),
    fetchAddressComponents(placeId),
  ]);

  /* Pass through non-200 responses unchanged */
  if (backendResult.status !== 200) {
    return new NextResponse(backendResult.body || null, {
      status: backendResult.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  /* Parse backend JSON and merge addressComponents */
  let previewJson: Record<string, unknown>;

  try {
    previewJson = JSON.parse(backendResult.body) as Record<string, unknown>;
  } catch {
    return new NextResponse(backendResult.body, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (addressComponents && addressComponents.length > 0) {
    previewJson["addressComponents"] = addressComponents;
  }

  return NextResponse.json(previewJson, { status: 200 });
}
