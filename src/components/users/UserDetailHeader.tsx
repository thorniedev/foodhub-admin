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
  const name = displayName(user.firstName, user.lastName, user.username);

  return (
    <section className="relative overflow-hidden rounded-[28px] bg-[#137A3D] p-6 text-white shadow-[0_18px_45px_rgba(19,122,61,0.18)] sm:p-8">
      <div className="absolute -right-14 -top-24 h-72 w-72 rounded-full bg-white/10" />

      <div className="relative">
        <Link
          href="/users"
          className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-sm font-bold text-emerald-50 transition hover:bg-white/15"
        >
          <ArrowLeft size={17} />
          ត្រឡប់ទៅ Users
        </Link>

        <div className="mt-6 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white text-xl font-black text-[#137A3D] shadow-sm">
              {initials(name)}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate text-3xl font-black sm:text-3xl">{name}</p>
                <StatusBadge status={user.status} />
              </div>

              <p className="mt-1 text-sm text-emerald-50">@{user.username}</p>

              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-emerald-50">
                <span className="inline-flex items-center gap-2">
                  <Mail size={15} />
                  {user.primaryEmail ?? "No email"}
                </span>
                <span className="inline-flex items-center gap-2">
                  <User size={15} />
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
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-4 font-bold text-[#137A3D] disabled:opacity-50"
            >
              <Pencil size={17} />
              Account status
            </button>

            <button
              type="button"
              disabled={busy}
              onClick={onDelete}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-red-200/30 bg-red-500/15 px-4 font-bold text-white transition hover:bg-red-500/25 disabled:opacity-50"
            >
              <Trash2 size={17} />
              Soft delete
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <Info label="Email verified" value={user.emailVerified ? "Yes" : "No"} />
          <Info label="Created" value={formatDateTime(user.createdAt)} />
          <Info label="Updated" value={formatDateTime(user.updatedAt)} />
        </div>
      </div>
    </section>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-100">
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-bold text-white">{value}</p>
    </div>
  );
}
