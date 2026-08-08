import { Calendar, Globe2, Star, User } from "lucide-react";

import type { AdminProfile } from "@/src/types/userProfile";
import {
  calculateAge,
  formatDateOnly,
  humanizeEnum,
  initials,
} from "@/src/lib/userProfileFormat";

interface ProfileTagCardProps {
  profile: AdminProfile;
  selected: boolean;
  onSelect: () => void;
}

export default function ProfileTagCard({
  profile,
  selected,
  onSelect,
}: ProfileTagCardProps) {
  const age = calculateAge(profile.dateOfBirth);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-[22px] border p-4 text-left transition ${
        selected
          ? "border-emerald-300 bg-emerald-50 shadow-[0_8px_25px_rgba(19,122,61,0.08)]"
          : "border-gray-100 bg-white hover:border-emerald-100 hover:bg-emerald-50/30"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#137A3D] font-black text-white">
          {initials(profile.profileName)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate font-black text-gray-900">
              {profile.profileName}
            </p>

            {profile.isDefault && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700">
                <Star size={11} />
                Default
              </span>
            )}

            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                profile.isActive
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-red-50 text-red-600"
              }`}
            >
              {profile.isActive ? "ACTIVE" : "DELETED"}
            </span>
          </div>

          <div className="mt-3 grid gap-2 text-xs text-gray-500 sm:grid-cols-2">
            <span className="inline-flex items-center gap-1.5">
              <User size={13} />
              {humanizeEnum(profile.relationship)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Calendar size={13} />
              {formatDateOnly(profile.dateOfBirth)}
              {age !== null ? ` · ${age}y` : ""}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Globe2 size={13} />
              {(profile.preferredLanguage ?? "—").toUpperCase()}
            </span>
            <span>
              {profile.ageGroup?.name ?? humanizeEnum(profile.ageGroup?.code)}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
