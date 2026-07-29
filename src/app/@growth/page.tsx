"use client";

import UserGrowthChart from "../../components/dashboard/UserGrowthChart";
import { useGetDashboardDataQuery } from "../store/dashboardApi";
// import { useGetDashboardDataQuery } from "../../store/dashboardApi";

export default function GrowthSlot() {
  const { data, isLoading } = useGetDashboardDataQuery();

  if (isLoading || !data) return null;

  return <UserGrowthChart data={data.userGrowth} />;
}