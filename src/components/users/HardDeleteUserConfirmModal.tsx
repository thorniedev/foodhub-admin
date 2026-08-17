"use client";

import { AlertOctagon, Loader2, X } from "lucide-react";

import type { AdminUser } from "@/src/types/userProfile";
import { displayName } from "@/src/lib/userProfileFormat";

interface HardDeleteUserConfirmModalProps {
  user: AdminUser | null;
  deleting: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export default function HardDeleteUserConfirmModal({
  user,
  deleting,
  onClose,
  onConfirm,
}: HardDeleteUserConfirmModalProps) {
  if (!user) return null;

  const name = displayName(
    user.firstName,
    user.lastName,
    user.username,
  );

  return (
    <div
      className="fixed inset-0 z-[140] flex items-center justify-center bg-black/50 p-4 backdrop-blur-[3px] animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !deleting) onClose();
      }}
    >
      <div className="w-full max-w-lg rounded-[30px] border border-red-100 bg-white p-6 shadow-2xl sm:p-7">
        <div className="flex items-start justify-between">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600">
            <AlertOctagon size={28} />
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

        <div className="mt-5">
         

          <h3 className="mt-2 text-2xl font-black text-gray-900 sm:text-3xl">
            លុបអ្នកប្រើប្រាស់?
          </h3>
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
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-red-600 px-4 text-lg font-bold text-white shadow-sm transition hover:bg-red-700 disabled:opacity-60"
          >
            {deleting && <Loader2 size={20} className="animate-spin" />}
            {deleting ? "កំពុងលុប..." : "លុបជាអចិន្ត្រៃយ៍"}
          </button>
        </div>
      </div>
    </div>
  );
}
