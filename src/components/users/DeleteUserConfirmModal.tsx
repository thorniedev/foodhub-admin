"use client";

import { Loader2, MinusCircle, X } from "lucide-react";
import type { AdminUser } from "@/src/types/userProfile";
import { displayName } from "@/src/lib/userProfileFormat";

interface DeleteUserConfirmModalProps {
  user: AdminUser | null;
  deleting: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export default function DeleteUserConfirmModal({
  user,
  deleting,
  onClose,
  onConfirm,
}: DeleteUserConfirmModalProps) {
  if (!user) return null;

  const name = displayName(user.firstName, user.lastName, user.username);

  return (
    <div
      className="fixed inset-0 z-[130] flex items-center justify-center bg-black/45 p-4 backdrop-blur-xs animate-in fade-in duration-200"
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
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-amber-500 ring-8 ring-amber-50/60">
          <MinusCircle size={28} className="stroke-[2.2]" />
        </div>

        {/* Header Content */}
        <div className="mt-5 text-center">
          <h3 className="text-xl font-bold tracking-tight text-gray-900 whitespace-nowrap">
            បិទដំណើរការគណនី?
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-gray-500">
            គណនី{" "}
            <span className="font-bold text-gray-900 bg-gray-100 px-2.5 py-0.5 rounded-lg border border-gray-200/80">
              {name}
            </span>{" "}
            នឹងត្រូវបានបិទដំណើរការជាបណ្តោះអាសន្ន។
          </p>
        </div>

        {/* Callout Notice */}
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-200/90 bg-amber-50/40 p-4 text-left">
          <MinusCircle size={17} className="mt-0.5 shrink-0 text-amber-600" />
          <p className="text-xs font-medium leading-relaxed text-rose-800">
            អ្នកអាចស្វែងរកគណនីនេះនៅផ្ទាំង <strong>"បិទដំណើរការ"</strong> និងចុច "ស្តារឡើងវិញ" បានគ្រប់ពេល។
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 grid grid-cols-2 gap-3.5">
          <button
            type="button"
            disabled={deleting}
            onClick={onClose}
            className="flex h-12 items-center justify-center rounded-2xl border border-gray-200 bg-white text-base font-bold text-gray-700 transition hover:bg-gray-50 active:scale-[0.98] disabled:opacity-50"
          >
            បោះបង់
          </button>

          <button
            type="button"
            disabled={deleting}
            onClick={() => void onConfirm()}
            className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 text-base font-bold text-white shadow-md shadow-red-900/20 transition hover:bg-red-700 active:scale-[0.98] disabled:opacity-60"
          >
            {deleting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                កំពុងបិទ...
              </>
            ) : (
              "បិទដំណើរការ"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
