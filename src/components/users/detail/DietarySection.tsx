import { Salad } from "lucide-react";

import type { DietaryTypeResponse } from "@/src/types/userProfile";
import { humanizeEnum } from "@/src/lib/userProfileFormat";
import { Section } from "./BasicInfoSection";

export default function DietarySection({
  items,
}: {
  items: DietaryTypeResponse[];
}) {
  return (
    <Section
      title={`Dietary types (${items.length})`}
      icon={<Salad size={20} />}
    >
      {items.length === 0 ? (
        <Empty />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.uuid}
              className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-gray-900">
                    {item.name}
                  </p>

                  <p className="mt-1 text-base text-gray-400">
                    {item.code} · {humanizeEnum(item.category)}
                  </p>
                </div>

                <span className="rounded-full bg-white px-3 py-1 text-base text-[#137A3D]">
                  {humanizeEnum(item.enforcementLevel)}
                </span>
              </div>

              <p className="mt-3 text-base leading-7 text-gray-600">
                Priority: {item.priority ?? "—"} · {item.notes || "No notes"}
              </p>
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}

function Empty() {
  return (
    <div className="rounded-2xl bg-gray-50 px-4 py-6 text-center text-base text-gray-400">
      No dietary types assigned.
    </div>
  );
}
