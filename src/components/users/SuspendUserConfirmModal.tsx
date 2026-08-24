"use client";

import { Loader2, UserX, X } from "lucide-react";
import type { AdminUser } from "@/src/types/userProfile";
import { displayName } from "@/src/lib/userProfileFormat";

interface SuspendUserConfirmModalProps {
  user: AdminUser | null;
  suspending: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export default function SuspendUserConfirmModal({
  user,
  suspending,
  onClose,
  onConfirm,
}: SuspendUserConfirmModalProps) {
  if (!user) return null;

  const name = displayName(user.firstName, user.lastName, user.username);

  return (
    <div
      className="fixed inset-0 z-[130] flex items-center justify-center bg-black/45 p-4 backdrop-blur-[3px] animate-in fade-in duration-200"
      onClick={(event) => {
        if (event.target === event.currentTarget && !suspending) {
          onClose();
        }
      }}
    >
      <div className="relative w-full max-w-lg overflow-hidden rounded-[30px] border border-amber-100 bg-white shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          type="button"
          disabled={suspending}
          onClick={onClose}
          aria-label="Close"
          className="absolute top-5 right-5 z-10 flex h-10 w-10 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
        >
          <X size={20} />
        </button>

        {/* Top Decorative Banner with Centered Icon */}
        <div className="flex flex-col items-center justify-center bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-transparent px-8 pt-9 pb-4 text-center">
          <div className="flex h-18 w-18 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 shadow-md shadow-amber-950/5 ring-4 ring-amber-50">
            <UserX size={34} className="stroke-[2.2]" />
          </div>

          <p className="mt-5 text-3xl font-black tracking-tight text-gray-900">
            ផ្អាកដំណើរការអ្នកប្រើប្រាស់?
          </p>
        </div>

        {/* Content Body */}
        <div className="p-8 pt-2 space-y-5 text-center">
          <p className="text-lg leading-relaxed text-gray-600">
            គណនីអ្នកប្រើប្រាស់{" "}
            <span className="inline-block font-bold text-gray-900 rounded-xl bg-gray-100 px-3 py-1 border border-gray-200">
              {name}
            </span>{" "}
            នឹងត្រូវបានផ្អាកដំណើរការជាបណ្តោះអាសន្ន។ អ្នកប្រើនឹងមិនអាច Login ចូលប្រើប្រាស់បានឡើយ។
          </p>

          <div className="rounded-2xl border border-amber-200/80 bg-amber-50/70 p-4 text-lg leading-relaxed text-amber-900 text-left">
            💡 អ្នកអាចស្វែងរកគណនីនេះនៅផ្ទាំង <strong>"ផ្អាកដំណើរការ"</strong> និងបើកដំណើរការឡើងវិញបានគ្រប់ពេល។
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <button
              type="button"
              disabled={suspending}
              onClick={onClose}
              className="h-14 rounded-2xl border border-gray-200 bg-white px-5 text-lg font-bold text-gray-700 transition hover:bg-gray-50 active:scale-95 disabled:opacity-50"
            >
              បោះបង់
            </button>

            <button
              type="button"
              disabled={suspending}
              onClick={() => void onConfirm()}
              className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-amber-400 px-6 text-lg font-black text-amber-950 shadow-md shadow-amber-950/10 transition-all hover:bg-amber-300 hover:scale-[1.02] active:scale-95 disabled:opacity-60"
            >
              {suspending ? (
                <>
                  <Loader2 size={22} className="animate-spin" />
                  កំពុងផ្អាក...
                </>
              ) : (
                "ផ្អាកដំណើរការ"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
