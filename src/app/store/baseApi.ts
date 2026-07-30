import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const baseApi = createApi({
  reducerPath: "",

  baseQuery: fetchBaseQuery({
    baseUrl: "",
  }),

  tagTypes: [
    "Shop",
    "User",
    "Order",
    "Category",
    "FoodType",
    "Drink",
    "DynamicContent",
    "Banner",
    "SeasonalFood",
    "FoodByArea",
    "Dashboard",
    "result",
  ],

  endpoints: () => ({}),
});
