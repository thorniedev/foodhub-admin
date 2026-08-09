import type { ReactNode } from "react";
import { Building2, DollarSign, ShieldCheck } from "lucide-react";
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
    <section className="rounded-[24px] border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2 font-black text-gray-900">
        <span className="text-[#137A3D]">{icon}</span>
        {title}
      </div>
      {children}
    </section>
  );
}
export default function StoreOverviewSection({ store }: { store: Store }) {
  return (
    <Section title="Store overview" icon={<Building2 size={18} />}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Info label="Store name" value={store.storeName} />
        <Info label="Country" value={store.countryCode} />
        <Info
          label="Price level"
          value={formatPriceLevel(store.priceLevel)}
          icon={<DollarSign size={14} />}
        />
        <Info
          label="Hygiene rating"
          value={formatRating(store.hygieneRating)}
          icon={<ShieldCheck size={14} />}
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
        />
      </div>
      <div className="mt-4 rounded-2xl bg-gray-50 px-4 py-4">
        <p className="text-xs font-black uppercase tracking-wide text-gray-400">
          Description
        </p>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-600">
          {store.description || "—"}
        </p>
      </div>
    </Section>
  );
}
function Info({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-gray-50 px-4 py-3">
      <p className="text-xs font-black uppercase tracking-wide text-gray-400">
        {label}
      </p>
      <p className="mt-1 flex items-center gap-1.5 text-sm font-black text-gray-700">
        {icon}
        {value}
      </p>
    </div>
  );
}
