import { Shield } from "lucide-react";

import type { AllergyResponse } from "@/src/types/userProfile";
import { formatSeverityKhmer } from "@/src/lib/userProfileFormat";
import { Section } from "./BasicInfoSection";
import SafetySectionError from "./SafetySectionError";

export default function AllergiesSection({
  allergies,
  error,
}: {
  allergies: AllergyResponse[];
  error?: unknown;
}) {
  return (
    <Section
      title={
        error && allergies.length === 0
          ? "ប្រតិកម្មអាលែហ្សី"
          : `ប្រតិកម្មអាលែហ្សី (${allergies.length})`
      }
      icon={<Shield size={22} />}
    >
      <div className="space-y-3">
        {error && <SafetySectionError error={error} />}

        {allergies.length === 0 ? (
          !error && <Empty />
        ) : (
          allergies.map((item) => (
            <div
              key={item.uuid}
              className="rounded-2xl border border-red-100 bg-red-50/40 p-4 transition hover:border-red-200 hover:bg-red-50/60"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-lg font-bold text-gray-900">
                  {item.name}
                </p>

                <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-red-600 shadow-2xs ring-1 ring-inset ring-red-200">
                  {formatSeverityKhmer(item.severity)}
                </span>
              </div>

              {item.reactionNotes && (
                <p className="mt-2.5 text-base leading-7 text-gray-600">
                  {item.reactionNotes}
                </p>
              )}

              {(item.avoidCrossContact || item.medicallyDiagnosed) && (
                <div className="mt-3 flex flex-wrap gap-2 text-sm">
                  {item.avoidCrossContact && (
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-200">
                      ជៀសវាងការប៉ះពាល់ឆ្លង
                    </span>
                  )}

                  {item.medicallyDiagnosed && (
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-700 ring-1 ring-inset ring-gray-200">
                      មានរោគវិនិច្ឆ័យវេជ្ជសាស្ត្រ
                    </span>
                  )}
                </div>
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
        <Shield size={16} />
      </div>
      <p className="mt-2 text-base font-medium text-gray-400">
        មិនមានទិន្នន័យប្រតិកម្មអាលែហ្សីឡើយ
      </p>
    </div>
  );
}
