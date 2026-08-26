import { DashboardData } from "../../types/dashboard";
import { baseApi } from "./baseApi";
import { fetchFileMockJson, mockDataDisabledError } from "./mockDataGuard";

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardData: builder.query<DashboardData, void>({
      queryFn: async () => {
        try {
          const data = await fetchFileMockJson<DashboardData>(
            "/data/dashboardData.json",
            "Dashboard",
          );
          return { data };
        } catch (error) {
          return {
            error:
              error instanceof Error
                ? { status: 403, data: error.message }
                : mockDataDisabledError("Dashboard"),
          };
        }
      },
      providesTags: ["Dashboard"],
    }),
  }),
  overrideExisting: true,
});

export const { useGetDashboardDataQuery } = dashboardApi;
