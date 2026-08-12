export interface MealType {
  id?: number;
  uuid: string;
  code: string;
  name: string;
  defaultStartTime: string;
  defaultEndTime: string;
  displayOrder: number;
  isActive: boolean;
}

export interface MealTypePayload {
  code?: string;
  name?: string;
  defaultStartTime?: string;
  defaultEndTime?: string;
  displayOrder?: number;
  isActive?: boolean;
}
