export type Area = "phnom_penh" | "siem_reap" | "battambang" | "kampot" | "kratie";
export type FoodByAreaStatus = "active" | "pending" | "disabled";

export interface FoodByAreaImage {
  id: string;
  image: string;
  title: string;
  description: string;
  area: Area;
  status: FoodByAreaStatus;
}

export interface AreaTabConfig {
  key: Area | "all";
  label: string;
}
