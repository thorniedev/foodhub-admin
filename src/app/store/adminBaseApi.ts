import {
  type BaseQueryFn,
  createApi,
  type FetchArgs,
  type FetchBaseQueryError,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";

import { redirectToAdminLogin } from "@/src/lib/redirectToAdminLogin";

/**
 * Browser requests go to the admin Next.js application first.
 * /api/admin/[...path] reads the HTTP-only Keycloak token and forwards it to
 * the FoodHub backend as Authorization: Bearer <token>.
 */
const rawAdminBaseQuery = fetchBaseQuery({
  baseUrl: "/api/admin",
  credentials: "include",
  prepareHeaders: (headers) => {
    headers.set("Accept", "application/json");
    return headers;
  },
});

const adminBaseQueryWithSessionRedirect: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await rawAdminBaseQuery(args, api, extraOptions);

  // The server route already refreshed and retried once. A remaining 401 is
  // terminal for this browser session, so restart the OAuth flow.
  if (result.error?.status === 401) {
    redirectToAdminLogin();
  }

  return result;
};

export const adminBaseApi = createApi({
  reducerPath: "adminBaseApi",
  baseQuery: adminBaseQueryWithSessionRedirect,
  tagTypes: [
    "Allergen",
    "DietaryType",
    "MedicalCondition",
    "AdminUser",
    "AdminProfile",
    "Store",
    "Shop",
    "MenuItem",
    "Food",
    "FoodCategory",
    "Cuisine",
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
