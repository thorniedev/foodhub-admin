import Link from "next/link";

import {
  Calendar,
  CheckCircle,
  Eye,
  Mail,
  Pencil,
  RotateCcw,
  Shield,
  AlertTriangle,
  Trash2,
  User as UserIcon,
  XCircle,
} from "lucide-react";

import type { AdminUser } from "@/src/types/userProfile";

import { displayName, formatDateKhmer } from "@/src/lib/userProfileFormat";
import UserAvatar from "./UserAvatar";

interface UsersTableProps {
  users: AdminUser[];
  disabled?: boolean;
  onProfileEdit: (user: AdminUser) => void;
  onSuspend?: (user: AdminUser) => void;
  onDelete?: (user: AdminUser) => void;
  onHardDelete?: (user: AdminUser) => void;
  onRestore?: (user: AdminUser) => void;
}

export default function UsersTable({
  users,
  disabled = false,
  onProfileEdit,
  onSuspend,
  onHardDelete,
  onRestore,
}: UsersTableProps) {
  return (
    <div className="w-full min-w-0 max-w-full">
      {/* Table header */}
      <div className="border-b border-gray-100 bg-gray-50/60 px-6 py-3">
        <div className="grid min-w-[960px] grid-cols-[minmax(260px,1.5fr)_minmax(140px,1fr)_minmax(160px,1.2fr)_140px_140px_160px] items-center gap-4">
          <span className="text-sm font-semibold uppercase tracking-wide text-gray-400">
            គណនីគណនីអ្នកប្រើប្រាស់
          </span>
          <span className="text-sm font-semibold uppercase tracking-wide text-gray-400">
            ឈ្មោះគណនី
          </span>
          <span className="text-sm font-semibold uppercase tracking-wide text-gray-400">
            កាលបរិច្ឆេទបង្កើត
          </span>
          <span className="text-sm font-semibold uppercase tracking-wide text-gray-400">
            ផ្ទៀងផ្ទាត់
          </span>
          <span className="text-sm font-semibold uppercase tracking-wide text-gray-400">
            ស្ថានភាព
          </span>
          <span className="text-right text-sm font-semibold uppercase tracking-wide text-gray-400 pr-3">
            សកម្មភាព
          </span>
        </div>
      </div>

      {/* Rows */}
      <div className="overflow-x-auto">
        <div className="min-w-[960px] divide-y divide-gray-50">
          {users.map((user) => {
            const name = displayName(
              user.firstName,
              user.lastName,
              user.username,
            );

            const detailHref = `/users/${user.uuid}`;

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

            const isActive = user.status === "ACTIVE";
            const isSuspended = user.status === "SUSPENDED";
            const isDeletedOrDisabled =
              user.status === "DELETED" || user.status === "DISABLED";
            const isDisabledOrDeleted = isSuspended || isDeletedOrDisabled;

            return (
              <div
                key={user.uuid}
                className={`group relative grid grid-cols-[minmax(260px,1.5fr)_minmax(140px,1fr)_minmax(160px,1.2fr)_140px_140px_160px] items-center gap-4 px-6 py-4 transition-all duration-150 ${isDisabledOrDeleted
                    ? "bg-red-50/30 hover:bg-red-50/50"
                    : "hover:bg-primary-50/30"
                  }`}
              >
                {/* Left accent bar on hover */}
                <span
                  className={`pointer-events-none absolute inset-y-0 left-0 w-[3px] rounded-r-full opacity-0 transition-opacity duration-150 group-hover:opacity-100 ${isDisabledOrDeleted ? "bg-red-400" : "bg-primary-500"
                    }`}
                />

                {/* User info cell */}
                <Link
                  href={detailHref}
                  title={`មើលព័ត៌មាន ${name}`}
                  className="flex min-w-0 items-center gap-3.5 rounded-2xl outline-none transition focus-visible:ring-4 focus-visible:ring-primary-100"
                >
                  <div className="relative shrink-0">
                    <UserAvatar
                      name={name}
                      userUuid={user.uuid}
                      avatarMediaUuid={avatarMediaUuid}
                      imageUrl={imageUrl}
                      containerClassName={`flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border text-base font-bold transition-all duration-150 ${isDisabledOrDeleted
                          ? "border-red-100 bg-red-50 text-red-400 grayscale"
                          : "border-primary-100 bg-primary-50 text-primary-700 group-hover:border-primary-200 group-hover:shadow-md"
                        }`}
                    />
                    {/* Online / status dot */}
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${user.status === "ACTIVE"
                          ? "bg-emerald-400"
                          : user.status === "SUSPENDED"
                            ? "bg-amber-400"
                            : "bg-red-400"
                        }`}
                    />
                  </div>

                  <div className="min-w-0">
                    <p
                      className={`truncate text-[15px] font-semibold transition-colors duration-150 ${isDisabledOrDeleted
                          ? "text-gray-400 line-through"
                          : "text-gray-800 group-hover:text-primary-700"
                        }`}
                    >
                      {name}
                    </p>

                    {user.primaryEmail && (
                      <p className="mt-0.5 flex items-center gap-1.5 truncate text-sm text-gray-400">
                        <Mail size={12} className="shrink-0" />
                        {user.primaryEmail}
                      </p>
                    )}
                  </div>
                </Link>

                {/* Username cell */}
                <div className="min-w-0">
                  <span className="inline-flex items-center gap-1 rounded-lg bg-gray-50 px-2.5 py-1 text-sm font-medium text-gray-600 ring-1 ring-inset ring-gray-200/70">
                    <UserIcon size={12} className="text-gray-400" />
                    <span className="truncate">@{user.username || "—"}</span>
                  </span>
                </div>

                {/* Created Date cell */}
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 text-sm text-gray-600">
                    <Calendar size={13} className="shrink-0 text-gray-400" />
                    <span>{user.createdAt ? formatDateKhmer(user.createdAt) : "—"}</span>
                  </p>
                </div>

                {/* Verified cell */}
                <div>
                  {user.emailVerified ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200">
                      <CheckCircle size={14} />
                      បានផ្ទៀងផ្ទាត់
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-600 ring-1 ring-inset ring-amber-200">
                      <XCircle size={14} />
                      មិនទាន់
                    </span>
                  )}
                </div>

                {/* Status cell */}
                <div>
                  <StatusBadge status={user.status} />
                </div>

                {/* Actions cell */}
                <div className="flex items-center justify-end gap-1 pr-2">
                  {/* View — always visible */}
                  <Link
                    href={detailHref}
                    title="មើលព័ត៌មាន និង Profiles"
                    className="flex h-9 w-9 items-center justify-center rounded-xl text-primary-600 transition hover:bg-primary-100 hover:text-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-100"
                  >
                    <Eye size={17} />
                  </Link>

                  {/* ACTIVE: edit + suspend + hard-delete */}
                  {isActive && (
                    <>
                      <button
                        type="button"
                        disabled={disabled}
                        onClick={() => onProfileEdit(user)}
                        title="កែប្រែព័ត៌មានគណនី"
                        className="flex h-9 w-9 items-center justify-center rounded-xl text-blue-500 transition hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Pencil size={17} />
                      </button>

                      {onSuspend && (
                        <button
                          type="button"
                          disabled={disabled}
                          onClick={() => onSuspend(user)}
                          title="ផ្អាកដំណើរការ"
                          className="flex h-9 w-9 items-center justify-center rounded-xl text-amber-500 transition hover:bg-amber-50 hover:text-amber-700 focus:outline-none focus:ring-4 focus:ring-amber-100 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <AlertTriangle size={17} />
                        </button>
                      )}

                      {onHardDelete && (
                        <button
                          type="button"
                          disabled={disabled}
                          onClick={() => onHardDelete(user)}
                          title="លុបចេញពីប្រព័ន្ធ"
                          className="flex h-9 w-9 items-center justify-center rounded-xl text-red-500 transition hover:bg-red-50 hover:text-red-700 focus:outline-none focus:ring-4 focus:ring-red-100 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Trash2 size={17} />
                        </button>
                      )}
                    </>
                  )}

                  {/* SUSPENDED: restore + hard-delete */}
                  {isSuspended && (
                    <>
                      {onRestore && (
                        <button
                          type="button"
                          disabled={disabled}
                          onClick={() => onRestore(user)}
                          title="ស្តារឡើងវិញ"
                          className="flex h-9 w-9 items-center justify-center rounded-xl text-primary-600 transition hover:bg-primary-50 hover:text-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-100 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <RotateCcw size={17} />
                        </button>
                      )}

                      {onHardDelete && (
                        <button
                          type="button"
                          disabled={disabled}
                          onClick={() => onHardDelete(user)}
                          title="លុបចេញពីប្រព័ន្ធ"
                          className="flex h-9 w-9 items-center justify-center rounded-xl text-red-500 transition hover:bg-red-50 hover:text-red-700 focus:outline-none focus:ring-4 focus:ring-red-100 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Trash2 size={17} />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}

          {users.length === 0 && (
            <div className="flex min-h-[280px] flex-col items-center justify-center gap-3 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gray-50">
                <Shield size={28} className="text-gray-300" />
              </div>
              <p className="text-base font-medium text-gray-400">
                មិនមានគណនីអ្នកប្រើប្រាស់
              </p>
              <p className="text-sm text-gray-300">
                ទិន្នន័យអ្នកប្រើនឹងបង្ហាញនៅទីនេះ
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const normalized = String(status || "UNKNOWN").toUpperCase();

  const className =
    normalized === "ACTIVE"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : normalized === "SUSPENDED"
        ? "bg-amber-50 text-amber-600 ring-amber-200"
        : "bg-gray-100 text-gray-500 ring-gray-200";

  const dotClassName =
    normalized === "ACTIVE"
      ? "bg-emerald-500"
      : normalized === "SUSPENDED"
        ? "bg-amber-500"
        : "bg-gray-400";

  const label =
    normalized === "ACTIVE"
      ? "សកម្ម"
      : normalized === "SUSPENDED"
        ? "ផ្អាកដំណើរការ"
        : normalized;

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium ring-1 ring-inset ${className}`}
    >
      <span className={`h-2 w-2 shrink-0 rounded-full ${dotClassName}`} />
      {label}
    </span>
  );
}
