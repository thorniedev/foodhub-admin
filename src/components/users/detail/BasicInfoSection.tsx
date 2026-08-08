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
    <Section title="Basic information" icon={<User size={18} />}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Item label="Profile name" value={profile.profileName} />
        <Item label="Relationship" value={humanizeEnum(profile.relationship)} />
        <Item label="Gender" value={humanizeEnum(profile.gender)} />
        <Item
          label="Date of birth"
          value={`${formatDateOnly(profile.dateOfBirth)}${age !== null ? ` (${age} years)` : ""}`}
          icon={<Calendar size={14} />}
        />
        <Item
          label="Language"
          value={(profile.preferredLanguage ?? "—").toUpperCase()}
          icon={<Globe2 size={14} />}
        />
        <Item label="Default profile" value={profile.isDefault ? "Yes" : "No"} />
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
    <section className="rounded-[22px] border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2 font-black text-gray-900">
        <span className="text-[#137A3D]">{icon}</span>
        {title}
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
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-gray-50 px-4 py-3">
      <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
        {label}
      </p>
      <p className="mt-1 flex items-center gap-1.5 text-sm font-bold text-gray-700">
        {icon}
        {value}
      </p>
    </div>
  );
}
