export type StoreReviewStatus = "PENDING" | "APPROVED" | "REJECTED" | string;
export type StoreOperatingStatus =
  | "OPEN"
  | "CLOSED"
  | "TEMPORARILY_CLOSED"
  | "PERMANENTLY_CLOSED"
  | "UNKNOWN"
  | string;
export type StoreAccountStatus =
  | "ACTIVE"
  | "SUSPENDED"
  | "ARCHIVED"
  | string;

/**
 * Mirrors the backend `StoreSocialPlatform` enum. The API rejects any other
 * value, so the admin UI must only ever offer these.
 */
export const STORE_SOCIAL_PLATFORMS = [
  "FACEBOOK",
  "INSTAGRAM",
  "TIKTOK",
  "YOUTUBE",
  "TELEGRAM",
  "X",
] as const;

export type StoreSocialPlatform = (typeof STORE_SOCIAL_PLATFORMS)[number];

/**
 * Hosts the backend accepts per platform (`StoreSocialUrlValidator`). Used to
 * validate before submitting so the admin sees a field-level message instead of
 * a generic 400 from the API.
 */
export const STORE_SOCIAL_PLATFORM_HOSTS: Record<
  StoreSocialPlatform,
  string[]
> = {
  FACEBOOK: ["facebook.com"],
  INSTAGRAM: ["instagram.com"],
  TIKTOK: ["tiktok.com"],
  YOUTUBE: ["youtube.com"],
  TELEGRAM: ["t.me"],
  X: ["x.com", "twitter.com"],
};

/** Backend caps a store at 10 social links. */
export const MAX_STORE_SOCIAL_LINKS = 10;

export interface StoreSocialLink {
  platform: string;
  profileUrl: string;
  displayOrder: number;
}

export interface StoreHour {
  scheduleType: "WEEKLY" | "SPECIAL_DATE";
  dayOfWeek?: number | null;
  businessDate?: string | null;
  openingTime?: string | null;
  closingTime?: string | null;
  intervalOrder: number;
  isClosed: boolean;
  reason?: string | null;
}

export interface Store {
  uuid: string;
  storeName: string;
  description: string | null;
  addressLine: string;
  commune: string | null;
  district: string | null;
  city: string | null;
  province: string | null;
  countryCode: string;
  postalCode: string | null;
  timezone: string;
  latitude: number;
  longitude: number;
  phoneNumber: string | null;
  email: string | null;
  logoMediaUuid: string | null;
  coverMediaUuid: string | null;
  logoUrl: string | null;
  coverImageUrl: string | null;
  priceLevel: number | string | null;
  hygieneRating: number | null;
  averageRating: number;
  totalReviews: number;
  reviewStatus: StoreReviewStatus;
  operatingStatus: StoreOperatingStatus;
  accountStatus: StoreAccountStatus;
  isOpenNow: boolean | null;
  socialLinks: StoreSocialLink[];
  openingHours: StoreHour[];
  externalSource: unknown | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface StorePage {
  contents: Store[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface GetAdminStoresParams {
  query?: string;
  reviewStatus?: StoreReviewStatus | "ALL";
  operatingStatus?: StoreOperatingStatus;
  accountStatus?: StoreAccountStatus;
  page?: number;
  size?: number;
}

export interface CreateStorePayload {
  storeName: string;
  description?: string | null;
  addressLine: string;
  commune?: string | null;
  district?: string | null;
  city?: string | null;
  province?: string | null;
  countryCode: string;
  postalCode?: string | null;
  timezone: string;
  latitude: number;
  longitude: number;
  phoneNumber?: string | null;
  email?: string | null;
  logoMediaUuid?: string | null;
  coverMediaUuid?: string | null;
  priceLevel?: number | null;
  hygieneRating?: number | null;
  operatingStatus?: StoreOperatingStatus;
  socialLinks?: StoreSocialLink[];
}

/** Fields demonstrated by the supplied PUT request (matches StoreRequest). */
export interface UpdateStorePayload {
  storeName: string;
  description?: string | null;
  addressLine: string;
  commune?: string | null;
  district?: string | null;
  city?: string | null;
  province?: string | null;
  countryCode: string;
  postalCode?: string | null;
  timezone: string;
  latitude: number;
  longitude: number;
  phoneNumber?: string | null;
  email?: string | null;
  logoMediaUuid?: string | null;
  coverMediaUuid?: string | null;
  priceLevel?: number | null;
  hygieneRating?: number | null;
  operatingStatus?: StoreOperatingStatus;
  /**
   * Omit to leave the store's existing links untouched; send an array to
   * replace them wholesale (`[]` clears them).
   */
  socialLinks?: StoreSocialLink[];
}

export interface UpdateStoreReviewStatusPayload {
  reviewStatus: "APPROVED" | "REJECTED";
  notes: string;
}
export interface UpdateStoreAccountStatusPayload {
  accountStatus: StoreAccountStatus;
}
export interface UpdateStoreOperatingStatusPayload {
  operatingStatus: StoreOperatingStatus;
}
export interface ReplaceStoreHoursPayload {
  hours: StoreHour[];
}
export interface CreateStoreFromGooglePayload {
  placeId: string;
  overrides: {
    timezone: string;
    logoMediaUuid?: string | null;
    coverMediaUuid?: string | null;
  };
}

export type GooglePlaceResult = Record<string, unknown>;
export type GooglePlacePreview = Record<string, unknown>;
export type StoreExternalSourceMetadata = Record<string, unknown>;

export type StoreReviewFilter = "ALL" | "PENDING" | "APPROVED" | "REJECTED";
export type StoreStatusAction = "REVIEW" | "ACCOUNT" | "OPERATING";
