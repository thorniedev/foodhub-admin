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
    <Section title="Age group" icon={<Users size={20} />}>
      {!ageGroup ? (
        <Empty text="No age group assigned." />
      ) : (
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-lg font-semibold text-[#137A3D]">
                {ageGroup.name}
              </p>

              <p className="mt-1 text-base text-emerald-600">
                {ageGroup.code}
              </p>
            </div>

            <span className="rounded-full bg-white px-3 py-1.5 text-base text-emerald-700">
              {ageGroup.minAge ?? "?"} – {ageGroup.maxAge ?? "∞"} years
            </span>
          </div>
        </div>
      )}
    </Section>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-200 px-4 py-6 text-center text-base text-gray-400">
      {text}
    </div>
  );
}
