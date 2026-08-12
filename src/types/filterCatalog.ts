// export type FilterSelectionMode = "SINGLE" | "MULTIPLE";

// export type FilterCatalogSource =
//   | "LOCAL"
//   | "ALLERGEN_API"
//   | "DIETARY_TYPE_API"
//   | "MEDICAL_CONDITION_API";

// export interface FilterGroupDefinition {
//   slug: string;
//   code: string;
//   labelKm: string;
//   labelEn: string;
//   descriptionKm: string;
//   selectionMode: FilterSelectionMode;
//   source: FilterCatalogSource;
// }

// export interface FilterCatalogOption {
//   uuid: string;
//   groupCode: string;
//   code: string;
//   name: string;
//   localName: string;
//   description: string | null;
//   numericValue: number | null;
//   unit: string | null;
//   active: boolean;
//   createdAt: string;
//   updatedAt: string;
// }

// export interface FilterCatalogOptionFormValues {
//   localName: string;
//   name: string;
//   description: string;
//   numericValue: string;
//   unit: string;
//   active: boolean;
// }

// export type ClassificationSelections = Record<string, string[]>;
export type FilterSelectionMode = "SINGLE" | "MULTIPLE";

export type FilterCatalogSource =
  | "LOCAL"
  | "ALLERGEN_API"
  | "DIETARY_TYPE_API"
  | "MEDICAL_CONDITION_API"
  | "AGE_GROUP_API";

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
  numericValue: number | null;
  unit: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FilterCatalogOptionFormValues {
  localName: string;
  name: string;
  description: string;
  numericValue: string;
  unit: string;
  active: boolean;
}

export type ClassificationSelections = Record<string, string[]>;
