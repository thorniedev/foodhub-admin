// import StatCard from "@/components/dashboard/StatCard";
// import { getDashboardData } from "@/lib/getDashboardData";

// import StatCard from "../../components/dashboard/StatCard";
// import { getDashboardData } from "../../lib/getDashboardData";

// export default async function StatsSlot() {
//   const data = await getDashboardData();

//   return (
//     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
//       {data.stats.map((stat) => (
//         <StatCard key={stat.id} data={stat} />
//       ))}
//     </div>
//   );
// }


// import StatCard from "../../components/dashboard/StatCard";
// import { getDashboardData } from "../../lib/getDashboardData";

// export default async function StatsSlot() {
//   const data = await getDashboardData();

//   return (
//     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
//       {data.stats.map((stat) => (
//         <StatCard key={stat.id} data={stat} />
//       ))}
//     </div>
//   );
// }


"use client";

import UserStatusChart from "../../components/dashboard/UserStatusChart";
import { useGetDashboardDataQuery } from "../store/dashboardApi";
// import { useGetDashboardDataQuery } from "../../store/dashboardApi";

export default function StatusSlot() {
  const { data, isLoading } = useGetDashboardDataQuery();

  if (isLoading || !data) return null;

  return <UserStatusChart data={data.userStatus} />;
}