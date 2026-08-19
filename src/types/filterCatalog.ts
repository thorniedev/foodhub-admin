export type FilterSelectionMode = "SINGLE" | "MULTIPLE";

export type FilterCatalogSource =
  | "LOCAL"
  | "CUISINE_API"
  | "FOOD_CATEGORY_API"
  | "FOOD_SUBCATEGORY_API"
  | "DRINK_SUBCATEGORY_API"
  | "MEAL_TYPE_API"
  | "ALLERGEN_API"
  | "DIETARY_TYPE_API"
  | "MEDICAL_CONDITION_API"
  | "SEASON_API"
  | "EVENT_API"
  | "WEATHER_CONDITION_API";

export interface FilterGroupDefinition {
  slug: string;
  code: string;
  labelKm: string;
  labelEn: string;
  descriptionKm: string;
  selectionMode: FilterSelectionMode;
  source: FilterCatalogSource;
}

export interface FilterCatalogOption {
  uuid: string;
  groupCode: string;
  code: string;
  name: string;
  localName: string;
  description: string | null;
  parentUuid?: string | null;
  numericValue: number | null;
  unit: string | null;
  startTime?: string;
  endTime?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FilterCatalogOptionFormValues {
  localName: string;
  name: string;
  description: string;
  parentUuid?: string | null;
  numericValue: string;
  unit: string;
  startTime?: string;
  endTime?: string;
  active: boolean;
}

export type ClassificationSelections = Record<string, string[]>;
