import { adminBaseApi } from "./adminBaseApi";
import type {
  AdminEntityType,
  AdminSearchQuery,
  AdminSearchResultItem,
  AdminSearchResponse,
  ReindexSearchResponse,
} from "@/src/types/adminSearch";

type UnknownRecord = Record<string, unknown>;
const isObject = (v: unknown): v is UnknownRecord =>
  typeof v === "object" && v !== null;
const unwrapData = (v: unknown): unknown =>
  isObject(v) && "data" in v && v.data !== undefined && v.data !== null
    ? v.data
    : v;

function normalizeSearchItem(item: unknown): AdminSearchResultItem | null {
  if (!isObject(item)) return null;

  const uuid = String(
    item.uuid || item.id || item.storeUuid || item.foodUuid || item.userUuid || "",
  );
  const rawType = String(
    item.type || item.entityType || item.targetType || "",
  ).toUpperCase();

  let type: AdminEntityType = "FOOD";
  if (rawType.includes("STORE") || rawType.includes("SHOP")) type = "STORE";
  else if (rawType.includes("USER") || rawType.includes("PROFILE")) type = "USER";
  else if (rawType.includes("MENU") || rawType.includes("ITEM")) type = "MENU_ITEM";
  else if (rawType.includes("FOOD")) type = "FOOD";

  const title = String(
    item.title ||
      item.name ||
      item.storeName ||
      item.canonicalName ||
      item.username ||
      item.fullName ||
      item.email ||
      "Untitled",
  );

  const subtitle = String(
    item.subtitle ||
      item.description ||
      item.localName ||
      item.email ||
      item.addressLine ||
      "",
  );

  const imageUrl =
    typeof item.imageUrl === "string"
      ? item.imageUrl
      : typeof item.logoUrl === "string"
        ? item.logoUrl
        : null;

  const status =
    typeof item.status === "string"
      ? item.status
      : typeof item.reviewStatus === "string"
        ? item.reviewStatus
        : typeof item.accountStatus === "string"
          ? item.accountStatus
          : undefined;

  return {
    uuid,
    type,
    title,
    subtitle,
    imageUrl,
    status,
    targetUrl: typeof item.targetUrl === "string" ? item.targetUrl : undefined,
  };
}

function normalizeSearchResponse(response: unknown): AdminSearchResponse {
  const raw = unwrapData(response);

  if (Array.isArray(raw)) {
    const results = raw.map(normalizeSearchItem).filter(Boolean) as AdminSearchResultItem[];
    return {
      results,
      pageNumber: 0,
      pageSize: results.length,
      totalElements: results.length,
      totalPages: results.length ? 1 : 0,
    };
  }

  if (!isObject(raw)) {
    return {
      results: [],
      pageNumber: 0,
      pageSize: 10,
      totalElements: 0,
      totalPages: 0,
    };
  }

  let rawList: unknown[] = [];

  if (Array.isArray(raw.results)) {
    rawList = raw.results;
  } else if (Array.isArray(raw.contents)) {
    rawList = raw.contents;
  } else if (Array.isArray(raw.content)) {
    rawList = raw.content;
  } else if (Array.isArray(raw.items)) {
    rawList = raw.items;
  } else {
    for (const key of ["stores", "shops", "foods", "users", "menuItems", "items", "data"]) {
      if (Array.isArray(raw[key])) {
        rawList.push(...(raw[key] as unknown[]));
      }
    }
  }

  const results = rawList.map(normalizeSearchItem).filter(Boolean) as AdminSearchResultItem[];

  return {
    results,
    pageNumber:
      typeof raw.pageNumber === "number"
        ? raw.pageNumber
        : typeof raw.number === "number"
          ? raw.number
          : 0,
    pageSize:
      typeof raw.pageSize === "number"
        ? raw.pageSize
        : typeof raw.size === "number"
          ? raw.size
          : results.length,
    totalElements:
      typeof raw.totalElements === "number"
        ? raw.totalElements
        : results.length,
    totalPages:
      typeof raw.totalPages === "number"
        ? raw.totalPages
        : results.length
          ? 1
          : 0,
  };
}

export const adminSearchApi = adminBaseApi.injectEndpoints({
  endpoints: (builder) => ({
    adminGlobalSearch: builder.query<AdminSearchResponse, AdminSearchQuery>({
      query: ({ query, types, page, size }) => ({
        url: "/search",
        method: "GET",
        params: {
          query: query.trim(),
          q: query.trim(),
          types: types && types.length > 0 ? types.join(",") : undefined,
          type: types && types.length > 0 ? types[0] : undefined,
          page: page ?? 0,
          size: size ?? 10,
        },
      }),
      transformResponse: normalizeSearchResponse,
      providesTags: ["AdminProfile"],
    }),
    reindexSearch: builder.mutation<ReindexSearchResponse, void>({
      query: () => ({
        url: "/search/reindex",
        method: "POST",
      }),
    }),
  }),
  overrideExisting: true,
});

export const {
  useAdminGlobalSearchQuery,
  useLazyAdminGlobalSearchQuery,
  useReindexSearchMutation,
} = adminSearchApi;
