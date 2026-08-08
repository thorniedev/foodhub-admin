import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const adminBaseApi = createApi({
  reducerPath: "adminBaseApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/admin",
    prepareHeaders: (headers) => {
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["Allergen", "DietaryType", "MedicalCondition"],
  endpoints: () => ({}),
});