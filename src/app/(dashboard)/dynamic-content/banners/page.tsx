import { Suspense } from "react";
import BannersManager from "../../../../components/dynamic-content/BannersManager";

export default function BannersPage() {
  return (
    <Suspense fallback={null}>
      <BannersManager />
    </Suspense>
  );
}
