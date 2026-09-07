import { adminBaseApi } from "./adminBaseApi";
import { normalizeSingleEntity } from "./utils/safetyNormalizer";

import type {
  AiProviderKey,
  CreateAiProviderKeyPayload,
  UpdateAiProviderKeyPayload,
} from "../../types/ai-provider-key";

/**
 * /api/admin/ai-provider-keys, forwarded by the generic /api/admin/[...path]
 * proxy straight through to the backend's AdminAiProviderKeyController.
 */
export const aiProviderKeyApi = adminBaseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAiProviderKeys: builder.query<AiProviderKey[], void>({
      query: () => ({
        url: "/ai-provider-keys",
        method: "GET",
      }),
      transformResponse: (response: unknown) =>
        normalizeSingleEntity<AiProviderKey[]>(response),
      providesTags: ["AiProviderKey"],
    }),

    createAiProviderKey: builder.mutation<
      AiProviderKey,
      CreateAiProviderKeyPayload
    >({
      query: (body) => ({
        url: "/ai-provider-keys",
        method: "POST",
        body,
      }),
      transformResponse: (response: unknown) =>
        normalizeSingleEntity<AiProviderKey>(response),
      invalidatesTags: ["AiProviderKey"],
    }),

    activateAiProviderKey: builder.mutation<AiProviderKey, string>({
      query: (uuid) => ({
        url: `/ai-provider-keys/${encodeURIComponent(uuid)}/activate`,
        method: "PATCH",
      }),
      transformResponse: (response: unknown) =>
        normalizeSingleEntity<AiProviderKey>(response),
      invalidatesTags: ["AiProviderKey"],
    }),

    updateAiProviderKey: builder.mutation<
      AiProviderKey,
      { uuid: string; body: UpdateAiProviderKeyPayload }
    >({
      query: ({ uuid, body }) => ({
        url: `/ai-provider-keys/${encodeURIComponent(uuid)}`,
        method: "PATCH",
        body,
      }),
      transformResponse: (response: unknown) =>
        normalizeSingleEntity<AiProviderKey>(response),
      invalidatesTags: ["AiProviderKey"],
    }),

    deleteAiProviderKey: builder.mutation<void, string>({
      query: (uuid) => ({
        url: `/ai-provider-keys/${encodeURIComponent(uuid)}`,
        method: "DELETE",
      }),
      invalidatesTags: ["AiProviderKey"],
    }),
  }),

  overrideExisting: true,
});

export const {
  useGetAiProviderKeysQuery,
  useCreateAiProviderKeyMutation,
  useActivateAiProviderKeyMutation,
  useUpdateAiProviderKeyMutation,
  useDeleteAiProviderKeyMutation,
} = aiProviderKeyApi;
