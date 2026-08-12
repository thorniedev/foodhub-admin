import {
  createApi,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";

/**
 * IMPORTANT:
 * Browser requests go to the ADMIN Next.js repo first.
 * /api/admin/[...path] reads the HTTP-only Keycloak token and forwards
 * Authorization: Bearer <token> to Spring Boot.
 */
export const adminBaseApi = createApi({
  reducerPath: "adminBaseApi",

  baseQuery: fetchBaseQuery({
    baseUrl: "/api/admin",
    credentials: "include",
    prepareHeaders: (headers) => {
      headers.set("Accept", "application/json");
      return headers;
    },
  }),

  tagTypes: [
    "Allergen",
    "DietaryType",
    "MedicalCondition",
    "AdminUser",
    "AdminProfile",
    "Store",
    "Shop",
    "MenuItem",
    "Ingredient",
    "Restaurant",
    "Banner",
    "Dashboard",
    "FoodType",
    "Drink",
    "Feedback",
    "SeasonalFood",
    "FoodByArea",
    "DynamicContent",
  ],

  endpoints: () => ({}),
});
