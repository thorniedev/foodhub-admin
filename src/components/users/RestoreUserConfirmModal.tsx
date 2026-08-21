"use client";

import { Loader2, UserCheck, X } from "lucide-react";
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
      className="fixed inset-0 z-[130] flex items-center justify-center bg-black/45 p-4 backdrop-blur-[3px] animate-in fade-in duration-200"
      onClick={(event) => {
        if (event.target === event.currentTarget && !restoring) {
          onClose();
        }
      }}
    >
      <div className="relative w-full max-w-md overflow-hidden rounded-[28px] border border-emerald-100 bg-white shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          type="button"
          disabled={restoring}
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
        >
          <X size={18} />
        </button>

        {/* Top Decorative Banner with Centered Icon */}
        <div className="flex flex-col items-center justify-center bg-gradient-to-b from-emerald-500/10 via-emerald-500/5 to-transparent px-6 pt-8 pb-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 shadow-md shadow-emerald-950/5 ring-4 ring-emerald-50">
            <UserCheck size={28} className="stroke-[2.2]" />
          </div>

          <h3 className="mt-4 text-2xl font-bold tracking-tight text-gray-900">
            បើកដំណើរការអ្នកប្រើឡើងវិញ?
          </h3>
        </div>

        {/* Content Body */}
        <div className="p-6 pt-1 space-y-4 text-center">
          <p className="text-base leading-relaxed text-gray-600">
            គណនីអ្នកប្រើប្រាស់{" "}
            <span className="inline-block font-bold text-gray-900 rounded-lg bg-gray-100 px-2.5 py-0.5 border border-gray-200">
              {name}
            </span>{" "}
            នឹងត្រូវបានស្តារឱ្យមានស្ថានភាព <strong>"សកម្ម" (ACTIVE)</strong> ឡើងវិញ។
          </p>

          <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/70 p-3.5 text-xs leading-relaxed text-emerald-900 text-left">
            ✅ បន្ទាប់ពីបើកដំណើរការឡើងវិញ អ្នកប្រើប្រាស់អាច Login ចូលប្រើប្រាស់ និងបញ្ជាទិញអាហារបានជាធម្មតា។
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              disabled={restoring}
              onClick={onClose}
              className="h-12 rounded-2xl border border-gray-200 bg-white px-4 text-base font-semibold text-gray-600 transition hover:bg-gray-50 active:scale-95 disabled:opacity-50"
            >
              បោះបង់
            </button>

            <button
              type="button"
              disabled={restoring}
              onClick={() => void onConfirm()}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-primary-800 px-5 text-base font-bold text-white shadow-md shadow-primary-900/20 transition-all hover:bg-primary-900 hover:scale-[1.02] active:scale-95 disabled:opacity-60"
            >
              {restoring ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  កំពុងស្តារ...
                </>
              ) : (
                "បើកដំណើរការ"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
