export interface MealType {
  id?: number;
  uuid: string;
  code: string;
  name: string;
  defaultStartTime?: string;
  default_start_time?: string;
  defaultEndTime?: string;
  default_end_time?: string;
  displayOrder?: number;
  display_order?: number;
  isActive?: boolean;
  active?: boolean;
  is_active?: boolean;
  created_by?: string;
  last_modified_by?: string;
}

export interface MealTypePayload {
  code?: string;
  name?: string;
  defaultStartTime?: string;
  default_start_time?: string;
  defaultEndTime?: string;
  default_end_time?: string;
  displayOrder?: number;
  display_order?: number;
  isActive?: boolean;
  active?: boolean;
  is_active?: boolean;
}
