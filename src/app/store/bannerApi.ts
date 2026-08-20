import { adminBaseApi } from "./adminBaseApi";
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
function buildBannerFormData(
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
      { id: string; isPublished: boolean }
    >({
      query: ({ id, isPublished }) => ({
        url: `/banners/${encodeURIComponent(id)}/status`,
        method: "PATCH",
        body: { isPublished },
      }),
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
