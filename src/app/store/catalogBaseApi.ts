import {
  createApi,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";

export const catalogBaseApi = createApi({
  reducerPath: "catalogBaseApi",

  baseQuery: fetchBaseQuery({
    baseUrl: "/api/catalog",

    credentials: "include",
  }),

  tagTypes: ["AgeGroup"],

  endpoints: () => ({}),
});