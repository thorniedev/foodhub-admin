export interface DietaryType {
  uuid: string;
  code: string;
  name: string;
  category: string;
  description: string | null;
  iconMediaUuid: string | null;
  active: boolean;
  updatedAt: string;
}

export interface DietaryTypePayload {
  code: string;
  name: string;
  category: string;
  description: string | null;
  iconMediaUuid: string | null;
  active: boolean;
}

export interface DietaryTypeFormValues {
  code: string;
  name: string;
  category: string;
  description: string;
  active: boolean;
}

export const DIETARY_TYPE_CATEGORIES = [
  "LIFESTYLE",
  "NUTRITIONAL",
  "MEDICAL",
] as const;
