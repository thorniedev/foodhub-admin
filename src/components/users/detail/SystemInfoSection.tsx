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
    <Section title="System information" icon={<Info size={18} />}>
      <div className="space-y-3 text-sm">
        {/* <Row label="Profile UUID" value={profile.uuid} mono /> */}
        <Row label="Avatar media UUID" value={profile.avatarMediaUuid ?? "—"} mono />
        <Row label="Created at" value={formatDateTime(profile.createdAt)} />
        <Row label="Updated at" value={formatDateTime(profile.updatedAt)} />
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
    <div className="grid gap-1 rounded-2xl bg-gray-50 px-4 py-3 sm:grid-cols-[150px_1fr]">
      <span className="font-bold text-gray-400">{label}</span>
      <span className={`break-all font-medium text-gray-700 ${mono ? "font-mono text-xs" : ""}`}>
        {value}
      </span>
    </div>
  );
}
