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
      transformResponse: (response: any) =>
        response?.data ?? response?.payload ?? response,
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
      transformResponse: (response: any, _meta, arg) => {
        const raw = response?.data ?? response?.payload ?? response;
        const contents = Array.isArray(raw?.items)
          ? raw.items
          : Array.isArray(raw?.contents)
            ? raw.contents
            : Array.isArray(raw?.content)
              ? raw.content
              : Array.isArray(raw)
                ? raw
                : [];
        const totalElements =
          typeof raw?.totalElements === "number"
            ? raw.totalElements
            : typeof raw?.total === "number"
              ? raw.total
              : contents.length;
        const pageSize =
          typeof raw?.pageSize === "number"
            ? raw.pageSize
            : typeof raw?.size === "number"
              ? raw.size
              : (arg.params?.size ?? 20);
        const pageNumber =
          typeof raw?.pageNumber === "number"
            ? raw.pageNumber
            : typeof raw?.number === "number"
              ? raw.number
              : (arg.params?.page ?? 0);
        const totalPages =
          typeof raw?.totalPages === "number"
            ? raw.totalPages
            : Math.max(1, Math.ceil(totalElements / Math.max(1, pageSize)));
        return {
          contents,
          pageNumber,
          pageSize,
          totalElements,
          totalPages,
          first: typeof raw?.isFirst === "boolean" ? raw.isFirst : (raw?.first ?? pageNumber === 0),
          last: typeof raw?.isLast === "boolean" ? raw.isLast : (raw?.last ?? true),
        };
      },
      invalidatesTags: ["DiscoverySearchResults"],
    }),
  }),
});

export const {
  useGetDiscoveryFilterOptionsQuery,
  useLazyGetDiscoveryFilterOptionsQuery,
  useSearchAdvancedMenuItemsMutation,
} = discoveryApi;
