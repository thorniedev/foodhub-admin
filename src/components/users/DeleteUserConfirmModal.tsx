"use client";

import { Ban, Loader2, X } from "lucide-react";

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
    <div
      className="fixed inset-0 z-[130] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[3px]"
      onClick={(event) => {
        if (event.target === event.currentTarget && !deleting) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-md rounded-3xl border border-gray-100 bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary-50 text-secondary-600">
            <Ban size={24} />
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
          អ្នកប្រើ <span className="font-semibold text-gray-800">{name}</span>{" "}
          នឹងត្រូវបានបញ្ឈប់ពីការប្រើប្រាស់។ វាមិនមែនជាការលុបជាអចិន្ត្រៃយ៍ទេ។
        </p>

        <div className="mt-4 rounded-2xl bg-primary-50 px-4 py-3 text-base leading-7 text-primary-700">
          បន្ទាប់ពីបញ្ឈប់ Admin អាចរកអ្នកប្រើនេះនៅផ្ទាំង Disabled ហើយចុច Restore
          ដើម្បីស្តារឡើងវិញ។
        </div>

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
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-secondary-600 px-4 text-lg font-medium text-white transition hover:bg-secondary-500 disabled:opacity-60"
          >
            {deleting && <Loader2 size={20} className="animate-spin" />}
            {deleting ? "កំពុងបញ្ឈប់..." : "បញ្ឈប់"}
          </button>
        </div>
      </div>
    </div>
  );
}
