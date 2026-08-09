import { Fingerprint } from "lucide-react";
import type { Store } from "@/src/types/shop";
import { Section } from "./StoreOverviewSection";
export default function StoreSystemInfoSection({ store }: { store: Store }) {
  const rows = [
    ["Store UUID", store.uuid],
    ["Review status", store.reviewStatus],
    ["Account status", store.accountStatus],
    ["Operating status", store.operatingStatus],
    ...(store.createdAt ? [["Created at", store.createdAt]] : []),
    ...(store.updatedAt ? [["Updated at", store.updatedAt]] : []),
  ];
  return (
    <Section title="System information" icon={<Fingerprint size={18} />}>
      <div className="space-y-3">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="grid gap-1 rounded-2xl bg-gray-50 px-4 py-3 sm:grid-cols-[140px_1fr]"
          >
            <span className="text-xs font-black uppercase text-gray-400">
              {label}
            </span>
            <span
              className={`break-all text-sm font-bold text-gray-700 ${label.includes("UUID") ? "font-mono text-xs" : ""}`}
            >
              {value}
            </span>
          </div>
        ))}
      </div>
    </Section>
  );
}
