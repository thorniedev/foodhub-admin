import { Suspense } from "react";

import AdminDashboardPage from "@/src/components/dashboard/AdminDashboardPage";
import DashboardLoadingSkeleton from "@/src/components/dashboard/DashboardLoadingSkeleton";

export const metadata = {
  title: "ទិន្នន័យវិភាគ | MhouBahar Admin",
};

export default function DashboardHomePage() {
  // The dashboard reads its filters from the URL, so it needs a Suspense
  // boundary for useSearchParams during prerendering.
  return (
    <Suspense fallback={<DashboardLoadingSkeleton />}>
      <AdminDashboardPage />
    </Suspense>
  );
}
