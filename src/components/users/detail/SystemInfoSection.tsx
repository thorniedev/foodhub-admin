import { Info } from "lucide-react";

import type { AdminProfile } from "@/src/types/userProfile";
import { formatDateTime } from "@/src/lib/userProfileFormat";
import { Section } from "./BasicInfoSection";

export default function SystemInfoSection({
  profile,
}: {
  profile: AdminProfile;
}) {
  return (
    <Section title="System information" icon={<Info size={20} />}>
      <div className="space-y-3">
        <Row
          label="Avatar media UUID"
          value={profile.avatarMediaUuid ?? "—"}
          mono
        />

        <Row
          label="Created at"
          value={formatDateTime(profile.createdAt)}
        />

        <Row
          label="Updated at"
          value={formatDateTime(profile.updatedAt)}
        />
      </div>
    </Section>
  );
}

function Row({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="grid gap-1 rounded-2xl bg-gray-50 px-4 py-3 sm:grid-cols-[170px_1fr]">
      <span className="text-base font-semibold text-[#F97316]">
        {label}
      </span>

      <span
        className={`break-all text-base text-gray-700 ${
          mono ? "font-mono text-sm" : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}
