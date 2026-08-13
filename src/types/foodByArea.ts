export type Area = "phnom_penh" | "siem_reap" | "battambang" | "kampot" | "kratie";

export interface FoodByAreaImage {
  id: string;
  location: string; // The area key
  name: string;
  description: string;
  isdisplay?: boolean;
  image_url: string;
}

export interface AreaTabConfig {
  key: Area | "all";
  label: string;
}
