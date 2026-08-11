import Link from "next/link";

import {
  ArrowLeft,
  Mail,
  Pencil,
  Trash2,
  User,
} from "lucide-react";

import type { AdminUser } from "@/src/types/userProfile";

import {
  displayName,
  formatDateTime,
  initials,
} from "@/src/lib/userProfileFormat";

import { StatusBadge } from "./UsersTable";

interface UserDetailHeaderProps {
  user: AdminUser;
  busy?: boolean;
  onStatusEdit: () => void;
  onDelete: () => void;
}

export default function UserDetailHeader({
  user,
  busy = false,
  onStatusEdit,
  onDelete,
}: UserDetailHeaderProps) {
  const name = displayName(
    user.firstName,
    user.lastName,
    user.username,
  );

  return (
    <section className="relative overflow-hidden rounded-[30px] bg-[#14833E] px-6 py-7 text-white shadow-sm sm:px-8 sm:py-8">
      <div className="pointer-events-none absolute -right-12 -top-16 h-52 w-52 rounded-full bg-white/5" />
      <div className="pointer-events-none absolute -bottom-24 right-20 h-64 w-64 rounded-full bg-white/5" />

      <div className="relative">
        <Link
          href="/users"
          className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-base text-white transition hover:bg-white/15"
        >
          <ArrowLeft size={17} />
          ត្រឡប់ទៅ Users
        </Link>

        <div className="mt-6 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[24px] bg-white text-2xl font-bold text-[#137A3D] shadow-sm">
              {initials(name)}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <p className="truncate text-4xl font-bold">
                  {name}
                </p>

                <StatusBadge status={user.status} />
              </div>

              <p className="mt-2 text-lg text-white/85">
                @{user.username}
              </p>

              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-base text-white/85">
                <span className="inline-flex items-center gap-2">
                  <Mail size={16} />
                  {user.primaryEmail ?? "No email"}
                </span>

                <span className="inline-flex items-center gap-2">
                  <User size={16} />
                  Last login: {formatDateTime(user.lastLoginAt)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={onStatusEdit}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-4 text-lg text-[#137A3D] transition hover:bg-emerald-50 disabled:opacity-50"
            >
              <Pencil size={17} />
              Account status
            </button>

            <button
              type="button"
              disabled={busy}
              onClick={onDelete}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-red-200/30 bg-red-500/15 px-4 text-lg text-white transition hover:bg-red-500/25 disabled:opacity-50"
            >
              <Trash2 size={17} />
              Soft delete
            </button>
          </div>
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-3">
          <Info
            label="Email verified"
            value={user.emailVerified ? "Yes" : "No"}
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
    <div className="rounded-3xl bg-white/10 px-5 py-4">
      <p className="text-xl text-white/75">{label}</p>
      <p className="mt-1 truncate text-lg text-white">{value}</p>
    </div>
  );
}
