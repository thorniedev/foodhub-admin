"use client";

import { Info, X } from "lucide-react";

export default function DeleteShopConfirmModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]">
      <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <Info size={24} />
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <p className="mt-5 text-2xl font-bold text-gray-900">
          Store delete endpoint មិនមាន
        </p>

        <p className="mt-2 text-base leading-7 text-gray-500">
          Supplied backend contract មិនមាន DELETE /api/v1/admin/stores/{"{uuid}"} ទេ។
          ប្រើ account status (INACTIVE/SUSPENDED) ជំនួស។
        </p>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-[#136C34] px-5 py-2.5 text-lg text-white transition hover:bg-[#0f592b]"
          >
            យល់ហើយ
          </button>
        </div>
      </div>
    </div>
  );
}
