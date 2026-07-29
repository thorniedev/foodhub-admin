export type DrinkVariant = "hot" | "cold" | "juice" | "other";
export type DrinkCategory = "hot" | "cold" | "juice" | "other";
export type DrinkStatus = "active" | "disabled";

export interface Drink {
  id: string;
  name: string;
  image: string;
  shopName: string;
  rating: number;
  drinkType: DrinkVariant;
  sugarLevel: string;
  distance: string;
  portionSize: string;
  description: string;
  category: DrinkCategory;
  status: DrinkStatus;
}