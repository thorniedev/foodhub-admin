"use client";

import { useGetDashboardDataQuery } from "@/src/app/store/dashboardApi";
import OrdersChart from "@/src/components/dashboard/OrdersChart";

export default function OrdersSlot() {
  const { data, isLoading } = useGetDashboardDataQuery();

  if (isLoading || !data) return null;

  return <OrdersChart data={data.ordersOverTime} />;
}