import { baseApi } from "./baseApi";

import type {
  Allergen,
  AllergenListParams,
  AllergenListResult,
  CreateAllergenRequest,
  UpdateAllergenRequest,
} from "@/src/types/allergen";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:7070/api/v1";

const ALLERGENS_URL = `${API_BASE_URL}/admin/allergens`;

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readNumber(
  sources: UnknownRecord[],
  keys: string[],
  fallback: number,
): number {
  for (const source of sources) {
    for (const key of keys) {
      const value = source[key];

      if (typeof value === "number" && Number.isFinite(value)) {
        return value;
      }
    }
  }

  return fallback;
}

function getAllergenItems(response: unknown): Allergen[] {
  // Supports your current public/data/allergic.json shape:
  // [ { ... }, { ... } ]
  if (Array.isArray(response)) {
    return response as Allergen[];
  }

  if (!isRecord(response)) {
    return [];
  }

  // Real admin endpoint is expected to use `contents`.
  const directArrays = [
    response.contents,
    response.content,
    response.items,
    response.results,
  ];

  for (const candidate of directArrays) {
    if (Array.isArray(candidate)) {
      return candidate as Allergen[];
    }
  }

  // Also support APIs wrapped with `data`.
  if (Array.isArray(response.data)) {
    return response.data as Allergen[];
  }

  if (isRecord(response.data)) {
    const nestedArrays = [
      response.data.contents,
      response.data.content,
      response.data.items,
      response.data.results,
    ];

    for (const candidate of nestedArrays) {
      if (Array.isArray(candidate)) {
        return candidate as Allergen[];
      }
    }
  }

  return [];
}

function normalizeAllergenList(
  response: unknown,
  params: AllergenListParams,
): AllergenListResult {
  const items = getAllergenItems(response);

  const root = isRecord(response) ? response : {};
  const data = isRecord(root.data) ? root.data : {};
  const pagination = isRecord(root.pagination)
    ? root.pagination
    : isRecord(data.pagination)
      ? data.pagination
      : {};

  const sources = [root, data, pagination];

  const page = readNumber(
    sources,
    ["page", "number", "pageNumber"],
    params.page ?? 0,
  );

  const size = readNumber(
    sources,
    ["size", "pageSize"],
    params.size ?? Math.max(items.length, 1),
  );

  const totalElements = readNumber(
    sources,
    ["totalElements", "total", "totalItems"],
    items.length,
  );

  const totalPages = readNumber(
    sources,
    ["totalPages", "pages"],
    Math.max(1, Math.ceil(totalElements / Math.max(size, 1))),
  );

  return {
    items,
    page,
    size,
    totalElements,
    totalPages,
  };
}

function unwrapAllergen(response: unknown): Allergen {
  if (isRecord(response) && isRecord(response.data)) {
    return response.data as unknown as Allergen;
  }

  return response as Allergen;
}

export const allergenApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /api/v1/admin/allergens?page=0&size=20
    getAllergens: builder.query<AllergenListResult, AllergenListParams>({
      query: ({ page = 0, size = 20 }) => ({
        url: ALLERGENS_URL,
        method: "GET",
        params: {
          page,
          size,
        },
      }),

      transformResponse: (
        response: unknown,
        _meta,
        arg: AllergenListParams,
      ) => normalizeAllergenList(response, arg),

      providesTags: (result) =>
        result
          ? [
              ...result.items.map((allergen) => ({
                type: "DynamicContent" as const,
                id: `ALLERGEN-${allergen.code}`,
              })),
              {
                type: "DynamicContent" as const,
                id: "ALLERGEN-LIST",
              },
            ]
          : [
              {
                type: "DynamicContent" as const,
                id: "ALLERGEN-LIST",
              },
            ],
    }),

    // POST /api/v1/admin/allergens
    createAllergen: builder.mutation<Allergen, CreateAllergenRequest>({
      query: (body) => ({
        url: ALLERGENS_URL,
        method: "POST",
        body,
      }),

      transformResponse: (response: unknown) => unwrapAllergen(response),

      invalidatesTags: [
        {
          type: "DynamicContent",
          id: "ALLERGEN-LIST",
        },
      ],
    }),

    // PATCH /api/v1/admin/allergens/{code}
    updateAllergen: builder.mutation<
      Allergen,
      {
        originalCode: string;
        body: UpdateAllergenRequest;
      }
    >({
      query: ({ originalCode, body }) => ({
        url: `${ALLERGENS_URL}/${encodeURIComponent(originalCode)}`,
        method: "PATCH",
        body,
      }),

      transformResponse: (response: unknown) => unwrapAllergen(response),

      invalidatesTags: (_result, _error, { originalCode, body }) => [
        {
          type: "DynamicContent",
          id: `ALLERGEN-${originalCode}`,
        },
        {
          type: "DynamicContent",
          id: `ALLERGEN-${body.code}`,
        },
        {
          type: "DynamicContent",
          id: "ALLERGEN-LIST",
        },
      ],
    }),

    // DELETE /api/v1/admin/allergens/{code}
    // Backend behavior: soft delete / deactivate.
    deactivateAllergen: builder.mutation<void, string>({
      query: (code) => ({
        url: `${ALLERGENS_URL}/${encodeURIComponent(code)}`,
        method: "DELETE",
      }),

      invalidatesTags: (_result, _error, code) => [
        {
          type: "DynamicContent",
          id: `ALLERGEN-${code}`,
        },
        {
          type: "DynamicContent",
          id: "ALLERGEN-LIST",
        },
      ],
    }),

    // PATCH /api/v1/admin/allergens/{code}/restore
    restoreAllergen: builder.mutation<Allergen, string>({
      query: (code) => ({
        url: `${ALLERGENS_URL}/${encodeURIComponent(code)}/restore`,
        method: "PATCH",
      }),

      transformResponse: (response: unknown) => unwrapAllergen(response),

      invalidatesTags: (_result, _error, code) => [
        {
          type: "DynamicContent",
          id: `ALLERGEN-${code}`,
        },
        {
          type: "DynamicContent",
          id: "ALLERGEN-LIST",
        },
      ],
    }),
  }),

  overrideExisting: false,
});

export const {
  useGetAllergensQuery,
  useCreateAllergenMutation,
  useUpdateAllergenMutation,
  useDeactivateAllergenMutation,
  useRestoreAllergenMutation,
} = allergenApi;
