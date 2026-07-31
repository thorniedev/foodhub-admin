"use client";

import { AlertTriangle } from "lucide-react";

interface DeleteShopConfirmModalProps {
  open: boolean;
  shopName: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function DeleteShopConfirmModal({
  open,
  shopName,
  onCancel,
  onConfirm,
}: DeleteShopConfirmModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-red-50 rounded-full p-2">
            <AlertTriangle size={20} className="text-red-500" />
          </div>
          <h2 className="text-lg font-bold text-gray-800">លុបហាង</h2>
        </div>

        <p className="text-sm text-gray-500 mb-6">
          តើអ្នកប្រាកដទេថាចង់លុប{" "}
          <span className="font-medium text-gray-700">{shopName}</span>? សកម្មភាពនេះមិន
          អាចត្រឡប់វិញបានទេ។
        </p>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            បោះបង់
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg"
          >
            លុប
          </button>
        </div>
      </div>
    </div>
  );
}