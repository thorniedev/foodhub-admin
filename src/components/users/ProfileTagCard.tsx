import {
  Calendar,
  Globe2,
  Star,
  User,
} from "lucide-react";

import type { AdminProfile } from "@/src/types/userProfile";

import {
  calculateAge,
  formatDateOnly,
  humanizeEnum,
} from "@/src/lib/userProfileFormat";
import UserAvatar from "./UserAvatar";

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
      className={`w-full rounded-2xl border p-4 text-left transition focus:outline-none focus:ring-4 focus:ring-primary-100 ${
        selected
          ? "border-primary-200 bg-primary-50"
          : "border-gray-100 bg-white hover:border-primary-100 hover:bg-primary-50/40"
      }`}
    >
      <div className="flex items-start gap-3">
        <UserAvatar
          name={profile.profileName}
          avatarMediaUuid={profile.avatarMediaUuid}
          containerClassName="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary-800 text-lg font-semibold text-white"
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-lg font-medium text-gray-900">
              {profile.profileName}
            </p>

            {profile.isDefault && (
              <span className="inline-flex items-center gap-1 rounded-full bg-secondary-50 px-2.5 py-1 text-base font-medium text-secondary-600">
                <Star size={14} />
                Default
              </span>
            )}

            <span
              className={`rounded-full px-2.5 py-1 text-base font-medium ${
                profile.isActive
                  ? "bg-primary-50 text-primary-700"
                  : "bg-red-50 text-red-600"
              }`}
            >
              {profile.isActive ? "សកម្ម" : "DELETED"}
            </span>
          </div>

          <div className="mt-3 grid gap-2 text-base text-gray-500 sm:grid-cols-2">
            <span className="inline-flex items-center gap-1.5">
              <User size={16} />
              {humanizeEnum(profile.relationship)}
            </span>

            <span className="inline-flex items-center gap-1.5">
              <Calendar size={16} />
              {formatDateOnly(profile.dateOfBirth)}
              {age !== null ? ` · ${age}y` : ""}
            </span>

            <span className="inline-flex items-center gap-1.5">
              <Globe2 size={16} />
              {(profile.preferredLanguage ?? "—").toUpperCase()}
            </span>

            <span>
              {profile.ageGroup?.name ??
                humanizeEnum(profile.ageGroup?.code)}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
