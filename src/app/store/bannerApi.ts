// import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
// import { Banner, BannerFormData } from "../../types/banner";
// // import { Banner, BannerFormData } from "@/types/banner";

// export const bannerApi = createApi({
//   reducerPath: "bannerApi",
//   baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
//   tagTypes: ["Banner"],
//   endpoints: (builder) => ({
//     getBanners: builder.query<Banner[], void>({
//       query: () => "/banners",
//       providesTags: (result) =>
//         result
//           ? [
//               ...result.map(({ id }) => ({ type: "Banner" as const, id })),
//               { type: "Banner" as const, id: "LIST" },
//             ]
//           : [{ type: "Banner" as const, id: "LIST" }],
//     }),
//     getBanner: builder.query<Banner, string>({
//       query: (id) => `/banners/${id}`,
//       providesTags: (_r, _e, id) => [{ type: "Banner", id }],
//     }),
//     addBanner: builder.mutation<Banner, BannerFormData>({
//       query: (body) => ({ url: "/banners", method: "POST", body }),
//       invalidatesTags: [{ type: "Banner", id: "LIST" }],
//     }),
//     updateBanner: builder.mutation<Banner, { id: string; data: Partial<BannerFormData> }>({
//       query: ({ id, data }) => ({ url: `/banners/${id}`, method: "PUT", body: data }),
//       invalidatesTags: (_r, _e, { id }) => [
//         { type: "Banner", id },
//         { type: "Banner", id: "LIST" },
//       ],
//     }),
//     deleteBanner: builder.mutation<{ id: string }, string>({
//       query: (id) => ({ url: `/banners/${id}`, method: "DELETE" }),
//       invalidatesTags: [{ type: "Banner", id: "LIST" }],
//     }),
//   }),
// });

// export const {
//   useGetBannersQuery,
//   useGetBannerQuery,
//   useAddBannerMutation,
//   useUpdateBannerMutation,
//   useDeleteBannerMutation,
// } = bannerApi;



// import { Banner, BannerFormData } from "../../types/banner";
// import { Banner, BannerFormData } from "@/types/banner";



// import { Banner, BannerFormData } from "../../types/banner";
// import { baseApi } from "./baseApi";

// export const bannerApi = baseApi.injectEndpoints({
//   endpoints: (builder) => ({
//     getBanners: builder.query<Banner[], void>({
//       query: () => ({ url: "/api/banners" }),
//       providesTags: (result) =>
//         result
//           ? [
//               ...result.map(({ id }) => ({ type: "Banner" as const, id })),
//               { type: "Banner" as const, id: "LIST" },
//             ]
//           : [{ type: "Banner" as const, id: "LIST" }],
//     }),
//     getBanner: builder.query<Banner, string>({
//       query: (id) => ({ url: `/api/banners/${id}` }),
//       providesTags: (_r, _e, id) => [{ type: "Banner", id }],
//     }),
//     addBanner: builder.mutation<Banner, BannerFormData>({
//       query: (body) => ({ url: "/api/banners", method: "POST", body }),
//       invalidatesTags: [{ type: "Banner", id: "LIST" }],
//     }),
//     updateBanner: builder.mutation<Banner, { id: string; data: Partial<BannerFormData> }>({
//       query: ({ id, data }) => ({ url: `/api/banners/${id}`, method: "PUT", body: data }),
//       invalidatesTags: (_r, _e, { id }) => [
//         { type: "Banner", id },
//         { type: "Banner", id: "LIST" },
//       ],
//     }),
//     deleteBanner: builder.mutation<{ id: string }, string>({
//       query: (id) => ({ url: `/api/banners/${id}`, method: "DELETE" }),
//       invalidatesTags: [{ type: "Banner", id: "LIST" }],
//     }),
//   }),
//   overrideExisting: false,
// });

// export const {
//   useGetBannersQuery,
//   useGetBannerQuery,
//   useAddBannerMutation,
//   useUpdateBannerMutation,
//   useDeleteBannerMutation,
// } = bannerApi;





// import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
// import { Banner } from "../../types/banner";
// // import type { Banner } from "@/types/banner";

// export const bannerApi = createApi({
//   reducerPath: "bannerApi",

//   baseQuery: fetchBaseQuery({
//     baseUrl: "/data",
//   }),

//   endpoints: (builder) => ({
//     getBanners: builder.query<Banner[], void>({
//       query: () => "/banners.json",
//     }),
//   }),
// });

// export const { useGetBannersQuery } = bannerApi;



import { Banner, BannerFormData } from "../../types/banner";
import { baseApi } from "./baseApi";

export const bannerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBanners: builder.query<Banner[], void>({
      query: () => ({ url: "/api/banners" }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Banner" as const, id })),
              { type: "Banner" as const, id: "LIST" },
            ]
          : [{ type: "Banner" as const, id: "LIST" }],
    }),
    getBanner: builder.query<Banner, string>({
      query: (id) => ({ url: `/api/banners/${id}` }),
      providesTags: (_r, _e, id) => [{ type: "Banner", id }],
    }),
    addBanner: builder.mutation<Banner, BannerFormData>({
      query: (body) => ({ url: "/api/banners", method: "POST", body }),
      invalidatesTags: [{ type: "Banner", id: "LIST" }],
    }),
    updateBanner: builder.mutation<Banner, { id: string; data: Partial<BannerFormData> }>({
      query: ({ id, data }) => ({ url: `/api/banners/${id}`, method: "PUT", body: data }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Banner", id },
        { type: "Banner", id: "LIST" },
      ],
    }),
    deleteBanner: builder.mutation<{ id: string }, string>({
      query: (id) => ({ url: `/api/banners/${id}`, method: "DELETE" }),
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