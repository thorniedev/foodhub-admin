"use client";

export type CatalogMediaPurpose =
  | "CATALOG_FOOD_PRIMARY"
  | "MENU_ITEM_PRIMARY"
  | "MENU_ITEM_GALLERY";

export interface UploadedMedia {
  uuid: string;
  originalFilename?: string | null;
  mimeType?: string | null;
  sizeBytes?: number | null;
  widthPx?: number | null;
  heightPx?: number | null;
  createdAt?: string | null;
}

function getErrorMessage(
  value: unknown,
  fallback: string,
): string {
  if (
    value &&
    typeof value === "object"
  ) {
    const record =
      value as Record<string, unknown>;

    for (const key of [
      "message",
      "error",
      "detail",
    ]) {
      const candidate =
        record[key];

      if (
        typeof candidate ===
          "string" &&
        candidate.trim()
      ) {
        return candidate.trim();
      }
    }
  }

  if (
    typeof value === "string" &&
    value.trim()
  ) {
    return value.trim();
  }

  return fallback;
}

export async function uploadCatalogMediaFile(
  file: File,
  purpose: CatalogMediaPurpose,
): Promise<UploadedMedia> {
  const formData =
    new FormData();

  formData.append(
    "file",
    file,
  );

  formData.append(
    "purpose",
    purpose,
  );

  const response =
    await fetch(
      "/api/media/upload",
      {
        method: "POST",
        credentials:
          "include",
        body: formData,
      },
    );

  const text =
    await response.text();

  let body: unknown =
    text;

  if (text) {
    try {
      body =
        JSON.parse(text);
    } catch {
      body = text;
    }
  }

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        body,
        `Image upload failed (${response.status}).`,
      ),
    );
  }

  const possibleWrapper =
    body &&
    typeof body ===
      "object"
      ? (body as Record<
          string,
          unknown
        >)
      : null;

  const resolved =
    possibleWrapper?.payload ??
    possibleWrapper?.data ??
    body;

  if (
    !resolved ||
    typeof resolved !==
      "object" ||
    typeof (
      resolved as Record<
        string,
        unknown
      >
    ).uuid !== "string"
  ) {
    throw new Error(
      "Media upload succeeded but no media UUID was returned.",
    );
  }

  return resolved as UploadedMedia;
}

export async function uploadFoodImages(
  files: File[],
): Promise<string[]> {
  const uuids: string[] =
    [];

  for (const file of files.slice(
    0,
    4,
  )) {
    const media =
      await uploadCatalogMediaFile(
        file,
        "CATALOG_FOOD_PRIMARY",
      );

    uuids.push(
      media.uuid,
    );
  }

  return uuids;
}

export async function uploadMenuItemImages(
  files: File[],
): Promise<string[]> {
  const uuids: string[] =
    [];

  for (
    let index = 0;
    index <
    Math.min(
      files.length,
      4,
    );
    index += 1
  ) {
    const purpose:
      CatalogMediaPurpose =
      index === 0
        ? "MENU_ITEM_PRIMARY"
        : "MENU_ITEM_GALLERY";

    const media =
      await uploadCatalogMediaFile(
        files[index],
        purpose,
      );

    uuids.push(
      media.uuid,
    );
  }

  return uuids;
}
