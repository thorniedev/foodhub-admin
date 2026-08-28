export interface FoodCategory {
  id?: number;
  uuid: string;
  parentCategoryUuid: string | null;
  parentCategoryName: string | null;
  code: string;
  name: string;
  description: string | null;
  isActive?: boolean;
  active?: boolean;
  is_active?: boolean;
  createdAt: string;
  subCategories?: FoodCategory[];
}

export interface FoodCategoryPayload {
  code?: string;
  name?: string;
  description?: string | null;
  parentCategoryUuid?: string | null;
  isActive?: boolean;
  active?: boolean;
  is_active?: boolean;
}
