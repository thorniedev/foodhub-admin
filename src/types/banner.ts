export const bannerCategories = [
  "MAIN",
  "POPULAR",
  "LOCATION",
  "SEASON",
] as const;

export type BannerCategory = (typeof bannerCategories)[number];

export const BANNER_CATEGORIES = bannerCategories;

export const BANNER_CATEGORY_LABELS: Record<BannerCategory, string> = {
  MAIN: "ផ្ទាំងសំខាន់ (Main)",
  POPULAR: "ពេញនិយម (Popular)",
  LOCATION: "ទីតាំង (Location)",
  SEASON: "រដូវកាល (Season)",
};

export const BANNER_CATEGORY_COLORS: Record<
  BannerCategory,
  { bg: string; text: string; border: string; dot: string }
> = {
  MAIN: {
    bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
    text: "text-emerald-700",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
  },
  POPULAR: {
    bg: "bg-orange-50 text-orange-700 border-orange-200",
    text: "text-orange-700",
    border: "border-orange-200",
    dot: "bg-orange-500",
  },
  LOCATION: {
    bg: "bg-blue-50 text-blue-700 border-blue-200",
    text: "text-blue-700",
    border: "border-blue-200",
    dot: "bg-blue-500",
  },
  SEASON: {
    bg: "bg-purple-50 text-purple-700 border-purple-200",
    text: "text-purple-700",
    dot: "bg-purple-500",
    border: "border-purple-200",
  },
};

// ==========================================
// Admin Banner Contracts
// ==========================================

export interface AdminBannerResponse {
  id: string; // UUID
  category: BannerCategory;
  imageMediaUuid: string; // UUID of media file
  imageUrl: string; // Path e.g. "/api/v1/media/{uuid}/file"
  location?: string | null; // Required for LOCATION category, null otherwise
  title: string;
  description?: string | null;
  isPublished: boolean; // Defaults to false upon creation
  createdAt: string; // ISO 8601 string
  updatedAt: string; // ISO 8601 string
}

export interface CreateBannerPayload {
  category: BannerCategory;
  title: string; // Required, max 255 chars
  location?: string | null; // Required IF category === 'LOCATION', max 100 chars
  description?: string | null;
}

export interface UpdateBannerPayload {
  category: BannerCategory;
  title: string; // Required, max 255 chars
  location?: string | null; // Required IF category === 'LOCATION', max 100 chars
  description?: string | null;
}

export interface UpdateBannerStatusPayload {
  isPublished: boolean;
}

// ==========================================
// Paginated Response
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
// Error Response Contracts
// ==========================================

export interface ApiErrorResponse {
  status: number;
  errorCode: string;
  message: string;
  fieldErrors?: Record<string, string>;
}

export interface AdminBannerErrorResponse {
  status: number;
  errorCode: string;
  message: string;
  timestamp: string;
  fieldErrors?: Record<string, string> | null;
}

// Public API response compatibility
export interface PublicBannerResponse {
  id: string;
  image: string;
  location?: string | null;
  title: string;
  description?: string | null;
}
