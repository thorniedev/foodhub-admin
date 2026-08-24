import {
  MinusCircle,
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
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0e6f34] via-[#14833E] to-[#1cb053] p-5 sm:p-6 text-white shadow-xl shadow-primary-950/10">
      {/* Background glow effects */}
      <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 right-20 h-48 w-48 rounded-full bg-emerald-300/15 blur-2xl" />

      <div className="relative flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        {/* Left Side: Avatar + Details */}
        <div className="flex min-w-0 items-center gap-3.5 sm:gap-4">
          <UserAvatar
            name={profile.profileName}
            avatarMediaUuid={profile.avatarMediaUuid}
            containerClassName="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white text-xl font-bold text-primary-800 shadow-md ring-2 ring-white/30"
          />

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="!text-[20px] text-[20px] leading-tight font-bold tracking-tight text-white drop-shadow-xs">
                {profile.profileName}
              </h2>

              {profile.isDefault && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-300 px-2.5 py-0.5 text-xs font-bold text-amber-950 shadow-sm ring-1 ring-amber-200 shrink-0">
                  <Star size={12} className="fill-amber-950 text-amber-950" />
                  លំនាំដើម
                </span>
              )}

              {profile.isActive ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/25 px-2.5 py-0.5 text-xs font-semibold text-emerald-100 backdrop-blur-md ring-1 ring-emerald-300/40 shrink-0">
                  <UserCheck size={12} />
                  សកម្ម
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/30 px-2.5 py-0.5 text-xs font-semibold text-rose-100 backdrop-blur-md ring-1 ring-rose-300/50 shrink-0">
                  <UserX size={12} />
                  ផ្អាកដំណើរការ
                </span>
              )}
            </div>

            <p className="mt-1 text-[18px] font-medium text-emerald-100/90 whitespace-nowrap">
              {formatRelationshipKhmer(profile.relationship)} ·{" "}
              {formatGenderKhmer(profile.gender)}
            </p>
          </div>
        </div>

        {/* Right Side: Unified Sleek Glass Action Bar */}
        <div className="flex items-center gap-1.5 rounded-2xl border border-white/20 bg-white/10 p-1.5 backdrop-blur-md shadow-lg shadow-black/5 shrink-0">
          {!profile.isDefault && profile.isActive && onSetDefault && (
            <button
              type="button"
              disabled={busy}
              onClick={onSetDefault}
              title="កំណត់ជាលំនាំដើម"
              className="flex h-9.5 w-9.5 items-center justify-center rounded-xl bg-white/10 text-amber-300 transition hover:bg-amber-400/30 hover:text-amber-200 active:scale-95 disabled:opacity-50"
            >
              <Star size={18} className="fill-amber-300" />
            </button>
          )}

          {onEdit && (
            <button
              type="button"
              disabled={busy}
              onClick={onEdit}
              title="កែប្រែ"
              className="flex h-9.5 w-9.5 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-white/25 active:scale-95 disabled:opacity-50"
            >
              <Pencil size={18} />
            </button>
          )}

          {profile.isActive ? (
            <button
              type="button"
              disabled={busy}
              onClick={onDelete}
              title="ផ្អាកដំណើរការ"
              className="flex h-9.5 w-9.5 items-center justify-center rounded-xl bg-white/10 text-amber-200 transition hover:bg-amber-400/30 hover:text-amber-100 active:scale-95 disabled:opacity-50"
            >
              <MinusCircle size={18} />
            </button>
          ) : (
            <button
              type="button"
              disabled={busy}
              onClick={onRestore}
              title="បើកដំណើរការឡើងវិញ"
              className="flex h-9.5 w-9.5 items-center justify-center rounded-xl bg-white/10 text-emerald-200 transition hover:bg-emerald-400/30 hover:text-emerald-100 active:scale-95 disabled:opacity-50"
            >
              <RotateCcw size={18} />
            </button>
          )}

          {onHardDelete && (
            <button
              type="button"
              disabled={busy}
              onClick={onHardDelete}
              title="លុបចេញពីប្រព័ន្ធ"
              className="flex h-9.5 w-9.5 items-center justify-center rounded-xl bg-white/10 text-rose-200 transition hover:bg-rose-500/30 hover:text-rose-100 active:scale-95 disabled:opacity-50"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
