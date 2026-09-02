"use client";

import { AlertTriangle, Loader2 } from "lucide-react";
import type { FoodCategory } from "@/src/types/foodCategory";

type Props = {
  open: boolean;
  item: FoodCategory | null;
  deleting: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
};

export default function DeleteSubCategoryConfirmModal({
  open,
  item,
  deleting,
  onClose,
  onConfirm,
}: Props) {
  if (!open || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl transition-all">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <AlertTriangle size={28} />
          </div>

          <h3 className="mt-4 text-xl font-normal text-gray-800">
            តើអ្នកពិតជាចង់លុបអនុប្រភេទនេះមែនទេ?
          </h3>

          <div className="mt-3 w-full rounded-2xl bg-gray-50 p-4">
            <p className="text-xl font-normal text-gray-800">{item.name}</p>
            <p className="mt-1 font-mono text-lg font-normal text-gray-500">{item.code}</p>
          </div>

          <p className="mt-3 text-lg font-normal text-gray-500">
            សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ។ សូមប្រាកដថាគ្មានមុខម្ហូប/ភេសជ្ជៈណាកំពុងប្រើប្រាស់អនុប្រភេទនេះមុននឹងលុប។
          </p>

          <div className="mt-6 flex w-full items-center justify-center gap-3">
            <button
              type="button"
              disabled={deleting}
              onClick={onClose}
              className="flex-1 rounded-full border border-gray-200 py-3 text-lg font-normal text-gray-700 transition hover:bg-gray-50 focus:outline-none"
            >
              បោះបង់
            </button>

            <button
              type="button"
              disabled={deleting}
              onClick={onConfirm}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-red-600 py-3 text-lg font-normal text-white shadow-sm transition hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-500/20 disabled:opacity-60"
            >
              {deleting && <Loader2 size={20} className="animate-spin" />}
              <span>យល់ព្រមលុប</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
