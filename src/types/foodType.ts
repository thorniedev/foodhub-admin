export type DietType = "halal" | "vegetarian" | "vegan" | "normal";
export type MealTime = "breakfast" | "lunch" | "evening";
export type FoodCategory =
  | "general"
  | "breakfast"
  | "regional"
  | "seasonal"
  | "age";
export type FoodStatus = "active" | "disabled";

export interface FoodType {
  id: string;
  name: string;
  image: string;
  shopName: string;
  rating: number;
  dietType: DietType;
  mealTime: MealTime;
  distance: string;
  portionSize: string;
  description: string;
  category: FoodCategory;
  status: FoodStatus;
}

export interface FoodTypeTabConfig {
  key: FoodCategory | "all";
  label: string;
}