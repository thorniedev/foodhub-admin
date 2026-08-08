import { Info, RotateCcw, Shield, Trash2 } from "lucide-react";

import type { AdminProfile } from "@/src/types/userProfile";
import { humanizeEnum, initials } from "@/src/lib/userProfileFormat";

interface ProfileHeaderProps {
  profile: AdminProfile;
  busy?: boolean;
  onDelete: () => void;
  onRestore: () => void;
}

export default function ProfileHeader({
  profile,
  busy = false,
  onDelete,
  onRestore,
}: ProfileHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-[26px] bg-gradient-to-br from-[#137A3D] to-[#0E5E30] p-6 text-white">
      <div className="absolute -right-14 -top-16 h-56 w-56 rounded-full bg-white/10" />

      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-lg font-black text-[#137A3D]">
            {initials(profile.profileName)}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-2xl font-black">{profile.profileName}</h2>

              {profile.isDefault && (
                <span className="rounded-full bg-amber-300/20 px-2.5 py-1 text-xs font-bold text-amber-100">
                  DEFAULT
                </span>
              )}

              <span
                className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                  profile.isActive
                    ? "bg-white/15 text-white"
                    : "bg-red-400/20 text-red-100"
                }`}
              >
                {profile.isActive ? "ACTIVE" : "DELETED"}
              </span>
            </div>

            <p className="mt-1 text-sm text-emerald-100">
              {humanizeEnum(profile.relationship)} · {humanizeEnum(profile.gender)}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 gap-2">
          {profile.isActive ? (
            <button
              type="button"
              disabled={busy}
              onClick={onDelete}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-red-500/20 px-3 text-sm font-bold text-white ring-1 ring-red-200/20 disabled:opacity-50"
            >
              <Trash2 size={16} />
              Soft delete
            </button>
          ) : (
            <button
              type="button"
              disabled={busy}
              onClick={onRestore}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-white px-3 text-sm font-bold text-[#137A3D] disabled:opacity-50"
            >
              <RotateCcw size={16} />
              Restore
            </button>
          )}
        </div>
      </div>

      <div className="relative mt-5 flex items-start gap-2 rounded-2xl bg-white/10 px-4 py-3 text-xs leading-5 text-emerald-50">
        <Info size={16} className="mt-0.5 shrink-0" />
        <span>
          Admin Profile API ដែលបានផ្តល់គឺ read-only សម្រាប់ personal/safety data។
          Admin អាច View, Soft delete និង Restore ប៉ុណ្ណោះ។
        </span>
      </div>
    </div>
  );
}
