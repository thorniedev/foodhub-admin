import { adminBaseApi } from "./adminBaseApi";
import { normalizeSafetyPagedResponse, normalizeSingleEntity } from "./utils/safetyNormalizer";

import type { Allergen, AllergenPayload } from "../../types/allergen";
import type { ListParams, PagedResponse } from "../../types/safetyResource";

export const allergenApi = adminBaseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllergens: builder.query<
      PagedResponse<Allergen>,
      ListParams | undefined
    >({
      query: (params) => {
        const p = (params ?? {}) as ListParams;
        const page = p.page ?? 0;
        const size = p.size ?? 20;

        return {
          url: "/allergens",
          method: "GET",
          params: { page, size },
        };
      },
      transformResponse: (response: any, _meta, params) =>
        normalizeSafetyPagedResponse<Allergen>(response, params?.page, params?.size),
    }),

    getAllergenByCode: builder.query<Allergen, string>({
      query: (code) => ({
        url: `/allergens/${encodeURIComponent(code)}`,
        method: "GET",
      }),
      transformResponse: (response: any) => normalizeSingleEntity<Allergen>(response),
    }),

    createAllergen: builder.mutation<Allergen, AllergenPayload>({
      query: (body) => ({
        url: "/allergens",
        method: "POST",
        body,
      }),
    }),

    updateAllergen: builder.mutation<
      Allergen,
      { code: string; body: AllergenPayload }
    >({
      query: ({ code, body }) => ({
        url: `/allergens/${encodeURIComponent(code)}`,
        method: "PATCH",
        body,
      }),
    }),

    deleteAllergen: builder.mutation<void, string>({
      query: (code) => ({
        url: `/allergens/${encodeURIComponent(code)}`,
        method: "DELETE",
      }),
    }),

    hardDeleteAllergen: builder.mutation<void, string>({
      query: (code) => ({
        url: `/allergens/${encodeURIComponent(code)}/hard`,
        method: "DELETE",
      }),
    }),

    restoreAllergen: builder.mutation<Allergen, string>({
      query: (code) => ({
        url: `/allergens/${encodeURIComponent(code)}/restore`,
        method: "PATCH",
      }),
    }),
  }),

  overrideExisting: true,
});

export const {
  useGetAllergensQuery,
  useGetAllergenByCodeQuery,
  useCreateAllergenMutation,
  useUpdateAllergenMutation,
  useDeleteAllergenMutation,
  useHardDeleteAllergenMutation,
  useRestoreAllergenMutation,
} = allergenApi;
