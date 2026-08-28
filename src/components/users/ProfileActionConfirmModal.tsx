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
    <div
      className="fixed inset-0 z-[130] flex items-center justify-center bg-black/45 p-4 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div className="relative w-full max-w-[440px] overflow-hidden rounded-[32px] border border-gray-100 bg-white px-6 py-7 shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          type="button"
          disabled={loading}
          onClick={onClose}
          aria-label="Close"
          className="absolute top-5 right-5 flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
        >
          <X size={17} />
        </button>

        {/* Circular Icon with Soft Glow */}
        <div
          className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ring-8 ${
            isSuspend
              ? "bg-amber-50 text-amber-500 ring-amber-50/60"
              : "bg-emerald-50 text-emerald-600 ring-emerald-50/60"
          }`}
        >
          {isSuspend ? (
            <UserX size={26} className="stroke-[2.2]" />
          ) : (
            <UserCheck size={26} className="stroke-[2.2]" />
          )}
        </div>

        {/* Header Content */}
        <div className="mt-5 text-center">
          <h3 className="text-2xl font-normal tracking-tight text-gray-900 whitespace-nowrap">
            {isSuspend
              ? "ផ្អាកដំណើរការប្រវត្តិរូប?"
              : "បើកដំណើរការប្រវត្តិរូបឡើងវិញ?"}
          </h3>
          <p className="mt-2 text-lg leading-relaxed text-gray-500 font-normal">
            ប្រវត្តិរូប{" "}
            <span className="font-normal text-gray-900 bg-gray-100 px-2.5 py-0.5 rounded-lg border border-gray-200/80">
              {profileName}
            </span>{" "}
            {isSuspend
              ? "នឹងត្រូវបានផ្អាកដំណើរការជាបណ្តោះអាសន្ន។"
              : "នឹងត្រូវបានបើកឱ្យដំណើរការឡើងវិញជាធម្មតា។"}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 grid grid-cols-2 gap-3.5">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="flex h-12 items-center justify-center rounded-full border border-gray-200 bg-white text-lg font-normal text-gray-700 transition hover:bg-gray-50 active:scale-[0.98] disabled:opacity-50"
          >
            បោះបង់
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => void onConfirm()}
            className={`flex h-12 items-center justify-center gap-2 rounded-full px-4 text-lg font-normal text-white shadow-md transition active:scale-[0.98] disabled:opacity-60 ${
              isSuspend
                ? "bg-[#F59E0B] hover:bg-[#D97706] shadow-amber-900/15"
                : "bg-[#0F5A2C] hover:bg-[#0C4723] shadow-emerald-950/20"
            }`}
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                កំពុងដំណើរការ...
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
  );
}
