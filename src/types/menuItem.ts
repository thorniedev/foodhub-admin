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





export type MenuItemsPageTab = "CATALOG" | "PUBLISHED";

export interface ApiEnvelope<T> {
  status?: number;
  message?: string;
  payload?: T;
  data?: T;
  timestamp?: string;
}

export interface PageLike<T> {
  content?: T[];
  contents?: T[];
  number?: number;
  pageNumber?: number;
  size?: number;
  pageSize?: number;
  numberOfElements?: number;
  totalElements?: number;
  totalPages?: number;
  first?: boolean;
  last?: boolean;
  empty?: boolean;
}

export interface NormalizedPage<T> {
  contents: T[];
  pageNumber: number;
  pageSize: number;
  numberOfElements: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface FoodCategoryOption {
  uuid: string;
  code: string;
  name: string;
  localName?: string | null;
  description?: string | null;
  parentCategoryUuid?: string | null;
  isActive?: boolean;
  active?: boolean;
}

export interface CuisineOption {
  uuid: string;
  code: string;
  name: string;
  localName?: string | null;
  description?: string | null;
  isActive?: boolean;
  active?: boolean;
}

export interface NutritionData {
  calories?: number | null;
  proteinGrams?: number | null;
  carbsGrams?: number | null;
  fatGrams?: number | null;
}

export interface FoodReferenceValue {
  code: string;
  name: string;
  localName?: string | null;
}

export interface CatalogFood {
  uuid: string;
  canonicalName: string;
  localName?: string | null;
  description?: string | null;
  localDescription?: string | null;
  categoryUuid?: string | null;
  cuisineUuid?: string | null;
  category?: FoodReferenceValue | null;
  cuisine?: FoodReferenceValue | null;
  primaryMediaUuids?: string[];
  thumbnail?: string | null;
  gallery?: string[];
  defaultSpiceLevel?: number | null;
  spiceLevel?: number | null;
  nutritionData?: NutritionData | null;
  nutrition?: NutritionData | null;
  dietaryTypes?: Array<Record<string, unknown>>;
  seasons?: Array<Record<string, unknown>>;
  events?: Array<Record<string, unknown>>;
  suitableWeather?: Array<Record<string, unknown>>;
  mealTypes?: Array<Record<string, unknown>>;
  ageRules?: Array<Record<string, unknown>>;
  ageGroups?: Array<Record<string, unknown>>;
  isActive?: boolean;
  active?: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface CreateCatalogFoodPayload {
  canonicalName: string;
  localName?: string | null;
  description?: string | null;
  categoryUuid: string;
  cuisineUuid: string;
  primaryMediaUuids: string[];
  defaultSpiceLevel: number;
  nutritionData: {
    calories?: number;
    proteinGrams?: number;
    carbohydrateGrams?: number;
    carbsGrams?: number;
    fatGrams?: number;
    fiberGrams?: number;
  };
  dietaryTypes: Array<Record<string, unknown>>;
  seasons: Array<Record<string, unknown>>;
  events: Array<Record<string, unknown>>;
  suitableWeather: Array<Record<string, unknown>>;
  mealTypes: Array<Record<string, unknown>>;
  ageRules: Array<Record<string, unknown>>;
  isActive: boolean;
}

export interface MenuItemStoreSummary {
  uuid: string;
  name?: string | null;
  storeName?: string | null;
  localName?: string | null;
  logoUrl?: string | null;
  coverImageUrl?: string | null;
  addressLine?: string | null;
  district?: string | null;
  city?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  operatingStatus?: string | null;
  averageRating?: number | null;
  totalReviews?: number | null;
}

export interface MenuItemFoodSummary {
  uuid: string;
  canonicalName?: string | null;
  localName?: string | null;
  category?: FoodReferenceValue | null;
  cuisine?: FoodReferenceValue | null;
  spiceLevel?: number | null;
  ageGroups?: Array<Record<string, unknown>>;
  seasons?: Array<Record<string, unknown>>;
  mealTypes?: Array<Record<string, unknown>>;
  dietaryTypes?: Array<Record<string, unknown>>;
  events?: Array<Record<string, unknown>>;
  suitableWeather?: Array<Record<string, unknown>>;
}

export interface CatalogMenuItem {
  uuid: string;
  legacyId?: number | null;
  name: string;
  localName?: string | null;
  description?: string | null;
  localDescription?: string | null;
  thumbnail?: string | null;
  gallery?: string[];
  price?: number | null;
  currencyCode?: string | null;
  preparationTimeMinutes?: number | null;
  availabilityStatus?: string | null;
  ingredientDataStatus?: string | null;
  isFeatured?: boolean;
  source?: string | null;
  store?: MenuItemStoreSummary | null;
  food?: MenuItemFoodSummary | null;
  ingredients?: Array<string | Record<string, unknown>>;
  allergenDeclarations?: Array<Record<string, unknown>>;
  dietaryTypes?: Array<Record<string, unknown>>;
  beveragePairings?: Array<Record<string, unknown>>;
  nutrition?: NutritionData | null;
  recommendation?: unknown;
  createdAt?: string | null;
  updatedAt?: string | null;
  origin?: Record<string, unknown> | null;
  filterOption?: Record<string, unknown> | null;
}

export interface CreateStoreMenuItemIngredient {
  ingredientUuid: string;
  quantity: number;
  unit: string;
  isOptional: boolean;
  notes?: string | null;
}

export interface CreateStoreMenuItemPayload {
  foodUuid: string;
  menuItem: {
    name: string;
    description?: string | null;
    price: number;
    currencyCode: string;
    preparationTimeMinutes: number;
    availabilityStatus: string;
    ingredientDataStatus: string;
    isFeatured: boolean;
    source: string;
  };
  primaryMediaUuids: string[];
  ingredients: CreateStoreMenuItemIngredient[];
  dietaryTypes: Array<Record<string, unknown>>;
  allergenDeclarations: Array<Record<string, unknown>>;
}

export interface CatalogListParams {
  page?: number;
  size?: number;
  sort?: string;
}

export interface MenuItemListParams extends CatalogListParams {
  foodUuid?: string;
  rootCategoryCode?: string;
}

export interface FoodListParams extends CatalogListParams {
  query?: string;
}


