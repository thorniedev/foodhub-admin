import { Star } from "lucide-react";

import type { AdminProfile } from "@/src/types/userProfile";
import { formatRelationshipKhmer } from "@/src/lib/userProfileFormat";
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
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group relative flex w-full items-center gap-3.5 rounded-2xl border p-3.5 text-left transition-all duration-150 focus:outline-none focus:ring-4 focus:ring-primary-100 ${
        selected
          ? "border-primary-500 bg-primary-50/70 shadow-sm ring-2 ring-primary-500/20"
          : "border-gray-150 bg-white hover:border-primary-200 hover:bg-primary-50/30 hover:shadow-xs"
      }`}
    >
      <UserAvatar
        name={profile.profileName}
        avatarMediaUuid={profile.avatarMediaUuid}
        containerClassName="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary-800 text-base font-bold text-white shadow-xs"
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-[18px] font-bold text-gray-900 group-hover:text-primary-800">
            {profile.profileName}
          </p>

          {profile.isActive ? (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              សកម្ម
            </span>
          ) : (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-700 border border-rose-200">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
              ផ្អាកដំណើរការ
            </span>
          )}
        </div>

        <div className="mt-1 flex items-center gap-2 text-[16px] text-gray-500">
          <span className="font-medium text-gray-600">
            {formatRelationshipKhmer(profile.relationship)}
          </span>

          {profile.isDefault && (
            <>
              <span className="text-gray-300">•</span>
              <span className="inline-flex items-center gap-1 font-semibold text-amber-600">
                <Star size={11} className="fill-amber-500 text-amber-500" />
                លំនាំដើម
              </span>
            </>
          )}
        </div>
      </div>
    </button>
  );
}
