"use client";

import { Loader2, RotateCcw, Trash2, X } from "lucide-react";

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
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/45 p-4">
      <div className="w-full max-w-md rounded-[26px] bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
              deleting ? "bg-red-50 text-red-500" : "bg-emerald-50 text-[#137A3D]"
            }`}
          >
            {deleting ? <Trash2 size={22} /> : <RotateCcw size={22} />}
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-gray-500"
          >
            <X size={18} />
          </button>
        </div>

        <h2 className="mt-5 text-xl font-black text-gray-900">
          {deleting ? "Soft delete Profile?" : "Restore Profile?"}
        </h2>
        <p className="mt-2 text-sm leading-6 text-gray-500">
          Profile <span className="font-bold text-gray-800">{profileName}</span>
          {deleting
            ? " នឹងត្រូវបិទ (isActive=false) មិនមែនលុបចេញពី database ទាំងស្រុងទេ។"
            : " នឹងត្រូវស្ដារឲ្យសកម្មវិញ តាម rule របស់ backend។"}
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="rounded-xl border border-gray-200 px-4 py-2.5 font-bold text-gray-600"
          >
            បោះបង់
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => void onConfirm()}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 font-bold text-white disabled:opacity-60 ${
              deleting ? "bg-red-500 hover:bg-red-600" : "bg-[#137A3D]"
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
