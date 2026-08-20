export const bannerCategories = [
  "MAIN",
  "POPULAR",
  "LOCATION",
  "SEASON",
] as const;

export type BannerCategory = (typeof bannerCategories)[number];

/** @deprecated use `bannerCategories` — kept as an alias for existing imports. */
export const BANNER_CATEGORIES = bannerCategories;

export const BANNER_CATEGORY_LABELS: Record<BannerCategory, string> = {
  MAIN: "ផ្ទាំងសំខាន់",
  POPULAR: "ពេញនិយម",
  LOCATION: "ទីតាំង",
  SEASON: "រដូវកាល",
};

// ==========================================
// Public API responses (foodhub-frontend contract, kept here for parity)
// ==========================================

export interface PublicBannerResponse {
  id: string;
  image: string;
  location?: string | null;
  title: string;
  description?: string | null;
}

// ==========================================
// Admin API responses & requests
//
// Verified against kh.edu.istad.ite.foodhub.feature.banner.dto.*:
// - AdminBannerResponse is a record with `id` (not `uuid`) as the public
//   identifier field name, and both `imageMediaUuid` and a derived
//   `imageUrl` ("/api/v1/media/{uuid}/file").
// - The record is @JsonInclude(NON_NULL), so `location`/`description` are
//   OMITTED from the JSON entirely when null, never sent as `null` — hence
//   `?: ... | null` rather than a required `| null` field.
// ==========================================

export interface AdminBannerResponse {
  id: string;
  category: BannerCategory;
  imageMediaUuid: string;
  imageUrl: string;
  location?: string | null;
  title: string;
  description?: string | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Matches CreateBannerRequest/UpdateBannerRequest exactly (both records have
 * the same shape server-side). `location`/`description` are always present
 * keys here because this is what the Zod-parsed form produces, not the raw
 * wire response.
 */
export interface CreateBannerPayload {
  category: BannerCategory;
  title: string;
  location: string | null;
  description: string | null;
}

export type UpdateBannerPayload = CreateBannerPayload;

export interface UpdateBannerStatusPayload {
  isPublished: boolean;
}

// ==========================================
// Shared paginated response
//
// Verified against kh.edu.istad.ite.foodhub.common.dto.PageResponse.
// ==========================================

export interface PageResponse<T> {
  contents: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export type AdminBannerPage = PageResponse<AdminBannerResponse>;

export interface GetAdminBannersParams {
  category?: BannerCategory;
  isPublished?: boolean;
  page?: number;
  size?: number;
}

// ==========================================
// Standard backend error response
//
// Verified against kh.edu.istad.ite.foodhub.common.exception.dto.ErrorResponseCommon.
// ==========================================

export interface AdminBannerErrorResponse {
  status: number;
  errorCode: string;
  message: string;
  timestamp: string;
  fieldErrors?: Record<string, string> | null;
}
