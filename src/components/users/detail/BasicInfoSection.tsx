import type { ReactNode } from "react";

import { Calendar, Globe2, User } from "lucide-react";

import type { AdminProfile } from "@/src/types/userProfile";

import {
  calculateAge,
  formatDateOnly,
  humanizeEnum,
} from "@/src/lib/userProfileFormat";

export default function BasicInfoSection({
  profile,
}: {
  profile: AdminProfile;
}) {
  const age = calculateAge(profile.dateOfBirth);

  return (
    <Section title="Basic information" icon={<User size={22} />}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Item label="Profile name" value={profile.profileName} />

        <Item label="Relationship" value={humanizeEnum(profile.relationship)} />

        <Item label="Gender" value={humanizeEnum(profile.gender)} />

        <Item
          label="Date of birth"
          value={`${formatDateOnly(profile.dateOfBirth)}${
            age !== null ? ` (${age} years)` : ""
          }`}
          icon={<Calendar size={19} />}
        />

        <Item
          label="Language"
          value={(profile.preferredLanguage ?? "—").toUpperCase()}
          icon={<Globe2 size={19} />}
        />

        <Item
          label="Default profile"
          value={profile.isDefault ? "Yes" : "No"}
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

        <p className="text-2xl font-semibold text-primary-800">{title}</p>
      </div>

      {children}
    </section>
  );
}

function Item({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50/60 px-4 py-4 transition hover:border-gray-200 hover:bg-gray-50">
      <p className="text-lg font-medium text-gray-500">{label}</p>

      <p className="mt-1 flex items-center gap-2 break-words text-lg font-semibold text-gray-800">
        {icon && <span className="text-primary-700">{icon}</span>}

        {value}
      </p>
    </div>
  );
}
