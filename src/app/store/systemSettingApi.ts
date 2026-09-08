import { adminBaseApi } from "./adminBaseApi";
import { normalizeSingleEntity } from "./utils/safetyNormalizer";

import type {
  SystemSetting,
  SystemSettingKey,
  UpdateSystemSettingPayload,
} from "../../types/system-setting";

/**
 * /api/admin/system-settings, forwarded by the generic /api/admin/[...path]
 * proxy straight through to the backend's AdminSystemSettingController.
 */
export const systemSettingApi = adminBaseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSystemSettings: builder.query<SystemSetting[], void>({
      query: () => ({
        url: "/system-settings",
        method: "GET",
      }),
      transformResponse: (response: unknown) =>
        normalizeSingleEntity<SystemSetting[]>(response),
      providesTags: ["SystemSetting"],
    }),

    updateSystemSetting: builder.mutation<
      SystemSetting,
      { key: SystemSettingKey; body: UpdateSystemSettingPayload }
    >({
      query: ({ key, body }) => ({
        url: `/system-settings/${encodeURIComponent(key)}`,
        method: "PUT",
        body,
      }),
      transformResponse: (response: unknown) =>
        normalizeSingleEntity<SystemSetting>(response),
      invalidatesTags: ["SystemSetting"],
    }),

    resetSystemSetting: builder.mutation<SystemSetting, SystemSettingKey>({
      query: (key) => ({
        url: `/system-settings/${encodeURIComponent(key)}`,
        method: "DELETE",
      }),
      transformResponse: (response: unknown) =>
        normalizeSingleEntity<SystemSetting>(response),
      invalidatesTags: ["SystemSetting"],
    }),
  }),

  overrideExisting: true,
});

export const {
  useGetSystemSettingsQuery,
  useUpdateSystemSettingMutation,
  useResetSystemSettingMutation,
} = systemSettingApi;
