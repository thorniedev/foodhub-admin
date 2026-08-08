// import { baseApi } from "./baseApi";
// import { Shop } from "../../types/shop";

// let memoryStore: Shop[] | null = null;

// async function ensureStore(): Promise<Shop[]> {
//   if (memoryStore) return memoryStore;
//   const res = await fetch("/data/stores.json");
//   const data: Shop[] = await res.json();
//   memoryStore = data;
//   return memoryStore;
// }

// export const shopApi = baseApi.injectEndpoints({
//   endpoints: (builder) => ({
//     getShops: builder.query<Shop[], void>({
//       queryFn: async () => {
//         const data = await ensureStore();
//         return { data: [...data] };
//       },
//       providesTags: (result) =>
//         result
//           ? [
//               ...result.map(({ id }) => ({ type: "Shop" as const, id })),
//               { type: "Shop" as const, id: "LIST" },
//             ]
//           : [{ type: "Shop" as const, id: "LIST" }],
//     }),

//     createShop: builder.mutation<Shop, Omit<Shop, "id">>({
//       queryFn: async (newShop) => {
//         const data = await ensureStore();
//         const shop: Shop = {
//           ...newShop,
//           id: `SHOP${String(data.length + 1).padStart(3, "0")}`,
//         };
//         memoryStore = [shop, ...data];
//         return { data: shop };
//       },
//       invalidatesTags: [{ type: "Shop", id: "LIST" }],
//     }),

//     updateShop: builder.mutation<Shop, { id: string; changes: Partial<Shop> }>({
//       queryFn: async ({ id, changes }) => {
//         const data = await ensureStore();
//         const index = data.findIndex((s) => s.id === id);
//         if (index === -1) {
//           return { error: { status: 404, data: "Shop not found" } as any };
//         }
//         const updated = { ...data[index], ...changes };
//         memoryStore = [
//           ...data.slice(0, index),
//           updated,
//           ...data.slice(index + 1),
//         ];
//         return { data: updated };
//       },
//       invalidatesTags: (result, error, { id }) => [
//         { type: "Shop", id },
//         { type: "Shop", id: "LIST" },
//       ],
//     }),

//     deleteShop: builder.mutation<{ id: string }, string>({
//       queryFn: async (id) => {
//         const data = await ensureStore();
//         memoryStore = data.filter((s) => s.id !== id);
//         return { data: { id } };
//       },
//       invalidatesTags: (result, error, id) => [
//         { type: "Shop", id },
//         { type: "Shop", id: "LIST" },
//       ],
//     }),

//     toggleShopStatus: builder.mutation<Shop, string>({
//       queryFn: async (id) => {
//         const data = await ensureStore();
//         const index = data.findIndex((s) => s.id === id);
//         if (index === -1) {
//           return { error: { status: 404, data: "Shop not found" } as any };
//         }
//         const current = data[index];
//         const updated: Shop = {
//           ...current,
//           status: current.status === "banned" ? "active" : "banned",
//         };
//         memoryStore = [
//           ...data.slice(0, index),
//           updated,
//           ...data.slice(index + 1),
//         ];
//         return { data: updated };
//       },
//       invalidatesTags: (result, error, id) => [
//         { type: "Shop", id },
//         { type: "Shop", id: "LIST" },
//       ],
//     }),
//   }),
//   overrideExisting: false,
// });

// export const {
//   useGetShopsQuery,
//   useCreateShopMutation,
//   useUpdateShopMutation,
//   useDeleteShopMutation,
//   useToggleShopStatusMutation,
// } = shopApi;





// import { baseApi } from "./baseApi";
// import { AccountStatus, CreateShopPayload, Shop } from "../../types/shop";

// let memoryStore: Shop[] | null = null;

// async function ensureStore(): Promise<Shop[]> {
//   if (memoryStore) return memoryStore;
//   const res = await fetch("/data/stores.json");
//   const data: Shop[] = await res.json();
//   memoryStore = data;
//   return memoryStore;
// }

// export const shopApi = baseApi.injectEndpoints({
//   endpoints: (builder) => ({
//     getShops: builder.query<Shop[], void>({
//       queryFn: async () => {
//         const data = await ensureStore();
//         return { data: [...data] };
//       },
//       providesTags: (result) =>
//         result
//           ? [
//               ...result.map(({ uuid }) => ({
//                 type: "Shop" as const,
//                 id: uuid,
//               })),
//               { type: "Shop" as const, id: "LIST" },
//             ]
//           : [{ type: "Shop" as const, id: "LIST" }],
//     }),

//     createShop: builder.mutation<Shop, CreateShopPayload>({
//       queryFn: async (payload) => {
//         const data = await ensureStore();
//         const shop: Shop = {
//           ...payload,
//           uuid: crypto.randomUUID(),
//           logoMediaUuid: null,
//           coverMediaUuid: null,
//           averageRating: 0,
//           totalReviews: 0,
//           isOpenNow: null,
//         };
//         memoryStore = [shop, ...data];
//         return { data: shop };
//       },
//       invalidatesTags: [{ type: "Shop", id: "LIST" }],
//     }),

//     updateShop: builder.mutation<
//       Shop,
//       { uuid: string; changes: Partial<Shop> }
//     >({
//       queryFn: async ({ uuid, changes }) => {
//         const data = await ensureStore();
//         const index = data.findIndex((s) => s.uuid === uuid);
//         if (index === -1) {
//           return { error: { status: 404, data: "Shop not found" } as any };
//         }
//         const updated = { ...data[index], ...changes };
//         memoryStore = [
//           ...data.slice(0, index),
//           updated,
//           ...data.slice(index + 1),
//         ];
//         return { data: updated };
//       },
//       invalidatesTags: (result, error, { uuid }) => [
//         { type: "Shop", id: uuid },
//         { type: "Shop", id: "LIST" },
//       ],
//     }),

//     deleteShop: builder.mutation<{ uuid: string }, string>({
//       queryFn: async (uuid) => {
//         const data = await ensureStore();
//         memoryStore = data.filter((s) => s.uuid !== uuid);
//         return { data: { uuid } };
//       },
//       invalidatesTags: (result, error, uuid) => [
//         { type: "Shop", id: uuid },
//         { type: "Shop", id: "LIST" },
//       ],
//     }),

//     toggleShopAccountStatus: builder.mutation<Shop, string>({
//       queryFn: async (uuid) => {
//         const data = await ensureStore();
//         const index = data.findIndex((s) => s.uuid === uuid);
//         if (index === -1) {
//           return { error: { status: 404, data: "Shop not found" } as any };
//         }
//         const current = data[index];
//         const nextStatus: AccountStatus =
//           current.accountStatus === "BANNED" ? "ACTIVE" : "BANNED";
//         const updated: Shop = { ...current, accountStatus: nextStatus };
//         memoryStore = [
//           ...data.slice(0, index),
//           updated,
//           ...data.slice(index + 1),
//         ];
//         return { data: updated };
//       },
//       invalidatesTags: (result, error, uuid) => [
//         { type: "Shop", id: uuid },
//         { type: "Shop", id: "LIST" },
//       ],
//     }),
//   }),
//   overrideExisting: false,
// });

// export const {
//   useGetShopsQuery,
//   useCreateShopMutation,
//   useUpdateShopMutation,
//   useDeleteShopMutation,
//   useToggleShopAccountStatusMutation,
// } = shopApi;



import { adminBaseApi } from "./adminBaseApi";
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
const isObject = (v: unknown): v is UnknownRecord => typeof v === "object" && v !== null;
const unwrapData = (v: unknown): unknown =>
  isObject(v) && "data" in v && v.data !== undefined && v.data !== null ? v.data : v;

function normalizeStorePage(response: unknown): StorePage {
  const raw = unwrapData(response);
  if (Array.isArray(raw)) {
    return { contents: raw as Store[], pageNumber: 0, pageSize: raw.length, totalElements: raw.length, totalPages: raw.length ? 1 : 0, first: true, last: true };
  }
  if (!isObject(raw)) {
    return { contents: [], pageNumber: 0, pageSize: 20, totalElements: 0, totalPages: 0, first: true, last: true };
  }
  const contents = Array.isArray(raw.contents)
    ? raw.contents as Store[]
    : Array.isArray(raw.content)
      ? raw.content as Store[]
      : [];
  return {
    contents,
    pageNumber: typeof raw.pageNumber === "number" ? raw.pageNumber : typeof raw.number === "number" ? raw.number : 0,
    pageSize: typeof raw.pageSize === "number" ? raw.pageSize : typeof raw.size === "number" ? raw.size : contents.length,
    totalElements: typeof raw.totalElements === "number" ? raw.totalElements : contents.length,
    totalPages: typeof raw.totalPages === "number" ? raw.totalPages : contents.length ? 1 : 0,
    first: typeof raw.first === "boolean" ? raw.first : true,
    last: typeof raw.last === "boolean" ? raw.last : true,
  };
}
const normalizeOne = <T,>(response: unknown): T => unwrapData(response) as T;

function normalizeHours(response: unknown): StoreHour[] {
  const raw = unwrapData(response);
  if (Array.isArray(raw)) return raw as StoreHour[];
  return isObject(raw) && Array.isArray(raw.hours) ? raw.hours as StoreHour[] : [];
}

function normalizeObjects(response: unknown): Record<string, unknown>[] {
  const raw = unwrapData(response);
  if (Array.isArray(raw)) return raw.filter(isObject);
  if (!isObject(raw)) return [];
  for (const key of ["results", "places", "contents", "content"]) {
    if (Array.isArray(raw[key])) return (raw[key] as unknown[]).filter(isObject);
  }
  return [raw];
}

export const shopApi = adminBaseApi.injectEndpoints({
  endpoints: (builder) => ({
    getShops: builder.query<StorePage, GetAdminStoresParams | void>({
      query: (params) => ({
        url: "/stores",
        method: "GET",
        params: { query: params?.query?.trim() || undefined, page: params?.page ?? 0, size: params?.size ?? 20 },
      }),
      transformResponse: normalizeStorePage,
    }),
    getShopByUuid: builder.query<Store, string>({
      query: (uuid) => ({ url: `/stores/${encodeURIComponent(uuid)}`, method: "GET" }),
      transformResponse: (r) => normalizeOne<Store>(r),
    }),
    createShop: builder.mutation<Store, CreateStorePayload>({
      query: (body) => ({ url: "/stores", method: "POST", body }),
      transformResponse: (r) => normalizeOne<Store>(r),
    }),
    updateShop: builder.mutation<Store, { storeUuid: string; body: UpdateStorePayload }>({
      query: ({ storeUuid, body }) => ({ url: `/stores/${encodeURIComponent(storeUuid)}`, method: "PUT", body }),
      transformResponse: (r) => normalizeOne<Store>(r),
    }),
    updateStoreReviewStatus: builder.mutation<Store, { storeUuid: string; body: UpdateStoreReviewStatusPayload }>({
      query: ({ storeUuid, body }) => ({ url: `/stores/${encodeURIComponent(storeUuid)}/review-status`, method: "PATCH", body }),
      transformResponse: (r) => normalizeOne<Store>(r),
    }),
    updateStoreAccountStatus: builder.mutation<Store, { storeUuid: string; body: UpdateStoreAccountStatusPayload }>({
      query: ({ storeUuid, body }) => ({ url: `/stores/${encodeURIComponent(storeUuid)}/account-status`, method: "PATCH", body }),
      transformResponse: (r) => normalizeOne<Store>(r),
    }),
    updateStoreOperatingStatus: builder.mutation<Store, { storeUuid: string; body: UpdateStoreOperatingStatusPayload }>({
      query: ({ storeUuid, body }) => ({ url: `/stores/${encodeURIComponent(storeUuid)}/operating-status`, method: "PATCH", body }),
      transformResponse: (r) => normalizeOne<Store>(r),
    }),
    getStoreHours: builder.query<StoreHour[], string>({
      query: (uuid) => ({ url: `/stores/${encodeURIComponent(uuid)}/hours`, method: "GET" }),
      transformResponse: normalizeHours,
    }),
    replaceStoreHours: builder.mutation<StoreHour[], { storeUuid: string; body: ReplaceStoreHoursPayload }>({
      query: ({ storeUuid, body }) => ({ url: `/stores/${encodeURIComponent(storeUuid)}/hours`, method: "PUT", body }),
      transformResponse: normalizeHours,
    }),
    getStoreExternalSources: builder.query<StoreExternalSourceMetadata[], string>({
      query: (uuid) => ({ url: `/stores/${encodeURIComponent(uuid)}/external-sources`, method: "GET" }),
      transformResponse: normalizeObjects,
    }),
    searchGooglePlaces: builder.query<GooglePlaceResult[], string>({
      query: (query) => ({ url: "/google-places/search", method: "GET", params: { query } }),
      transformResponse: normalizeObjects,
    }),
    getGooglePlacePreview: builder.query<GooglePlacePreview, string>({
      query: (placeId) => ({ url: `/google-places/${encodeURIComponent(placeId)}/preview`, method: "GET" }),
      transformResponse: (r) => normalizeOne<GooglePlacePreview>(r),
    }),
    createStoreFromGoogle: builder.mutation<Store, CreateStoreFromGooglePayload>({
      query: (body) => ({ url: "/stores/from-google", method: "POST", body }),
      transformResponse: (r) => normalizeOne<Store>(r),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetShopsQuery,
  useLazyGetShopsQuery,
  useGetShopByUuidQuery,
  useLazyGetShopByUuidQuery,
  useCreateShopMutation,
  useUpdateShopMutation,
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
