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
  // The proxy route can take a while to refresh a token and retry the
  // backend call. Without a client-side cap, a wedged upstream leaves the
  // query on isLoading forever instead of surfacing a retryable error.
  timeout: 20_000,
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
  // Different admins edit the same data from separate browser sessions, so
  // this session's RTK Query cache can go stale the moment another admin
  // saves a change elsewhere. refetchOnFocus/refetchOnReconnect (paired with
  // setupListeners in Providers.tsx) refetch active queries when this tab
  // regains focus or the network reconnects, instead of only on remount.
  refetchOnFocus: true,
  refetchOnReconnect: true,
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
