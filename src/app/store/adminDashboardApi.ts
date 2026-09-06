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

/** A metric with no `previousValue`/`changePercent` history behind it. */
function bareMetric(value: number | null): Record<string, unknown> {
  return { value, previousValue: null, changePercent: null };
}

/**
 * Fills in a `kpis` entry from an equivalent top-level overview field when the
 * backend's `kpis` object omits it — legacy responses report the same figure
 * under a flatter name (`totalActiveStores` instead of `kpis.activeStores`).
 *
 * This intentionally does NOT invent a number for a KPI that has no real
 * equivalent anywhere in the payload (`recommendationSuccessRate` most
 * notably): a previous version of this function filled that gap with
 * `totalRecommendations > 0 ? 100 : null`, which reported a perfect safety
 * score for a session that had simply run at all, regardless of whether
 * anything was actually blocked. An honest "—" beats a fabricated 100%.
 */
function fallbackMetric(raw: unknown, source: number | undefined): unknown {
  if (raw !== undefined) return raw;
  return bareMetric(typeof source === "number" ? source : null);
}

export function normalizeOverview(response: unknown): DashboardOverview {
  const payload = unwrapAdminPayload<Partial<DashboardOverview> | null>(response, null);

  if (!isRecord(payload)) return EMPTY_OVERVIEW;

  const rawKpis = (
    payload.kpis && typeof payload.kpis === "object" ? payload.kpis : {}
  ) as Record<string, unknown>;

  const num = (value: unknown): number | undefined =>
    typeof value === "number" ? value : undefined;

  const totalActiveStores = num(payload.totalActiveStores);
  const totalPendingStores = num(payload.totalPendingStores);
  const totalMenuItems = num(payload.totalMenuItems);
  const totalRecommendations =
    num(payload.totalRecommendationsServed) ??
    num((payload as { recommendationSessions?: number }).recommendationSessions);
  const totalBookmarks =
    num(payload.totalBookmarks) ?? num((payload as { bookmarks?: number }).bookmarks);

  const synthesizedKpis: Record<string, unknown> = {
    // No top-level equivalent exists for these three — an admin count of
    // *all* registered users is not the same fact as "active this period",
    // so unlike the others below this does not fall back to a nearby field.
    activeUsers: fallbackMetric(rawKpis.activeUsers, undefined),
    newUsers: fallbackMetric(rawKpis.newUsers, undefined),
    recommendationSuccessRate: fallbackMetric(rawKpis.recommendationSuccessRate, undefined),

    recommendationSessions: fallbackMetric(rawKpis.recommendationSessions, totalRecommendations),
    activeStores: fallbackMetric(rawKpis.activeStores, totalActiveStores),
    pendingStores: fallbackMetric(rawKpis.pendingStores, totalPendingStores),
    liveMenuItems: fallbackMetric(rawKpis.liveMenuItems, totalMenuItems),
    bookmarks: fallbackMetric(rawKpis.bookmarks, totalBookmarks),

    // `openDataIssues` used to default to `totalPendingStores + totalSafetyBlocks`
    // when absent — safety blocks are the allergen filter doing its job, not a
    // data-quality problem, so that sum overcounted "issues" by orders of
    // magnitude (48,686 safety blocks is a normal filtering volume, not 48,686
    // broken records). There is no correct substitute among the top-level
    // fields, so this stays unknown rather than guessing.
    openDataIssues: fallbackMetric(rawKpis.openDataIssues, undefined),

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
