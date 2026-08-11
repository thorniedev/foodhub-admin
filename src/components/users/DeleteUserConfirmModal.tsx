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
  if (!user) {
    return null;
  }

  const name = displayName(user.firstName, user.lastName, user.username);

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]">
      <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
            <Trash2 size={24} />
          </div>

          <button
            type="button"
            disabled={deleting}
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mt-5">
          <p className="text-4xl font-bold text-gray-900">បញ្ឈប់អ្នកប្រើនេះ?</p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            disabled={deleting}
            onClick={onClose}
            className="rounded-xl border border-gray-200 px-4 py-2.5 text-lg text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
          >
            បោះបង់
          </button>

          <button
            type="button"
            disabled={deleting}
            onClick={() => void onConfirm()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-2.5 text-lg font-semibold text-white transition hover:bg-red-600 disabled:opacity-60"
          >
            {deleting && <Loader2 size={17} className="animate-spin" />}
            បញ្ឈប់
          </button>
        </div>
      </div>
    </div>
  );
}
