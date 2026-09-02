"use client";

import { useEffect } from "react";
import { AlertOctagon, Loader2, X } from "lucide-react";

import type { Allergen } from "@/src/types/allergen";

interface HardDeleteAllergenConfirmModalProps {
  item: Allergen | null;
  deleting: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export default function HardDeleteAllergenConfirmModal({
  item,
  deleting,
  onClose,
  onConfirm,
}: HardDeleteAllergenConfirmModalProps) {
  useEffect(() => {
    if (!item) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [item]);

  if (!item) return null;

  return (
    <div
      className="fixed inset-0 z-[140] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-[3px] animate-in fade-in duration-200"
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
          <h3 className="mt-2 text-2xl font-normal text-gray-900">
            លុបអាឡែស៊ី?
          </h3>
        </div>

        <div className="mt-4 rounded-2xl border border-red-100 bg-red-50/70 p-4 text-lg leading-relaxed text-red-800 font-normal">
          <p>
            អ្នកកំពុងលុបអាឡែស៊ី{" "}
            <span className="font-normal text-red-950">{item.name || item.code}</span> (Code:{" "}
            <code className="rounded bg-red-100 px-1.5 py-0.5 font-mono text-lg">{item.code}</code>)។
          </p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            disabled={deleting}
            onClick={onClose}
            className="min-h-12 rounded-full border border-gray-200 px-4 text-lg font-normal text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
          >
            បោះបង់
          </button>

          <button
            type="button"
            disabled={deleting}
            onClick={() => void onConfirm()}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-red-600 px-4 text-lg font-normal text-white shadow-sm transition hover:bg-red-700 disabled:opacity-60"
          >
            {deleting && <Loader2 size={20} className="animate-spin" />}
            {deleting ? "កំពុងលុប..." : "លុបជាអចិន្ត្រៃយ៍"}
          </button>
        </div>
      </div>
    </div>
  );
}
