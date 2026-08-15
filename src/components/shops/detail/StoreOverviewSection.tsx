import type { ReactNode } from "react";

import { Building2, DollarSign, ShieldCheck } from "lucide-react";

import type { Store } from "@/src/types/shop";

import { formatPriceLevel, formatRating } from "@/src/lib/shopFormat";

/* =========================================================
   SECTION
========================================================= */

export function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <section
      className="
        rounded-2xl
        border
        border-gray-100
        bg-white
        p-5
        sm:p-6
      "
    >
      <div
        className="
          mb-6
          flex
          items-center
          gap-3
        "
      >
        <div
          className="
            flex
            h-11
            w-11
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-primary-50
            text-primary-800
          "
        >
          {icon}
        </div>

        <p
          className="
            text-2xl
            font-semibold
            text-primary-800
          "
        >
          {title}
        </p>
      </div>

      {children}
    </section>
  );
}

/* =========================================================
   STORE OVERVIEW
========================================================= */

export default function StoreOverviewSection({ store }: { store: Store }) {
  return (
    <Section title="Store overview" icon={<Building2 size={22} />}>
      <div
        className="
          grid
          gap-4
          sm:grid-cols-2
        "
      >
        <Info label="Store name" value={store.storeName} />

        <Info label="Country" value={store.countryCode} />

        <Info
          label="Price level"
          value={formatPriceLevel(store.priceLevel)}
          icon={<DollarSign size={20} />}
          accent
        />

        <Info
          label="Hygiene rating"
          value={formatRating(store.hygieneRating)}
          icon={<ShieldCheck size={20} />}
          accent
        />

        <Info label="Timezone" value={store.timezone} />

        <Info
          label="Open now"
          value={
            store.isOpenNow === null
              ? "Unknown"
              : store.isOpenNow
                ? "Yes"
                : "No"
          }
          status={
            store.isOpenNow === true
              ? "success"
              : store.isOpenNow === false
                ? "danger"
                : "default"
          }
        />
      </div>

      {/* Description */}
      <div
        className="
          mt-5
          rounded-2xl
          border
          border-gray-100
          bg-gray-50/60
          px-5
          py-4
        "
      >
        <p
          className="
            text-lg
            font-medium
            text-primary-800
          "
        >
          Description
        </p>

        <p
          className="
            mt-2
            whitespace-pre-wrap
            text-lg
            leading-8
            text-gray-600
          "
        >
          {store.description || "—"}
        </p>
      </div>
    </Section>
  );
}

/* =========================================================
   INFO
========================================================= */

function Info({
  label,
  value,
  icon,
  accent = false,
  status = "default",
}: {
  label: string;
  value: string;
  icon?: ReactNode;
  accent?: boolean;
  status?: "default" | "success" | "danger";
}) {
  const valueStyle =
    status === "success"
      ? "text-primary-700"
      : status === "danger"
        ? "text-red-600"
        : "text-gray-800";

  return (
    <div
      className="
        flex
        min-w-0
        items-center
        gap-4
        rounded-2xl
        border
        border-gray-100
        bg-gray-50/60
        p-4
        transition
        hover:border-gray-200
        hover:bg-gray-50
      "
    >
      {icon && (
        <div
          className={`
            flex
            h-11
            w-11
            shrink-0
            items-center
            justify-center
            rounded-xl
            ${
              accent
                ? "bg-secondary-50 text-secondary-600"
                : "bg-primary-50 text-primary-800"
            }
          `}
        >
          {icon}
        </div>
      )}

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

        <p
          className={`
            mt-1
            truncate
            text-lg
            font-semibold
            ${valueStyle}
          `}
          title={value}
        >
          {value}
        </p>
      </div>
    </div>
  );
}
