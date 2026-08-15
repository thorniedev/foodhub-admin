"use client";

import {
  Loader2,
  Trash2,
  X,
} from "lucide-react";

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

  const name = displayName(
    user.firstName,
    user.lastName,
    user.username,
  );

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[3px]">
      <div className="w-full max-w-md rounded-3xl border border-gray-100 bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
            <Trash2 size={24} />
          </div>

          <button
            type="button"
            disabled={deleting}
            onClick={onClose}
            aria-label="Close"
            className="flex h-11 w-11 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
          >
            <X size={22} />
          </button>
        </div>

        <p className="mt-5 text-2xl font-semibold text-primary-800">
          បញ្ឈប់អ្នកប្រើនេះ?
        </p>

        <p className="mt-3 text-lg leading-8 text-gray-500">
          អ្នកប្រើ{" "}
          <span className="font-semibold text-gray-800">
            {name}
          </span>{" "}
          នឹងត្រូវ soft-delete តាម rule របស់ backend។
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            disabled={deleting}
            onClick={onClose}
            className="min-h-12 rounded-full border border-gray-200 px-4 text-lg font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
          >
            បោះបង់
          </button>

          <button
            type="button"
            disabled={deleting}
            onClick={() => void onConfirm()}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-red-500 px-4 text-lg font-medium text-white transition hover:bg-red-600 disabled:opacity-60"
          >
            {deleting && (
              <Loader2 size={20} className="animate-spin" />
            )}
            បញ្ឈប់
          </button>
        </div>
      </div>
    </div>
  );
}
