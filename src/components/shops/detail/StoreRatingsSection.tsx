import { Star } from "lucide-react";
import type { Store } from "@/src/types/shop";
import { formatRating } from "@/src/lib/shopFormat";
import { Section } from "./StoreOverviewSection";
export default function StoreRatingsSection({ store }: { store: Store }) {
  return (
    <Section title="Ratings & review state" icon={<Star size={18} />}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Card
          label="Average rating"
          value={formatRating(store.averageRating)}
        />
        <Card label="Total reviews" value={String(store.totalReviews ?? 0)} />
        <Card
          label="Hygiene rating"
          value={formatRating(store.hygieneRating)}
        />
        <Card label="Review status" value={store.reviewStatus} />
      </div>
   
    </Section>
  );
}
function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-emerald-50/70 px-4 py-4">
      <p className="text-xs font-black uppercase text-emerald-600">{label}</p>
      <p className="mt-1 text-lg font-black text-[#137A3D]">{value}</p>
    </div>
  );
}
