export type FeedbackCategory = "app" | "food_quality" | "delivery" | "service";
export type FeedbackStatus = "new" | "reviewed" | "resolved";

export interface Feedback {
  id: string;
  customerName: string;
  avatar?: string;
  message: string;
  rating: number; // 1 - 5
  category: FeedbackCategory;
  status: FeedbackStatus;
  createdAt: string; // ISO date string
}

export interface FeedbackCategoryTabConfig {
  key: FeedbackCategory | "all";
  label: string;
}
