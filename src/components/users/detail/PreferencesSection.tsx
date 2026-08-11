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
        icon={<Star size={20} />}
      >
        <div className="rounded-2xl bg-gray-50 px-4 py-6 text-center text-base text-gray-400">
          No preference data returned.
        </div>
      </Section>
    );
  }

  return (
    <Section title="Preferences" icon={<Star size={20} />}>
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
      <p className="mb-2 text-base font-semibold text-[#F97316]">
        {label}
      </p>

      <div className="flex flex-wrap gap-2">
        {values.length === 0 ? (
          <span className="text-base text-gray-400">—</span>
        ) : (
          values.map((value) => (
            <span
              key={value}
              className="rounded-full bg-emerald-50 px-3 py-1.5 text-base text-[#137A3D]"
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
    <div className="rounded-2xl bg-gray-50 px-4 py-3">
      <p className="text-base font-semibold text-[#F97316]">
        {label}
      </p>

      <p className="mt-1 text-base text-gray-700">
        {value}
      </p>
    </div>
  );
}
