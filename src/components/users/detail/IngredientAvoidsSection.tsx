import { Utensils } from "lucide-react";

import type { IngredientAvoidResponse } from "@/src/types/userProfile";
import { humanizeEnum } from "@/src/lib/userProfileFormat";
import { Section } from "./BasicInfoSection";

export default function IngredientAvoidsSection({
  items,
}: {
  items: IngredientAvoidResponse[];
}) {
  return (
    <Section
      title={`Ingredient avoids (${items.length})`}
      icon={<Utensils size={22} />}
    >
      {items.length === 0 ? (
        <Empty />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.uuid}
              className="rounded-2xl border border-secondary-100 bg-secondary-50/40 p-4 transition hover:border-secondary-200 hover:bg-secondary-50/60"
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

                <span className="rounded-full bg-white px-3.5 py-1.5 text-lg font-medium text-secondary-600 ring-1 ring-inset ring-secondary-100">
                  {humanizeEnum(item.avoidLevel)}
                </span>
              </div>

              <p className="mt-3 text-lg leading-8 text-gray-600">
                Reason: {humanizeEnum(item.reasonCode)} ·{" "}
                {item.notes || "No notes"}
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
      No ingredient avoids assigned.
    </div>
  );
}
