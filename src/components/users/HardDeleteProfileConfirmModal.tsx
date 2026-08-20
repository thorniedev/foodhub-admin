"use client";

import { AlertOctagon, Loader2, Trash2, X } from "lucide-react";
import type { AdminProfile } from "@/src/types/userProfile";

interface HardDeleteProfileConfirmModalProps {
  profile: AdminProfile | null;
  deleting: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export default function HardDeleteProfileConfirmModal({
  profile,
  deleting,
  onClose,
  onConfirm,
}: HardDeleteProfileConfirmModalProps) {
  if (!profile) return null;

  return (
    <div
      className="fixed inset-0 z-[140] flex items-center justify-center bg-black/50 p-4 backdrop-blur-[3px] animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !deleting) onClose();
      }}
    >
      <div className="relative w-full max-w-md overflow-hidden rounded-[28px] border border-red-100 bg-white shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          type="button"
          disabled={deleting}
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
        >
          <X size={18} />
        </button>

        {/* Top Decorative Banner with Centered Icon */}
        <div className="flex flex-col items-center justify-center bg-gradient-to-b from-red-500/10 via-red-500/5 to-transparent px-6 pt-8 pb-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-red-600 shadow-md shadow-red-950/5 ring-4 ring-red-50">
            <AlertOctagon size={28} className="stroke-[2.2]" />
          </div>

          <h3 className="mt-4 text-2xl font-bold tracking-tight text-gray-900">
            លុបកម្រងព័ត៌មានជារៀងរហូត?
          </h3>
        </div>

        {/* Content Body */}
        <div className="p-6 pt-1 space-y-4 text-center">
          <p className="text-base leading-relaxed text-gray-600">
            កម្រងព័ត៌មាន{" "}
            <span className="inline-block font-bold text-gray-900 rounded-lg bg-gray-100 px-2.5 py-0.5 border border-gray-200">
              {profile.profileName}
            </span>{" "}
            នឹងត្រូវបានលុបចេញពីប្រព័ន្ធទាំងស្រុង (Hard Delete) ហើយមិនអាចស្តារឡើងវិញបានឡើយ។
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              disabled={deleting}
              onClick={onClose}
              className="h-12 rounded-2xl border border-gray-200 bg-white px-4 text-base font-semibold text-gray-600 transition hover:bg-gray-50 active:scale-95 disabled:opacity-50"
            >
              បោះបង់
            </button>

            <button
              type="button"
              disabled={deleting}
              onClick={() => void onConfirm()}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 text-base font-bold text-white shadow-md shadow-red-900/20 transition-all hover:bg-red-700 hover:scale-[1.02] active:scale-95 disabled:opacity-60"
            >
              {deleting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  កំពុងលុប...
                </>
              ) : (
                <>
                  <Trash2 size={18} />
                  លុបជាអចិន្ត្រៃយ៍
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
