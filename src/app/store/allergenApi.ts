import { adminBaseApi } from "./adminBaseApi";

import type { Allergen, AllergenPayload } from "../../types/allergen";
import type { ListParams, PagedResponse } from "../../types/safetyResource";

export const allergenApi = adminBaseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllergens: builder.query<
      PagedResponse<Allergen>,
      ListParams | void
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
    }),

    getAllergenByCode: builder.query<Allergen, string>({
      query: (code) => ({
        url: `/allergens/${encodeURIComponent(code)}`,
        method: "GET",
      }),
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
