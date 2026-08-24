"use client";

import { Dialog } from "@base-ui/react/dialog";
import { AlertTriangle, Loader2, Trash2, X } from "lucide-react";
import React from "react";
import type { AdminBannerResponse } from "../../types/banner";
import { BANNER_CATEGORY_LABELS, BANNER_CATEGORY_COLORS } from "../../types/banner";

interface BannerDeleteDialogProps {
  banner: AdminBannerResponse | null;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
}

export default function BannerDeleteDialog({
  banner,
  loading = false,
  onClose,
  onConfirm,
}: BannerDeleteDialogProps) {
  if (!banner) return null;

  const categoryColor = BANNER_CATEGORY_COLORS[banner.category] || {
    bg: "bg-gray-100 text-gray-700 border-gray-200",
  };

  return (
    <Dialog.Root open onOpenChange={(open) => !open && !loading && onClose()}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-[150] bg-black/40 backdrop-blur-[2px] transition-opacity" />
        <Dialog.Popup className="fixed inset-0 z-[150] flex items-center justify-center p-4 outline-none">
          <div className="w-full max-w-lg overflow-hidden rounded-[28px] bg-white shadow-2xl transition-all">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-gray-100 px-7 py-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                  <AlertTriangle size={26} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    លុបផ្ទាំងបែនណឺ (Delete Banner)
                  </p>
                  <p className="mt-1 text-lg text-gray-500">
                    ការលុបនេះមិនអាចត្រឡប់វិញបានទេ
                  </p>
                </div>
              </div>
              <Dialog.Close
                disabled={loading}
                onClick={onClose}
                className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
              >
                <X size={22} />
              </Dialog.Close>
            </div>

            {/* Body */}
            <div className="space-y-5 p-7">
              <div className="rounded-2xl border border-red-100 bg-red-50/50 p-5">
                <p className="text-lg text-gray-700 leading-relaxed">
                  តើអ្នកពិតជាចង់លុបបែនណឺ{" "}
                  <span className="font-bold text-gray-900 underline decoration-red-300">
                    &ldquo;{banner.title}&rdquo;
                  </span>{" "}
                  នេះមែនទេ?
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-2.5">
                  <span
                    className={`inline-flex items-center rounded-full border px-3.5 py-1 text-lg font-semibold ${categoryColor.bg}`}
                  >
                    {BANNER_CATEGORY_LABELS[banner.category] || banner.category}
                  </span>
                  {banner.location && (
                    <span className="inline-flex items-center rounded-full bg-blue-50 px-3.5 py-1 text-lg font-semibold text-blue-700">
                      📍 {banner.location}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex flex-col-reverse gap-3 border-t border-gray-100 bg-gray-50 px-7 py-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={loading}
                onClick={onClose}
                className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-lg font-bold text-gray-700 transition hover:bg-gray-100 disabled:opacity-50"
              >
                បោះបង់ (Cancel)
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={onConfirm}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-lg font-bold text-white shadow-sm transition hover:bg-red-700 active:scale-95 disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <Trash2 size={20} />
                )}
                {loading ? "កំពុងលុប..." : "លុបបែនណឺ (Delete)"}
              </button>
            </div>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
