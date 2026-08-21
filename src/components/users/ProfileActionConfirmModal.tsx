"use client";

import { Loader2, UserCheck, UserX, X } from "lucide-react";

interface ProfileActionConfirmModalProps {
  open: boolean;
  action: "DELETE" | "RESTORE";
  profileName: string;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export default function ProfileActionConfirmModal({
  open,
  action,
  profileName,
  loading,
  onClose,
  onConfirm,
}: ProfileActionConfirmModalProps) {
  if (!open) return null;

  const isSuspend = action === "DELETE";

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/45 p-4 backdrop-blur-[3px]">
      <div className="relative w-full max-w-md overflow-hidden rounded-[28px] border border-gray-100 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          type="button"
          disabled={loading}
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
        >
          <X size={18} />
        </button>

        {/* Top Decorative Banner with Centered Icon */}
        <div
          className={`flex flex-col items-center justify-center px-6 pt-8 pb-4 text-center ${
            isSuspend
              ? "bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-transparent"
              : "bg-gradient-to-b from-emerald-500/10 via-emerald-500/5 to-transparent"
          }`}
        >
          <div
            className={`flex h-16 w-16 items-center justify-center rounded-2xl shadow-md ring-4 ${
              isSuspend
                ? "bg-amber-100 text-amber-700 ring-amber-50 shadow-amber-950/5"
                : "bg-emerald-100 text-emerald-700 ring-emerald-50 shadow-emerald-950/5"
            }`}
          >
            {isSuspend ? (
              <UserX size={28} className="stroke-[2.2]" />
            ) : (
              <UserCheck size={28} className="stroke-[2.2]" />
            )}
          </div>

          <h3 className="mt-4 text-2xl font-bold tracking-tight text-gray-900">
            {isSuspend ? "ផ្អាកដំណើរការកម្រងព័ត៌មាន?" : "បើកដំណើរការកម្រងព័ត៌មានឡើងវិញ?"}
          </h3>
        </div>

        {/* Content Body */}
        <div className="p-6 pt-1 space-y-5 text-center">
          <p className="text-base leading-relaxed text-gray-600">
            កម្រងព័ត៌មាន{" "}
            <span className="inline-block font-bold text-gray-900 rounded-lg bg-gray-100 px-2.5 py-0.5 border border-gray-200">
              {profileName}
            </span>{" "}
            {isSuspend
              ? "នឹងត្រូវបានផ្អាកដំណើរការជាបណ្តោះអាសន្ន។ អ្នកអាចបើកដំណើរការឡើងវិញបានគ្រប់ពេល។"
              : "នឹងត្រូវបានបើកឱ្យដំណើរការឡើងវិញជាធម្មតាក្នុងប្រព័ន្ធ។"}
          </p>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="h-12 rounded-2xl border border-gray-200 bg-white px-4 text-base font-semibold text-gray-600 transition hover:bg-gray-50 active:scale-95 disabled:opacity-50"
            >
              បោះបង់
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => void onConfirm()}
              className={`inline-flex h-12 items-center justify-center gap-2 rounded-2xl px-5 text-base font-bold shadow-md transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60 ${
                isSuspend
                  ? "bg-amber-400 text-amber-950 shadow-amber-950/10 hover:bg-amber-300"
                  : "bg-primary-800 text-white shadow-primary-900/20 hover:bg-primary-900"
              }`}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  {isSuspend ? "កំពុងផ្អាក..." : "កំពុងបើក..."}
                </>
              ) : isSuspend ? (
                "ផ្អាកដំណើរការ"
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
