import {
  AlertTriangle,
  Pencil,
  RotateCcw,
  Star,
  Trash2,
  UserCheck,
  UserX,
} from "lucide-react";

import type { AdminProfile } from "@/src/types/userProfile";
import {
  formatGenderKhmer,
  formatRelationshipKhmer,
} from "@/src/lib/userProfileFormat";
import UserAvatar from "../UserAvatar";

interface ProfileHeaderProps {
  profile: AdminProfile;
  busy?: boolean;
  onEdit?: () => void;
  onSetDefault?: () => void;
  onDelete: () => void;
  onHardDelete?: () => void;
  onRestore: () => void;
}

export default function ProfileHeader({
  profile,
  busy = false,
  onEdit,
  onSetDefault,
  onDelete,
  onHardDelete,
  onRestore,
}: ProfileHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0e6f34] via-[#14833E] to-[#1cb053] p-6 sm:p-7 text-white shadow-xl shadow-primary-950/10">
      {/* Background glow effects */}
      <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 right-20 h-48 w-48 rounded-full bg-emerald-300/15 blur-2xl" />

      <div className="relative flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        {/* Left Side: Avatar + Details */}
        <div className="flex min-w-0 items-center gap-4">
          <UserAvatar
            name={profile.profileName}
            avatarMediaUuid={profile.avatarMediaUuid}
            containerClassName="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white text-2xl font-medium text-primary-800 shadow-md ring-2 ring-white/30"
          />

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-white drop-shadow-xs">
                {profile.profileName}
              </h2>

              {profile.isDefault && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-300 px-3.5 py-1 text-lg font-normal text-amber-950 shadow-sm ring-1 ring-amber-200 shrink-0">
                  <Star size={16} className="fill-amber-950 text-amber-950" />
                  <span>លំនាំដើម</span>
                </span>
              )}

              {profile.isActive ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/25 px-3.5 py-1 text-lg font-normal text-emerald-100 backdrop-blur-md ring-1 ring-emerald-300/40 shrink-0">
                  <UserCheck size={16} />
                  <span>សកម្ម</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/30 px-3.5 py-1 text-lg font-normal text-rose-100 backdrop-blur-md ring-1 ring-rose-300/50 shrink-0">
                  <UserX size={16} />
                  <span>ផ្អាកដំណើរការ</span>
                </span>
              )}
            </div>

            <p className="mt-1 text-lg font-normal text-emerald-100/90 whitespace-nowrap">
              {formatRelationshipKhmer(profile.relationship)} ·{" "}
              {formatGenderKhmer(profile.gender)}
            </p>
          </div>
        </div>

        {/* Right Side: Responsive Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {!profile.isDefault && profile.isActive && onSetDefault && (
            <button
              type="button"
              disabled={busy}
              onClick={onSetDefault}
              className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-amber-300/50 bg-amber-400/20 px-5 text-lg font-normal text-amber-100 backdrop-blur-md transition hover:bg-amber-400/30 active:scale-[0.98] disabled:opacity-50"
            >
              <Star size={18} className="fill-amber-300 text-amber-300" />
              <span>កំណត់ជាលំនាំដើម</span>
            </button>
          )}

          {onEdit && (
            <button
              type="button"
              disabled={busy}
              onClick={onEdit}
              className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-white px-5 text-lg font-normal text-primary-800 shadow-sm transition hover:bg-emerald-50 active:scale-[0.98] disabled:opacity-50"
            >
              <Pencil size={18} />
              <span>កែប្រែ</span>
            </button>
          )}

          {profile.isActive ? (
            <button
              type="button"
              disabled={busy}
              onClick={onDelete}
              className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-amber-500 hover:bg-amber-600 px-5 text-lg font-normal text-white shadow-sm transition active:scale-[0.98] disabled:opacity-50"
            >
              <AlertTriangle size={18} />
              <span>ផ្អាកដំណើរការ</span>
            </button>
          ) : (
            <button
              type="button"
              disabled={busy}
              onClick={onRestore}
              className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-white px-5 text-lg font-normal text-primary-800 shadow-sm transition hover:bg-primary-50 active:scale-[0.98] disabled:opacity-50"
            >
              <RotateCcw size={18} />
              <span>បើកដំណើរការឡើងវិញ</span>
            </button>
          )}

          {onHardDelete && (
            <button
              type="button"
              disabled={busy}
              onClick={onHardDelete}
              className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-red-600 hover:bg-red-700 px-5 text-lg font-normal text-white shadow-sm transition active:scale-[0.98] disabled:opacity-50"
              title="លុប profile ចេញពីប្រព័ន្ធ"
            >
              <Trash2 size={18} />
              <span>លុបចេញពីប្រព័ន្ធ</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
