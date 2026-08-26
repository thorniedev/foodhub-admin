"use client";

import { BadgeCheck, MessageSquareText, ShieldCheck, Star } from "lucide-react";
import type { Store } from "@/src/types/shop";
import { formatRating } from "@/src/lib/shopFormat";
import { Item, Section } from "./StoreOverviewSection";

export default function StoreRatingsSection({ store }: { store: Store }) {
  const ratingNum = Number(store.averageRating || 0);
  const totalReviews = Number(store.totalReviews || 0);
  const reviewStatus = store.reviewStatus || "UNKNOWN";
  const hygieneRating = Number(store.hygieneRating || 0);

  return (
    <Section title="ការវាយតម្លៃ & ស្ថានភាពពិនិត្យ" icon={<Star size={22} />}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Item
          label="ពិន្ទុវាយតម្លៃមធ្យម"
          customValue={
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-amber-600">
                {ratingNum > 0 ? ratingNum.toFixed(1) : "0.0"}
              </span>
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={16}
                    className={
                      star <= Math.round(ratingNum)
                        ? "fill-amber-400 text-amber-400"
                        : "fill-gray-200 text-gray-200"
                    }
                  />
                ))}
              </div>
            </div>
          }
          icon={<Star size={19} />}
        />

        <Item
          label="ចំនួនការវាយតម្លៃសរុប"
          value={`${totalReviews} មតិ`}
          icon={<MessageSquareText size={19} />}
        />

        <Item
          label="កម្រិតអនាម័យ"
          value={hygieneRating > 0 ? `${formatRating(store.hygieneRating)} / 5.0` : "មិនមានកំណត់"}
          icon={<ShieldCheck size={19} />}
        />

        <Item
          label="ស្ថានភាពពិនិត្យ"
          customValue={
            <ReviewStatusBadge status={reviewStatus} />
          }
          icon={<BadgeCheck size={19} />}
        />
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
      : "bg-amber-50 text-amber-700 ring-amber-200";

  const dotStyle = approved
    ? "bg-emerald-600"
    : rejected
      ? "bg-red-500"
      : "bg-amber-500";

  const labelKhmer = approved
    ? "បានអនុម័ត"
    : rejected
      ? "បានបដិសេធ"
      : "កំពុងរង់ចាំពិនិត្យ";

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-bold ring-1 ring-inset ${badgeStyle}`}
    >
      <span className={`h-2 w-2 shrink-0 rounded-full ${dotStyle}`} />
      {labelKhmer}
    </span>
  );
}
