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
          <tr className="border-b border-gray-100 bg-gray-50/50">
            <th className="px-5 py-4 text-xl font-bold text-[#136C34]">អ្នកប្រើ</th>
            {/* <th className="px-5 py-4 text-xl font-bold text-[#136C34]">Username</th> */}
            <th className="px-5 py-4 text-xl font-bold text-[#136C34]">Email</th>
            <th className="px-5 py-4 text-xl font-bold text-[#136C34]">Verified</th>
            <th className="px-5 py-4 text-xl font-bold text-[#136C34]">ស្ថានភាព</th>
            <th className="px-5 py-4 text-right text-xl font-bold text-[#136C34]">សកម្មភាព</th>
          </tr>
        </thead>

        <tbody>
          {users.map((user) => {
            const name = displayName(
              user.firstName,
              user.lastName,
              user.username,
            );

            return (
              <tr
                key={user.uuid}
                className="border-b border-gray-100 bg-white transition last:border-0 hover:bg-gray-50/60"
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-lg font-bold text-[#136C34]">
                      {initials(name)}
                    </div>

                    <p className="truncate text-lg text-gray-800">{name}</p>
                  </div>
                </td>
{/* 
                <td className="px-5 py-4 text-base text-gray-700">
                  {user.username}
                </td> */}

                <td className="max-w-[300px] px-5 py-4 text-base text-gray-500">
                  <p className="truncate">{user.primaryEmail ?? "—"}</p>
                </td>

                <td className="px-5 py-4">
                  {user.emailVerified ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-base text-emerald-700">
                      <CheckCircle size={15} />
                      Yes
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-base text-amber-700">
                      <XCircle size={15} />
                      No
                    </span>
                  )}
                </td>

                <td className="px-5 py-4">
                  <StatusBadge status={user.status} />
                </td>

                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/users/${user.uuid}`}
                      title="View user profiles"
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-emerald-600 transition hover:bg-emerald-50"
                    >
                      <Eye size={18} />
                    </Link>

                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => onStatusEdit(user)}
                      title="Change status"
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-blue-500 transition hover:bg-blue-50 disabled:opacity-40"
                    >
                      <Pencil size={18} />
                    </button>

                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => onDelete(user)}
                      title="Soft delete"
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-red-400 transition hover:bg-red-50 disabled:opacity-40"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}

          {users.length === 0 && (
            <tr>
              <td colSpan={6} className="px-5 py-16 text-center text-lg text-gray-400">
                មិនមានអ្នកប្រើប្រាស់
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export function StatusBadge({
  status,
}: {
  status: string;
}) {
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
    <span className={`inline-flex rounded-full px-3 py-1 text-lg ${className}`}>
      {status || "UNKNOWN"}
    </span>
  );
}
