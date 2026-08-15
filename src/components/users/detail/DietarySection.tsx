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
      icon={<Salad size={22} />}
    >
      {items.length === 0 ? (
        <Empty />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.uuid}
              className="rounded-2xl border border-gray-100 bg-gray-50/60 p-4 transition hover:border-gray-200 hover:bg-gray-50"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-gray-900">
                    {item.name}
                  </p>

                  <p className="mt-1 text-lg text-gray-500">
                    {item.code} · {humanizeEnum(item.category)}
                  </p>
                </div>

                <span className="rounded-full bg-primary-50 px-3.5 py-1.5 text-lg font-medium text-primary-700 ring-1 ring-inset ring-primary-100">
                  {humanizeEnum(item.enforcementLevel)}
                </span>
              </div>

              <p className="mt-3 text-lg leading-8 text-gray-600">
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
    <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 px-4 py-8 text-center text-lg text-gray-400">
      No dietary types assigned.
    </div>
  );
}
