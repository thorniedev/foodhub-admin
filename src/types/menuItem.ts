export type AvailabilityStatus = "AVAILABLE" | "UNAVAILABLE" | "OUT_OF_STOCK";
export type ItemSource = "MANUAL" | "IMPORTED";
export type VerificationStatus = "VERIFIED" | "UNVERIFIED";
export type DeclarationType = "CONTAINS" | "MAY_CONTAIN";
export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";

export interface CodeName {
  code: string;
  name: string;
}

export interface StoreRef {
  uuid: string;
  name: string;
  localName?: string;
  logoUrl?: string | null;
  coverImageUrl?: string | null;
  addressLine?: string;
  district?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  operatingStatus?: string;
  averageRating?: number;
  totalReviews?: number;
}

export interface FoodRef {
  uuid: string;
  canonicalName: string;
  category: CodeName;
  cuisine: CodeName;
  spiceLevel: number;
  ageGroups: CodeName[];
}

export interface DietaryType extends CodeName {
  verificationStatus: VerificationStatus;
}

export interface AllergenDeclaration extends CodeName {
  declarationType: DeclarationType;
  riskLevel: RiskLevel;
  verificationStatus: VerificationStatus;
}

export interface NutritionInfo {
  calories?: number;
  protein?: number;
  carbohydrate?: number;
  fat?: number;
  fiber?: number;
  sodium?: number;
}

export interface MenuItem {
  uuid: string;
  legacyId?: number;
  name: string;
  localName: string;
  description: string;
  localDescription?: string;
  thumbnail: string | null;
  gallery: string[];
  price: number;
  currencyCode: string;
  preparationTimeMinutes: number;
  availabilityStatus: AvailabilityStatus;
  isFeatured: boolean;
  source: ItemSource;
  store: StoreRef;
  food: FoodRef;
  mealTypes: CodeName[];
  dietaryTypes: DietaryType[];
  allergenDeclarations: AllergenDeclaration[];
  ingredients: string[];
  beveragePairings: string[];
  nutrition: NutritionInfo;
  distanceKm?: number;
  createdAt?: string;
  updatedAt?: string;
  // Not editable in admin — passed through unchanged if present
  recommendation?: unknown;
  origin?: unknown;
  recommendationContext?: unknown;
}

export type CreateMenuItemPayload = Omit<
  MenuItem,
  | "uuid"
  | "legacyId"
  | "createdAt"
  | "updatedAt"
  | "recommendation"
  | "origin"
  | "recommendationContext"
  | "distanceKm"
>;