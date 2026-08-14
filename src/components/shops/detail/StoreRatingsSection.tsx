import type { ReactNode } from "react";

import { BadgeCheck, MessageSquareText, ShieldCheck, Star } from "lucide-react";

import type { Store } from "@/src/types/shop";

import { formatRating } from "@/src/lib/shopFormat";

import { Section } from "./StoreOverviewSection";

/* =========================================================
   STORE RATINGS
========================================================= */

export default function StoreRatingsSection({ store }: { store: Store }) {
  const reviewStatus = store.reviewStatus || "UNKNOWN";

  return (
    <Section title="Ratings & review state" icon={<Star size={22} />}>
      <div
        className="
          grid
          gap-4
          sm:grid-cols-2
        "
      >
        {/* Average rating */}
        <StatCard
          label="Average rating"
          value={formatRating(store.averageRating)}
          icon={<Star size={22} />}
          variant="rating"
          helper="Overall customer rating"
        />

        {/* Total reviews */}
        <StatCard
          label="Total reviews"
          value={String(store.totalReviews ?? 0)}
          icon={<MessageSquareText size={22} />}
          helper="Customer feedback received"
        />

        {/* Hygiene */}
        <StatCard
          label="Hygiene rating"
          value={formatRating(store.hygieneRating)}
          icon={<ShieldCheck size={22} />}
          variant="primary"
          helper="Store hygiene score"
        />

        {/* Review status */}
        <ReviewStatusCard status={reviewStatus} />
      </div>
    </Section>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  label,
  value,
  icon,
  helper,
  variant = "default",
}: {
  label: string;
  value: string;
  icon: ReactNode;
  helper: string;
  variant?: "default" | "primary" | "rating";
}) {
  const iconStyle =
    variant === "rating"
      ? "bg-secondary-50 text-secondary-600"
      : variant === "primary"
        ? "bg-primary-50 text-primary-800"
        : "bg-gray-100 text-gray-500";

  const valueStyle =
    variant === "rating"
      ? "text-secondary-600"
      : variant === "primary"
        ? "text-primary-800"
        : "text-gray-900";

  return (
    <div
      className="
        group
        flex
        min-w-0
        items-center
        gap-4
        rounded-2xl
        border
        border-gray-100
        bg-gray-50/50
        p-5
        transition
        hover:border-gray-200
        hover:bg-white
        hover:shadow-sm
      "
    >
      {/* Icon */}
      <div
        className={`
          flex
          h-12
          w-12
          shrink-0
          items-center
          justify-center
          rounded-xl
          transition
          ${iconStyle}
        `}
      >
        {icon}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p
          className="
            text-lg
            font-medium
            text-gray-500
          "
        >
          {label}
        </p>

        <div
          className="
            mt-1
            flex
            items-end
            gap-2
          "
        >
          <p
            className={`
              truncate
              text-2xl
              font-semibold
              ${valueStyle}
            `}
            title={value}
          >
            {value}
          </p>

          {variant === "rating" && (
            <Star
              size={19}
              className="
                mb-1
                fill-secondary-500
                text-secondary-500
              "
            />
          )}
        </div>

        {/* <p
          className="
            mt-1
            truncate
            text-base
            text-gray-400
          "
        >
          {helper}
        </p> */}
      </div>
    </div>
  );
}

/* =========================================================
   REVIEW STATUS
========================================================= */

function ReviewStatusCard({ status }: { status: string }) {
  const normalized = String(status).toUpperCase();

  const approved = normalized === "APPROVED";

  const rejected = normalized === "REJECTED";

  const iconStyle = approved
    ? "bg-primary-50 text-primary-700"
    : rejected
      ? "bg-red-50 text-red-500"
      : "bg-gray-100 text-gray-500";

  const badgeStyle = approved
    ? "bg-primary-50 text-primary-700 ring-primary-100"
    : rejected
      ? "bg-red-50 text-red-600 ring-red-100"
      : "bg-gray-100 text-gray-600 ring-gray-200";

  const dotStyle = approved
    ? "bg-primary-600"
    : rejected
      ? "bg-red-500"
      : "bg-gray-400";

  return (
    <div
      className="
        group
        flex
        min-w-0
        items-center
        gap-4
        rounded-2xl
        border
        border-gray-100
        bg-gray-50/50
        p-5
        transition
        hover:border-gray-200
        hover:bg-white
        hover:shadow-sm
      "
    >
      {/* Icon */}
      <div
        className={`
          flex
          h-12
          w-12
          shrink-0
          items-center
          justify-center
          rounded-xl
          ${iconStyle}
        `}
      >
        <BadgeCheck size={22} />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p
          className="
            text-lg
            font-medium
            text-gray-500
          "
        >
          Review status
        </p>

        <div className="mt-2">
          <span
            className={`
              inline-flex
              items-center
              gap-2
              rounded-full
              px-3.5
              py-1.5
              text-lg
              font-medium
              ring-1
              ring-inset
              ${badgeStyle}
            `}
          >
            <span
              className={`
                h-2
                w-2
                shrink-0
                rounded-full
                ${dotStyle}
              `}
            />

            {normalized}
          </span>
        </div>

        {/* <p
          className="
            mt-2
            text-base
            text-gray-400
          "
        >
          Current verification state
        </p> */}
      </div>
    </div>
  );
}
