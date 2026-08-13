"use client";

import { Loader2, Trash2, X } from "lucide-react";

export default function DeleteConfirmModal({
  open,
  title,
  description,
  deleting,
  onClose,
  onConfirm,
}: {
  open: boolean;
  title: string;
  description: string;
  deleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]">
      <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
            <Trash2 size={24} />
          </div>

          <button
            type="button"
            disabled={deleting}
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        <h3 className="mt-5 text-2xl font-bold text-gray-900">
          {title}
        </h3>

        <p className="mt-2 text-sm leading-6 text-gray-500">
          {description}
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            disabled={deleting}
            onClick={onClose}
            className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-bold text-gray-600"
          >
            បោះបង់
          </button>

          <button
            type="button"
            disabled={deleting}
            onClick={onConfirm}
            className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
          >
            {deleting && (
              <Loader2 size={16} className="animate-spin" />
            )}
            លុប
          </button>
        </div>
      </div>
    </div>
  );
}
