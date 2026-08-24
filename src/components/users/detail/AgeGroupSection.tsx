import { Users } from "lucide-react";

import type { AdminProfile } from "@/src/types/userProfile";
import { formatAgeGroupKhmer } from "@/src/lib/userProfileFormat";
import { Section } from "./BasicInfoSection";

export default function AgeGroupSection({
  profile,
}: {
  profile: AdminProfile;
}) {
  const ageGroup = profile.ageGroup;

  return (
    <Section
      title="ក្រុមអាយុ"
      icon={<Users size={22} />}
    >
      {!ageGroup ? (
        <Empty text="មិនមានកំណត់ក្រុមអាយុឡើយ" />
      ) : (
        <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-4 transition hover:border-gray-200 hover:bg-gray-50">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[18px] font-bold text-gray-800">
              {formatAgeGroupKhmer(ageGroup.name)}
            </p>

            <span className="rounded-full bg-primary-50 px-3.5 py-1 text-sm font-semibold text-primary-700 ring-1 ring-inset ring-primary-100">
              {ageGroup.minAge ?? "0"} – {ageGroup.maxAge ?? "∞"} ឆ្នាំ
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
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/40 py-6 text-center">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-400">
        <Users size={16} />
      </div>
      <p className="mt-2 text-base font-medium text-gray-400">{text}</p>
    </div>
  );
}
