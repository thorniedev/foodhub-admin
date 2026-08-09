import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

import { NextRequest, NextResponse } from "next/server";

import type { StoreMediaPurpose } from "@/src/types/media";

import {
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_IMAGE_BYTES,
  forwardMediaToBackend,
  isStoreMediaPurpose,
} from "../_shared";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ImportImageRequest {
  url?: unknown;
  purpose?: unknown;
}

const REDIRECT_CODES = new Set([
  301,
  302,
  303,
  307,
  308,
]);

function isUnsafeIpv4(address: string): boolean {
  const parts = address
    .split(".")
    .map((part) => Number(part));

  if (
    parts.length !== 4 ||
    parts.some(
      (part) =>
        !Number.isInteger(part) ||
        part < 0 ||
        part > 255,
    )
  ) {
    return true;
  }

  const [a, b] = parts;

  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 0) ||
    (a === 192 && b === 168) ||
    (a === 198 && (b === 18 || b === 19)) ||
    a >= 224
  );
}

function isUnsafeIp(address: string): boolean {
  const normalized = address.toLowerCase();

  if (isIP(normalized) === 4) {
    return isUnsafeIpv4(normalized);
  }

  if (isIP(normalized) === 6) {
    if (
      normalized === "::" ||
      normalized === "::1" ||
      normalized.startsWith("fc") ||
      normalized.startsWith("fd") ||
      normalized.startsWith("fe8") ||
      normalized.startsWith("fe9") ||
      normalized.startsWith("fea") ||
      normalized.startsWith("feb")
    ) {
      return true;
    }

    const mappedIpv4 =
      normalized.match(/::ffff:(\d+\.\d+\.\d+\.\d+)$/)?.[1];

    if (mappedIpv4) {
      return isUnsafeIpv4(mappedIpv4);
    }

    return false;
  }

  return true;
}

async function assertSafeRemoteUrl(
  url: URL,
): Promise<void> {
  if (
    url.protocol !== "https:" &&
    url.protocol !== "http:"
  ) {
    throw new Error(
      "Only http:// and https:// image URLs are allowed.",
    );
  }

  if (url.username || url.password) {
    throw new Error(
      "Image URL must not contain a username or password.",
    );
  }

  const hostname = url.hostname
    .replace(/^\[|\]$/g, "")
    .toLowerCase();

  if (
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local") ||
    hostname.endsWith(".internal")
  ) {
    throw new Error(
      "Local/private image URLs are not allowed.",
    );
  }

  if (isIP(hostname)) {
    if (isUnsafeIp(hostname)) {
      throw new Error(
        "Local/private image URLs are not allowed.",
      );
    }

    return;
  }

  const addresses = await lookup(hostname, {
    all: true,
    verbatim: true,
  });

  if (!addresses.length) {
    throw new Error(
      "Could not resolve the image host.",
    );
  }

  if (
    addresses.some(({ address }) =>
      isUnsafeIp(address),
    )
  ) {
    throw new Error(
      "Local/private image URLs are not allowed.",
    );
  }
}

function extensionFromMimeType(
  mimeType: string,
): string {
  switch (mimeType) {
    case "image/png":
      return "png";
    case "image/jpeg":
      return "jpg";
    case "image/gif":
      return "gif";
    case "image/webp":
      return "webp";
    default:
      return "img";
  }
}

async function downloadRemoteImage(
  initialUrl: URL,
): Promise<{
  bytes: ArrayBuffer;
  mimeType: string;
  filename: string;
}> {
  let currentUrl = initialUrl;

  for (
    let redirectCount = 0;
    redirectCount <= 3;
    redirectCount += 1
  ) {
    await assertSafeRemoteUrl(currentUrl);

    const response = await fetch(
      currentUrl,
      {
        method: "GET",
        redirect: "manual",
        cache: "no-store",
        headers: {
          Accept:
            "image/png,image/jpeg,image/gif,image/webp",
          "User-Agent":
            "FoodHubAdmin/1.0",
        },
      },
    );

    if (
      REDIRECT_CODES.has(
        response.status,
      )
    ) {
      const location =
        response.headers.get(
          "location",
        );

      if (!location) {
        throw new Error(
          "Image server returned an invalid redirect.",
        );
      }

      currentUrl = new URL(
        location,
        currentUrl,
      );

      continue;
    }

    if (!response.ok) {
      throw new Error(
        `Could not download image (${response.status}).`,
      );
    }

    const mimeType = (
      response.headers
        .get("content-type")
        ?.split(";")[0] ?? ""
    )
      .trim()
      .toLowerCase();

    if (
      !ALLOWED_IMAGE_MIME_TYPES.has(
        mimeType,
      )
    ) {
      throw new Error(
        "The URL must point directly to a PNG, JPEG, GIF or WebP image.",
      );
    }

    const contentLength = Number(
      response.headers.get(
        "content-length",
      ) ?? "0",
    );

    if (
      Number.isFinite(
        contentLength,
      ) &&
      contentLength >
        MAX_IMAGE_BYTES
    ) {
      throw new Error(
        "Remote image must be 10 MB or smaller.",
      );
    }

    const bytes =
      await response.arrayBuffer();

    if (
      bytes.byteLength <= 0
    ) {
      throw new Error(
        "The remote image is empty.",
      );
    }

    if (
      bytes.byteLength >
      MAX_IMAGE_BYTES
    ) {
      throw new Error(
        "Remote image must be 10 MB or smaller.",
      );
    }

    const pathName =
      currentUrl.pathname
        .split("/")
        .filter(Boolean)
        .pop();

    const fallbackName =
      `store-image.${extensionFromMimeType(
        mimeType,
      )}`;

    let filename =
      pathName &&
      pathName.length <= 150
        ? pathName
        : fallbackName;

    try {
      filename =
        decodeURIComponent(
          filename,
        );
    } catch {
      filename =
        fallbackName;
    }

    if (
      !filename.includes(".")
    ) {
      filename =
        fallbackName;
    }

    return {
      bytes,
      mimeType,
      filename,
    };
  }

  throw new Error(
    "Too many redirects while downloading image.",
  );
}

export async function POST(
  request: NextRequest,
): Promise<Response> {
  const accessToken =
    request.cookies.get(
      "foodhub_access_token",
    )?.value;

  if (!accessToken) {
    return NextResponse.json(
      {
        message:
          "Admin session is missing or expired.",
      },
      {
        status: 401,
      },
    );
  }

  let body: ImportImageRequest;

  try {
    body =
      (await request.json()) as ImportImageRequest;
  } catch {
    return NextResponse.json(
      {
        message:
          "Invalid JSON body.",
      },
      {
        status: 400,
      },
    );
  }

  const urlValue =
    typeof body.url === "string"
      ? body.url.trim()
      : "";

  if (!urlValue) {
    return NextResponse.json(
      {
        message:
          "Image URL is required.",
      },
      {
        status: 400,
      },
    );
  }

  if (
    !isStoreMediaPurpose(
      body.purpose,
    )
  ) {
    return NextResponse.json(
      {
        message:
          "purpose must be STORE_LOGO or STORE_COVER.",
      },
      {
        status: 400,
      },
    );
  }

  let imageUrl: URL;

  try {
    imageUrl =
      new URL(urlValue);
  } catch {
    return NextResponse.json(
      {
        message:
          "Image URL is invalid.",
      },
      {
        status: 400,
      },
    );
  }

  try {
    const remote =
      await downloadRemoteImage(
        imageUrl,
      );

    const file = new File(
      [remote.bytes],
      remote.filename,
      {
        type: remote.mimeType,
      },
    );

    return forwardMediaToBackend({
      accessToken,
      file,
      purpose:
        body.purpose as StoreMediaPurpose,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Could not import image URL.",
      },
      {
        status: 400,
      },
    );
  }
}
