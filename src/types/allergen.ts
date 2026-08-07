export interface Allergen {
  uuid: string;
  code: string;
  name: string;
  description: string | null;
  iconMediaUuid: string | null;
  active: boolean;
  updatedAt: string;
}

export interface AllergenListParams {
  page?: number;
  size?: number;
}

export interface AllergenListResult {
  items: Allergen[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface CreateAllergenRequest {
  code: string;
  name: string;
  description: string | null;
  iconMediaUuid: string | null;
  active: boolean;
}

export interface UpdateAllergenRequest {
  code: string;
  name: string;
  description: string | null;
  iconMediaUuid: string | null;
  active: boolean;
}

export interface AllergenFormValues {
  code: string;
  name: string;
  description: string;
  active: boolean;
}

export type AllergenStatusFilter = "ALL" | "ACTIVE" | "INACTIVE";
