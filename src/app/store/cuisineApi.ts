import { baseApi } from "./baseApi";

import type {
  Cuisine,
  CuisinePayload,
} from "../../types/cuisine";
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

export const cuisineApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCuisines: builder.query<
      PagedResponse<Cuisine>,
      ListParams & { includeInactive?: boolean }
    >({
      query: (params) => {
        const queryParams = params ?? {};
        const page = queryParams.page ?? 0;
        const size = queryParams.size ?? 20;
        const includeInactive = queryParams.includeInactive ?? false;

        return {
          url: includeInactive
            ? "/api/catalog/cuisines/all"
            : "/api/catalog/cuisines",
          method: "GET",
          params: {
            page,
            size,
            sort: "name,asc",
          },
        };
      },
      transformResponse: (
        response: BackendPagedResponse<Cuisine> | ApiResponse<BackendPagedResponse<Cuisine>>,
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
                type: "Cuisine" as const,
                id: uuid,
              })),
              {
                type: "Cuisine" as const,
                id: "LIST",
              },
            ]
          : [
              {
                type: "Cuisine" as const,
                id: "LIST",
              },
            ],
    }),

    getCuisineByUuid: builder.query<Cuisine, string>({
      query: (uuid) => ({
        url: `/api/catalog/cuisines/${encodeURIComponent(uuid)}`,
        method: "GET",
      }),
      transformResponse: (response: Cuisine | ApiResponse<Cuisine>) =>
        unwrapResponse(response),
      providesTags: (_result, _error, uuid) => [
        {
          type: "Cuisine",
          id: uuid,
        },
      ],
    }),

    createCuisine: builder.mutation<Cuisine, CuisinePayload>({
      query: (body) => ({
        url: "/api/catalog/cuisines",
        method: "POST",
        body,
      }),
      transformResponse: (response: Cuisine | ApiResponse<Cuisine>) =>
        unwrapResponse(response),
      invalidatesTags: [
        {
          type: "Cuisine",
          id: "LIST",
        },
      ],
    }),

    updateCuisine: builder.mutation<
      Cuisine,
      { uuid: string; body: CuisinePayload }
    >({
      query: ({ uuid, body }) => ({
        url: `/api/catalog/cuisines/${encodeURIComponent(uuid)}`,
        method: "PATCH",
        body,
      }),
      transformResponse: (response: Cuisine | ApiResponse<Cuisine>) =>
        unwrapResponse(response),
      invalidatesTags: (_result, _error, { uuid }) => [
        {
          type: "Cuisine",
          id: uuid,
        },
        {
          type: "Cuisine",
          id: "LIST",
        },
      ],
    }),

    deleteCuisine: builder.mutation<void, string>({
      query: (uuid) => ({
        url: `/api/catalog/cuisines/${encodeURIComponent(uuid)}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, uuid) => [
        {
          type: "Cuisine",
          id: uuid,
        },
        {
          type: "Cuisine",
          id: "LIST",
        },
      ],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetCuisinesQuery,
  useGetCuisineByUuidQuery,
  useCreateCuisineMutation,
  useUpdateCuisineMutation,
  useDeleteCuisineMutation,
} = cuisineApi;
