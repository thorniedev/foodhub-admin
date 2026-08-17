import Link from "next/link";

import { AlertOctagon, CheckCircle, Eye, Pencil, Trash2, XCircle } from "lucide-react";

import type { AdminUser } from "@/src/types/userProfile";

import { displayName, initials } from "@/src/lib/userProfileFormat";
import UserAvatar from "./UserAvatar";

interface UsersTableProps {
  users: AdminUser[];
  disabled?: boolean;
  onStatusEdit: (user: AdminUser) => void;
  onDelete: (user: AdminUser) => void;
  onHardDelete?: (user: AdminUser) => void;
}

export default function UsersTable({
  users,
  disabled = false,
  onStatusEdit,
  onDelete,
  onHardDelete,
}: UsersTableProps) {
  return (
    <div className="w-full min-w-0 max-w-full overflow-x-auto">
      <table className="w-full min-w-[1080px] border-collapse text-left">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/70">
            <th className="px-6 py-4 text-xl font-semibold text-primary-800">
              អ្នកប្រើ
            </th>

            {/* <th className="px-6 py-4 text-xl font-semibold text-primary-800">
              Email
            </th> */}

            <th className="px-6 py-4 text-xl font-semibold text-primary-800">
              Verified
            </th>

            <th className="px-6 py-4 text-xl font-semibold text-primary-800">
              ស្ថានភាព
            </th>

            <th className="px-6 py-4 text-center text-xl font-semibold text-primary-800">
              សកម្មភាព
            </th>
          </tr>
        </thead>

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

            return (
              <tr
                key={user.uuid}
                className="border-b border-gray-100 bg-white transition-colors duration-150 last:border-b-0 hover:bg-gray-50/70"
              >
                <td className="px-6 py-4">
                  <Link
                    href={detailHref}
                    title={`មើលព័ត៌មាន ${name}`}
                    className="group flex min-w-[260px] items-center gap-4 rounded-2xl outline-none transition focus-visible:ring-4 focus-visible:ring-primary-100"
                  >
                    <UserAvatar
                      name={name}
                      userUuid={user.uuid}
                      avatarMediaUuid={avatarMediaUuid}
                      imageUrl={imageUrl}
                      containerClassName="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-primary-100 bg-primary-50 text-lg font-semibold text-primary-800 transition group-hover:border-primary-200 group-hover:bg-primary-100"
                    />

                    <div className="min-w-0">
                      <p className="max-w-[250px] truncate text-lg font-medium text-gray-800 transition group-hover:text-primary-800">
                        {name}
                      </p>

                      <p className="mt-1 truncate text-base text-gray-400">
                        {user.username}
                      </p>
                    </div>
                  </Link>
                </td>

                {/* <td className="max-w-[320px] px-6 py-4">
                  <p className="truncate text-lg text-gray-500">
                    {user.primaryEmail ?? "—"}
                  </p>
                </td> */}

                <td className="px-6 py-4">
                  {user.emailVerified ? (
                    <span className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3.5 py-1.5 text-lg font-medium text-primary-700 ring-1 ring-inset ring-primary-100">
                      <CheckCircle size={17} />
                      បានផ្ទៀងផ្ទាត់
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 rounded-full bg-secondary-50 px-3.5 py-1.5 text-lg font-medium text-secondary-600 ring-1 ring-inset ring-secondary-100">
                      <XCircle size={17} />
                      មិនបានផ្ទៀងផ្ទាត់
                    </span>
                  )}
                </td>

                <td className="px-6 py-4">
                  <StatusBadge status={user.status} />
                </td>

                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={detailHref}
                      title="View user profiles"
                      className="flex h-10 w-10 items-center justify-center rounded-xl text-primary-700 transition hover:bg-primary-50 hover:text-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-100"
                    >
                      <Eye size={20} />
                    </Link>

                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => onStatusEdit(user)}
                      title="Change status"
                      className="flex h-10 w-10 items-center justify-center rounded-xl text-blue-500 transition hover:bg-blue-50 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Pencil size={20} />
                    </button>

                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => onDelete(user)}
                      title=" បញ្ឈប់"
                      className="flex h-10 w-10 items-center justify-center rounded-xl text-amber-600 transition hover:bg-amber-50 focus:outline-none focus:ring-4 focus:ring-amber-100 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Trash2 size={20} />
                    </button>

                    {onHardDelete && (
                      <button
                        type="button"
                        disabled={disabled}
                        onClick={() => onHardDelete(user)}
                        title="លុប (Permanent)"
                        className="flex h-10 w-10 items-center justify-center rounded-xl text-red-600 transition hover:bg-red-50 focus:outline-none focus:ring-4 focus:ring-red-100 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <AlertOctagon size={20} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}

          {users.length === 0 && (
            <tr>
              <td colSpan={5} className="px-6 py-16 text-center">
                <p className="text-lg font-medium text-gray-500">
                  មិនមានអ្នកប្រើប្រាស់
                </p>

                <p className="mt-1 text-lg text-gray-400">
                  ទិន្នន័យអ្នកប្រើនឹងបង្ហាញនៅទីនេះ
                </p>
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
      ? "bg-primary-50 text-primary-700 ring-primary-100"
      : normalized === "SUSPENDED"
        ? "bg-secondary-50 text-secondary-600 ring-secondary-100"
        : normalized === "DELETED" || normalized === "DISABLED"
          ? "bg-red-50 text-red-600 ring-red-100"
          : "bg-gray-100 text-gray-600 ring-gray-200";

  const dotClassName =
    normalized === "ACTIVE"
      ? "bg-primary-600"
      : normalized === "SUSPENDED"
        ? "bg-secondary-500"
        : normalized === "DELETED" || normalized === "DISABLED"
          ? "bg-red-500"
          : "bg-gray-400";

  const label =
    normalized === "ACTIVE"
      ? "សកម្ម"
      : normalized === "SUSPENDED"
        ? "SUSPENDED"
        : normalized === "DISABLED"
          ? "DISABLED"
          : normalized;

  return (
    <span
      className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full px-3.5 py-1.5 text-lg font-medium ring-1 ring-inset ${className}`}
    >
      <span className={`h-2 w-2 shrink-0 rounded-full ${dotClassName}`} />
      {label}
    </span>
  );
}
