export type Season = "rainy" | "dry" | "hot" | "festival";
export type SeasonalFoodStatus = "active" | "pending" | "disabled";

export interface SeasonalFoodImage {
  id: string;
  image: string;
  title: string;
  description: string;
  season: Season;
  status: SeasonalFoodStatus;
}

export interface SeasonTabConfig {
  key: Season | "all";
  label: string;
}