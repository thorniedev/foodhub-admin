import { Banner, BannerFormData } from "../../types/banner";
import { baseApi } from "./baseApi";

export const bannerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBanners: builder.query<Banner[], void>({
      query: () => ({ url: " /data/banners.json" }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Banner" as const, id })),
              { type: "Banner" as const, id: "LIST" },
            ]
          : [{ type: "Banner" as const, id: "LIST" }],
    }),
    getBanner: builder.query<Banner, string>({
      query: (id) => ({ url: ` /data/banners.json/${id}` }),
      providesTags: (_r, _e, id) => [{ type: "Banner", id }],
    }),
    addBanner: builder.mutation<Banner, BannerFormData>({
      query: (body) => ({ url: " /data/banners.json", method: "POST", body }),
      invalidatesTags: [{ type: "Banner", id: "LIST" }],
    }),
    updateBanner: builder.mutation<
      Banner,
      { id: string; data: Partial<BannerFormData> }
    >({
      query: ({ id, data }) => ({
        url: ` /data/banners.json/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Banner", id },
        { type: "Banner", id: "LIST" },
      ],
    }),
    deleteBanner: builder.mutation<{ id: string }, string>({
      query: (id) => ({ url: ` /data/banners.json/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Banner", id: "LIST" }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetBannersQuery,
  useGetBannerQuery,
  useAddBannerMutation,
  useUpdateBannerMutation,
  useDeleteBannerMutation,
} = bannerApi;
