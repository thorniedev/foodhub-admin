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

  return (await response.json()) as MediaFileResponse;
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

  return (await response.json()) as MediaFileResponse;
}
