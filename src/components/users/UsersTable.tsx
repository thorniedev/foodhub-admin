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
    <div className="w-full min-w-0 max-w-full overflow-x-auto">
      <table className="w-full min-w-[1050px] border-collapse text-left">
        {/* ================= HEAD ================= */}
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/70">
            <th className="whitespace-nowrap px-6 py-5 text-xl font-bold text-primary-800 min-w-[300px]">
              គណនីអ្នកប្រើប្រាស់
            </th>
            <th className="whitespace-nowrap px-6 py-5 text-xl font-bold text-primary-800 min-w-[180px]">
              កាលបរិច្ឆេទបង្កើត
            </th>
            <th className="whitespace-nowrap px-6 py-5 text-xl font-bold text-primary-800 min-w-[160px]">
              ផ្ទៀងផ្ទាត់
            </th>
            <th className="whitespace-nowrap px-6 py-5 text-xl font-bold text-primary-800 min-w-[160px]">
              ស្ថានភាព
            </th>
            <th className="whitespace-nowrap px-6 py-5 text-end text-xl font-bold text-primary-800 min-w-[170px] pr-6">
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
                <td className="px-6 py-5">
                  <Link
                    href={detailHref}
                    title={`មើលព័ត៌មាន ${name}`}
                    className="group flex items-center gap-4 rounded-2xl outline-none transition focus-visible:ring-4 focus-visible:ring-primary-100"
                  >
                    <div className="relative shrink-0">
                      <UserAvatar
                        name={name}
                        userUuid={user.uuid}
                        avatarMediaUuid={avatarMediaUuid}
                        imageUrl={imageUrl}
                        containerClassName="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-primary-100 bg-primary-50 text-primary-800 transition group-hover:border-primary-200 group-hover:bg-primary-100 text-xl font-bold ring-1 ring-black/5 shadow-xs"
                      />
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white ${
                          user.status === "ACTIVE"
                            ? "bg-emerald-500"
                            : user.status === "SUSPENDED"
                              ? "bg-amber-500"
                              : "bg-red-500"
                        }`}
                      />
                    </div>

                    <div className="min-w-0">
                      <p className="max-w-[280px] truncate text-xl font-bold text-gray-900 transition group-hover:text-primary-800">
                        {name}
                      </p>
                      {subtext && (
                        <p className="max-w-[280px] truncate text-lg font-medium text-gray-400">
                          {subtext}
                        </p>
                      )}
                    </div>
                  </Link>
                </td>

                {/* Created Date */}
                <td className="whitespace-nowrap px-6 py-5">
                  <div className="flex items-center gap-2 text-lg font-medium text-gray-600">
                    <Calendar size={20} className="text-primary-700 shrink-0" />
                    <span>{user.createdAt ? formatDateKhmer(user.createdAt) : "—"}</span>
                  </div>
                </td>

                {/* Verified */}
                <td className="whitespace-nowrap px-6 py-5">
                  {user.emailVerified ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-4 py-1.5 text-lg font-bold text-emerald-700 border border-emerald-100">
                      <CheckCircle size={18} />
                      បានផ្ទៀងផ្ទាត់
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-4 py-1.5 text-lg font-bold text-amber-700 border border-amber-100">
                      <XCircle size={18} />
                      មិនទាន់
                    </span>
                  )}
                </td>

                {/* Status */}
                <td className="whitespace-nowrap px-6 py-5">
                  <StatusBadge status={user.status} />
                </td>

                {/* Actions */}
                <td className="px-6 py-5">
                  <div className="flex items-center justify-end gap-2.5 pr-2">
                    {/* View */}
                    <Link
                      href={detailHref}
                      className="flex h-11 w-11 items-center justify-center rounded-xl text-primary-700 transition hover:bg-primary-50 hover:text-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-100"
                      title="មើលលម្អិត"
                    >
                      <Eye size={22} />
                    </Link>

                    {/* ACTIVE: edit + suspend + delete */}
                    {isActive && (
                      <>
                        <button
                          type="button"
                          disabled={disabled}
                          onClick={() => onProfileEdit(user)}
                          className="flex h-11 w-11 items-center justify-center rounded-xl text-blue-600 transition hover:bg-blue-50 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-40"
                          title="កែប្រែ"
                        >
                          <Pencil size={22} />
                        </button>

                        {onSuspend && (
                          <button
                            type="button"
                            disabled={disabled}
                            onClick={() => onSuspend(user)}
                            className="flex h-11 w-11 items-center justify-center rounded-xl text-amber-600 transition hover:bg-amber-50 focus:outline-none focus:ring-4 focus:ring-amber-100 disabled:cursor-not-allowed disabled:opacity-40"
                            title="ផ្អាកដំណើរការ"
                          >
                            <AlertTriangle size={22} />
                          </button>
                        )}

                        {onHardDelete && (
                          <button
                            type="button"
                            disabled={disabled}
                            onClick={() => onHardDelete(user)}
                            className="flex h-11 w-11 items-center justify-center rounded-xl text-red-600 transition hover:bg-red-50 focus:outline-none focus:ring-4 focus:ring-red-100 disabled:cursor-not-allowed disabled:opacity-40"
                            title="លុប"
                          >
                            <Trash2 size={22} />
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
                            className="flex h-11 w-11 items-center justify-center rounded-xl text-primary-700 transition hover:bg-primary-50 focus:outline-none focus:ring-4 focus:ring-primary-100 disabled:cursor-not-allowed disabled:opacity-40"
                            title="ស្តារឡើងវិញ"
                          >
                            <RotateCcw size={22} />
                          </button>
                        )}

                        {onHardDelete && (
                          <button
                            type="button"
                            disabled={disabled}
                            onClick={() => onHardDelete(user)}
                            className="flex h-11 w-11 items-center justify-center rounded-xl text-red-600 transition hover:bg-red-50 focus:outline-none focus:ring-4 focus:ring-red-100 disabled:cursor-not-allowed disabled:opacity-40"
                            title="លុប"
                          >
                            <Trash2 size={22} />
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
              <td colSpan={5} className="py-16 text-center text-gray-400">
                <div className="flex flex-col items-center justify-center gap-4">
                  <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gray-50 text-gray-400">
                    <Shield size={36} />
                  </div>
                  <p className="text-2xl font-bold text-gray-500">
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
      className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-1.5 text-lg font-bold border ${className}`}
    >
      <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${dotClassName}`} />
      {label}
    </span>
  );
}