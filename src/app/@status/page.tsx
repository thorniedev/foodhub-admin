// import UserStatusChart from "@/components/dashboard/UserStatusChart";
// import { getDashboardData } from "@/lib/getDashboardData";

// import UserStatusChart from "../../components/dashboard/UserStatusChart";
// import { getDashboardData } from "../../lib/getDashboardData";

// export default async function StatusSlot() {
//   const data = await getDashboardData();
//   return <UserStatusChart data={data.userStatus} />;
// }



// import { redirect } from "next/navigation";

// export default function RootPage() {
//   redirect("/dashboard");
// }




// import UserStatusChart from "../../components/dashboard/UserStatusChart";
// import { getDashboardData } from "../../lib/getDashboardData";

// export default async function StatusSlot() {
//   const data = await getDashboardData();
//   return <UserStatusChart data={data.userStatus} />;
// }



"use client";

import StatCard from "../../components/dashboard/StatCard";
import { useGetDashboardDataQuery } from "../store/dashboardApi";
// import { useGetDashboardDataQuery } from "../../store/dashboardApi";

export default function StatsSlot() {
  const { data, isLoading } = useGetDashboardDataQuery();

  if (isLoading || !data) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {data.stats.map((stat) => (
        <StatCard key={stat.id} data={stat} />
      ))}
    </div>
  );
}