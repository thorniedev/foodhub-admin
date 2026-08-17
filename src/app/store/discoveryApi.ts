import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import type {
  AdvancedMenuItemSearchRequest,
  DiscoveryFilterOptionsResponse,
  DiscoverySearchResultPage,
} from "@/src/types/discovery";
import type { MenuItemRecord } from "@/src/types/menu-management";

export const discoveryApi = createApi({
  reducerPath: "discoveryApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/discovery",
    credentials: "include",
    prepareHeaders: (headers) => {
      headers.set("Accept", "application/json");
      return headers;
    },
  }),
  tagTypes: ["DiscoveryFilterOptions", "DiscoverySearchResults"],
  endpoints: (builder) => ({
    getDiscoveryFilterOptions: builder.query<
      DiscoveryFilterOptionsResponse,
      void
    >({
      query: () => ({
        url: "/menu-items/filters",
        method: "GET",
      }),
      providesTags: ["DiscoveryFilterOptions"],
    }),
    searchAdvancedMenuItems: builder.mutation<
      DiscoverySearchResultPage<MenuItemRecord>,
      {
        params?: {
          page?: number;
          size?: number;
          sort?: string;
        };
        body: AdvancedMenuItemSearchRequest;
      }
    >({
      query: ({ params, body }) => ({
        url: "/menu-items/search",
        method: "POST",
        params: {
          page: params?.page ?? 0,
          size: params?.size ?? 20,
          sort: params?.sort ?? "FOODHUB_RATING_DESC",
        },
        body,
      }),
      invalidatesTags: ["DiscoverySearchResults"],
    }),
  }),
});

export const {
  useGetDiscoveryFilterOptionsQuery,
  useLazyGetDiscoveryFilterOptionsQuery,
  useSearchAdvancedMenuItemsMutation,
} = discoveryApi;
