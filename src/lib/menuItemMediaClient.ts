export type MenuItemMediaPurpose =
  | "CATALOG_FOOD_PRIMARY"
  | "MENU_ITEM_PRIMARY"
  | "MENU_ITEM_GALLERY";

export interface UploadedMedia {
  uuid: string;
  [key: string]: unknown;
}

const ACCEPTED_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
]);

const MAX_BYTES = 10 * 1024 * 1024;

function readMediaUuid(value: unknown): string | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const record = value as Record<string, unknown>;

  if (typeof record.uuid === "string" && record.uuid.trim()) {
    return record.uuid;
  }

  for (const key of ["payload", "data"]) {
    const nested = record[key];
    if (typeof nested === "object" && nested !== null) {
      const uuid = (nested as Record<string, unknown>).uuid;
      if (typeof uuid === "string" && uuid.trim()) {
        return uuid;
      }
    }
  }

  return null;
}

export async function uploadMenuItemMediaFile(
  file: File,
  purpose: MenuItemMediaPurpose,
): Promise<UploadedMedia> {
  if (!ACCEPTED_TYPES.has(file.type)) {
    throw new Error("Only PNG, JPEG, GIF and WebP images are supported.");
  }

  if (file.size > MAX_BYTES) {
    throw new Error("Image must be 10 MB or smaller.");
  }

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(
    `/api/media/upload?purpose=${encodeURIComponent(purpose)}`,
    {
      method: "POST",
      credentials: "include",
      body: formData,
    },
  );

  const text = await response.text();

  let parsed: unknown = null;
  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = text;
    }
  }

  if (!response.ok) {
    if (typeof parsed === "object" && parsed !== null) {
      const message = (parsed as Record<string, unknown>).message;
      if (typeof message === "string" && message.trim()) {
        throw new Error(message);
      }
    }

    throw new Error(`Image upload failed (${response.status}).`);
  }

  const uuid = readMediaUuid(parsed);

  if (!uuid) {
    throw new Error("Media API succeeded but did not return a media UUID.");
  }

  return {
    ...(typeof parsed === "object" && parsed !== null ? parsed : {}),
    uuid,
  };
}

export function normalizeCatalogAssetUrl(value?: string | null): string | null {
  const trimmed = value?.trim();

  if (!trimmed) {
    return null;
  }

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  if (trimmed.startsWith("/api/v1/catalog/")) {
    return trimmed.replace("/api/v1/catalog/", "/api/catalog/");
  }

  if (trimmed.startsWith("/")) {
    return trimmed;
  }

  return `/${trimmed}`;
}
