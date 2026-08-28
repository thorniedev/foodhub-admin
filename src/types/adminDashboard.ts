/**
 * Types for the admin analytics dashboard.
 *
 * These mirror the Spring Boot DTOs in
 * `feature/admin/dto/DashboardOverviewResponse.java` and the shared
 * `common/dto/PageResponse.java`. The backend wraps every JSON body in
 * `ApiResponse<T>` under a `payload` key.
 */

export interface AdminApiResponse<T> {
  status: number;
  message: string;
  payload: T;
  timestamp?: string;
}

/** Matches the backend `PageResponse` record exactly (`contents`, not `items`). */
export interface AdminPageResponse<T> {
  contents: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface DashboardPeriod {
  from: string;
  to: string;
  previousFrom: string;
  previousTo: string;
}

export interface DashboardMetric {
  value: number;
  previousValue: number | null;
  /** Null when the previous period was zero — growth is undefined, not 0%. */
  changePercent: number | null;
}

export interface DashboardTrendPoint {
  date: string;
  newUsers: number;
  activeUsers: number;
  recommendationSessions: number;
  itemViews: number;
}

export interface StorePerformance {
  storeUuid: string;
  storeName: string;
  city: string | null;
  address: string | null;
  rating: number;
  totalMenuItems: number;
  storeViews: number;
  uniqueViewers: number;
  clicks: number;
  likes: number;
  bookmarks: number;
  clickThroughRate: number;
  incompleteMenuItems: number;
  performanceScore: number;
  operatingStatus: string | null;
  reviewStatus: string | null;
}

export interface ItemPerformance {
  menuItemUuid: string;
  itemName: string;
  foodName: string | null;
  categoryName: string | null;
  storeUuid: string;
  storeName: string | null;
  views: number;
  uniqueViewers: number;
  clicks: number;
  likes: number;
  skips: number;
  bookmarks: number;
  recommendationAppearances: number;
  clickThroughRate: number;
  missingContentCount: number;
  popularityScore: number;
  availabilityStatus: string | null;
}

export interface LocationSummary {
  location: string;
  city: string | null;
  province: string | null;
  activeStores: number;
  menuItems: number;
  views: number;
  uniqueViewers: number;
  clicks: number;
  clickThroughRate: number;
  topItemName: string | null;
  topStoreName: string | null;
}

export interface CategorySummary {
  categoryCode: string;
  categoryName: string;
  activeStores: number;
  menuItems: number;
  views: number;
  uniqueViewers: number;
  clicks: number;
  bookmarks: number;
  clickThroughRate: number;
}

export type ActionItemSeverity = "HIGH" | "MEDIUM" | "LOW" | string;

export type ActionItemIssueType =
  | "INCOMPLETE_MENU_ITEM"
  | "STALE_MENU_ITEM"
  | "PENDING_STORE"
  | string;

export interface DashboardActionItem {
  issueType: ActionItemIssueType;
  severity: ActionItemSeverity;
  entityUuid: string;
  entityName: string;
  relatedName: string | null;
  recommendation: string;
}

/** Keys the backend puts in `kpis`. Unknown keys stay readable via the index signature. */
export type DashboardKpiKey =
  | "totalUsers"
  | "activeUsers"
  | "newUsers"
  | "totalProfiles"
  | "activeStores"
  | "pendingStores"
  | "totalMenuItems"
  | "liveMenuItems"
  | "recommendationSessions"
  | "recommendationSuccessRate"
  | "averageRecommendationLatencyMs"
  | "likes"
  | "skips"
  | "bookmarks"
  | "safetyBlocks"
  | "openDataIssues";

export type DashboardKpis = Partial<Record<DashboardKpiKey, DashboardMetric>> &
  Record<string, DashboardMetric | undefined>;

export interface DashboardOverview {
  totalUsers: number;
  totalProfiles: number;
  totalActiveStores: number;
  totalPendingStores: number;
  totalMenuItems: number;
  totalRecommendationsServed: number;
  totalLikes: number;
  totalSkips: number;
  totalBookmarks: number;
  totalSafetyBlocks: number;
  period: DashboardPeriod;
  kpis: DashboardKpis;
  activityTrend: DashboardTrendPoint[];
  topStores: StorePerformance[];
  popularItems: ItemPerformance[];
  locationSummary: LocationSummary[];
  categorySummary: CategorySummary[];
  actionItems: DashboardActionItem[];
}

/* =========================================================
   FILTERS
========================================================= */

export type DashboardDatePreset = "7d" | "30d" | "90d" | "custom";

/**
 * The full dashboard filter state. Every field is optional so it can be
 * serialised into the URL without carrying empty values.
 */
export interface DashboardFilters {
  preset: DashboardDatePreset;
  from?: string;
  to?: string;
  city?: string;
  province?: string;
  categoryCode?: string;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
}

/** Filters plus server-side pagination, as sent to /dashboard/stores and /dashboard/items. */
export interface DashboardPagedQuery extends DashboardFilters {
  page: number;
  size: number;
}

export type DashboardExportReport =
  | "overview"
  | "stores"
  | "items"
  | "locations"
  | "categories";

export type DashboardExportFormat = "CSV" | "PDF";
