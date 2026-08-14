import { Users } from "lucide-react";

import type { AdminProfile } from "@/src/types/userProfile";
import { Section } from "./BasicInfoSection";

export default function AgeGroupSection({
  profile,
}: {
  profile: AdminProfile;
}) {
  const ageGroup = profile.ageGroup;

  return (
    <Section
      title="Age group"
      icon={<Users size={22} />}
    >
      {!ageGroup ? (
        <Empty text="No age group assigned." />
      ) : (
        <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-4 transition hover:border-gray-200 hover:bg-gray-50">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-lg font-semibold text-gray-800">
                {ageGroup.name}
              </p>

              <p className="mt-1 text-lg text-gray-500">
                {ageGroup.code}
              </p>
            </div>

            <span className="rounded-full bg-primary-50 px-3.5 py-1.5 text-lg font-medium text-primary-700 ring-1 ring-inset ring-primary-100">
              {ageGroup.minAge ?? "?"} – {ageGroup.maxAge ?? "∞"} years
            </span>
          </div>
        </div>
      )}
    </Section>
  );
}

function Empty({
  text,
}: {
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 px-4 py-8 text-center text-lg text-gray-400">
      {text}
    </div>
  );
}
