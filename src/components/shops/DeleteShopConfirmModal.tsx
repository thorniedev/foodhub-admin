"use client";

import { AlertTriangle, Loader2, Trash2, X } from "lucide-react";
import type { Store } from "@/src/types/shop";

export default function DeleteShopConfirmModal({
  store,
  open,
  loading = false,
  onClose,
  onConfirm,
}: {
  store: Store | null;
  open: boolean;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
}) {
  if (!open || !store) return null;

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/45 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <Trash2 size={26} />
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <p className="mt-5 text-2xl font-black text-gray-900">
          តើអ្នកប្រាកដជាចង់លុប Store នេះមែនទេ?
        </p>

        <div className="mt-3 rounded-2xl border border-gray-100 bg-gray-50/80 p-4">
          <p className="font-bold text-gray-900">{store.storeName}</p>
          <p className="mt-1 text-xs text-gray-500">
            {[store.addressLine, store.city].filter(Boolean).join(", ") || "No address"}
          </p>
          <p className="mt-1 font-mono text-[11px] text-gray-400">
            UUID: {store.uuid}
          </p>
        </div>

        <div className="mt-3 flex items-center gap-2 text-xs text-amber-600">
          <AlertTriangle size={15} className="shrink-0" />
          <span>ទិន្នន័យទាំងអស់របស់ហាងនេះនឹងត្រូវលុបចេញពីប្រព័ន្ធជាអចិន្ត្រៃយ៍។</span>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="rounded-xl border border-gray-200 px-5 py-2.5 text-base font-bold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
          >
            បោះបង់
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => void onConfirm()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-base font-bold text-white shadow-sm transition hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Trash2 size={18} />
            )}
            {loading ? "កំពុងលុប..." : "លុប Store"}
          </button>
        </div>
      </div>
    </div>
  );
}
