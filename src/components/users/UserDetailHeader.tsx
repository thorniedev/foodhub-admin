import Link from "next/link";

import {
  AlertOctagon,
  ArrowLeft,
  Mail,
  Pencil,
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
  onStatusEdit: () => void;
  onDelete: () => void;
  onHardDelete?: () => void;
  onRestore?: () => void;
}

export default function UserDetailHeader({
  user,
  busy = false,
  onStatusEdit,
  onDelete,
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
    user.profiles?.[0]?.avatarMediaUuid;

  const imageUrl =
    user.avatarUrl ||
    user.profileImage ||
    user.profilePicture ||
    user.picture ||
    user.imageUrl ||
    user.image ||
    user.avatar;

  return (
    <section className="relative overflow-hidden rounded-[30px] bg-[#14833E] px-6 py-7 text-white shadow-sm sm:px-8 sm:py-8">
      <div className="pointer-events-none absolute -right-12 -top-16 h-52 w-52 rounded-full bg-white/5" />
      <div className="pointer-events-none absolute -bottom-24 right-20 h-64 w-64 rounded-full bg-white/5" />

      <div className="relative">
        <Link
          href="/users"
          className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-lg text-white transition hover:bg-white/15"
        >
          <ArrowLeft size={18} />
          ត្រឡប់ទៅ Users
        </Link>

        <div className="mt-6 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <UserAvatar
              name={name}
              userUuid={user.uuid}
              avatarMediaUuid={avatarMediaUuid}
              imageUrl={imageUrl}
              containerClassName="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-[24px] bg-white text-2xl font-bold text-primary-800 shadow-sm"
            />

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <p className="truncate text-5xl font-bold text-accent-400">
                  {name}
                </p>

                <StatusBadge status={user.status} />
              </div>

              {/* <p className="mt-2 text-lg text-white/85">
                {user.username}
              </p> */}

              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-lg text-white/85">
                <span className="inline-flex items-center gap-2">
                  <Mail size={18} />
                  {user.primaryEmail ?? "No email"}
                </span>

                <span className="inline-flex items-center gap-2">
                  <User size={18} />
                  Last login: {formatDateTime(user.lastLoginAt)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={busy}
              onClick={onStatusEdit}
              className="inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-5 text-lg font-medium text-primary-800 transition hover:bg-primary-50 disabled:opacity-50"
            >
              <Pencil size={19} />
              Account status
            </button>

            {onRestore && user.status !== "ACTIVE" && (
              <button
                type="button"
                disabled={busy}
                onClick={onRestore}
                className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/30 bg-white/20 px-5 text-lg font-bold text-white shadow-sm transition hover:bg-white/30 disabled:opacity-50"
                title="ស្តារអ្នកប្រើប្រាស់ឡើងវិញ (Restore)"
              >
                <RotateCcw size={19} />
                ស្តារឡើងវិញ
              </button>
            )}

            <button
              type="button"
              disabled={busy}
              onClick={onDelete}
              className="inline-flex min-h-12 items-center gap-2 rounded-full border border-red-200/30 bg-red-500/15 px-5 text-lg font-medium text-white transition hover:bg-red-500/25 disabled:opacity-50"
              title=" បញ្ឈប់ user"
            >
              <Trash2 size={19} />
              បញ្ឈប់
            </button>

            {onHardDelete && (
              <button
                type="button"
                disabled={busy}
                onClick={onHardDelete}
                className="inline-flex min-h-12 items-center gap-2 rounded-full border border-red-300 bg-red-600 px-5 text-lg font-bold text-white shadow-sm transition hover:bg-red-700 disabled:opacity-50"
                title="Permanently លុប user"
              >
                <AlertOctagon size={19} />
                លុប
              </button>
            )}
          </div>
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-3">
          <Info
            label="Email verified"
            value={user.emailVerified ? "បានផ្ទៀងផ្ទាត់" : "មិនបានផ្ទៀងផ្ទាត់"}
          />

          <Info
            label="Created"
            value={formatDateTime(user.createdAt)}
          />

          <Info
            label="Updated"
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
    <div className="rounded-3xl bg-white/20 px-5 py-4">
      <p className="text-xl text-white/80">{label}</p>
      <p className="mt-1 truncate text-lg font-medium text-white">
        {value}
      </p>
    </div>
  );
}
