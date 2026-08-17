import type { ReactNode } from "react";
import { BadgeCheck, MessageSquareText, ShieldCheck, Star } from "lucide-react";
import type { Store } from "@/src/types/shop";
import { formatRating } from "@/src/lib/shopFormat";
import { Section } from "./StoreOverviewSection";

export default function StoreRatingsSection({ store }: { store: Store }) {
  const reviewStatus = store.reviewStatus || "UNKNOWN";

  return (
    <Section title="Ratings & review state" icon={<Star size={24} />}>
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Average rating */}
        <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4 transition hover:bg-gray-50">
          <p className="flex items-center gap-1.5 text-lg font-bold uppercase tracking-wider text-gray-400">
            <Star size={18} />
            Average rating
          </p>
          <div className="mt-2 flex items-center gap-2">
            <p className="text-xl font-bold text-amber-600">
              {formatRating(store.averageRating)}
            </p>
            <Star size={20} className="fill-amber-500 text-amber-500" />
          </div>
        </div>

        {/* Total reviews */}
        <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4 transition hover:bg-gray-50">
          <p className="flex items-center gap-1.5 text-lg font-bold uppercase tracking-wider text-gray-400">
            <MessageSquareText size={18} />
            Total reviews
          </p>
          <p className="mt-2 text-xl font-bold text-gray-900">
            {String(store.totalReviews ?? 0)}
          </p>
        </div>

        {/* Hygiene rating */}
        <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4 transition hover:bg-gray-50">
          <p className="flex items-center gap-1.5 text-lg font-bold uppercase tracking-wider text-gray-400">
            <ShieldCheck size={18} />
            Hygiene rating
          </p>
          <p className="mt-2 text-xl font-bold text-emerald-700">
            {formatRating(store.hygieneRating)}
          </p>
        </div>

        {/* Review status */}
        <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4 transition hover:bg-gray-50">
          <p className="flex items-center gap-1.5 text-lg font-bold uppercase tracking-wider text-gray-400">
            <BadgeCheck size={18} />
            Review status
          </p>
          <div className="mt-2">
            <ReviewStatusBadge status={reviewStatus} />
          </div>
        </div>
      </div>
    </Section>
  );
}

function ReviewStatusBadge({ status }: { status: string }) {
  const normalized = String(status).toUpperCase();
  const approved = normalized === "APPROVED";
  const rejected = normalized === "REJECTED";

  const badgeStyle = approved
    ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
    : rejected
      ? "bg-red-50 text-red-600 ring-red-100"
      : "bg-gray-100 text-gray-600 ring-gray-200";

  const dotStyle = approved
    ? "bg-emerald-600"
    : rejected
      ? "bg-red-500"
      : "bg-gray-400";

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-lg font-bold ring-1 ring-inset ${badgeStyle}`}
    >
      <span className={`h-2 w-2 shrink-0 rounded-full ${dotStyle}`} />
      {normalized}
    </span>
  );
}
