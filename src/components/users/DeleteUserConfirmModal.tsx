"use client";

import { Loader2, Trash2, X } from "lucide-react";

import type { AdminUser } from "@/src/types/userProfile";
import { displayName } from "@/src/lib/userProfileFormat";

interface DeleteUserConfirmModalProps {
  user: AdminUser | null;
  deleting: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export default function DeleteUserConfirmModal({
  user,
  deleting,
  onClose,
  onConfirm,
}: DeleteUserConfirmModalProps) {
  if (!user) return null;

  const name = displayName(user.firstName, user.lastName, user.username);

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/45 p-4">
      <div className="w-full max-w-md rounded-[26px] bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-500">
            <Trash2 size={22} />
          </div>

          <button
            type="button"
            disabled={deleting}
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-gray-500"
          >
            <X size={18} />
          </button>
        </div>

        <h2 className="mt-5 text-xl font-black text-gray-900">
          Soft delete អ្នកប្រើនេះ?
        </h2>

        <p className="mt-2 text-sm leading-6 text-gray-500">
          <span className="font-bold text-gray-800">{name}</span> នឹងត្រូវប្តូរ
          status ទៅ DELETED, Keycloak account នឹងត្រូវ disable ហើយ active
          sessions នឹងត្រូវបញ្ចប់។
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            disabled={deleting}
            onClick={onClose}
            className="rounded-xl border border-gray-200 px-4 py-2.5 font-bold text-gray-600"
          >
            បោះបង់
          </button>

          <button
            type="button"
            disabled={deleting}
            onClick={() => void onConfirm()}
            className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2.5 font-bold text-white hover:bg-red-600 disabled:opacity-60"
          >
            {deleting && <Loader2 size={17} className="animate-spin" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
