import Link from "next/link";
import {
  CheckCircle,
  Eye,
  Pencil,
  Trash2,
  XCircle,
} from "lucide-react";

import type { AdminUser } from "@/src/types/userProfile";
import {
  displayName,
  formatDateTime,
  initials,
} from "@/src/lib/userProfileFormat";

interface UsersTableProps {
  users: AdminUser[];
  disabled?: boolean;
  onStatusEdit: (user: AdminUser) => void;
  onDelete: (user: AdminUser) => void;
}

export default function UsersTable({
  users,
  disabled = false,
  onStatusEdit,
  onDelete,
}: UsersTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-[1080px] w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/70 text-[13px] font-bold uppercase tracking-wide text-gray-500">
            <th className="px-5 py-4">អ្នកប្រើ</th>
            <th className="px-5 py-4">Username</th>
            <th className="px-5 py-4">Email</th>
            <th className="px-5 py-4">Verified</th>
            <th className="px-5 py-4">ស្ថានភាព</th>
            <th className="px-5 py-4">ចូលចុងក្រោយ</th>
            <th className="px-5 py-4">បង្កើតនៅ</th>
            <th className="px-5 py-4 text-right">សកម្មភាព</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">
          {users.map((user) => {
            const name = displayName(
              user.firstName,
              user.lastName,
              user.username,
            );

            return (
              <tr
                key={user.uuid}
                className="bg-white text-sm text-gray-600 transition hover:bg-emerald-50/30"
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-black text-[#137A3D]">
                      {initials(name)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-bold text-gray-900">{name}</p>
                      <p className="mt-0.5 max-w-[210px] truncate text-xs text-gray-400">
                        {user.uuid}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-5 py-4 font-medium text-gray-700">
                  {user.username}
                </td>

                <td className="px-5 py-4">
                  {user.primaryEmail ?? "—"}
                </td>

                <td className="px-5 py-4">
                  {user.emailVerified ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                      <CheckCircle size={14} />
                      Yes
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
                      <XCircle size={14} />
                      No
                    </span>
                  )}
                </td>

                <td className="px-5 py-4">
                  <StatusBadge status={user.status} />
                </td>

                <td className="px-5 py-4">
                  {formatDateTime(user.lastLoginAt)}
                </td>

                <td className="px-5 py-4">
                  {formatDateTime(user.createdAt)}
                </td>

                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-1.5">
                    <Link
                      href={`/users/${user.uuid}`}
                      title="View user profiles"
                      className="flex h-9 w-9 items-center justify-center rounded-xl text-emerald-600 transition hover:bg-emerald-50"
                    >
                      <Eye size={18} />
                    </Link>

                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => onStatusEdit(user)}
                      title="Change status"
                      className="flex h-9 w-9 items-center justify-center rounded-xl text-blue-500 transition hover:bg-blue-50 disabled:opacity-40"
                    >
                      <Pencil size={17} />
                    </button>

                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => onDelete(user)}
                      title="Soft delete"
                      className="flex h-9 w-9 items-center justify-center rounded-xl text-red-500 transition hover:bg-red-50 disabled:opacity-40"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const normalized = status?.toUpperCase();

  const className =
    normalized === "ACTIVE"
      ? "bg-emerald-50 text-emerald-700"
      : normalized === "SUSPENDED"
        ? "bg-amber-50 text-amber-700"
        : normalized === "DELETED"
          ? "bg-red-50 text-red-700"
          : "bg-gray-100 text-gray-600";

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${className}`}>
      {status || "UNKNOWN"}
    </span>
  );
}
