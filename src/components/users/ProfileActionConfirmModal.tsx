"use client";

import {
  Loader2,
  RotateCcw,
  Trash2,
  X,
} from "lucide-react";

interface ProfileActionConfirmModalProps {
  open: boolean;
  action: "DELETE" | "RESTORE";
  profileName: string;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export default function ProfileActionConfirmModal({
  open,
  action,
  profileName,
  loading,
  onClose,
  onConfirm,
}: ProfileActionConfirmModalProps) {
  if (!open) return null;

  const deleting = action === "DELETE";

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[3px]">
      <div className="w-full max-w-md rounded-3xl border border-gray-100 bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div
            className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
              deleting
                ? "bg-red-50 text-red-500"
                : "bg-primary-50 text-primary-800"
            }`}
          >
            {deleting ? (
              <Trash2 size={24} />
            ) : (
              <RotateCcw size={24} />
            )}
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            aria-label="Close"
            className="flex h-11 w-11 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
          >
            <X size={22} />
          </button>
        </div>

        <p className="mt-5 text-2xl font-semibold text-primary-800">
          {deleting ? "Soft delete Profile?" : "Restore Profile?"}
        </p>

        <p className="mt-3 text-lg leading-8 text-gray-500">
          Profile{" "}
          <span className="font-semibold text-gray-800">
            {profileName}
          </span>
          {deleting
            ? " នឹងត្រូវបិទ (isActive=false) មិនមែនលុបចេញពី database ទាំងស្រុងទេ។"
            : " នឹងត្រូវស្ដារឲ្យសកម្មវិញ តាម rule របស់ backend។"}
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="min-h-12 rounded-full border border-gray-200 px-4 text-lg font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
          >
            បោះបង់
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => void onConfirm()}
            className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-4 text-lg font-medium text-white disabled:opacity-60 ${
              deleting
                ? "bg-red-500 hover:bg-red-600"
                : "bg-primary-800 hover:bg-primary-900"
            }`}
          >
            {loading && (
              <Loader2 size={20} className="animate-spin" />
            )}
            {deleting ? "Delete" : "Restore"}
          </button>
        </div>
      </div>
    </div>
  );
}
