import { Suspense } from "react";
import { BannersView } from "@/src/components/banners";

export const metadata = {
  title: "Banner Management | FoodHub Admin",
  description: "Manage marketing and dynamic banners across FoodHub apps",
};

export default function DashboardAdminBannersPage() {
  return (
    <Suspense fallback={null}>
      <BannersView />
    </Suspense>
  );
}
