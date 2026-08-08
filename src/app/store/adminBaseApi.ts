import {
  BaseQueryFn,
  createApi,
  fetchBaseQuery,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";

import {
  getAuthAccessToken,
  refreshAuthSession,
} from "@/src/lib/authSession";

const ADMIN_API_BASE_URL =
  process.env.NEXT_PUBLIC_ADMIN_API_URL ??
  "http://localhost:7070/api/v1/admin";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: ADMIN_API_BASE_URL,

  prepareHeaders: (headers) => {
    const token = getAuthAccessToken();

    console.log("[ADMIN API AUTH]", {
      hasToken: Boolean(token),
    });

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    headers.set("Content-Type", "application/json");

    return headers;
  },
});

const baseQueryWithAuth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  // Access token may have expired.
  if (result.error?.status === 401) {
    console.warn("[ADMIN API] 401 received. Refreshing token...");

    const refreshed = await refreshAuthSession();

    if (refreshed) {
      console.log("[ADMIN API] Token refreshed. Retrying request.");

      result = await rawBaseQuery(args, api, extraOptions);
    } else {
      console.error("[ADMIN API] Token refresh failed.");
    }
  }

  return result;
};

export const adminBaseApi = createApi({
  reducerPath: "adminBaseApi",

  baseQuery: baseQueryWithAuth,

  tagTypes: [
    "Allergen",
    "DietaryType",
    "MedicalCondition",
  ],

  endpoints: () => ({}),
});