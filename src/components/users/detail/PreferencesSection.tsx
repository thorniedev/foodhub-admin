import { Star } from "lucide-react";

import type { ProfilePreferenceResponse } from "@/src/types/userProfile";
import {
  formatSpiceLevelKhmer,
  humanizeEnum,
} from "@/src/lib/userProfileFormat";
import { Section } from "./BasicInfoSection";

export default function PreferencesSection({
  preferences,
}: {
  preferences: ProfilePreferenceResponse | null;
}) {
  if (!preferences) {
    return (
      <Section
        title="ចំណង់ចំណូលចិត្ត"
        icon={<Star size={22} />}
      >
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/40 py-6 text-center">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-400">
            <Star size={16} />
          </div>
          <p className="mt-2 text-base font-medium text-gray-400">
            មិនមានទិន្នន័យចំណង់ចំណូលចិត្តឡើយ
          </p>
        </div>
      </Section>
    );
  }

  return (
    <Section
      title="ចំណង់ចំណូលចិត្ត"
      icon={<Star size={22} />}
    >
      <div className="space-y-4">
        {Boolean(preferences.cuisineCodes?.length) && (
          <Tags
            label="ប្រភេទម្ហូប"
            values={preferences.cuisineCodes ?? []}
          />
        )}

        {Boolean(preferences.tasteCodes?.length) && (
          <Tags
            label="រសជាតិ"
            values={preferences.tasteCodes ?? []}
          />
        )}

        {Boolean(preferences.textureCodes?.length) && (
          <Tags
            label="ទម្រង់អាហារ"
            values={preferences.textureCodes ?? []}
          />
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <Info
            label="កម្រិតហិរ"
            value={formatSpiceLevelKhmer(preferences.spiceLevel)}
          />

          <Info
            label="ថវិកា"
            value={
              preferences.minimumBudget !== null ||
              preferences.maximumBudget !== null
                ? `${preferences.minimumBudget ?? "?"} – ${preferences.maximumBudget ?? "?"}`
                : "—"
            }
          />

          <Info
            label="ចម្ងាយ"
            value={
              preferences.radiusMeters !== null
                ? `${preferences.radiusMeters} ម៉ែត្រ`
                : "—"
            }
          />
        </div>
      </div>
    </Section>
  );
}

function Tags({
  label,
  values,
}: {
  label: string;
  values: string[];
}) {
  return (
    <div>
      <p className="mb-2 text-lg font-medium text-gray-500">
        {label}
      </p>

      <div className="flex flex-wrap gap-2">
        {values.length === 0 ? (
          <span className="text-lg text-gray-400">
            —
          </span>
        ) : (
          values.map((value) => (
            <span
              key={value}
              className="rounded-full bg-primary-50 px-3.5 py-1.5 text-lg font-medium text-primary-700 ring-1 ring-inset ring-primary-100"
            >
              {humanizeEnum(value)}
            </span>
          ))
        )}
      </div>
    </div>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50/60 px-4 py-4 transition hover:border-gray-200 hover:bg-gray-50">
      <p className="text-lg font-medium text-gray-500">
        {label}
      </p>

      <p className="mt-1 text-lg font-semibold text-gray-800">
        {value}
      </p>
    </div>
  );
}
