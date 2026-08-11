// export type FoodCategoryKey =
//   | "khmerFood"
//   | "fastFood"
//   | "chineseFood"
//   | "other";

// export type AgeGroupKey =
//   | "infant0to6m"
//   | "infant6to12m"
//   | "toddler1to3y"
//   | "child4to12y"
//   | "teen13to17y"
//   | "adult18to59y"
//   | "elderly60plus";

// export type DietSuitabilityKey =
//   | "halal"
//   | "glutenFree"
//   | "vegetarian"
//   | "dairyFree"
//   | "nutFree"
//   | "lowCarb";

// export interface Restaurant {
//   id: string;
//   name: string;
//   address: string;
// }

// export interface CreateFoodPayload {
//   images: string[];
//   category: string;
//   ageGroups: AgeGroupKey[];
//   dietSuitability: DietSuitabilityKey[];
//   customTags: string[];
//   foodName: string;
//   description: string;
//   restaurantId: string;
//   restaurantName: string;
//   address: string;
//   status: "draft" | "published";
// }




export type FoodCategoryKey =
  | "khmerFood"
  | "fastFood"
  | "chineseFood"
  | "other";

export type AgeGroupKey =
  | "infant0to6m"
  | "infant6to12m"
  | "toddler1to3y"
  | "child4to12y"
  | "teen13to17y"
  | "adult18to59y"
  | "elderly60plus";

export type DietSuitabilityKey =
  | "halal"
  | "glutenFree"
  | "vegetarian"
  | "dairyFree"
  | "nutFree"
  | "lowCarb";

export type FoodClassificationSelections =
  Record<string, string[]>;
