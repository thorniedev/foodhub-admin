"use client";

import { useEffect } from "react";
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
  /* =========================================================
     MODAL UX (Lock scroll & Escape key)
  ========================================================= */

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !loading) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, loading, onClose]);

  if (!open || !store) {
    return null;
  }

  const address =
    [store.addressLine, store.city].filter(Boolean).join(", ") ||
    "មិនមានអាសយដ្ឋាន";

  return (
    <div
      className="fixed inset-0 z-[140] flex items-center justify-center bg-black/45 p-4 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-store-title"
    >
      <div className="relative w-full max-w-[440px] overflow-hidden rounded-[32px] border border-gray-100 bg-white px-6 py-7 shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          type="button"
          disabled={loading}
          onClick={onClose}
          aria-label="Close"
          className="absolute top-5 right-5 flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
        >
          <X size={17} />
        </button>

        {/* Circular Icon with Soft Glow */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600 ring-8 ring-red-50/60">
          <Trash2 size={26} className="stroke-[2.2]" />
        </div>

        {/* Header Content */}
        <div className="mt-5 text-center">
          <h3
            id="delete-store-title"
            className="text-xl font-bold tracking-tight text-gray-900 whitespace-nowrap"
          >
            លុប Store ជាអចិន្ត្រៃយ៍?
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-gray-500">
            ហាង{" "}
            <span className="font-bold text-gray-900 bg-gray-100 px-2.5 py-0.5 rounded-lg border border-gray-200/80">
              {store.storeName}
            </span>{" "}
            នឹងត្រូវបានលុបចេញពីប្រព័ន្ធទាំងស្រុង។
          </p>
        </div>

        {/* Store Address Info */}
        {address && (
          <div className="mt-3.5 rounded-xl border border-gray-100 bg-gray-50/80 px-3.5 py-2 text-center text-xs text-gray-500 truncate">
            {address}
          </div>
        )}

        {/* Callout Notice */}
        <div className="mt-4 flex items-start gap-3 rounded-2xl border border-red-200/90 bg-red-50/40 p-4 text-left">
          <AlertTriangle size={17} className="mt-0.5 shrink-0 text-red-600" />
          <p className="text-xs font-medium leading-relaxed text-red-800">
            សកម្មភាពនេះមិនអាចស្តារឡើងវិញបានឡើយ។ ទិន្នន័យទាំងអស់របស់ហាងនេះនឹងត្រូវលុបជាអចិន្ត្រៃយ៍។
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 grid grid-cols-2 gap-3.5">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="flex h-12 items-center justify-center rounded-2xl border border-gray-200 bg-white text-base font-bold text-gray-700 transition hover:bg-gray-50 active:scale-[0.98] disabled:opacity-50"
          >
            បោះបង់
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => void onConfirm()}
            className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#990000] px-4 text-base font-bold text-white shadow-md shadow-red-950/20 transition hover:bg-[#800000] active:scale-[0.98] disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                កំពុងលុប...
              </>
            ) : (
              "លុបជាអចិន្ត្រៃយ៍"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
