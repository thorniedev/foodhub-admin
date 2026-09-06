import {
  BaseQueryFn,
  createApi,
  FetchArgs,
  fetchBaseQuery,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";

import { redirectToAdminLogin } from "../../lib/redirectToAdminLogin";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: "",
  credentials: "include",
  // See adminBaseApi.ts: caps how long a wedged proxy/backend can leave a
  // query on isLoading before it fails visibly instead of hanging forever.
  timeout: 20_000,
  prepareHeaders: (headers) => {
    headers.set("Accept", "application/json");

    return headers;
  },
});

const baseQueryWithAuth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  // The proxy route (/api/[...all]) already refreshes and retries once
  // server-side using the httpOnly cookies, so a 401 that survives that
  // retry is terminal for this browser session. Restart the OAuth flow
  // instead of leaving every caller stuck in an error state with no way
  // back to login.
  if (result.error?.status === 401) {
    redirectToAdminLogin();
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "",

  baseQuery: baseQueryWithAuth,

  // See adminBaseApi.ts: refetch on focus/reconnect so edits made by other
  // admins in a different session become visible without a full reload.
  refetchOnFocus: true,
  refetchOnReconnect: true,

  tagTypes: [
    "Shop",
    "User",
    "Order",
    "Category",
    "FoodType",
    "Drink",
    "DynamicContent",
    "FilterGroup",
    "Banner",
    "SeasonalFood",
    "FoodByArea",
    "Dashboard",
    "result",
    "Restaurant",
    "MenuItem",
    "Food",
    "Allergen",
    "Cuisine",
    "FoodCategory",
    "MealType",
    "WeatherCondition",
  ],

  endpoints: () => ({}),
});
