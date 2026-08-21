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
  onបើកដំណើរការឡើងវិញ: () => void;
}

export default function ProfileHeader({
  profile,
  busy = false,
  onEdit,
  onSetDefault,
  onDelete,
  onHardDelete,
  onបើកដំណើរការឡើងវិញ,
}: ProfileHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#0e6f34] via-[#14833E] to-[#1cb053] p-6 text-white shadow-xl shadow-primary-900/15 sm:p-7">
      {/* Luminous background glow effects */}
      <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 right-32 h-60 w-60 rounded-full bg-emerald-300/15 blur-2xl" />
      <div className="pointer-events-none absolute left-1/3 top-0 h-40 w-40 rounded-full bg-white/5 blur-xl" />

      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <UserAvatar
            name={profile.profileName}
            avatarMediaUuid={profile.avatarMediaUuid}
            containerClassName="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white text-2xl font-bold text-primary-800 shadow-md ring-2 ring-white/30"
          />

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate text-3xl font-extrabold tracking-tight drop-shadow-xs">
                {profile.profileName}
              </p>

              {profile.isDefault && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-300 to-amber-400 px-3 py-1 text-sm font-bold text-amber-950 shadow-sm ring-1 ring-amber-200">
                  <Star size={14} className="fill-amber-950 text-amber-950" />
                  លំនាំដើម
                </span>
              )}

              {profile.isActive ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/20 px-3 py-1 text-sm font-semibold text-emerald-100 backdrop-blur-md ring-1 ring-emerald-300/40">
                  <UserCheck size={14} />
                  សកម្ម
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/25 px-3 py-1 text-sm font-semibold text-rose-100 backdrop-blur-md ring-1 ring-rose-300/50">
                  <UserX size={14} />
                  ផ្អាកដំណើរការ
                </span>
              )}
            </div>

            <p className="mt-2 text-lg font-medium text-white/90">
              {formatRelationshipKhmer(profile.relationship)} ·{" "}
              {formatGenderKhmer(profile.gender)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap shrink-0 gap-2.5">
          {!profile.isDefault && profile.isActive && onSetDefault && (
            <button
              type="button"
              disabled={busy}
              onClick={onSetDefault}
              className="inline-flex min-h-12 items-center gap-2 rounded-full border border-amber-300/80 bg-amber-400/20 px-5 text-base font-bold text-amber-100 backdrop-blur-md transition-all hover:bg-amber-400/30 hover:scale-[1.02] active:scale-95 disabled:opacity-50"
            >
              <Star size={17} className="fill-amber-300 text-amber-300" />
              កំណត់ជាលំនាំដើម
            </button>
          )}

          {onEdit && (
            <button
              type="button"
              disabled={busy}
              onClick={onEdit}
              className="inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-5 text-base font-bold text-primary-800 shadow-md shadow-black/10 transition-all hover:bg-emerald-50 hover:scale-[1.02] active:scale-95 disabled:opacity-50"
            >
              <Pencil size={17} />
              កែប្រែ
            </button>
          )}

          {profile.isActive ? (
            <button
              type="button"
              disabled={busy}
              onClick={onDelete}
              className="inline-flex min-h-12 items-center gap-2 rounded-full border border-amber-300 bg-amber-400 px-5 text-base font-bold text-amber-950 shadow-md shadow-amber-950/15 transition-all hover:bg-amber-300 hover:scale-[1.02] active:scale-95 disabled:opacity-50"
            >
              <AlertTriangle size={18} />
              ផ្អាកដំណើរការ
            </button>
          ) : (
            <button
              type="button"
              disabled={busy}
              onClick={onបើកដំណើរការឡើងវិញ}
              className="inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-5 text-base font-bold text-primary-800 shadow-md shadow-black/10 transition-all hover:bg-primary-50 hover:scale-[1.02] active:scale-95 disabled:opacity-50"
            >
              <RotateCcw size={18} />
              បើកដំណើរការឡើងវិញ
            </button>
          )}

          {onHardDelete && (
            <button
              type="button"
              disabled={busy}
              onClick={onHardDelete}
              className="inline-flex min-h-12 items-center gap-2 rounded-full border border-red-400 bg-red-600 px-5 text-base font-bold text-white shadow-md shadow-red-950/20 transition-all hover:bg-red-500 hover:scale-[1.02] active:scale-95 disabled:opacity-50"
              title="លុប profile ចេញពីប្រព័ន្ធ"
            >
              <Trash2 size={18} />
              លុបចេញពីប្រព័ន្ធ
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
