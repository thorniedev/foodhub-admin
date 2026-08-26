export type AdminEntityType = "STORE" | "FOOD" | "USER" | "MENU_ITEM";

export interface AdminSearchQuery {
  query: string;
  types?: AdminEntityType[];
  page?: number;
  size?: number;
}

export interface AdminSearchResultItem {
  uuid: string;
  type: AdminEntityType;
  title: string;
  subtitle?: string;
  imageUrl?: string | null;
  status?: string;
  targetUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface AdminSearchResponse {
  results: AdminSearchResultItem[];
  totalElements: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface ReindexSearchResponse {
  message: string;
  status: string;
  timestamp?: string;
}
