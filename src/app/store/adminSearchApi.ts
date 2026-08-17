import { adminBaseApi } from "./adminBaseApi";
import type {
  AdminSearchQuery,
  AdminSearchResponse,
  ReindexSearchResponse,
} from "@/src/types/adminSearch";

export const adminSearchApi = adminBaseApi.injectEndpoints({
  endpoints: (builder) => ({
    adminGlobalSearch: builder.query<AdminSearchResponse, AdminSearchQuery>({
      query: ({ query, types, page, size }) => ({
        url: "/search",
        method: "GET",
        params: {
          query: query.trim(),
          types: types && types.length > 0 ? types.join(",") : undefined,
          page: page ?? 0,
          size: size ?? 10,
        },
      }),
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
