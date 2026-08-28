"use client";

import { AlertTriangle } from "lucide-react";

interface DeleteConfirmModalProps {
  open: boolean;
  itemName: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function DeleteConfirmModal({
  open,
  itemName,
  onCancel,
  onConfirm,
}: DeleteConfirmModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-md p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-red-50 rounded-2xl p-2.5">
            <AlertTriangle size={24} className="text-red-500" />
          </div>
          <h2 className="text-xl font-normal text-gray-800">
            លុបចំណីអាហារ
          </h2>
        </div>

        <p className="text-lg font-normal text-gray-500 mb-6">
          តើអ្នកប្រាកដទេថាចង់លុប{" "}
          <span className="font-normal text-gray-700">{itemName}</span>? សកម្មភាពនេះមិន
          អាចត្រឡប់វិញបានទេ។
        </p>

        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-6 py-2.5 text-lg font-normal text-gray-600 hover:bg-gray-100 rounded-full border border-gray-200"
          >
            បោះបង់
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2.5 text-lg font-normal text-white bg-red-500 hover:bg-red-600 rounded-full"
          >
            លុប
          </button>
        </div>
      </div>
    </div>
  );
}