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
    <Section title="System information" icon={<Fingerprint size={20} />}>
      <div className="space-y-3">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="grid gap-1 rounded-2xl bg-gray-50 px-4 py-3 sm:grid-cols-[160px_1fr]"
          >
            <span className="text-lg font-semibold text-[#F97316]">{label}</span>
            <span
              className={`break-all text-base text-gray-700 ${
                label.includes("UUID") ? "font-mono text-sm" : ""
              }`}
            >
              {value}
            </span>
          </div>
        ))}
      </div>
    </Section>
  );
}
