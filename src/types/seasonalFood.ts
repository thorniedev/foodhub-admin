export type Season = "rainy" | "dry" | "hot" | "festival";

export interface SeasonalFoodImage {
  id: string;
  name: string;
  image_url: string;
  season: Season;
  order: number;
  isdisplay?: boolean;
}

export interface SeasonTabConfig {
  key: Season | "all";
  label: string;
}