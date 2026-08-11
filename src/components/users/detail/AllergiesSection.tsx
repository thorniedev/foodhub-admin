import { Shield } from "lucide-react";

import type { AllergyResponse } from "@/src/types/userProfile";
import { humanizeEnum } from "@/src/lib/userProfileFormat";
import { Section } from "./BasicInfoSection";

export default function AllergiesSection({
  allergies,
}: {
  allergies: AllergyResponse[];
}) {
  return (
    <Section
      title={`Allergies (${allergies.length})`}
      icon={<Shield size={20} />}
    >
      {allergies.length === 0 ? (
        <Empty />
      ) : (
        <div className="space-y-3">
          {allergies.map((item) => (
            <div
              key={item.uuid}
              className="rounded-2xl border border-red-100 bg-red-50/50 p-4"
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

                <span className="rounded-full bg-white px-3 py-1 text-base text-red-600">
                  {humanizeEnum(item.severity)}
                </span>
              </div>

              <p className="mt-3 text-base leading-7 text-gray-600">
                {item.reactionNotes || "No reaction notes."}
              </p>

              <div className="mt-3 flex flex-wrap gap-2 text-sm">
                <span className="rounded-full bg-white px-3 py-1.5 text-gray-600">
                  Cross-contact: {item.avoidCrossContact ? "Avoid" : "No"}
                </span>

                <span className="rounded-full bg-white px-3 py-1.5 text-gray-600">
                  Diagnosed: {item.medicallyDiagnosed ? "Yes" : "No"}
                </span>
              </div>
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
      No allergies assigned.
    </div>
  );
}
