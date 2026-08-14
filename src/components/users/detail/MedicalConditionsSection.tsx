import { HeartPulse } from "lucide-react";

import type { MedicalConditionResponse } from "@/src/types/userProfile";
import { humanizeEnum } from "@/src/lib/userProfileFormat";
import { Section } from "./BasicInfoSection";

export default function MedicalConditionsSection({
  items,
}: {
  items: MedicalConditionResponse[];
}) {
  return (
    <Section
      title={`Medical conditions (${items.length})`}
      icon={<HeartPulse size={22} />}
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
                    {item.code}
                  </p>
                </div>

                <span className="rounded-full bg-secondary-50 px-3.5 py-1.5 text-lg font-medium text-secondary-600 ring-1 ring-inset ring-secondary-100">
                  {humanizeEnum(item.severity)}
                </span>
              </div>

              <p className="mt-3 text-lg leading-8 text-gray-600">
                {item.notes || "No notes."}
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
      No medical conditions assigned.
    </div>
  );
}
