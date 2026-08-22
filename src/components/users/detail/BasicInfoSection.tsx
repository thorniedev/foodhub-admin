import type { ReactNode } from "react";

import { Calendar, Globe2, Star, User, Users } from "lucide-react";

import type { AdminProfile } from "@/src/types/userProfile";

import {
  calculateAge,
  formatAgeGroupKhmer,
  formatDateKhmer,
  formatGenderKhmer,
  formatLanguageKhmer,
  formatRelationshipKhmer,
} from "@/src/lib/userProfileFormat";

export default function BasicInfoSection({
  profile,
}: {
  profile: AdminProfile;
}) {
  const age = calculateAge(profile.dateOfBirth);

  return (
    <Section title="ព័ត៌មានលម្អិត" icon={<User size={22} />}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Item label="ឈ្មោះប្រវត្តិរូប" value={profile.profileName} />

        <Item
          label="ទំនាក់ទំនង"
          value={formatRelationshipKhmer(profile.relationship)}
        />

        <Item label="ភេទ" value={formatGenderKhmer(profile.gender)} />

        <Item
          label="ថ្ងៃខែឆ្នាំកំណើត"
          value={`${formatDateKhmer(profile.dateOfBirth)}${
            age !== null ? ` (${age} ឆ្នាំ)` : ""
          }`}
          icon={<Calendar size={19} />}
        />

        <Item
          label="ក្រុមអាយុ"
          customValue={
            profile.ageGroup ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-base font-bold text-gray-800">
                  {formatAgeGroupKhmer(profile.ageGroup.name)}
                </span>
                <span className="rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-bold text-primary-800 border border-primary-200">
                  {profile.ageGroup.minAge ?? "0"} – {profile.ageGroup.maxAge ?? "∞"} ឆ្នាំ
                </span>
              </div>
            ) : (
              <span className="text-base text-gray-400">មិនមានកំណត់</span>
            )
          }
          icon={<Users size={19} />}
        />

        <Item
          label="ភាសា"
          value={formatLanguageKhmer(profile.preferredLanguage)}
          icon={<Globe2 size={19} />}
        />

        <Item
          label="ប្រវត្តិរូប"
          customValue={
            profile.isDefault ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-sm font-bold text-amber-800 border border-amber-200 shadow-2xs">
                <Star size={14} className="fill-amber-500 text-amber-500" />
                លំនាំដើម
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600">
                ធម្មតា
              </span>
            )
          }
        />
      </div>
    </Section>
  );
}

export function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-800">
          {icon}
        </div>

        <p className="text-[20px] font-bold text-primary-800">{title}</p>
      </div>

      {children}
    </section>
  );
}

function Item({
  label,
  value,
  customValue,
  icon,
}: {
  label: string;
  value?: string;
  customValue?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50/60 px-4 py-4 transition hover:border-gray-200 hover:bg-gray-50">
      <p className="text-[18px] font-medium text-gray-500">{label}</p>

      {customValue ? (
        <div className="mt-2">{customValue}</div>
      ) : (
        <p className="mt-1 flex items-center gap-2 break-words text-[18px] font-semibold text-gray-800">
          {icon && <span className="text-primary-700">{icon}</span>}
          {value}
        </p>
      )}
    </div>
  );
}
