import { Clock3, Fingerprint, Info } from "lucide-react";

import type { AdminProfile } from "@/src/types/userProfile";

import { formatDateTime } from "@/src/lib/userProfileFormat";

import { Section } from "./BasicInfoSection";


export default function SystemInfoSection({
  profile: _profile,
}: {
  profile: AdminProfile;
}) {
  return null;
}

function Row({
  label,
  value,
  icon,
  mono = false,
  accent = false,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  mono?: boolean;
  accent?: boolean;
}) {
  return (
    <div className="flex min-w-0 items-center gap-4 rounded-2xl border border-gray-100 bg-gray-50/60 px-4 py-4 transition hover:border-gray-200 hover:bg-gray-50">
      {icon && (
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
            accent
              ? "bg-secondary-50 text-secondary-500"
              : "bg-primary-50 text-primary-800"
          }`}
        >
          {icon}
        </div>
      )}

      <div className="grid min-w-0 flex-1 gap-1  sm:items-center sm:gap-1">
        <p className="text-lg font-medium text-gray-500">{label}</p>

        <p
          className={`min-w-0 break-all text-lg font-medium text-gray-800 ${
            mono ? "font-mono" : ""
          }`}
          title={value}
        >
          {value}
        </p>
      </div>
    </div>
  );
}
