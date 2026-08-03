"use client";

import { AlertTriangle } from "lucide-react";

interface DeleteUserConfirmModalProps {
  open: boolean;
  profileName: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function DeleteUserConfirmModal({
  open,
  profileName,
  onCancel,
  onConfirm,
}: DeleteUserConfirmModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm p-5 sm:p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-red-50 rounded-full p-2">
            <AlertTriangle size={20} className="text-red-500" />
          </div>
          <h2 className="text-base sm:text-lg font-bold text-gray-800">
            លុបប្រវត្តិរូប
          </h2>
        </div>

        <p className="text-sm text-gray-500 mb-6">
          តើអ្នកប្រាកដទេថាចង់លុប{" "}
          <span className="font-medium text-gray-700">{profileName}</span>? សកម្មភាពនេះមិន
          អាចត្រឡប់វិញបានទេ។
        </p>

        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3">
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