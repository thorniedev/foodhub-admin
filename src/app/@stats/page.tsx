"use client";

import UserStatusChart from "../../components/dashboard/UserStatusChart";
import { useGetDashboardDataQuery } from "../store/dashboardApi";
// import { useGetDashboardDataQuery } from "../../store/dashboardApi";

export default function StatusSlot() {
  const { data, isLoading } = useGetDashboardDataQuery();

  if (isLoading || !data) return null;

  return <UserStatusChart data={data.userStatus} />;
}