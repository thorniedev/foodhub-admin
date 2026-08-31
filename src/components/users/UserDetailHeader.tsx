import Link from "next/link";

import {
  ArrowLeft,
  Mail,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
  User,
} from "lucide-react";

import type { AdminUser } from "@/src/types/userProfile";

import { displayName, formatDateTime } from "@/src/lib/userProfileFormat";

import { StatusBadge } from "./UsersTable";
import UserAvatar from "./UserAvatar";

interface UserDetailHeaderProps {
  user: AdminUser;
  busy?: boolean;
  onStatusEdit?: () => void;
  onCreateProfile?: () => void;
  onHardDelete?: () => void;
  onRestore?: () => void;
}

export default function UserDetailHeader({
  user,
  busy = false,
  onStatusEdit,
  onCreateProfile,
  onHardDelete,
  onRestore,
}: UserDetailHeaderProps) {
  const name = displayName(
    user.firstName,
    user.lastName,
    user.username,
  );

  const avatarMediaUuid =
    user.avatarMediaUuid ||
    user.defaultProfile?.avatarMediaUuid ||
    user.profiles?.[0]?.avatarMediaUuid ||
    (user as any).profileMediaUuid ||
    (user as any).profile?.avatarMediaUuid;

  const imageUrl =
    user.avatarUrl ||
    user.profileImage ||
    user.profilePicture ||
    user.picture ||
    user.imageUrl ||
    user.image ||
    user.avatar ||
    (user.defaultProfile as any)?.avatarUrl ||
    (user.defaultProfile as any)?.profileImageUrl ||
    (user.defaultProfile as any)?.imageUrl ||
    (user.defaultProfile as any)?.photoUrl ||
    (user.defaultProfile as any)?.picture ||
    (user.profiles?.[0] as any)?.avatarUrl ||
    (user.profiles?.[0] as any)?.profileImageUrl ||
    (user.profiles?.[0] as any)?.imageUrl ||
    (user.profiles?.[0] as any)?.photoUrl ||
    (user as any).profile?.avatarUrl ||
    (user as any).profile?.profileImageUrl ||
    (user as any).profile?.imageUrl;

  const isDisabledOrDeleted =
    user.status === "DISABLED" || user.status === "DELETED";

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0f6b32] via-[#14833E] to-[#1aad54] px-4 py-5 text-white shadow-xl shadow-primary-900/20 sm:px-8 sm:py-8">
      {/* Decorative luminous glow */}
      <div className="pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 right-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute left-1/3 top-0 h-40 w-40 rounded-full bg-white/5 blur-xl" />

      <div className="relative">
        <Link
          href="/users"
          className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 sm:px-5 py-2 sm:py-2.5 text-base sm:text-lg font-normal text-white backdrop-blur-sm ring-1 ring-white/20 transition hover:bg-white/25 active:scale-95"
        >
          <ArrowLeft size={18} />
          <span>ត្រឡប់ទៅបញ្ជីគណនីអ្នកប្រើប្រាស់</span>
        </Link>

        <div className="mt-5 sm:mt-6 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <UserAvatar
              name={name}
              userUuid={user.uuid}
              avatarMediaUuid={avatarMediaUuid}
              imageUrl={imageUrl}
              containerClassName="flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white text-xl sm:text-2xl font-medium text-primary-800 shadow-md ring-2 ring-white/30"
            />

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <h1 className="truncate text-2xl sm:text-4xl font-medium text-accent-400 drop-shadow-xs">
                  {name}
                </h1>

                <StatusBadge status={user.status} />
              </div>

              <div className="mt-1.5 sm:mt-2.5 flex flex-wrap gap-x-4 sm:gap-x-5 gap-y-1.5 text-lg font-normal text-white/90">
                <span className="inline-flex items-center gap-1.5 sm:gap-2">
                  <Mail size={18} className="shrink-0" />
                  <span className="truncate max-w-[200px] sm:max-w-none">{user.primaryEmail ?? "គ្មានអ៊ីមែល"}</span>
                </span>

                <span className="inline-flex items-center gap-1.5 sm:gap-2">
                  <User size={18} className="shrink-0" />
                  <span>ចូលប្រើចុងក្រោយ: {formatDateTime(user.lastLoginAt)}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5 sm:gap-3 shrink-0">
            {onCreateProfile && !isDisabledOrDeleted && (
              <button
                type="button"
                disabled={busy}
                onClick={onCreateProfile}
                className="inline-flex min-h-12 w-full sm:w-auto items-center justify-center cursor-pointer gap-2 rounded-full bg-white px-5 sm:px-6 text-lg font-bold text-primary-800 shadow-md shadow-black/10 transition-all hover:bg-accent-50 active:scale-95 disabled:opacity-50"
              >
                <Plus size={20} />
                <span>បង្កើតប្រវត្តិរូបថ្មី</span>
              </button>
            )}

            {isDisabledOrDeleted && (
              <>
                {onRestore && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={onRestore}
                    className="inline-flex min-h-12 w-full sm:w-auto items-center justify-center cursor-pointer gap-2 rounded-full bg-emerald-500 px-5 sm:px-6 text-lg font-bold text-white shadow-md shadow-emerald-950/20 transition-all hover:bg-emerald-600 active:scale-95 disabled:opacity-50"
                    title="ស្តារ user"
                  >
                    <RotateCcw size={18} />
                    <span>ស្តារឡើងវិញ</span>
                  </button>
                )}

                {onHardDelete && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={onHardDelete}
                    className="inline-flex min-h-12 w-full sm:w-auto items-center justify-center cursor-pointer gap-2 rounded-full border border-red-400 bg-red-600 px-5 sm:px-6 text-lg font-bold text-white shadow-md shadow-red-950/20 transition-all hover:bg-red-500 active:scale-95 disabled:opacity-50"
                    title="លុប user ចេញពីប្រព័ន្ធ"
                  >
                    <Trash2 size={18} />
                    <span>លុបចេញពីប្រព័ន្ធ</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        <div className="mt-5 sm:mt-7 grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3.5">
          <Info
            label="ផ្ទៀងផ្ទាត់អ៊ីមែល"
            value={user.emailVerified ? "បានផ្ទៀងផ្ទាត់" : "មិនបានផ្ទៀងផ្ទាត់"}
          />

          <Info
            label="ថ្ងៃបង្កើត"
            value={formatDateTime(user.createdAt)}
          />

          <Info
            label="ថ្ងៃកែប្រែ"
            value={formatDateTime(user.updatedAt)}
          />
        </div>
      </div>
    </section>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl sm:rounded-3xl bg-white/20 px-4 py-3 sm:px-6 sm:py-4.5">
      <p className="text-base sm:text-lg font-normal text-white/80">{label}</p>
      <p className="mt-0.5 sm:mt-1 truncate text-xl sm:text-2xl font-medium text-white">
        {value}
      </p>
    </div>
  );
}