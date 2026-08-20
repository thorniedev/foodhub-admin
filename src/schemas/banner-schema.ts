import { z } from "zod";
import { bannerCategories } from "../types/banner";

/**
 * Verified against the backend (MediaServiceImpl defaults, no application.yaml
 * override): media.upload.allowed-mime-types and media.upload.max-size-bytes.
 * AdminBannerController -> MediaService.uploadUserMedia(image, BANNER_IMAGE)
 * shares these limits with every other user-uploaded image.
 */
export const BANNER_IMAGE_MAX_SIZE_BYTES = 10 * 1024 * 1024;
export const BANNER_IMAGE_ACCEPTED_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
] as const;

/** Backend CreateBannerRequest/UpdateBannerRequest: title @Size(max = 255). */
const BANNER_TITLE_MAX_LENGTH = 255;
/** Backend CreateBannerRequest/UpdateBannerRequest: location @Size(max = 100). */
const BANNER_LOCATION_MAX_LENGTH = 100;

/**
 * Form values keep this as plain `string | undefined` (never `null`) so RHF
 * defaults and native inputs stay simple. The submit handler is what maps it
 * to the `string | null` shape CreateBannerPayload/UpdateBannerPayload need —
 * form values and request payloads are intentionally separate types.
 */
const optionalTrimmedString = (maximum?: number) => {
  const base = z.string().trim();
  return (maximum ? base.max(maximum) : base).optional();
};

function isSupportedImageMimeType(file: File): boolean {
  return (BANNER_IMAGE_ACCEPTED_MIME_TYPES as readonly string[]).includes(
    file.type,
  );
}

const bannerImageFileSchema = z
  .instanceof(File, { message: "Image is required" })
  .refine((file) => file.size > 0, { message: "The selected file is empty" })
  .refine((file) => file.size <= BANNER_IMAGE_MAX_SIZE_BYTES, {
    message: "Image must be 10MB or smaller",
  })
  .refine(isSupportedImageMimeType, {
    message: "Image must be PNG, JPEG, GIF, or WebP",
  });

/**
 * Shared field rules for both create and update. `category`/`title`/
 * `description` map 1:1 to CreateBannerRequest/UpdateBannerRequest.
 * `location` is conditionally required by the superRefine below, matching
 * BannerServiceImpl#validateState (LOCATION category requires a location).
 */
const bannerBaseShape = {
  category: z.enum(bannerCategories, {
    error: () => ({ message: "Select a banner category" }),
  }),
  title: z
    .string()
    .trim()
    .min(1, { message: "Title is required" })
    .max(BANNER_TITLE_MAX_LENGTH, {
      message: `Title must be at most ${BANNER_TITLE_MAX_LENGTH} characters`,
    }),
  location: optionalTrimmedString(BANNER_LOCATION_MAX_LENGTH),
  // No backend @Size constraint on description; only trim/normalize to null.
  description: optionalTrimmedString(),
};

function requireLocationForLocationCategory<
  T extends { category: string; location?: string },
>(value: T, context: z.RefinementCtx) {
  if (value.category === "LOCATION" && !value.location) {
    context.addIssue({
      code: "custom",
      path: ["location"],
      message: "Location is required for LOCATION banners",
    });
  }
}

export const createBannerSchema = z
  .object({
    ...bannerBaseShape,
    image: bannerImageFileSchema,
  })
  .superRefine(requireLocationForLocationCategory);

export const updateBannerSchema = z
  .object({
    ...bannerBaseShape,
    image: bannerImageFileSchema.optional().nullable(),
  })
  .superRefine(requireLocationForLocationCategory);

export type CreateBannerFormValues = z.infer<typeof createBannerSchema>;
export type UpdateBannerFormValues = z.infer<typeof updateBannerSchema>;
export type BannerFormValues = CreateBannerFormValues | UpdateBannerFormValues;
