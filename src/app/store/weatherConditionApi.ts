import { baseApi } from "./baseApi";

import type {
  CreateWeatherConditionPayload,
  UpdateWeatherConditionPayload,
  WeatherCondition,
  WeatherConditionListParams,
  WeatherConditionPage,
} from "../../types/weather-condition";

interface ApiResponse<T> {
  data?: T;
  payload?: T;
  status?: number;
  message?: string;
}

type BackendPagedResponse<T> =
  | WeatherConditionPage
  | {
    content?: T[];
    contents?: T[];
    number?: number;
    pageNumber?: number;
    size?: number;
    pageSize?: number;
    numberOfElements?: number;
    totalElements?: number;
    totalPages?: number;
    first?: boolean;
    last?: boolean;
    empty?: boolean;
  };

function unwrapResponse<T>(response: T | ApiResponse<T>): T {
  if (response && typeof response === "object") {
    if ("payload" in response && response.payload !== undefined) {
      return response.payload;
    }
    if ("data" in response && response.data !== undefined) {
      return response.data;
    }
  }

  return response as T;
}

function normalizeWeatherCondition(item: WeatherCondition): WeatherCondition {
  const active = item.isActive ?? item.active ?? true;
  return {
    ...item,
    isActive: active,
    active: active,
    localName: item.localName ?? null,
    description: item.description ?? null,
  };
}

function normalizePagedResponse(
  response:
    | BackendPagedResponse<WeatherCondition>
    | ApiResponse<BackendPagedResponse<WeatherCondition>>
    | WeatherCondition[],
  page: number,
  size: number,
): WeatherConditionPage {
  const data = unwrapResponse(response);

  if (Array.isArray(data)) {
    const contents = data.map(normalizeWeatherCondition);
    return {
      contents,
      pageNumber: page,
      pageSize: size,
      numberOfElements: contents.length,
      totalElements: contents.length,
      totalPages: Math.max(Math.ceil(contents.length / size), 1),
      first: page === 0,
      last: true,
      empty: contents.length === 0,
    };
  }

  const raw = data as Record<string, any>;
  const rawContents =
    Array.isArray(raw.items)
      ? raw.items
      : Array.isArray(raw.contents)
        ? raw.contents
        : Array.isArray(raw.content)
          ? raw.content
          : [];

  const contents = rawContents.map(normalizeWeatherCondition);

  const pageNumber =
    typeof raw.pageNumber === "number"
      ? raw.pageNumber
      : typeof raw.number === "number"
        ? raw.number
        : page;

  const pageSize =
    typeof raw.pageSize === "number"
      ? raw.pageSize
      : typeof raw.size === "number"
        ? raw.size
        : size;

  const totalElements =
    typeof raw.totalElements === "number"
      ? raw.totalElements
      : typeof raw.total === "number"
        ? raw.total
        : contents.length;

  const totalPages =
    typeof raw.totalPages === "number"
      ? raw.totalPages
      : Math.max(Math.ceil(totalElements / pageSize), 1);

  return {
    contents,
    pageNumber,
    pageSize,
    numberOfElements:
      typeof data.numberOfElements === "number"
        ? data.numberOfElements
        : contents.length,
    totalElements,
    totalPages,
    first: typeof data.first === "boolean" ? data.first : pageNumber === 0,
    last:
      typeof data.last === "boolean"
        ? data.last
        : pageNumber >= totalPages - 1,
    empty:
      typeof data.empty === "boolean"
        ? data.empty
        : contents.length === 0,
  };
}

export const weatherConditionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getWeatherConditions: builder.query<
      WeatherConditionPage,
      WeatherConditionListParams | void
    >({
      query: (params) => {
        const queryParams = (params ?? {}) as WeatherConditionListParams;
        const page = queryParams.page ?? 0;
        const size = queryParams.size ?? 100;
        const sort = queryParams.sort ?? "name,asc";

        return {
          url: "/api/catalog/weather-conditions",
          method: "GET",
          params: {
            page,
            size,
            sort,
            ...(queryParams.query ? { query: queryParams.query } : {}),
          },
        };
      },
      transformResponse: (
        response:
          | BackendPagedResponse<WeatherCondition>
          | ApiResponse<BackendPagedResponse<WeatherCondition>>
          | WeatherCondition[],
        _meta,
        params,
      ) => {
        const queryParams = (params ?? {}) as WeatherConditionListParams;
        return normalizePagedResponse(
          response,
          queryParams.page ?? 0,
          queryParams.size ?? 100,
        );
      },
      providesTags: (result) =>
        result
          ? [
            ...result.contents.map(({ uuid }) => ({
              type: "WeatherCondition" as const,
              id: uuid,
            })),
            {
              type: "WeatherCondition" as const,
              id: "LIST",
            },
          ]
          : [
            {
              type: "WeatherCondition" as const,
              id: "LIST",
            },
          ],
    }),

    getWeatherConditionByUuid: builder.query<WeatherCondition, string>({
      query: (uuid) => ({
        url: `/api/catalog/weather-conditions/${encodeURIComponent(uuid)}`,
        method: "GET",
      }),
      transformResponse: (
        response: WeatherCondition | ApiResponse<WeatherCondition>,
      ) => normalizeWeatherCondition(unwrapResponse(response)),
      providesTags: (_result, _error, uuid) => [
        {
          type: "WeatherCondition",
          id: uuid,
        },
      ],
    }),

    createWeatherCondition: builder.mutation<
      WeatherCondition,
      CreateWeatherConditionPayload
    >({
      query: (payload) => {
        const active = payload.isActive ?? payload.active ?? true;
        return {
          url: "/api/catalog/weather-conditions",
          method: "POST",
          body: {
            code: payload.code,
            name: payload.name,
            localName: payload.localName ?? null,
            description: payload.description ?? null,
            isActive: active,
            active: active,
          },
        };
      },
      transformResponse: (
        response: WeatherCondition | ApiResponse<WeatherCondition>,
      ) => normalizeWeatherCondition(unwrapResponse(response)),
      invalidatesTags: [
        {
          type: "WeatherCondition",
          id: "LIST",
        },
      ],
    }),

    updateWeatherCondition: builder.mutation<
      WeatherCondition,
      {
        uuid: string;
        body?: UpdateWeatherConditionPayload;
        payload?: UpdateWeatherConditionPayload;
      }
    >({
      query: ({ uuid, body, payload }) => {
        const data = body ?? payload ?? {};
        const active = data.isActive ?? data.active;
        const normalizedBody: Record<string, unknown> = {
          ...data,
        };
        if (active !== undefined) {
          normalizedBody.isActive = active;
          normalizedBody.active = active;
        }

        return {
          url: `/api/catalog/weather-conditions/${encodeURIComponent(uuid)}`,
          method: "PATCH",
          body: normalizedBody,
        };
      },
      transformResponse: (
        response: WeatherCondition | ApiResponse<WeatherCondition>,
      ) => normalizeWeatherCondition(unwrapResponse(response)),
      invalidatesTags: (_result, _error, { uuid }) => [
        {
          type: "WeatherCondition",
          id: uuid,
        },
        {
          type: "WeatherCondition",
          id: "LIST",
        },
      ],
    }),

    deleteWeatherCondition: builder.mutation<void, string>({
      query: (uuid) => ({
        url: `/api/catalog/weather-conditions/${encodeURIComponent(uuid)}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, uuid) => [
        {
          type: "WeatherCondition",
          id: uuid,
        },
        {
          type: "WeatherCondition",
          id: "LIST",
        },
      ],
    }),

    deactivateWeatherCondition: builder.mutation<void, string>({
      query: (uuid) => ({
        url: `/api/catalog/weather-conditions/${encodeURIComponent(uuid)}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, uuid) => [
        {
          type: "WeatherCondition",
          id: uuid,
        },
        {
          type: "WeatherCondition",
          id: "LIST",
        },
      ],
    }),

    restoreWeatherCondition: builder.mutation<WeatherCondition, string>({
      query: (uuid) => ({
        url: `/api/catalog/weather-conditions/${encodeURIComponent(uuid)}/restore`,
        method: "PATCH",
      }),
      transformResponse: (
        response: WeatherCondition | ApiResponse<WeatherCondition>,
      ) => normalizeWeatherCondition(unwrapResponse(response)),
      invalidatesTags: (_result, _error, uuid) => [
        {
          type: "WeatherCondition",
          id: uuid,
        },
        {
          type: "WeatherCondition",
          id: "LIST",
        },
      ],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetWeatherConditionsQuery,
  useGetWeatherConditionByUuidQuery,
  useCreateWeatherConditionMutation,
  useUpdateWeatherConditionMutation,
  useDeleteWeatherConditionMutation,
  useDeactivateWeatherConditionMutation,
  useRestoreWeatherConditionMutation,
} = weatherConditionApi;
