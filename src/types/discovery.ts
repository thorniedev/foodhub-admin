export interface DiscoveryFilterOptionItem {
  uuid: string;
  code: string;
  name: string;
  localName?: string;
}

export interface DiscoveryFilterOptionsResponse {
  categories: DiscoveryFilterOptionItem[];
  cuisines: DiscoveryFilterOptionItem[];
  mealTypes: DiscoveryFilterOptionItem[];
  dietaryTypes: DiscoveryFilterOptionItem[];
  allergens: DiscoveryFilterOptionItem[];
  availabilityStatuses: string[];
  sortOptions: string[];
  storePriceLevels: number[];
  provinces: string[];
  cities: string[];
  seasons: DiscoveryFilterOptionItem[];
  events: DiscoveryFilterOptionItem[];
  suitableWeather: DiscoveryFilterOptionItem[];
  ageGroups: DiscoveryFilterOptionItem[];
  spiceLevels: { min: number; max: number };
  priceRanges: { currency: string; min: number; max: number };
}

export interface AdvancedMenuItemSearchRequest {
  query?: string;
  categoryUuids?: string[];
  categoryCodes?: string[];
  cuisineUuids?: string[];
  cuisineCodes?: string[];
  mealTypeUuids?: string[];
  mealTypeCodes?: string[];
  seasonUuids?: string[];
  seasonCodes?: string[];
  eventUuids?: string[];
  eventCodes?: string[];
  weatherConditionUuids?: string[];
  weatherConditionCodes?: string[];
  ageGroupUuids?: string[];
  ageGroupCodes?: string[];
  minimumPrice?: number;
  maximumPrice?: number;
  currencyCode?: string;
  minimumSpiceLevel?: number;
  maximumSpiceLevel?: number;
  dietaryTypeUuids?: string[];
  excludeAllergenUuids?: string[];
  includeIngredientUuids?: string[];
  excludeIngredientUuids?: string[];
  storePriceLevels?: number[];
  provinces?: string[];
  cities?: string[];
  openNow?: boolean;
  maxPreparationTimeMinutes?: number;
  minimumStoreRating?: number;
  minimumHygieneRating?: number;
  featuredOnly?: boolean;
  hasImage?: boolean;
  sort?: string;
}

export interface DiscoverySearchResultPage<T> {
  contents: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}
