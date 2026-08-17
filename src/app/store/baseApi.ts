import {
  BaseQueryFn,
  createApi,
  FetchArgs,
  fetchBaseQuery,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";

import {
  getAuthAccessToken,
  refreshAuthAccessToken,
} from "../../lib/authSession";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: "",
  prepareHeaders: (headers) => {
    const token = getAuthAccessToken();

    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }

    return headers;
  },
});

const baseQueryWithAuth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    const refreshed = await refreshAuthAccessToken();

    if (refreshed) {
      result = await rawBaseQuery(args, api, extraOptions);
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "",

  baseQuery: baseQueryWithAuth,

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
