"use client";

import { useGetDashboardDataQuery } from "@/src/app/store/dashboardApi";
import UserStatusChart from "@/src/components/dashboard/UserStatusChart";


// import { useGetDashboardDataQuery } from "../../store/dashboardApi";

export default function StatusSlot() {
  const { data, isLoading } = useGetDashboardDataQuery();

  if (isLoading || !data) return null;

  return <UserStatusChart data={data.userStatus} />;
}