"use client";

import { AlertTriangle, Loader2, Trash2, X } from "lucide-react";
import type { AdminUser } from "@/src/types/userProfile";
import { displayName } from "@/src/lib/userProfileFormat";

interface HardDeleteUserConfirmModalProps {
  user: AdminUser | null;
  deleting: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export default function HardDeleteUserConfirmModal({
  user,
  deleting,
  onClose,
  onConfirm,
}: HardDeleteUserConfirmModalProps) {
  if (!user) return null;

  const name = displayName(user.firstName, user.lastName, user.username);

  return (
    <div
      className="fixed inset-0 z-[140] flex items-center justify-center bg-black/45 p-4 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(event) => {
        if (event.target === event.currentTarget && !deleting) {
          onClose();
        }
      }}
    >
      <div className="relative w-full max-w-[440px] overflow-hidden rounded-[32px] border border-gray-100 bg-white px-6 py-7 shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          type="button"
          disabled={deleting}
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
          <h3 className="text-2xl font-normal tracking-tight text-gray-900 whitespace-nowrap">
            លុបគណនីនេះជាអចិន្ត្រៃយ៍?
          </h3>
          <p className="mt-2 text-lg leading-relaxed text-gray-500 font-normal">
            គណនី{" "}
            <span className="font-normal text-gray-900 bg-gray-100 px-2.5 py-0.5 rounded-lg border border-gray-200/80">
              {name}
            </span>{" "}
            នឹងត្រូវបានលុបចេញពីប្រព័ន្ធទាំងស្រុង។
          </p>
        </div>

        {/* Callout Notice */}
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-red-200/90 bg-red-50/40 p-4 text-left">
          <AlertTriangle size={20} className="mt-0.5 shrink-0 text-red-600" />
          <p className="text-lg font-normal leading-relaxed text-red-800">
            សកម្មភាពនេះមិនអាចស្តារឡើងវិញបានឡើយ។ ទិន្នន័យពាក់ព័ន្ធទាំងអស់នឹងត្រូវលុបជាអចិន្ត្រៃយ៍។
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 grid grid-cols-2 gap-3.5">
          <button
            type="button"
            disabled={deleting}
            onClick={onClose}
            className="flex h-12 items-center justify-center rounded-full border border-gray-200 bg-white text-lg font-normal text-gray-700 transition hover:bg-gray-50 active:scale-[0.98] disabled:opacity-50"
          >
            បោះបង់
          </button>

          <button
            type="button"
            disabled={deleting}
            onClick={() => void onConfirm()}
            className="flex h-12 items-center justify-center gap-2 rounded-full bg-[#990000] px-4 text-lg font-normal text-white shadow-md shadow-red-950/20 transition hover:bg-[#800000] active:scale-[0.98] disabled:opacity-60"
          >
            {deleting ? (
              <>
                <Loader2 size={20} className="animate-spin" />
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
