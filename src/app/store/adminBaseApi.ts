import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// TODO: replace with your app's real token retrieval (auth context, cookie, etc.)
function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("adminAccessToken");
}

const ADMIN_API_BASE_URL =
  process.env.NEXT_PUBLIC_ADMIN_API_URL ?? "http://localhost:7070/api/v1/admin";

export const adminBaseApi = createApi({
  reducerPath: "adminBaseApi",
  baseQuery: fetchBaseQuery({
    baseUrl: ADMIN_API_BASE_URL,
    prepareHeaders: (headers) => {
      const token = getAdminToken();
      if (token) headers.set("Authorization", `Bearer ${token}`);
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["Allergen", "DietaryType", "MedicalCondition"],
  endpoints: () => ({}),
});