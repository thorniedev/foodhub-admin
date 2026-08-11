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
  if (!open) {
    return null;
  }

  const deleting = action === "DELETE";

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]">
      <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div
            className={`flex h-14 w-14 items-center justify-center rounded-full ${
              deleting
                ? "bg-red-50 text-red-500"
                : "bg-emerald-50 text-[#137A3D]"
            }`}
          >
            {deleting ? <Trash2 size={24} /> : <RotateCcw size={24} />}
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <h2 className="mt-5 text-2xl font-bold text-gray-900">
          {deleting ? "Soft delete Profile?" : "Restore Profile?"}
        </h2>

        <p className="mt-3 text-base leading-7 text-gray-500">
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
            className="rounded-xl border border-gray-200 px-4 py-2.5 text-lg text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
          >
            បោះបង់
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => void onConfirm()}
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-lg font-semibold text-white disabled:opacity-60 ${
              deleting
                ? "bg-red-500 hover:bg-red-600"
                : "bg-[#136C34] hover:bg-[#0f592b]"
            }`}
          >
            {loading && <Loader2 size={17} className="animate-spin" />}
            {deleting ? "Delete" : "Restore"}
          </button>
        </div>
      </div>
    </div>
  );
}
