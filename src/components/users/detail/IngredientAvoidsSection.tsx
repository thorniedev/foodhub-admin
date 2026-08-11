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
      icon={<Utensils size={20} />}
    >
      {items.length === 0 ? (
        <Empty />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.uuid}
              className="rounded-2xl border border-amber-100 bg-amber-50/50 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-gray-900">
                    {item.name}
                  </p>

                  <p className="mt-1 text-base text-gray-400">
                    {item.code}
                  </p>
                </div>

                <span className="rounded-full bg-white px-3 py-1 text-base text-amber-700">
                  {humanizeEnum(item.avoidLevel)}
                </span>
              </div>

              <p className="mt-3 text-base leading-7 text-gray-600">
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
    <div className="rounded-2xl bg-gray-50 px-4 py-6 text-center text-base text-gray-400">
      No ingredient avoids assigned.
    </div>
  );
}
