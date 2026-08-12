export interface Cuisine {
  id?: number;
  uuid: string;
  code: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CuisinePayload {
  code?: string;
  name?: string;
  description?: string | null;
  isActive?: boolean;
}
