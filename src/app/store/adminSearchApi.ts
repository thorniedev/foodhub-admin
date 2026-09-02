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
    : isObject(v) && "payload" in v && v.payload !== undefined && v.payload !== null
      ? v.payload
      : v;

function normalizeSearchItem(item: unknown): AdminSearchResultItem | null {
  if (!isObject(item)) return null;

  const uuid = String(
    item.uuid ||
      item.id ||
      item.storeUuid ||
      item.menuItemUuid ||
      item.foodUuid ||
      item.userUuid ||
      "",
  );
  const rawType = String(
    item.type || item.entityType || item.targetType || "",
  ).toUpperCase();

  let type: AdminEntityType = "FOOD";
  if (rawType.includes("STORE") || rawType.includes("SHOP") || item.storeUuid) type = "STORE";
  else if (rawType.includes("USER") || rawType.includes("PROFILE") || item.userUuid) type = "USER";
  else if (rawType.includes("MENU") || rawType.includes("ITEM") || item.menuItemUuid) type = "MENU_ITEM";
  else if (rawType.includes("FOOD") || item.foodUuid) type = "FOOD";

  const title = String(
    item.title ||
      item.name ||
      item.storeName ||
      item.canonicalName ||
      item.localName ||
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
      [item.city, item.province].filter(Boolean).join(", ") ||
      "",
  );

  const imageUrl =
    typeof item.imageUrl === "string"
      ? item.imageUrl
      : typeof item.logoUrl === "string"
        ? item.logoUrl
        : typeof item.primaryMediaUrl === "string"
          ? item.primaryMediaUrl
          : null;

  const status =
    typeof item.status === "string"
      ? item.status
      : typeof item.reviewStatus === "string"
        ? item.reviewStatus
        : typeof item.accountStatus === "string"
          ? item.accountStatus
          : undefined;

  let targetUrl: string | undefined =
    typeof item.targetUrl === "string" ? item.targetUrl : undefined;
  if (!targetUrl && uuid) {
    switch (type) {
      case "STORE":
        targetUrl = `/shops/${uuid}`;
        break;
      case "FOOD":
        targetUrl = `/food-catalog/foods`;
        break;
      case "USER":
        targetUrl = `/users/${uuid}`;
        break;
      case "MENU_ITEM":
        targetUrl = `/menu-items/${uuid}`;
        break;
    }
  }

  return {
    uuid,
    type,
    title,
    subtitle: subtitle || undefined,
    imageUrl,
    status,
    targetUrl,
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

  // 1. Direct result arrays
  if (Array.isArray(raw.results)) {
    rawList = raw.results;
  } else if (Array.isArray(raw.contents)) {
    rawList = raw.contents;
  } else if (Array.isArray(raw.content)) {
    rawList = raw.content;
  } else if (Array.isArray(raw.items)) {
    rawList = raw.items;
  }

  // 2. GlobalSearchResponse nested groups: stores, foods, menuItems, users
  if (isObject(raw.stores)) {
    const storeItems = Array.isArray(raw.stores)
      ? raw.stores
      : Array.isArray((raw.stores as any).items)
        ? (raw.stores as any).items
        : [];
    storeItems.forEach((s: any) => rawList.push({ ...s, type: "STORE" }));
  }
  if (isObject(raw.foods)) {
    const foodItems = Array.isArray(raw.foods)
      ? raw.foods
      : Array.isArray((raw.foods as any).items)
        ? (raw.foods as any).items
        : [];
    foodItems.forEach((f: any) => rawList.push({ ...f, type: "FOOD" }));
  }
  if (isObject(raw.menuItems)) {
    const menuItemList = Array.isArray(raw.menuItems)
      ? raw.menuItems
      : Array.isArray((raw.menuItems as any).items)
        ? (raw.menuItems as any).items
        : [];
    menuItemList.forEach((m: any) => rawList.push({ ...m, type: "MENU_ITEM" }));
  }
  if (isObject(raw.users)) {
    const userItems = Array.isArray(raw.users)
      ? raw.users
      : Array.isArray((raw.users as any).items)
        ? (raw.users as any).items
        : [];
    userItems.forEach((u: any) => rawList.push({ ...u, type: "USER" }));
  }

  // 3. Fallback collection keys
  for (const key of ["shops", "items", "data"]) {
    if (Array.isArray(raw[key])) {
      rawList.push(...(raw[key] as unknown[]));
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
