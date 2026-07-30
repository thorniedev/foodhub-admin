import { DashboardData } from "../../types/dashboard";
import { baseApi } from "./baseApi";

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardData: builder.query<DashboardData, void>({
      query: () => "/data/dashboardData.json",
      providesTags: ["Dashboard"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetDashboardDataQuery } = dashboardApi;
