import type { ReactNode } from "react";
import { Building2, DollarSign, Globe, MapPin, ShieldCheck, Tag, Clock, CheckCircle } from "lucide-react";
import type { Store } from "@/src/types/shop";
import { formatPriceLevel, formatRating } from "@/src/lib/shopFormat";

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
    <section className="rounded-[32px] border border-gray-100 bg-white p-6 shadow-sm sm:p-7">
      <div className="mb-6 flex items-center gap-3.5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
          {icon}
        </div>

        <p className="text-2xl font-bold text-gray-900 sm:text-3xl">
          {title}
        </p>
      </div>

      {children}
    </section>
  );
}

export default function StoreOverviewSection({ store }: { store: Store }) {
  return (
    <Section title="Store overview" icon={<Building2 size={24} />}>
      <div className="grid gap-4 sm:grid-cols-2">
        <InfoCard
          label="Store name"
          value={store.storeName || "—"}
          icon={<Tag size={18} />}
        />

        <InfoCard
          label="Country"
          value={store.countryCode || "—"}
          icon={<Globe size={18} />}
        />

        <InfoCard
          label="Price level"
          value={formatPriceLevel(store.priceLevel)}
          icon={<DollarSign size={18} />}
        />

        <InfoCard
          label="Hygiene rating"
          value={formatRating(store.hygieneRating)}
          icon={<ShieldCheck size={18} />}
        />

        <InfoCard
          label="Timezone"
          value={store.timezone || "—"}
          icon={<Clock size={18} />}
        />

        <InfoCard
          label="Open now"
          value={
            store.isOpenNow === null
              ? "Unknown"
              : store.isOpenNow
                ? "Yes"
                : "No"
          }
          icon={<CheckCircle size={18} />}
          status={
            store.isOpenNow === true
              ? "success"
              : store.isOpenNow === false
                ? "danger"
                : "default"
          }
        />

        {/* Description Full Width */}
        <div className="col-span-full rounded-2xl border border-gray-100 bg-gray-50/70 p-5 transition hover:bg-gray-50">
          <p className="text-lg font-bold uppercase tracking-wider text-gray-400">
            Description
          </p>

          <p className="mt-2 whitespace-pre-wrap text-lg font-medium leading-relaxed text-gray-800">
            {store.description || "—"}
          </p>
        </div>
      </div>
    </Section>
  );
}

function InfoCard({
  label,
  value,
  icon,
  status = "default",
}: {
  label: string;
  value: string;
  icon?: ReactNode;
  status?: "default" | "success" | "danger";
}) {
  const valueColor =
    status === "success"
      ? "text-emerald-600"
      : status === "danger"
        ? "text-red-600"
        : "text-gray-900";

  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4 transition hover:bg-gray-50">
      <p className="flex items-center gap-1.5 text-lg font-bold uppercase tracking-wider text-gray-400">
        {icon}
        {label}
      </p>

      <p className={`mt-2 truncate text-xl font-bold ${valueColor}`} title={value}>
        {value}
      </p>
    </div>
  );
}
