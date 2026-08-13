export interface Ingredient {
  id: number | null;
  uuid: string;
  code: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface IngredientPage {
  contents: Ingredient[];
  pageNumber: number;
  pageSize: number;
  numberOfElements: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface IngredientListParams {
  page?: number;
  size?: number;
  sort?: string;
}

export interface CreateIngredientPayload {
  code: string;
  name: string;
  description: string | null;
  isActive: boolean;
}

export interface UpdateIngredientPayload {
  code?: string;
  name?: string;
  description?: string | null;
  isActive?: boolean;
}

export interface IngredientFormValues {
  code: string;
  name: string;
  description: string;
  isActive: boolean;
}

export type IngredientStatusFilter =
  | "ALL"
  | "ACTIVE"
  | "INACTIVE";