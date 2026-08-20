"use client";

import { Dialog } from "@base-ui/react/dialog";
import { AlertTriangle, Loader2, Trash2, X } from "lucide-react";
import type { AdminBannerResponse } from "../../../types/banner";

interface DeleteBannerConfirmModalProps {
  banner: AdminBannerResponse | null;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
}

export default function DeleteBannerConfirmModal({
  banner,
  loading = false,
  onClose,
  onConfirm,
}: DeleteBannerConfirmModalProps) {
  const open = Boolean(banner);

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => !next && !loading && onClose()}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-[160] bg-black/45 backdrop-blur-xs" />
        <Dialog.Popup className="fixed inset-0 z-[160] flex items-center justify-center p-4 outline-none">
          {banner && (
            <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl">
              <div className="flex items-start justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                  <Trash2 size={26} />
                </div>

                <Dialog.Close
                  disabled={loading}
                  className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
                  aria-label="Close"
                >
                  <X size={20} />
                </Dialog.Close>
              </div>

              <Dialog.Title className="mt-5 text-2xl font-black text-gray-900">
                តើអ្នកប្រាកដជាចង់លុបបែនណឺនេះមែនទេ?
              </Dialog.Title>

              <Dialog.Description className="mt-3 rounded-2xl border border-gray-100 bg-gray-50/80 p-4 text-sm">
                <p className="font-bold text-gray-900">{banner.title}</p>
                <p className="mt-1 text-xs text-gray-500">
                  {banner.category}
                  {banner.location ? ` · ${banner.location}` : ""}
                </p>
              </Dialog.Description>

              <div className="mt-3 flex items-center gap-2 text-xs text-amber-600">
                <AlertTriangle size={15} className="shrink-0" />
                <span>សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ។ បែនណឺនេះនឹងត្រូវលុបចេញជាអចិន្ត្រៃយ៍។</span>
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
                  {loading ? "កំពុងលុប..." : "លុបបែនណឺ"}
                </button>
              </div>
            </div>
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
