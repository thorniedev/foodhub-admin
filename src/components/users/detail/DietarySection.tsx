import { Salad } from "lucide-react";

import type { DietaryTypeResponse } from "@/src/types/userProfile";
import {
  formatDietaryCategoryKhmer,
  formatEnforcementLevelKhmer,
} from "@/src/lib/userProfileFormat";
import { Section } from "./BasicInfoSection";
import SafetySectionError from "./SafetySectionError";

export default function DietarySection({
  items,
  error,
}: {
  items: DietaryTypeResponse[];
  error?: unknown;
}) {
  return (
    <Section
      title={
        error && items.length === 0
          ? "របបអាហារ"
          : `របបអាហារ (${items.length})`
      }
      icon={<Salad size={22} />}
    >
      <div className="space-y-3">
        {error && <SafetySectionError error={error} />}

        {items.length === 0 ? (
          !error && <Empty />
        ) : (
          items.map((item) => (
            <div
              key={item.uuid}
              className="rounded-2xl border border-gray-100 bg-gray-50/60 p-4 transition hover:border-gray-200 hover:bg-gray-50"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[20px] font-bold text-gray-900">
                    {item.name}
                  </p>

                  {item.category && (
                    <p className="mt-1 text-[18px] font-medium text-gray-500">
                      {formatDietaryCategoryKhmer(item.category)}
                    </p>
                  )}
                </div>

                <span className="rounded-full bg-primary-50 px-3 py-1 text-sm font-semibold text-primary-700 ring-1 ring-inset ring-primary-100">
                  {formatEnforcementLevelKhmer(item.enforcementLevel)}
                </span>
              </div>

              {item.notes && (
                <p className="mt-2.5 text-[18px] leading-relaxed text-gray-600">
                  {item.notes}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </Section>
  );
}

function Empty() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/40 py-6 text-center">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-400">
        <Salad size={16} />
      </div>
      <p className="mt-2 text-[18px] font-medium text-gray-400">
        មិនមានរបបអាហារដែលបានកំណត់ឡើយ
      </p>
    </div>
  );
}
