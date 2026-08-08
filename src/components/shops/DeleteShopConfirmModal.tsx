"use client";
import { Info, X } from "lucide-react";

export default function DeleteShopConfirmModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/45 p-4">
      <div className="w-full max-w-md rounded-[26px] bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600"><Info size={22} /></div>
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-gray-500"><X size={18} /></button>
        </div>
        <h2 className="mt-5 text-xl font-black text-gray-900">Store delete endpoint មិនមាន</h2>
        <p className="mt-2 text-sm leading-6 text-gray-500">
          Supplied backend contract មិនមាន DELETE /api/v1/admin/stores/{"{uuid}"} ទេ។
          ប្រើ account status (INACTIVE/SUSPENDED) ឬបន្ថែម Spring Boot delete endpoint ជាមុន។
        </p>
        <div className="mt-6 flex justify-end">
          <button onClick={onClose} className="rounded-xl bg-[#137A3D] px-4 py-2.5 font-black text-white">យល់ហើយ</button>
        </div>
      </div>
    </div>
  );
}
