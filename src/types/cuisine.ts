export interface Cuisine {
  id?: number;
  uuid: string;
  code: string;
  name: string;
  description: string | null;
  isActive?: boolean;
  active?: boolean;
  is_active?: boolean;
  createdAt?: string;
  updatedAt?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CuisinePayload {
  code?: string;
  name?: string;
  description?: string | null;
  isActive?: boolean;
  active?: boolean;
  is_active?: boolean;
}
