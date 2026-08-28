"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import {
  Calendar,
  CheckCircle,
  Eye,
  Mail,
  MoreVertical,
  Pencil,
  RotateCcw,
  Shield,
  AlertTriangle,
  Trash2,
  XCircle,
} from "lucide-react";

import type { AdminUser } from "@/src/types/userProfile";

import {
  canManageAdminUser,
  getAdminUserPrimaryRole,
} from "@/src/lib/adminUserRoles";
import { displayName, formatDateKhmer } from "@/src/lib/userProfileFormat";
import UserAvatar from "./UserAvatar";

interface UsersTableProps {
  users: AdminUser[];
  currentAdminRole: string;
  disabled?: boolean;
  onProfileEdit: (user: AdminUser) => void;
  onSuspend?: (user: AdminUser) => void;
  onDelete?: (user: AdminUser) => void;
  onHardDelete?: (user: AdminUser) => void;
  onRestore?: (user: AdminUser) => void;
}

export default function UsersTable({
  users,
  currentAdminRole,
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
          <tr className="border-b border-gray-100 bg-gray-50/60 text-left text-lg font-normal text-primary-800">
            <th className="whitespace-nowrap px-6 py-4 font-normal min-w-[280px]">
              គណនីអ្នកប្រើប្រាស់
            </th>
            <th className="whitespace-nowrap px-6 py-4 font-normal min-w-[170px]">
              កាលបរិច្ឆេទបង្កើត
            </th>
            <th className="whitespace-nowrap px-6 py-4 font-normal min-w-[140px]">
              ផ្ទៀងផ្ទាត់
            </th>
            <th className="whitespace-nowrap px-6 py-4 font-normal min-w-[140px]">
              ស្ថានភាព
            </th>
            <th className="whitespace-nowrap px-6 py-4 text-end font-normal min-w-[160px] pr-6">
              សកម្មភាព
            </th>
          </tr>
        </thead>

        {/* ================= BODY ================= */}
        <tbody>
          {users.map((user, index) => {
            const name = displayName(
              user.firstName,
              user.lastName,
              user.username,
            );

            const detailHref = `/users/${user.uuid}`;

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

            const isActive = user.status === "ACTIVE";
            const isSuspended = user.status === "SUSPENDED";
            const role = getAdminUserPrimaryRole(user);
            const canManage = canManageAdminUser(currentAdminRole, user);
            const actionDisabled = disabled || !canManage;

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
                        containerClassName="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-primary-100 bg-primary-50 text-primary-800 transition group-hover:border-primary-200 group-hover:bg-primary-100 text-lg font-normal"
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
                      <p className="max-w-[280px] truncate text-lg font-normal text-gray-800 transition group-hover:text-primary-800">
                        {name}
                      </p>
                      {subtext && (
                        <p className="max-w-[280px] truncate text-base font-normal text-gray-400">
                          {subtext}
                        </p>
                      )}
                      <span className="mt-1 inline-flex rounded-full border border-primary-100 bg-primary-50 px-2.5 py-0.5 text-sm font-normal uppercase tracking-wide text-primary-700">
                        {role}
                      </span>
                    </div>
                  </Link>
                </td>

                {/* Created Date */}
                <td className="whitespace-nowrap px-6 py-3.5">
                  <div className="flex items-center gap-2 text-lg font-normal text-gray-600">
                    <Calendar size={18} className="text-primary-700 shrink-0" />
                    <span>{user.createdAt ? formatDateKhmer(user.createdAt) : "—"}</span>
                  </div>
                </td>

                {/* Verified */}
                <td className="whitespace-nowrap px-6 py-3.5">
                  {user.emailVerified ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3.5 py-1 text-lg font-normal text-emerald-700 border border-emerald-100">
                      <CheckCircle size={16} />
                      បានផ្ទៀងផ្ទាត់
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3.5 py-1 text-lg font-normal text-amber-700 border border-amber-100">
                      <XCircle size={16} />
                      មិនទាន់
                    </span>
                  )}
                </td>

                {/* Status */}
                <td className="whitespace-nowrap px-6 py-3.5">
                  <StatusBadge status={user.status} />
                </td>

                {/* Actions */}
                <td className="px-6 py-3.5 text-right">
                  <UserRowActions
                    user={user}
                    detailHref={detailHref}
                    disabled={actionDisabled}
                    rowIndex={index}
                    totalRows={users.length}
                    onProfileEdit={onProfileEdit}
                    onSuspend={onSuspend}
                    onRestore={onRestore}
                    onHardDelete={onHardDelete}
                  />
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

function UserRowActions({
  user,
  detailHref,
  disabled,
  rowIndex = 0,
  totalRows = 1,
  onProfileEdit,
  onSuspend,
  onRestore,
  onHardDelete,
}: {
  user: AdminUser;
  detailHref: string;
  disabled: boolean;
  rowIndex?: number;
  totalRows?: number;
  onProfileEdit: (user: AdminUser) => void;
  onSuspend?: (user: AdminUser) => void;
  onRestore?: (user: AdminUser) => void;
  onHardDelete?: (user: AdminUser) => void;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const openUpward = totalRows > 2 && rowIndex >= totalRows - 2;

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const isActive = user.status?.toUpperCase() === "ACTIVE";
  const isSuspended = user.status?.toUpperCase() === "SUSPENDED";

  return (
    <div className="relative flex items-center justify-end gap-2 pr-1">
      {/* 1. View Detail (Green Eye) */}
      <Link
        href={detailHref}
        className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-100"
        title="មើលលម្អិត"
      >
        <Eye size={18} />
      </Link>

      {/* 2. Primary Action: Edit (Blue Pencil) */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => onProfileEdit(user)}
        className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-500 transition hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-40"
        title="កែប្រែ"
      >
        <Pencil size={18} />
      </button>

      {/* 3. More (3-dots) for extra actions */}
      {(onSuspend || onRestore || onHardDelete) && (
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            disabled={disabled}
            onClick={() => setOpen((prev) => !prev)}
            className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gray-50 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800 focus:outline-none ${
              open ? "bg-gray-200 text-gray-900 ring-2 ring-gray-300/60" : ""
            }`}
            title="ផ្សេងទៀត"
            aria-label="More actions"
          >
            <MoreVertical size={18} />
          </button>

          {open && (
            <div
              className={`absolute right-0 z-[100] min-w-[175px] overflow-hidden rounded-2xl border border-gray-100 bg-white p-1.5 shadow-2xl animate-in fade-in zoom-in-95 duration-150 text-left ${
                openUpward ? "bottom-full mb-2" : "top-full mt-2"
              }`}
            >
              {isActive && onSuspend && (
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    onSuspend(user);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-50"
                >
                  <AlertTriangle size={16} />
                  <span>ផ្អាកដំណើរការ</span>
                </button>
              )}

              {isSuspended && onRestore && (
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    onRestore(user);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
                >
                  <RotateCcw size={16} />
                  <span>ស្តារឡើងវិញ</span>
                </button>
              )}

              {onHardDelete && (
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    onHardDelete(user);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                >
                  <Trash2 size={16} />
                  <span>លុបចេញពីប្រព័ន្ធ</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}
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
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1 text-lg font-normal border ${className}`}
    >
      <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${dotClassName}`} />
      {label}
    </span>
  );
}
