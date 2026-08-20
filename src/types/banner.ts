export type BannerCategory = "MAIN" | "POPULAR" | "LOCATION" | "SEASON";

export const BANNER_CATEGORIES: BannerCategory[] = [
  "MAIN",
  "POPULAR",
  "LOCATION",
  "SEASON",
];

export const BANNER_CATEGORY_LABELS: Record<BannerCategory, string> = {
  MAIN: "ផ្ទាំងសំខាន់",
  POPULAR: "ពេញនិយម",
  LOCATION: "ទីតាំង",
  SEASON: "រដូវកាល",
};

// ==========================================
// Public API responses (consumed by the PWA, kept here for contract parity)
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

export interface CreateBannerPayload {
  category: BannerCategory;
  title: string;
  location?: string;
  description?: string;
}

export type UpdateBannerPayload = CreateBannerPayload;

export interface UpdateBannerStatusPayload {
  isPublished: boolean;
}

// ==========================================
// Shared paginated response
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
