import { adminBaseApi } from "./adminBaseApi";

import { buildDashboardQueryParams } from "@/src/lib/dashboardFilters";
import type {
  AdminPageResponse,
  CategorySummary,
  DashboardFilters,
  DashboardOverview,
  DashboardPagedQuery,
  ItemPerformance,
  LocationSummary,
  StorePerformance,
} from "@/src/types/adminDashboard";

/** Overview refresh cadence, in milliseconds. */
export const DASHBOARD_OVERVIEW_POLLING_INTERVAL_MS = 60_000;

const EMPTY_PAGE_RESPONSE = {
  contents: [],
  pageNumber: 0,
  pageSize: 0,
  totalElements: 0,
  totalPages: 0,
  first: true,
  last: true,
} as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/**
 * The backend wraps every body in `ApiResponse` under `payload`. Some older
 * routes still answer with `data`, and a proxy error can answer with the bare
 * object, so all three shapes are unwrapped rather than assumed.
 */
export function unwrapAdminPayload<T>(response: unknown, fallback: T): T {
  if (!isRecord(response)) {
    return response === undefined || response === null ? fallback : (response as T);
  }

  if ("payload" in response && response.payload !== undefined && response.payload !== null) {
    return response.payload as T;
  }

  if ("data" in response && response.data !== undefined && response.data !== null) {
    return response.data as T;
  }

  // A bare payload (no envelope) still needs to reach the UI.
  if ("status" in response && "message" in response) {
    return fallback;
  }

  return response as T;
}

export function unwrapAdminList<T>(response: unknown): T[] {
  const payload = unwrapAdminPayload<unknown>(response, []);
  if (Array.isArray(payload)) return payload as T[];
  if (isRecord(payload) && Array.isArray(payload.contents)) {
    return payload.contents as T[];
  }
  return [];
}

export function unwrapAdminPage<T>(response: unknown): AdminPageResponse<T> {
  const payload = unwrapAdminPayload<unknown>(response, null);

  if (Array.isArray(payload)) {
    return {
      ...EMPTY_PAGE_RESPONSE,
      contents: payload as T[],
      pageSize: payload.length,
      totalElements: payload.length,
      totalPages: payload.length > 0 ? 1 : 0,
    };
  }

  if (!isRecord(payload) || !Array.isArray(payload.contents)) {
    return { ...EMPTY_PAGE_RESPONSE, contents: [] };
  }

  const contents = payload.contents as T[];
  const pageSize = Number(payload.pageSize ?? contents.length) || contents.length;
  const totalElements = Number(payload.totalElements ?? contents.length) || 0;
  const totalPages =
    Number(payload.totalPages ?? (pageSize > 0 ? Math.ceil(totalElements / pageSize) : 0)) || 0;
  const pageNumber = Number(payload.pageNumber ?? 0) || 0;

  return {
    contents,
    pageNumber,
    pageSize,
    totalElements,
    totalPages,
    first: payload.first === undefined ? pageNumber === 0 : Boolean(payload.first),
    last:
      payload.last === undefined
        ? pageNumber >= Math.max(totalPages - 1, 0)
        : Boolean(payload.last),
  };
}

const EMPTY_OVERVIEW: DashboardOverview = {
  totalUsers: 0,
  totalProfiles: 0,
  totalActiveStores: 0,
  totalPendingStores: 0,
  totalMenuItems: 0,
  totalRecommendationsServed: 0,
  totalLikes: 0,
  totalSkips: 0,
  totalBookmarks: 0,
  totalSafetyBlocks: 0,
  period: { from: "", to: "", previousFrom: "", previousTo: "" },
  kpis: {},
  activityTrend: [],
  topStores: [],
  popularItems: [],
  locationSummary: [],
  categorySummary: [],
  actionItems: [],
};

export function normalizeOverview(response: unknown): DashboardOverview {
  const payload = unwrapAdminPayload<Partial<DashboardOverview> | null>(response, null);

  if (!isRecord(payload)) return EMPTY_OVERVIEW;

  const rawKpis = (
    payload.kpis && typeof payload.kpis === "object" ? payload.kpis : {}
  ) as Record<string, unknown>;

  const totalUsers = typeof payload.totalUsers === "number" ? payload.totalUsers : 0;
  const activeUsers =
    typeof (payload as { activeUsers?: number }).activeUsers === "number"
      ? (payload as { activeUsers?: number }).activeUsers!
      : totalUsers;
  const newUsers =
    typeof (payload as { newUsers?: number }).newUsers === "number"
      ? (payload as { newUsers?: number }).newUsers!
      : 0;
  const totalActiveStores =
    typeof payload.totalActiveStores === "number" ? payload.totalActiveStores : 0;
  const totalPendingStores =
    typeof payload.totalPendingStores === "number" ? payload.totalPendingStores : 0;
  const totalMenuItems =
    typeof payload.totalMenuItems === "number" ? payload.totalMenuItems : 0;
  const totalRecommendations =
    typeof payload.totalRecommendationsServed === "number"
      ? payload.totalRecommendationsServed
      : typeof (payload as { recommendationSessions?: number }).recommendationSessions === "number"
        ? (payload as { recommendationSessions?: number }).recommendationSessions!
        : 0;
  const totalBookmarks =
    typeof payload.totalBookmarks === "number"
      ? payload.totalBookmarks
      : typeof (payload as { bookmarks?: number }).bookmarks === "number"
        ? (payload as { bookmarks?: number }).bookmarks!
        : 0;
  const totalSafetyBlocks =
    typeof payload.totalSafetyBlocks === "number"
      ? payload.totalSafetyBlocks
      : typeof (payload as { safetyBlocks?: number }).safetyBlocks === "number"
        ? (payload as { safetyBlocks?: number }).safetyBlocks!
        : 0;

  const synthesizedKpis: Record<string, unknown> = {
    activeUsers: rawKpis.activeUsers ?? {
      value: activeUsers,
      previousValue: null,
      changePercent: null,
    },
    newUsers: rawKpis.newUsers ?? {
      value: newUsers,
      previousValue: null,
      changePercent: null,
    },
    recommendationSessions: rawKpis.recommendationSessions ?? {
      value: totalRecommendations,
      previousValue: null,
      changePercent: null,
    },
    recommendationSuccessRate: rawKpis.recommendationSuccessRate ?? {
      value: totalRecommendations > 0 ? 100 : null,
      previousValue: null,
      changePercent: null,
    },
    activeStores: rawKpis.activeStores ?? {
      value: totalActiveStores,
      previousValue: null,
      changePercent: null,
    },
    liveMenuItems: rawKpis.liveMenuItems ?? {
      value: totalMenuItems,
      previousValue: null,
      changePercent: null,
    },
    bookmarks: rawKpis.bookmarks ?? {
      value: totalBookmarks,
      previousValue: null,
      changePercent: null,
    },
    openDataIssues: rawKpis.openDataIssues ?? {
      value: totalPendingStores + totalSafetyBlocks,
      previousValue: null,
      changePercent: null,
    },
    ...rawKpis,
  };

  return {
    ...EMPTY_OVERVIEW,
    ...payload,
    period: { ...EMPTY_OVERVIEW.period, ...(payload.period ?? {}) },
    kpis: synthesizedKpis as DashboardOverview["kpis"],
    activityTrend: Array.isArray(payload.activityTrend) ? payload.activityTrend : [],
    topStores: Array.isArray(payload.topStores) ? payload.topStores : [],
    popularItems: Array.isArray(payload.popularItems) ? payload.popularItems : [],
    locationSummary: Array.isArray(payload.locationSummary) ? payload.locationSummary : [],
    categorySummary: Array.isArray(payload.categorySummary) ? payload.categorySummary : [],
    actionItems: Array.isArray(payload.actionItems) ? payload.actionItems : [],
  };
}

export const adminDashboardApi = adminBaseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardOverview: builder.query<DashboardOverview, DashboardFilters>({
      query: (filters) => ({
        url: "/dashboard/overview",
        method: "GET",
        params: buildDashboardQueryParams(filters),
      }),
      transformResponse: normalizeOverview,
      providesTags: ["Dashboard"],
    }),

    getDashboardStores: builder.query<
      AdminPageResponse<StorePerformance>,
      DashboardPagedQuery
    >({
      query: ({ page, size, ...filters }) => ({
        url: "/dashboard/stores",
        method: "GET",
        params: buildDashboardQueryParams(filters, { page, size }),
      }),
      transformResponse: (response: unknown) =>
        unwrapAdminPage<StorePerformance>(response),
      providesTags: ["Dashboard"],
    }),

    getDashboardItems: builder.query<
      AdminPageResponse<ItemPerformance>,
      DashboardPagedQuery
    >({
      query: ({ page, size, ...filters }) => ({
        url: "/dashboard/items",
        method: "GET",
        params: buildDashboardQueryParams(filters, { page, size }),
      }),
      transformResponse: (response: unknown) =>
        unwrapAdminPage<ItemPerformance>(response),
      providesTags: ["Dashboard"],
    }),

    getDashboardLocations: builder.query<LocationSummary[], DashboardFilters>({
      query: (filters) => ({
        url: "/dashboard/locations",
        method: "GET",
        params: buildDashboardQueryParams(filters),
      }),
      transformResponse: (response: unknown) =>
        unwrapAdminList<LocationSummary>(response),
      providesTags: ["Dashboard"],
    }),

    getDashboardCategories: builder.query<CategorySummary[], DashboardFilters>({
      query: (filters) => ({
        url: "/dashboard/categories",
        method: "GET",
        params: buildDashboardQueryParams(filters),
      }),
      transformResponse: (response: unknown) =>
        unwrapAdminList<CategorySummary>(response),
      providesTags: ["Dashboard"],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetDashboardOverviewQuery,
  useGetDashboardStoresQuery,
  useGetDashboardItemsQuery,
  useGetDashboardLocationsQuery,
  useGetDashboardCategoriesQuery,
} = adminDashboardApi;
