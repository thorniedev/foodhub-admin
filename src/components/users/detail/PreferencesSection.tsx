import { Star } from "lucide-react";

import type { ProfilePreferenceResponse } from "@/src/types/userProfile";
import { humanizeEnum } from "@/src/lib/userProfileFormat";
import { Section } from "./BasicInfoSection";

export default function PreferencesSection({
  preferences,
}: {
  preferences: ProfilePreferenceResponse | null;
}) {
  if (!preferences) {
    return (
      <Section
        title="Preferences"
        icon={<Star size={22} />}
      >
        <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 px-4 py-8 text-center text-lg text-gray-400">
          No preference data returned.
        </div>
      </Section>
    );
  }

  return (
    <Section
      title="Preferences"
      icon={<Star size={22} />}
    >
      <div className="space-y-4">
        <Tags
          label="Cuisines"
          values={preferences.cuisineCodes ?? []}
        />

        <Tags
          label="Tastes"
          values={preferences.tasteCodes ?? []}
        />

        <Tags
          label="Textures"
          values={preferences.textureCodes ?? []}
        />

        <div className="grid gap-3 sm:grid-cols-2">
          <Info
            label="Spice level"
            value={humanizeEnum(preferences.spiceLevel)}
          />

          <Info
            label="Budget"
            value={
              preferences.minimumBudget !== null ||
              preferences.maximumBudget !== null
                ? `${preferences.minimumBudget ?? "?"} – ${preferences.maximumBudget ?? "?"}`
                : "—"
            }
          />

          <Info
            label="Radius"
            value={
              preferences.radiusMeters !== null
                ? `${preferences.radiusMeters} m`
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
