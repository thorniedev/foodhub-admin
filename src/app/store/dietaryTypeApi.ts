import { adminBaseApi } from "./adminBaseApi";

import type {
  DietaryType,
  DietaryTypePayload,
} from "../../types/dietaryType";
import type { ListParams, PagedResponse } from "../../types/safetyResource";

export const dietaryTypeApi = adminBaseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDietaryTypes: builder.query<
      PagedResponse<DietaryType>,
      ListParams | void
    >({
      query: (params) => {
        const p = (params ?? {}) as ListParams;
        const page = p.page ?? 0;
        const size = p.size ?? 20;

        return {
          url: "/dietary-types",
          method: "GET",
          params: { page, size },
        };
      },
    }),

    getDietaryTypeByCode: builder.query<DietaryType, string>({
      query: (code) => ({
        url: `/dietary-types/${encodeURIComponent(code)}`,
        method: "GET",
      }),
    }),

    createDietaryType: builder.mutation<
      DietaryType,
      DietaryTypePayload
    >({
      query: (body) => ({
        url: "/dietary-types",
        method: "POST",
        body,
      }),
    }),

    updateDietaryType: builder.mutation<
      DietaryType,
      { code: string; body: DietaryTypePayload }
    >({
      query: ({ code, body }) => ({
        url: `/dietary-types/${encodeURIComponent(code)}`,
        method: "PATCH",
        body,
      }),
    }),

    deleteDietaryType: builder.mutation<void, string>({
      query: (code) => ({
        url: `/dietary-types/${encodeURIComponent(code)}`,
        method: "DELETE",
      }),
    }),

    restoreDietaryType: builder.mutation<DietaryType, string>({
      query: (code) => ({
        url: `/dietary-types/${encodeURIComponent(code)}/restore`,
        method: "PATCH",
      }),
    }),
  }),

  overrideExisting: true,
});

export const {
  useGetDietaryTypesQuery,
  useGetDietaryTypeByCodeQuery,
  useCreateDietaryTypeMutation,
  useUpdateDietaryTypeMutation,
  useDeleteDietaryTypeMutation,
  useRestoreDietaryTypeMutation,
} = dietaryTypeApi;
