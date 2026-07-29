// import OrdersChart from "@/components/dashboard/OrdersChart";
// import { getDashboardData } from "@/lib/getDashboardData";

// import OrdersChart from "../../components/dashboard/OrdersChart";
// import { getDashboardData } from "../../lib/getDashboardData";

// export default async function OrdersSlot() {
//   const data = await getDashboardData();
//   return <OrdersChart data={data.ordersOverTime} />;
// }



// import OrdersChart from "../../components/dashboard/OrdersChart";
// import { getDashboardData } from "../../lib/getDashboardData";

// export default async function OrdersSlot() {
//   const data = await getDashboardData();
//   return <OrdersChart data={data.ordersOverTime} />;
// }
"use client";

import OrdersChart from "../../components/dashboard/OrdersChart";
import { useGetDashboardDataQuery } from "../store/dashboardApi";
// import { useGetDashboardDataQuery } from "../../store/dashboardApi";

export default function OrdersSlot() {
  const { data, isLoading } = useGetDashboardDataQuery();

  if (isLoading || !data) return null;

  return <OrdersChart data={data.ordersOverTime} />;
}