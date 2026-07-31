export type AgeGroupKey =
  | "infant0to6m"
  | "infant6to12m"
  | "toddler1to3y"
  | "child4to12y"
  | "teen13to17y"
  | "adult18to59y"
  | "elderly60plus";

export interface CreateDrinkPayload {
  images: string[];
  category: string;
  ageGroups: AgeGroupKey[];
  sugarLevel: string;
  customTags: string[];
  drinkName: string;
  description: string;
  shopId: string;
  shopName: string;
  address: string;
  status: "draft" | "published";
}