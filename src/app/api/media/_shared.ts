import type { StoreMediaPurpose } from "@/src/types/media";

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

export const ALLOWED_IMAGE_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
]);

export function isStoreMediaPurpose(
  value: unknown,
): value is StoreMediaPurpose {
  return value === "STORE_LOGO" || value === "STORE_COVER";
}

export function getBackendApiUrl(): string | null {
  const configured = (
    process.env.BACKEND_API_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL
  )?.replace(/\/+$/, "");

  if (!configured) {
    return null;
  }

  return /\/api\/v1$/i.test(configured)
    ? configured
    : `${configured}/api/v1`;
}

export async function forwardMediaToBackend({
  accessToken,
  file,
  purpose,
}: {
  accessToken: string;
  file: Blob;
  purpose: StoreMediaPurpose;
}): Promise<Response> {
  const backendApiUrl = getBackendApiUrl();

  if (!backendApiUrl) {
    return Response.json(
      {
        message:
          "Backend API URL is not configured. Set BACKEND_API_URL or NEXT_PUBLIC_API_BASE_URL.",
      },
      {
        status: 500,
      },
    );
  }

  const formData = new FormData();

  const filename =
    file instanceof File && file.name
      ? file.name
      : purpose === "STORE_LOGO"
        ? "store-logo.jpg"
        : "store-cover.jpg";

  formData.append("file", file, filename);

  const backendResponse = await fetch(
    `${backendApiUrl}/media?purpose=${encodeURIComponent(purpose)}`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
      cache: "no-store",
    },
  );

  const responseBody = await backendResponse.arrayBuffer();

  return new Response(responseBody, {
    status: backendResponse.status,
    headers: {
      "Content-Type":
        backendResponse.headers.get("content-type") ??
        "application/json",
    },
  });
}
