export type ReviewStatus = "PENDING" | "APPROVED" | "REJECTED";
export type OperatingStatus = "OPEN" | "CLOSED" | "TEMPORARILY_CLOSED" | "UNKNOWN";
export type AccountStatus = "ACTIVE" | "SUSPENDED" | "BANNED" | "PENDING";
export type PriceLevel = "LOW" | "MEDIUM" | "HIGH" | null;

export type DayOfWeek =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export interface OpeningHourEntry {
  dayOfWeek: DayOfWeek;
  openTime: string;
  closeTime: string;
  isClosed?: boolean;
}

export interface SocialLink {
  platform: string;
  url: string;
}

export interface Shop {
  uuid: string;
  storeName: string;
  description: string;
  addressLine: string;
  commune: string | null;
  district: string;
  city: string;
  province: string;
  countryCode: string;
  postalCode: string | null;
  timezone: string;
  latitude: number | null;
  longitude: number | null;
  phoneNumber: string;
  email: string;
  logoMediaUuid: string | null;
  coverMediaUuid: string | null;
  logoUrl: string | null;
  coverImageUrl: string | null;
  priceLevel: PriceLevel;
  hygieneRating: number | null;
  averageRating: number;
  totalReviews: number;
  reviewStatus: ReviewStatus;
  operatingStatus: OperatingStatus;
  accountStatus: AccountStatus;
  isOpenNow: boolean | null;
  socialLinks: SocialLink[];
  openingHours: OpeningHourEntry[];
  externalSource: string | null;
   googleMapUrl?: string | null;
  galleryImages?: string[];
}

export type CreateShopPayload = Omit
  Shop,
  "uuid" | "logoMediaUuid" | "coverMediaUuid" | "averageRating" | "totalReviews" | "isOpenNow"
>;