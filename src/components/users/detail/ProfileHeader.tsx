import { RotateCcw, Trash2 } from "lucide-react";

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
    <div className="relative overflow-hidden rounded-[28px] bg-[#14833E] p-6 text-white shadow-sm sm:p-7">
      <div className="pointer-events-none absolute -right-14 -top-16 h-56 w-56 rounded-full bg-white/5" />

      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white text-2xl font-bold text-primary-800">
            {initials(profile.profileName)}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate text-3xl font-bold">
                {profile.profileName}
              </p>

              {profile.isDefault && (
                <span className="rounded-full bg-secondary-500/20 px-3 py-1.5 text-lg font-medium text-secondary-50">
                  DEFAULT
                </span>
              )}

              <span
                className={`rounded-full px-3 py-1.5 text-lg font-medium ${
                  profile.isActive
                    ? "bg-white/15 text-white"
                    : "bg-red-400/20 text-red-100"
                }`}
              >
                {profile.isActive ? "ACTIVE" : "DELETED"}
              </span>
            </div>

            <p className="mt-2 text-lg text-white/85">
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
              className="inline-flex min-h-12 items-center gap-2 rounded-full bg-red-500/20 px-5 text-lg font-medium text-white ring-1 ring-red-200/20 transition hover:bg-red-500/30 disabled:opacity-50"
            >
              <Trash2 size={19} />
              Soft delete
            </button>
          ) : (
            <button
              type="button"
              disabled={busy}
              onClick={onRestore}
              className="inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-5 text-lg font-medium text-primary-800 transition hover:bg-primary-50 disabled:opacity-50"
            >
              <RotateCcw size={19} />
              Restore
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
