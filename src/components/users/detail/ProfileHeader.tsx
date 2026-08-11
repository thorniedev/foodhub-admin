import {
  Info,
  RotateCcw,
  Trash2,
} from "lucide-react";

import type { AdminProfile } from "@/src/types/userProfile";

import {
  humanizeEnum,
  initials,
} from "@/src/lib/userProfileFormat";

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
    <div className="relative overflow-hidden rounded-[28px] bg-[#14833E] p-6 text-white shadow-sm sm:p-7">
      <div className="pointer-events-none absolute -right-14 -top-16 h-56 w-56 rounded-full bg-white/5" />

      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white text-xl font-bold text-[#137A3D]">
            {initials(profile.profileName)}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-3xl font-bold">
                {profile.profileName}
              </h2>

              {profile.isDefault && (
                <span className="rounded-full bg-amber-300/20 px-3 py-1 text-sm text-amber-100">
                  DEFAULT
                </span>
              )}

              <span
                className={`rounded-full px-3 py-1 text-sm ${
                  profile.isActive
                    ? "bg-white/15 text-white"
                    : "bg-red-400/20 text-red-100"
                }`}
              >
                {profile.isActive ? "ACTIVE" : "DELETED"}
              </span>
            </div>

            <p className="mt-2 text-base text-white/85">
              {humanizeEnum(profile.relationship)} ·{" "}
              {humanizeEnum(profile.gender)}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 gap-2">
          {profile.isActive ? (
            <button
              type="button"
              disabled={busy}
              onClick={onDelete}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-red-500/20 px-4 text-base text-white ring-1 ring-red-200/20 transition hover:bg-red-500/30 disabled:opacity-50"
            >
              <Trash2 size={17} />
              Soft delete
            </button>
          ) : (
            <button
              type="button"
              disabled={busy}
              onClick={onRestore}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-4 text-base text-[#137A3D] transition hover:bg-emerald-50 disabled:opacity-50"
            >
              <RotateCcw size={17} />
              Restore
            </button>
          )}
        </div>
      </div>

   
    </div>
  );
}
