import { baseApi } from "./baseApi";

import type {
  FoodCategory,
  FoodCategoryPayload,
} from "../../types/foodCategory";
import type { ListParams, PagedResponse } from "../../types/safetyResource";

interface ApiResponse<T> {
  data: T;
}

type BackendPagedResponse<T> =
  | PagedResponse<T>
  | {
    content?: T[];
    contents?: T[];
    number?: number;
    size?: number;
    totalElements?: number;
    totalPages?: number;
    first?: boolean;
    last?: boolean;
  };

function unwrapResponse<T>(response: T | ApiResponse<T> | { payload: T }): T {
  if (
    typeof response === "object" &&
    response !== null
  ) {
    if ("payload" in response) {
      return (response as { payload: T }).payload;
    }
    if ("data" in response) {
      return (response as ApiResponse<T>).data;
    }
  }

  return response as T;
}

function normalizePagedResponse<T>(
  response: BackendPagedResponse<T> | ApiResponse<BackendPagedResponse<T>>,
  page: number,
  size: number,
): PagedResponse<T> {
  const data = unwrapResponse(response);

  if (Array.isArray(data)) {
    return {
      contents: data,
      pageNumber: page,
      pageSize: size,
      totalElements: data.length,
      totalPages: Math.max(Math.ceil(data.length / size), 1),
      first: page === 0,
      last: true,
    };
  }

  const raw = data as Record<string, any>;
  const contents =
    Array.isArray(raw.items)
      ? (raw.items as T[])
      : Array.isArray(raw.contents)
        ? (raw.contents as T[])
        : Array.isArray(raw.content)
          ? (raw.content as T[])
          : [];

  return {
    contents,
    pageNumber:
      typeof raw.pageNumber === "number"
        ? raw.pageNumber
        : typeof raw.number === "number"
          ? raw.number
          : page,
    pageSize:
      typeof raw.pageSize === "number"
        ? raw.pageSize
        : typeof raw.size === "number"
          ? raw.size
          : size,
    totalElements:
      typeof raw.totalElements === "number"
        ? raw.totalElements
        : typeof raw.total === "number"
          ? raw.total
          : contents.length,
    totalPages:
      typeof raw.totalPages === "number"
        ? raw.totalPages
        : Math.max(Math.ceil(contents.length / size), 1),
    first:
      typeof raw.first === "boolean"
        ? raw.first
        : page === 0,
    last:
      typeof raw.last === "boolean"
        ? raw.last
        : true,
  };
}

export const foodCategoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFoodCategories: builder.query<
      PagedResponse<FoodCategory>,
      ListParams & { includeInactive?: boolean }
    >({
      query: (params) => {
        const queryParams = params ?? {};
        const page = queryParams.page ?? 0;
        const size = queryParams.size ?? 20;
        const includeInactive = queryParams.includeInactive ?? false;

        return {
          url: "/api/catalog/food-categories",
          method: "GET",
          params: {
            page,
            size,
            sort: "name,asc",
          },
        };
      },
      transformResponse: (
        response: BackendPagedResponse<FoodCategory> | ApiResponse<BackendPagedResponse<FoodCategory>>,
        _meta,
        params,
      ) =>
        normalizePagedResponse(
          response,
          params.page ?? 0,
          params.size ?? 20,
        ),
      providesTags: (result) =>
        result
          ? [
            ...result.contents.map(({ uuid }) => ({
              type: "FoodCategory" as const,
              id: uuid,
            })),
            {
              type: "FoodCategory" as const,
              id: "LIST",
            },
          ]
          : [
            {
              type: "FoodCategory" as const,
              id: "LIST",
            },
          ],
    }),

    getFoodCategoryByUuid: builder.query<FoodCategory, string>({
      query: (uuid) => ({
        url: `/api/catalog/food-categories/${encodeURIComponent(uuid)}`,
        method: "GET",
      }),
      transformResponse: (response: FoodCategory | ApiResponse<FoodCategory>) =>
        unwrapResponse(response),
      providesTags: (_result, _error, uuid) => [
        {
          type: "FoodCategory",
          id: uuid,
        },
      ],
    }),

    createFoodCategory: builder.mutation<FoodCategory, FoodCategoryPayload>({
      query: (body) => ({
        url: "/api/catalog/food-categories",
        method: "POST",
        body,
      }),
      transformResponse: (response: FoodCategory | ApiResponse<FoodCategory>) =>
        unwrapResponse(response),
      invalidatesTags: [
        {
          type: "FoodCategory",
          id: "LIST",
        },
      ],
    }),

    updateFoodCategory: builder.mutation<
      FoodCategory,
      { uuid: string; body: FoodCategoryPayload }
    >({
      query: ({ uuid, body }) => ({
        url: `/api/catalog/food-categories/${encodeURIComponent(uuid)}`,
        method: "PATCH",
        body,
      }),
      transformResponse: (response: FoodCategory | ApiResponse<FoodCategory>) =>
        unwrapResponse(response),
      invalidatesTags: (_result, _error, { uuid }) => [
        {
          type: "FoodCategory",
          id: uuid,
        },
        {
          type: "FoodCategory",
          id: "LIST",
        },
      ],
    }),

    deleteFoodCategory: builder.mutation<void, string>({
      query: (uuid) => ({
        url: `/api/catalog/food-categories/${encodeURIComponent(uuid)}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, uuid) => [
        {
          type: "FoodCategory",
          id: uuid,
        },
        {
          type: "FoodCategory",
          id: "LIST",
        },
      ],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetFoodCategoriesQuery,
  useGetFoodCategoryByUuidQuery,
  useCreateFoodCategoryMutation,
  useUpdateFoodCategoryMutation,
  useDeleteFoodCategoryMutation,
} = foodCategoryApi;
