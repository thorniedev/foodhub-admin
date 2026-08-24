import { Utensils } from "lucide-react";

import type { IngredientAvoidResponse } from "@/src/types/userProfile";
import {
  formatAvoidLevelKhmer,
  humanizeEnum,
} from "@/src/lib/userProfileFormat";
import { Section } from "./BasicInfoSection";
import SafetySectionError from "./SafetySectionError";

export default function IngredientAvoidsSection({
  items,
  error,
}: {
  items: IngredientAvoidResponse[];
  error?: unknown;
}) {
  return (
    <Section
      title={
        error && items.length === 0
          ? "គ្រឿងផ្សំដែលត្រូវជៀសវាង"
          : `គ្រឿងផ្សំដែលត្រូវជៀសវាង (${items.length})`
      }
      icon={<Utensils size={22} />}
    >
      <div className="space-y-3">
        {error && <SafetySectionError error={error} />}

        {items.length === 0 ? (
          !error && <Empty />
        ) : (
          items.map((item) => (
            <div
              key={item.uuid}
              className="rounded-2xl border border-secondary-100 bg-secondary-50/40 p-4 transition hover:border-secondary-200 hover:bg-secondary-50/60"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-[18px] font-bold text-gray-900">
                  {item.name}
                </p>

                <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-secondary-600 shadow-2xs ring-1 ring-inset ring-secondary-200">
                  {formatAvoidLevelKhmer(item.avoidLevel)}
                </span>
              </div>

              {item.notes && (
                <p className="mt-2.5 text-base leading-7 text-gray-600">
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
        <Utensils size={16} />
      </div>
      <p className="mt-2 text-base font-medium text-gray-400">
        មិនមានគ្រឿងផ្សំដែលត្រូវជៀសវាងឡើយ
      </p>
    </div>
  );
}
