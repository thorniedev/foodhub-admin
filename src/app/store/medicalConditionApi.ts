import { adminBaseApi } from "./adminBaseApi";

import type {
  MedicalCondition,
  MedicalConditionPayload,
} from "../../types/medicalCondition";
import type { ListParams, PagedResponse } from "../../types/safetyResource";

export const medicalConditionApi = adminBaseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMedicalConditions: builder.query<
      PagedResponse<MedicalCondition>,
      ListParams | undefined
    >({
      query: (params) => {
        const p = (params ?? {}) as ListParams;
        const page = p.page ?? 0;
        const size = p.size ?? 20;

        return {
          url: "/medical-conditions",
          method: "GET",
          params: { page, size },
        };
      },
    }),

    getMedicalConditionByCode: builder.query<
      MedicalCondition,
      string
    >({
      query: (code) => ({
        url: `/medical-conditions/${encodeURIComponent(code)}`,
        method: "GET",
      }),
    }),

    createMedicalCondition: builder.mutation<
      MedicalCondition,
      MedicalConditionPayload
    >({
      query: (body) => ({
        url: "/medical-conditions",
        method: "POST",
        body,
      }),
    }),

    updateMedicalCondition: builder.mutation<
      MedicalCondition,
      { code: string; body: MedicalConditionPayload }
    >({
      query: ({ code, body }) => ({
        url: `/medical-conditions/${encodeURIComponent(code)}`,
        method: "PATCH",
        body,
      }),
    }),

    deleteMedicalCondition: builder.mutation<void, string>({
      query: (code) => ({
        url: `/medical-conditions/${encodeURIComponent(code)}`,
        method: "DELETE",
      }),
    }),

    hardDeleteMedicalCondition: builder.mutation<void, string>({
      query: (code) => ({
        url: `/medical-conditions/${encodeURIComponent(code)}/hard`,
        method: "DELETE",
      }),
    }),

    restoreMedicalCondition: builder.mutation<
      MedicalCondition,
      string
    >({
      query: (code) => ({
        url: `/medical-conditions/${encodeURIComponent(code)}/restore`,
        method: "PATCH",
      }),
    }),
  }),

  overrideExisting: true,
});

export const {
  useGetMedicalConditionsQuery,
  useGetMedicalConditionByCodeQuery,
  useCreateMedicalConditionMutation,
  useUpdateMedicalConditionMutation,
  useDeleteMedicalConditionMutation,
  useHardDeleteMedicalConditionMutation,
  useRestoreMedicalConditionMutation,
} = medicalConditionApi;
