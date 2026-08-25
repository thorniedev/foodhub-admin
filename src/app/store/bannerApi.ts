import { adminBaseApi } from "./adminBaseApi";
import { normalizeSafetyPagedResponse, normalizeSingleEntity } from "./utils/safetyNormalizer";
import type {
  AdminBannerPage,
  AdminBannerResponse,
  CreateBannerPayload,
  GetAdminBannersParams,
  UpdateBannerPayload,
} from "../../types/banner";

/**
 * Backend controller expects @RequestPart("request") as an application/json
 * Blob and @RequestPart("image") as the file part. Do not set a manual
 * Content-Type header for FormData bodies — fetchBaseQuery strips it so the
 * browser can generate the multipart boundary.
 */
export function buildBannerFormData(
  payload: CreateBannerPayload | UpdateBannerPayload,
  image?: File | null,
): FormData {
  const formData = new FormData();

  formData.append(
    "request",
    new Blob([JSON.stringify(payload)], { type: "application/json" }),
    "request.json",
  );

  if (image) {
    formData.append("image", image);
  }

  return formData;
}

export const bannerApi = adminBaseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminBanners: builder.query<
      AdminBannerPage,
      GetAdminBannersParams | void
    >({
      query: (params) => {
        const p = (params ?? {}) as GetAdminBannersParams;
        return {
          url: "/banners",
          method: "GET",
          params: {
            category: p.category,
            isPublished: p.isPublished,
            page: p.page ?? 0,
            size: p.size ?? 20,
          },
        };
      },
      transformResponse: (response: any, _meta, params) =>
        normalizeSafetyPagedResponse<AdminBannerResponse>(
          response,
          params ? params.page : undefined,
          params ? params.size : undefined,
        ),
      providesTags: (result) =>
        result
          ? [
            ...result.contents.map(({ id }) => ({
              type: "Banner" as const,
              id,
            })),
            { type: "Banner" as const, id: "LIST" },
          ]
          : [{ type: "Banner" as const, id: "LIST" }],
    }),

    getAdminBannerById: builder.query<AdminBannerResponse, string>({
      query: (id) => ({
        url: `/banners/${encodeURIComponent(id)}`,
        method: "GET",
      }),
      transformResponse: (response: any) => normalizeSingleEntity<AdminBannerResponse>(response),
      providesTags: (_result, _error, id) => [{ type: "Banner", id }],
    }),

    createBanner: builder.mutation<
      AdminBannerResponse,
      { payload: CreateBannerPayload; image: File }
    >({
      query: ({ payload, image }) => ({
        url: "/banners",
        method: "POST",
        body: buildBannerFormData(payload, image),
      }),
      invalidatesTags: [{ type: "Banner", id: "LIST" }],
    }),

    updateBanner: builder.mutation<
      AdminBannerResponse,
      { id: string; payload: UpdateBannerPayload; image?: File | null }
    >({
      query: ({ id, payload, image }) => ({
        url: `/banners/${encodeURIComponent(id)}`,
        method: "PUT",
        body: buildBannerFormData(payload, image ?? null),
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Banner", id },
        { type: "Banner", id: "LIST" },
      ],
    }),

    updateBannerStatus: builder.mutation<
      AdminBannerResponse,
      {
        id: string;
        isPublished: boolean;
        /** Exact args of the currently rendered list query, for optimistic patching. */
        listArgs?: GetAdminBannersParams;
      }
    >({
      query: ({ id, isPublished }) => ({
        url: `/banners/${encodeURIComponent(id)}/status`,
        method: "PATCH",
        body: { isPublished },
      }),
      // Optimistic update with rollback: flip the switch instantly, then
      // reconcile with the server. RTK Query's updateQueryData patches are
      // safely undoable via patch.undo() if the request fails.
      async onQueryStarted(
        { id, isPublished, listArgs },
        { dispatch, queryFulfilled },
      ) {
        const patches = [
          dispatch(
            bannerApi.util.updateQueryData(
              "getAdminBannerById",
              id,
              (draft) => {
                draft.isPublished = isPublished;
              },
            ),
          ),
        ];

        if (listArgs !== undefined) {
          patches.push(
            dispatch(
              bannerApi.util.updateQueryData(
                "getAdminBanners",
                listArgs,
                (draft) => {
                  const item = draft.contents.find((banner) => banner.id === id);
                  if (item) {
                    item.isPublished = isPublished;
                  }
                },
              ),
            ),
          );
        }

        try {
          await queryFulfilled;
        } catch {
          patches.forEach((patch) => patch.undo());
        }
      },
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Banner", id },
        { type: "Banner", id: "LIST" },
      ],
    }),

    deleteBanner: builder.mutation<void, string>({
      query: (id) => ({
        url: `/banners/${encodeURIComponent(id)}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Banner", id: "LIST" }],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetAdminBannersQuery,
  useGetAdminBannerByIdQuery,
  useCreateBannerMutation,
  useUpdateBannerMutation,
  useUpdateBannerStatusMutation,
  useDeleteBannerMutation,
} = bannerApi;
