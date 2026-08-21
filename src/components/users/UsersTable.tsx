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
    <div className="w-full overflow-x-auto rounded-3xl border border-gray-100 bg-white shadow-sm">
      <table className="w-full border-collapse text-left">
        {/* ================= HEAD ================= */}
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/60">
            <th className="whitespace-nowrap px-6 py-4 text-lg font-semibold text-primary-800 min-w-[280px]">
              គណនីអ្នកប្រើប្រាស់
            </th>
            <th className="whitespace-nowrap px-6 py-4 text-lg font-semibold text-primary-800 min-w-[170px]">
              កាលបរិច្ឆេទបង្កើត
            </th>
            <th className="whitespace-nowrap px-6 py-4 text-lg font-semibold text-primary-800 min-w-[140px]">
              ផ្ទៀងផ្ទាត់
            </th>
            <th className="whitespace-nowrap px-6 py-4 text-lg font-semibold text-primary-800 min-w-[140px]">
              ស្ថានភាព
            </th>
            <th className="whitespace-nowrap px-6 py-4 text-end text-lg font-semibold text-primary-800 min-w-[160px] pr-6">
              សកម្មភាព
            </th>
          </tr>
        </thead>

        {/* ================= BODY ================= */}
        <tbody>
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

            // Only show one clean subtext (Email or Username) without repetition
            const subtext = user.primaryEmail || (user.username ? `@${user.username}` : "");

            return (
              <tr
                key={user.uuid}
                className="border-b border-gray-100 bg-white transition-colors duration-150 last:border-b-0 hover:bg-gray-50/70"
              >
                {/* User column */}
                <td className="px-6 py-3.5">
                  <Link
                    href={detailHref}
                    title={`មើលព័ត៌មាន ${name}`}
                    className="group flex items-center gap-3.5 rounded-2xl outline-none transition focus-visible:ring-4 focus-visible:ring-primary-100"
                  >
                    <div className="relative shrink-0">
                      <UserAvatar
                        name={name}
                        userUuid={user.uuid}
                        avatarMediaUuid={avatarMediaUuid}
                        imageUrl={imageUrl}
                        containerClassName="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-primary-100 bg-primary-50 text-primary-800 transition group-hover:border-primary-200 group-hover:bg-primary-100 text-base font-bold"
                      />
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${
                          user.status === "ACTIVE"
                            ? "bg-emerald-400"
                            : user.status === "SUSPENDED"
                              ? "bg-amber-400"
                              : "bg-red-400"
                        }`}
                      />
                    </div>

                    <div className="min-w-0">
                      <p className="max-w-[280px] truncate text-base font-semibold text-gray-800 transition group-hover:text-primary-800">
                        {name}
                      </p>
                      {subtext && (
                        <p className="max-w-[280px] truncate text-sm text-gray-400">
                          {subtext}
                        </p>
                      )}
                    </div>
                  </Link>
                </td>

                {/* Created Date */}
                <td className="whitespace-nowrap px-6 py-3.5">
                  <div className="flex items-center gap-2 text-base font-medium text-gray-500">
                    <Calendar size={16} className="text-primary-700 shrink-0" />
                    <span>{user.createdAt ? formatDateKhmer(user.createdAt) : "—"}</span>
                  </div>
                </td>

                {/* Verified */}
                <td className="whitespace-nowrap px-6 py-3.5">
                  {user.emailVerified ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-100">
                      <CheckCircle size={13} />
                      បានផ្ទៀងផ្ទាត់
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 border border-amber-100">
                      <XCircle size={13} />
                      មិនទាន់
                    </span>
                  )}
                </td>

                {/* Status */}
                <td className="whitespace-nowrap px-6 py-3.5">
                  <StatusBadge status={user.status} />
                </td>

                {/* Actions */}
                <td className="px-6 py-2">
                  <div className="flex items-center justify-end gap-2 pr-2">
                    {/* View */}
                    <Link
                      href={detailHref}
                      className="flex h-10 w-10 items-center justify-center rounded-xl text-primary-700 transition hover:bg-primary-50 hover:text-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-100"
                      title="មើលលម្អិត"
                    >
                      <Eye size={20} />
                    </Link>

                    {/* ACTIVE: edit + suspend + delete */}
                    {isActive && (
                      <>
                        <button
                          type="button"
                          disabled={disabled}
                          onClick={() => onProfileEdit(user)}
                          className="flex h-10 w-10 items-center justify-center rounded-xl text-blue-500 transition hover:bg-blue-50 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-40"
                          title="កែប្រែ"
                        >
                          <Pencil size={20} />
                        </button>

                        {onSuspend && (
                          <button
                            type="button"
                            disabled={disabled}
                            onClick={() => onSuspend(user)}
                            className="flex h-10 w-10 items-center justify-center rounded-xl text-amber-500 transition hover:bg-amber-50 focus:outline-none focus:ring-4 focus:ring-amber-100 disabled:cursor-not-allowed disabled:opacity-40"
                            title="ផ្អាកដំណើរការ"
                          >
                            <AlertTriangle size={20} />
                          </button>
                        )}

                        {onHardDelete && (
                          <button
                            type="button"
                            disabled={disabled}
                            onClick={() => onHardDelete(user)}
                            className="flex h-10 w-10 items-center justify-center rounded-xl text-red-500 transition hover:bg-red-50 focus:outline-none focus:ring-4 focus:ring-red-100 disabled:cursor-not-allowed disabled:opacity-40"
                            title="លុប"
                          >
                            <Trash2 size={20} />
                          </button>
                        )}
                      </>
                    )}

                    {/* SUSPENDED: restore + delete */}
                    {isSuspended && (
                      <>
                        {onRestore && (
                          <button
                            type="button"
                            disabled={disabled}
                            onClick={() => onRestore(user)}
                            className="flex h-10 w-10 items-center justify-center rounded-xl text-primary-700 transition hover:bg-primary-50 focus:outline-none focus:ring-4 focus:ring-primary-100 disabled:cursor-not-allowed disabled:opacity-40"
                            title="ស្តារឡើងវិញ"
                          >
                            <RotateCcw size={20} />
                          </button>
                        )}

                        {onHardDelete && (
                          <button
                            type="button"
                            disabled={disabled}
                            onClick={() => onHardDelete(user)}
                            className="flex h-10 w-10 items-center justify-center rounded-xl text-red-500 transition hover:bg-red-50 focus:outline-none focus:ring-4 focus:ring-red-100 disabled:cursor-not-allowed disabled:opacity-40"
                            title="លុប"
                          >
                            <Trash2 size={20} />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}

          {users.length === 0 && (
            <tr>
              <td colSpan={5} className="py-12 text-center text-gray-400">
                <div className="flex flex-col items-center justify-center gap-3">
                  <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gray-50 text-gray-400">
                    <Shield size={28} />
                  </div>
                  <p className="text-lg font-medium text-gray-500">
                    មិនមានគណនីអ្នកប្រើប្រាស់
                  </p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const normalized = String(status || "UNKNOWN").toUpperCase();

  const className =
    normalized === "ACTIVE"
      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
      : normalized === "SUSPENDED"
        ? "bg-amber-50 text-amber-700 border-amber-100"
        : "bg-gray-100 text-gray-500 border-gray-200";

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
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1 text-sm font-semibold border ${className}`}
    >
      <span className={`h-2 w-2 shrink-0 rounded-full ${dotClassName}`} />
      {label}
    </span>
  );
}