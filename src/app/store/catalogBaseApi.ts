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

  // See adminBaseApi.ts: refetch on focus/reconnect so edits made by other
  // admins in a different session become visible without a full reload.
  refetchOnFocus: true,
  refetchOnReconnect: true,

  tagTypes: ["AgeGroup"],

  endpoints: () => ({}),
});