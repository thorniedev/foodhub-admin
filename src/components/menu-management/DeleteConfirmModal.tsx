"use client";

import { Loader2, MinusCircle, Trash2, X } from "lucide-react";

export default function DeleteConfirmModal({
  open,
  title,
  description,
  deleting,
  variant = "soft",
  onClose,
  onConfirm,
}: {
  open: boolean;
  title: string;
  description: string;
  deleting: boolean;
  variant?: "soft" | "hard";
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;

  const isHard = variant === "hard";

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/45 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-[30px] bg-white p-7 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between">
          <div
            className={`flex h-16 w-16 items-center justify-center rounded-2xl ${
              isHard
                ? "bg-red-50 text-red-600"
                : "bg-amber-50 text-amber-600"
            }`}
          >
            {isHard ? <Trash2 size={30} /> : <MinusCircle size={30} />}
          </div>

          <button
            type="button"
            disabled={deleting}
            onClick={onClose}
            className="rounded-full p-2.5 text-gray-400 hover:bg-gray-100 transition"
          >
            <X size={24} />
          </button>
        </div>

        <p className="mt-6 text-2xl font-normal text-gray-800">
          {title}
        </p>

        <p className="mt-3 text-lg leading-7 font-normal text-gray-600">
          {description}
        </p>

        <div className="mt-8 flex justify-end gap-3.5">
          <button
            type="button"
            disabled={deleting}
            onClick={onClose}
            className="rounded-full border border-gray-200 px-6 py-3 text-lg font-normal text-gray-600 hover:bg-gray-50 transition"
          >
            បោះបង់
          </button>

          <button
            type="button"
            disabled={deleting}
            onClick={onConfirm}
            className={`inline-flex items-center gap-2 rounded-full px-6 py-3 text-lg font-normal text-white disabled:opacity-60 transition active:scale-95 ${
              isHard
                ? "bg-red-600 hover:bg-red-700"
                : "bg-amber-600 hover:bg-amber-700"
            }`}
          >
            {deleting && (
              <Loader2 size={20} className="animate-spin" />
            )}
            {isHard ? "លុបចេញពីប្រព័ន្ធ" : "យល់ព្រម"}
          </button>
        </div>
      </div>
    </div>
  );
}
