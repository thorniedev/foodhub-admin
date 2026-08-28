"use client";

import { CheckCircle2, Loader2, UserCheck, X } from "lucide-react";
import type { AdminUser } from "@/src/types/userProfile";
import { displayName } from "@/src/lib/userProfileFormat";

interface RestoreUserConfirmModalProps {
  user: AdminUser | null;
  restoring: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export default function RestoreUserConfirmModal({
  user,
  restoring,
  onClose,
  onConfirm,
}: RestoreUserConfirmModalProps) {
  if (!user) return null;

  const name = displayName(user.firstName, user.lastName, user.username);

  return (
    <div
      className="fixed inset-0 z-[130] flex items-center justify-center bg-black/45 p-4 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(event) => {
        if (event.target === event.currentTarget && !restoring) {
          onClose();
        }
      }}
    >
      <div className="relative w-full max-w-[440px] overflow-hidden rounded-[32px] border border-gray-100 bg-white px-6 py-7 shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          type="button"
          disabled={restoring}
          onClick={onClose}
          aria-label="Close"
          className="absolute top-5 right-5 flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
        >
          <X size={17} />
        </button>

        {/* Circular Icon with Soft Glow */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/60">
          <UserCheck size={26} className="stroke-[2.2]" />
        </div>

        {/* Header Content */}
        <div className="mt-5 text-center">
          <h3 className="text-2xl font-normal tracking-tight text-gray-900 whitespace-nowrap">
            បើកដំណើរការគណនីនេះឡើងវិញ?
          </h3>
          <p className="mt-2 text-lg leading-relaxed text-gray-500 font-normal">
            គណនី{" "}
            <span className="font-normal text-gray-900 bg-gray-100 px-2.5 py-0.5 rounded-lg border border-gray-200/80">
              {name}
            </span>{" "}
            នឹងត្រូវបានស្តារឱ្យមានស្ថានភាព "សកម្ម" ឡើងវិញ។
          </p>
        </div>

        {/* Callout Notice */}
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-emerald-200/90 bg-emerald-50/40 p-4 text-left">
          <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-emerald-600" />
          <p className="text-lg font-normal leading-relaxed text-emerald-900">
            បន្ទាប់ពីបើកដំណើរការឡើងវិញ អ្នកប្រើប្រាស់អាច Login ចូលប្រើប្រាស់ និងបញ្ជាទិញអាហារបានជាធម្មតា។
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 grid grid-cols-2 gap-3.5">
          <button
            type="button"
            disabled={restoring}
            onClick={onClose}
            className="flex h-12 items-center justify-center rounded-full border border-gray-200 bg-white text-lg font-normal text-gray-700 transition hover:bg-gray-50 active:scale-[0.98] disabled:opacity-50"
          >
            បោះបង់
          </button>

          <button
            type="button"
            disabled={restoring}
            onClick={() => void onConfirm()}
            className="flex h-12 items-center justify-center gap-2 rounded-full bg-[#0F5A2C] px-4 text-lg font-normal text-white shadow-md shadow-emerald-950/20 transition hover:bg-[#0C4723] active:scale-[0.98] disabled:opacity-60"
          >
            {restoring ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                កំពុងស្តារ...
              </>
            ) : (
              "បើកដំណើរការឡើងវិញ"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
