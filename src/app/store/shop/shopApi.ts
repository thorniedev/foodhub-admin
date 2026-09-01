import { adminBaseApi } from "../adminBaseApi";
import type {
  CreateStoreFromGooglePayload,
  CreateStorePayload,
  GetAdminStoresParams,
  GooglePlacePreview,
  GooglePlaceResult,
  ReplaceStoreHoursPayload,
  Store,
  StoreAccountStatus,
  StoreExternalSourceMetadata,
  StoreHour,
  StoreOperatingStatus,
  StorePage,
  StoreReviewStatus,
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

function parseEnumString(val: unknown): string {
  if (!val) return "";
  if (typeof val === "string") return val.trim().toUpperCase();
  if (typeof val === "object") {
    const obj = val as Record<string, unknown>;
    const inner = obj.name ?? obj.code ?? obj.value ?? obj.status ?? obj.key;
    if (typeof inner === "string") return inner.trim().toUpperCase();
  }
  return "";
}

function extractReviewStatus(r: Record<string, any>): StoreReviewStatus {
  const candidates = [
    r.reviewStatus,
    r.review_status,
    r.storeReviewStatus,
    r.store_review_status,
    r.verificationStatus,
    r.approvalStatus,
    r.reviewState,
    r.review_state,
    r.review?.status,
    r.review?.reviewStatus,
    r.storeReview?.status,
  ];

  for (const raw of candidates) {
    const u = parseEnumString(raw);
    if (u) {
      if (u === "APPROVED" || u === "APPROVE" || u === "VERIFIED") return "APPROVED";
      if (u === "REJECTED" || u === "REJECT") return "REJECTED";
      if (u === "PENDING" || u === "IN_REVIEW" || u === "WAITING") return "PENDING";
      return u;
    }
  }

  // Boolean approval flags
  if (r.isApproved === true || r.approved === true) return "APPROVED";
  if (r.isRejected === true || r.rejected === true) return "REJECTED";
  if (r.isPending === true || r.pending === true) return "PENDING";

  // Check generic status field ONLY if it contains a ReviewStatus value
  const statusStr = parseEnumString(r.status);
  if (statusStr === "APPROVED" || statusStr === "APPROVE") return "APPROVED";
  if (statusStr === "REJECTED" || statusStr === "REJECT") return "REJECTED";
  if (statusStr === "PENDING") return "PENDING";

  return "UNKNOWN";
}

function extractAccountStatus(r: Record<string, any>): StoreAccountStatus {
  const candidates = [
    r.accountStatus,
    r.account_status,
    r.storeAccountStatus,
    r.store_account_status,
    r.accountState,
    r.account_state,
    r.account?.status,
    r.account?.accountStatus,
  ];

  for (const raw of candidates) {
    const u = parseEnumString(raw);
    if (u) {
      if (u === "ACTIVE" || u === "ACTIVATED") return "ACTIVE";
      if (u === "SUSPENDED" || u === "SUSPEND") return "SUSPENDED";
      if (u === "ARCHIVED" || u === "ARCHIVE" || u === "INACTIVE") return "ARCHIVED";
      return u;
    }
  }

  const statusStr = parseEnumString(r.status);
  if (statusStr === "ACTIVE" || statusStr === "ACTIVATED") return "ACTIVE";
  if (statusStr === "SUSPENDED" || statusStr === "SUSPEND") return "SUSPENDED";
  if (statusStr === "ARCHIVED" || statusStr === "INACTIVE") return "ARCHIVED";

  if (r.isActive === true || r.active === true) return "ACTIVE";
  if (r.isSuspended === true || r.suspended === true) return "SUSPENDED";
  if (r.isArchived === true || r.archived === true) return "ARCHIVED";

  return "UNKNOWN";
}

function extractOperatingStatus(r: Record<string, any>): StoreOperatingStatus {
  const candidates = [
    r.operatingStatus,
    r.operating_status,
    r.operationStatus,
    r.operation_status,
    r.storeOperatingStatus,
    r.operation?.status,
    r.operating?.status,
  ];

  for (const raw of candidates) {
    const u = parseEnumString(raw);
    if (u) {
      if (u === "PERMANENTLY_CLOSED" || u.includes("PERMANENT")) return "PERMANENTLY_CLOSED";
      if (u === "TEMPORARILY_CLOSED" || u.includes("TEMP")) return "TEMPORARILY_CLOSED";
      if (u === "CLOSED") return "CLOSED";
      if (u === "OPEN") return "OPEN";
      return u;
    }
  }

  const statusStr = parseEnumString(r.status);
  if (statusStr === "PERMANENTLY_CLOSED") return "PERMANENTLY_CLOSED";
  if (statusStr === "TEMPORARILY_CLOSED") return "TEMPORARILY_CLOSED";
  if (statusStr === "CLOSED") return "CLOSED";
  if (statusStr === "OPEN") return "OPEN";

  if (typeof r.isOpenNow === "boolean" || typeof r.is_open_now === "boolean" || typeof r.isOpen === "boolean") {
    return "OPEN";
  }

  return "UNKNOWN";
}

export function normalizeStore(raw: unknown): Store {
  if (!isObject(raw)) return {} as Store;
  const r = raw as Record<string, any>;
  return {
    id: r.id !== undefined && r.id !== null ? r.id : undefined,
    uuid: String(r.uuid || r.id || ""),
    storeName: String(r.storeName || r.store_name || r.name || ""),
    description: r.description !== undefined ? r.description : null,
    addressLine: String(r.addressLine || r.address_line || r.address || ""),
    commune: r.commune ?? null,
    district: r.district ?? null,
    city: r.city ?? null,
    province: r.province ?? null,
    countryCode: String(r.countryCode || r.country_code || "KH"),
    postalCode: r.postalCode ?? r.postal_code ?? null,
    timezone: String(r.timezone || "Asia/Phnom_Penh"),
    latitude: Number(r.latitude ?? 0),
    longitude: Number(r.longitude ?? 0),
    phoneNumber: r.phoneNumber ?? r.phone_number ?? r.phone ?? null,
    email: r.email ?? null,
    logoMediaUuid: r.logoMediaUuid ?? r.logo_media_uuid ?? r.logoMedia ?? r.logo ?? null,
    coverMediaUuid: r.coverMediaUuid ?? r.cover_media_uuid ?? r.coverMedia ?? r.cover ?? null,
    logoUrl: r.logoUrl ?? r.logo_url ?? null,
    coverImageUrl: r.coverImageUrl ?? r.cover_image_url ?? r.coverUrl ?? null,
    priceLevel: r.priceLevel ?? r.price_level ?? null,
    hygieneRating: r.hygieneRating ?? r.hygiene_rating ?? null,
    averageRating: Number(r.averageRating ?? r.average_rating ?? r.rating ?? 0),
    totalReviews: Number(r.totalReviews ?? r.total_reviews ?? 0),
    reviewStatus: extractReviewStatus(r),
    operatingStatus: extractOperatingStatus(r),
    accountStatus: extractAccountStatus(r),
    isOpenNow:
      typeof r.isOpenNow === "boolean"
        ? r.isOpenNow
        : typeof r.is_open_now === "boolean"
          ? r.is_open_now
          : typeof r.isOpen === "boolean"
            ? r.isOpen
            : null,
    socialLinks: Array.isArray(r.socialLinks)
      ? r.socialLinks
      : Array.isArray(r.social_links)
        ? r.social_links
        : [],
    openingHours: Array.isArray(r.openingHours)
      ? r.openingHours
      : Array.isArray(r.opening_hours)
        ? r.opening_hours
        : Array.isArray(r.hours)
          ? r.hours
          : [],
    externalSource: r.externalSource ?? r.external_source ?? null,
    createdAt: r.createdAt ?? r.created_at ?? null,
    updatedAt: r.updatedAt ?? r.updated_at ?? null,
  };
}

function normalizeStorePage(response: unknown): StorePage {
  const raw = unwrapData(response);
  if (Array.isArray(raw)) {
    const contents = raw.map(normalizeStore);
    return {
      contents,
      pageNumber: 0,
      pageSize: contents.length,
      totalElements: contents.length,
      totalPages: contents.length ? 1 : 0,
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
  const rawList = Array.isArray(raw.items)
    ? raw.items
    : Array.isArray(raw.contents)
      ? raw.contents
      : Array.isArray(raw.content)
        ? raw.content
        : [];
  const contents = rawList.map(normalizeStore);
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
const normalizeOne = <T>(response: unknown): T => {
  const raw = unwrapData(response);
  return normalizeStore(raw) as unknown as T;
};

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
            size: Math.min(Math.max(1, p.size ?? 20), 100),
            sort: p.sort || "createdAt,desc",
          },
        };
      },
      transformResponse: (response: unknown, _meta, arg: GetAdminStoresParams | void) => {
        const page = normalizeStorePage(response);
        const p = (arg ?? {}) as GetAdminStoresParams;
        const requestedReview =
          p.reviewStatus && p.reviewStatus !== "ALL" ? p.reviewStatus : undefined;
        const requestedAccount =
          p.accountStatus || (requestedReview === "APPROVED" ? "ACTIVE" : undefined);
        const requestedOperating = p.operatingStatus;

        page.contents = page.contents.map((store) => ({
          ...store,
          reviewStatus:
            store.reviewStatus && store.reviewStatus !== "UNKNOWN"
              ? store.reviewStatus
              : requestedReview || store.reviewStatus || "PENDING",
          accountStatus:
            store.accountStatus && store.accountStatus !== "UNKNOWN"
              ? store.accountStatus
              : requestedAccount || store.accountStatus || "ACTIVE",
          operatingStatus:
            store.operatingStatus && store.operatingStatus !== "UNKNOWN"
              ? store.operatingStatus
              : requestedOperating || (store.isOpenNow !== null ? (store.isOpenNow ? "OPEN" : "CLOSED") : "OPEN"),
        }));

        return page;
      },
      providesTags: ["Store", "Shop"],
      keepUnusedDataFor: 300,
    }),
    getAllShops: builder.query<
      Store[],
      { reviewStatus?: StoreReviewStatus | "ALL"; accountStatus?: StoreAccountStatus; query?: string } | void
    >({
      queryFn: async (arg, _api, _extraOptions, baseQuery) => {
        try {
          const pageSize = 100;
          const p = (arg ?? {}) as {
            reviewStatus?: StoreReviewStatus | "ALL";
            accountStatus?: StoreAccountStatus;
            query?: string;
          };
          const requestedReview =
            p.reviewStatus && p.reviewStatus !== "ALL" ? p.reviewStatus : undefined;
          const requestedAccount =
            p.accountStatus || (requestedReview === "APPROVED" ? "ACTIVE" : undefined);
          const requestedQuery = p.query?.trim() || undefined;

          const firstRes = await baseQuery({
            url: "/stores",
            method: "GET",
            params: {
              query: requestedQuery,
              reviewStatus: requestedReview,
              accountStatus: requestedAccount,
              page: 0,
              size: pageSize,
              sort: "createdAt,desc",
            },
          });

          if (firstRes.error) {
            return { error: firstRes.error };
          }

          const firstPageData = normalizeStorePage(firstRes.data);
          let allStores: Store[] = [...firstPageData.contents];
          const totalPages = Math.min(firstPageData.totalPages || 1, 50);

          if (totalPages > 1) {
            const pagePromises = [];
            for (let p = 1; p < totalPages; p++) {
              pagePromises.push(
                baseQuery({
                  url: "/stores",
                  method: "GET",
                  params: {
                    query: requestedQuery,
                    reviewStatus: requestedReview,
                    accountStatus: requestedAccount,
                    page: p,
                    size: pageSize,
                    sort: "createdAt,desc",
                  },
                }),
              );
            }

            const results = await Promise.all(pagePromises);
            for (const res of results) {
              if (res.data) {
                const pageData = normalizeStorePage(res.data);
                allStores.push(...pageData.contents);
              }
            }
          }

          allStores = allStores.map((store) => ({
            ...store,
            reviewStatus:
              store.reviewStatus && store.reviewStatus !== "UNKNOWN"
                ? store.reviewStatus
                : requestedReview || store.reviewStatus || "PENDING",
            accountStatus:
              store.accountStatus && store.accountStatus !== "UNKNOWN"
                ? store.accountStatus
                : requestedAccount || store.accountStatus || "ACTIVE",
          }));

          return { data: allStores };
        } catch (err: any) {
          return {
            error: {
              status: "CUSTOM_ERROR" as const,
              error: err?.message || "Failed to fetch stores",
            },
          };
        }
      },
      providesTags: ["Store", "Shop"],
      keepUnusedDataFor: 300,
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
      providesTags: (_r, _e, uuid) => [
        { type: "Store", id: `${uuid}_hours` },
        "Store",
        "Shop",
      ],
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
      invalidatesTags: (_r, _e, { storeUuid }) => [
        { type: "Store", id: `${storeUuid}_hours` },
        { type: "Store", id: storeUuid },
        "Store",
        "Shop",
      ],
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
  useGetAllShopsQuery,
  useLazyGetAllShopsQuery,
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
