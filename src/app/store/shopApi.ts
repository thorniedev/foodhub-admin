// import { Shop } from "../types/shop";
import { baseApi } from "./baseApi";
import { Shop } from "../../types/shop";

export const shopApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getShops: builder.query<Shop[], void>({
      query: () => "/data/stores.json",
      providesTags: ["Shop"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetShopsQuery } = shopApi;
