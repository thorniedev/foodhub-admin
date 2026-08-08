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
    <Section title={`Medical conditions (${items.length})`} icon={<HeartPulse size={18} />}>
      {items.length === 0 ? (
        <Empty />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.uuid} className="rounded-2xl border border-orange-100 bg-orange-50/50 p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-black text-gray-900">{item.name}</p>
                  <p className="mt-0.5 text-xs font-bold text-gray-400">{item.code}</p>
                </div>
                <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-orange-700">
                  {humanizeEnum(item.severity)}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-gray-600">
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
  return <div className="rounded-2xl bg-gray-50 px-4 py-6 text-center text-sm text-gray-400">No medical conditions assigned.</div>;
}
