import type {
  MediaApiError,
  MediaFileResponse,
  StoreMediaPurpose,
} from "@/src/types/media";

async function readError(response: Response): Promise<string> {
  const text = await response.text();

  if (!text) {
    return `Media request failed (${response.status}).`;
  }

  try {
    const json = JSON.parse(text) as MediaApiError;

    return (
      json.message ||
      json.detail ||
      json.error ||
      `Media request failed (${response.status}).`
    );
  } catch {
    return text;
  }
}

function unwrapMediaResponse(json: unknown): MediaFileResponse {
  if (!json || typeof json !== "object") {
    throw new Error("Invalid response format from Media service.");
  }

  const record = json as Record<string, unknown>;
  const nested = (record.payload ?? record.data ?? record) as Record<
    string,
    unknown
  >;

  const uuid =
    typeof nested.uuid === "string" && nested.uuid.trim()
      ? nested.uuid.trim()
      : typeof record.uuid === "string" && record.uuid.trim()
        ? record.uuid.trim()
        : null;

  if (!uuid) {
    throw new Error("Media service did not return a valid media UUID.");
  }

  return {
    ...nested,
    uuid,
  } as unknown as MediaFileResponse;
}

export async function uploadStoreMediaFile(
  file: File,
  purpose: StoreMediaPurpose,
): Promise<MediaFileResponse> {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("purpose", purpose);

  const response = await fetch("/api/media/upload", {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  const json = await response.json();
  return unwrapMediaResponse(json);
}

export async function importStoreMediaFromUrl(
  imageUrl: string,
  purpose: StoreMediaPurpose,
): Promise<MediaFileResponse> {
  const response = await fetch("/api/media/import-url", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      url: imageUrl,
      purpose,
    }),
  });

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  const json = await response.json();
  return unwrapMediaResponse(json);
}

