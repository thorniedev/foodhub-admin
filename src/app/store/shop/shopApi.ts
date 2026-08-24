import { adminBaseApi } from "../adminBaseApi";
import type {
  CreateStoreFromGooglePayload,
  CreateStorePayload,
  GetAdminStoresParams,
  GooglePlacePreview,
  GooglePlaceResult,
  ReplaceStoreHoursPayload,
  Store,
  StoreExternalSourceMetadata,
  StoreHour,
  StorePage,
  UpdateStoreAccountStatusPayload,
  UpdateStoreOperatingStatusPayload,
  UpdateStorePayload,
  UpdateStoreReviewStatusPayload,
} from "@/src/types/shop";

type UnknownRecord = Record<string, unknown>;
const isObject = (v: unknown): v is UnknownRecord =>
  typeof v === "object" && v !== null;
const unwrapData = (v: unknown): unknown =>
  isObject(v) && "data" in v && v.data !== undefined && v.data !== null
    ? v.data
    : isObject(v) && "payload" in v && v.payload !== undefined && v.payload !== null
      ? v.payload
      : v;

function normalizeStorePage(response: unknown): StorePage {
  const raw = unwrapData(response);
  if (Array.isArray(raw)) {
    return {
      contents: raw as Store[],
      pageNumber: 0,
      pageSize: raw.length,
      totalElements: raw.length,
      totalPages: raw.length ? 1 : 0,
      first: true,
      last: true,
    };
  }
  if (!isObject(raw)) {
    return {
      contents: [],
      pageNumber: 0,
      pageSize: 20,
      totalElements: 0,
      totalPages: 0,
      first: true,
      last: true,
    };
  }
  const contents = Array.isArray(raw.items)
    ? (raw.items as Store[])
    : Array.isArray(raw.contents)
      ? (raw.contents as Store[])
      : Array.isArray(raw.content)
        ? (raw.content as Store[])
        : [];
  return {
    contents,
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
          : contents.length,
    totalElements:
      typeof raw.totalElements === "number"
        ? raw.totalElements
        : typeof raw.total === "number"
          ? raw.total
          : contents.length,
    totalPages:
      typeof raw.totalPages === "number"
        ? raw.totalPages
        : contents.length
          ? 1
          : 0,
    first: typeof raw.isFirst === "boolean" ? raw.isFirst : typeof raw.first === "boolean" ? raw.first : true,
    last: typeof raw.isLast === "boolean" ? raw.isLast : typeof raw.last === "boolean" ? raw.last : true,
  };
}
const normalizeOne = <T>(response: unknown): T => unwrapData(response) as T;

function normalizeHours(response: unknown): StoreHour[] {
  const raw = unwrapData(response);
  if (Array.isArray(raw)) return raw as StoreHour[];
  return isObject(raw) && Array.isArray(raw.hours)
    ? (raw.hours as StoreHour[])
    : [];
}

function normalizeObjects(response: unknown): Record<string, unknown>[] {
  const raw = unwrapData(response);
  if (Array.isArray(raw)) return raw.filter(isObject);
  if (!isObject(raw)) return [];
  for (const key of ["results", "places", "contents", "content"]) {
    if (Array.isArray(raw[key]))
      return (raw[key] as unknown[]).filter(isObject);
  }
  return [raw];
}

export const shopApi = adminBaseApi.injectEndpoints({
  endpoints: (builder) => ({
    getShops: builder.query<StorePage, GetAdminStoresParams | void>({
      query: (params) => {
        const p = (params ?? {}) as GetAdminStoresParams;
        return {
          url: "/stores",
          method: "GET",
          params: {
            query: p.query?.trim() || undefined,
            reviewStatus:
              p.reviewStatus && p.reviewStatus !== "ALL"
                ? p.reviewStatus
                : undefined,
            operatingStatus: p.operatingStatus || undefined,
            accountStatus: p.accountStatus || undefined,
            page: p.page ?? 0,
            size: p.size ?? 20,
          },
        };
      },
      transformResponse: normalizeStorePage,
      providesTags: ["Store", "Shop"],
    }),
    getShopByUuid: builder.query<Store, string>({
      query: (uuid) => ({
        url: `/stores/${encodeURIComponent(uuid)}`,
        method: "GET",
      }),
      transformResponse: (r) => normalizeOne<Store>(r),
      providesTags: ["Store", "Shop"],
    }),
    createShop: builder.mutation<Store, CreateStorePayload>({
      query: (body) => ({ url: "/stores", method: "POST", body }),
      transformResponse: (r) => normalizeOne<Store>(r),
      invalidatesTags: ["Store", "Shop"],
    }),
    updateShop: builder.mutation<
      Store,
      { storeUuid: string; body: UpdateStorePayload }
    >({
      query: ({ storeUuid, body }) => ({
        url: `/stores/${encodeURIComponent(storeUuid)}`,
        method: "PATCH",
        body,
      }),
      transformResponse: (r) => normalizeOne<Store>(r),
      invalidatesTags: ["Store", "Shop"],
    }),
    updateStoreReviewStatus: builder.mutation<
      Store,
      { storeUuid: string; body: UpdateStoreReviewStatusPayload }
    >({
      query: ({ storeUuid, body }) => ({
        url: `/stores/${encodeURIComponent(storeUuid)}/review-status`,
        method: "PATCH",
        body,
      }),
      transformResponse: (r) => normalizeOne<Store>(r),
      invalidatesTags: ["Store", "Shop"],
    }),
    updateStoreAccountStatus: builder.mutation<
      Store,
      { storeUuid: string; body: UpdateStoreAccountStatusPayload }
    >({
      query: ({ storeUuid, body }) => ({
        url: `/stores/${encodeURIComponent(storeUuid)}/account-status`,
        method: "PATCH",
        body,
      }),
      transformResponse: (r) => normalizeOne<Store>(r),
      invalidatesTags: ["Store", "Shop"],
    }),
    updateStoreOperatingStatus: builder.mutation<
      Store,
      { storeUuid: string; body: UpdateStoreOperatingStatusPayload }
    >({
      query: ({ storeUuid, body }) => ({
        url: `/stores/${encodeURIComponent(storeUuid)}/operating-status`,
        method: "PATCH",
        body,
      }),
      transformResponse: (r) => normalizeOne<Store>(r),
      invalidatesTags: ["Store", "Shop"],
    }),
    getStoreHours: builder.query<StoreHour[], string>({
      query: (uuid) => ({
        url: `/stores/${encodeURIComponent(uuid)}/hours`,
        method: "GET",
      }),
      transformResponse: normalizeHours,
    }),
    replaceStoreHours: builder.mutation<
      StoreHour[],
      { storeUuid: string; body: ReplaceStoreHoursPayload }
    >({
      query: ({ storeUuid, body }) => ({
        url: `/stores/${encodeURIComponent(storeUuid)}/hours`,
        method: "PUT",
        body,
      }),
      transformResponse: normalizeHours,
    }),
    getStoreExternalSources: builder.query<
      StoreExternalSourceMetadata[],
      string
    >({
      query: (uuid) => ({
        url: `/stores/${encodeURIComponent(uuid)}/external-sources`,
        method: "GET",
      }),
      transformResponse: normalizeObjects,
    }),
    searchGooglePlaces: builder.query<GooglePlaceResult[], string>({
      query: (query) => ({
        url: "/google-places/search",
        method: "GET",
        params: { query },
      }),
      transformResponse: normalizeObjects,
    }),
    getGooglePlacePreview: builder.query<GooglePlacePreview, string>({
      query: (placeId) => ({
        url: `/google-places/${encodeURIComponent(placeId)}/preview`,
        method: "GET",
      }),
      transformResponse: (r) => normalizeOne<GooglePlacePreview>(r),
    }),
    createStoreFromGoogle: builder.mutation<
      Store,
      CreateStoreFromGooglePayload
    >({
      query: (body) => ({ url: "/stores/from-google", method: "POST", body }),
      transformResponse: (r) => normalizeOne<Store>(r),
      invalidatesTags: ["Store", "Shop"],
    }),
    deleteShop: builder.mutation<void, string>({
      query: (storeUuid) => ({
        url: `/stores/${encodeURIComponent(storeUuid)}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Store", "Shop"],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetShopsQuery,
  useLazyGetShopsQuery,
  useGetShopByUuidQuery,
  useLazyGetShopByUuidQuery,
  useCreateShopMutation,
  useUpdateShopMutation,
  useDeleteShopMutation,
  useUpdateStoreReviewStatusMutation,
  useUpdateStoreAccountStatusMutation,
  useUpdateStoreOperatingStatusMutation,
  useGetStoreHoursQuery,
  useLazyGetStoreHoursQuery,
  useReplaceStoreHoursMutation,
  useGetStoreExternalSourcesQuery,
  useLazyGetStoreExternalSourcesQuery,
  useSearchGooglePlacesQuery,
  useLazySearchGooglePlacesQuery,
  useGetGooglePlacePreviewQuery,
  useLazyGetGooglePlacePreviewQuery,
  useCreateStoreFromGoogleMutation,
} = shopApi;
