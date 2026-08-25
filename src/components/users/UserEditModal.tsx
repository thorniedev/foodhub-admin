"use client";

import { useEffect, useState } from "react";
import { Check, Loader2, Save, UserCog, UserCheck, UserX, X } from "lucide-react";
import type { AdminUser, MutableAdminUserStatus } from "@/src/types/userProfile";

interface UserEditModalProps {
  user: AdminUser | null;
  saving: boolean;
  onClose: () => void;
  onSubmit: (status: MutableAdminUserStatus) => Promise<void>;
}

export default function UserEditModal({
  user,
  saving,
  onClose,
  onSubmit,
}: UserEditModalProps) {
  const [status, setStatus] = useState<MutableAdminUserStatus>("ACTIVE");

  useEffect(() => {
    if (!user) return;
    setStatus(user.status === "SUSPENDED" ? "SUSPENDED" : "ACTIVE");
  }, [user]);

  if (!user) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/45 p-4 backdrop-blur-[3px]">
      <div className="w-full max-w-lg overflow-hidden rounded-[28px] border border-gray-100 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-emerald-50/70 via-white to-emerald-50/40 px-6 py-5 sm:px-8">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-800 text-white shadow-md shadow-primary-900/20 ring-1 ring-primary-700/20">
              <UserCog size={22} />
            </div>
            <div>
              <p className="text-2xl font-bold tracking-tight text-gray-900">
                ស្ថានភាពគណនី
              </p>
              <p className="mt-0.5 text-sm text-gray-400">@{user.username}</p>
            </div>
          </div>

          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            aria-label="Close"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-5 p-6 sm:p-8">
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-3">
              ជ្រើសរើសស្ថានភាពគណនី
            </p>

            <div className="grid grid-cols-2 gap-3.5">
              {(["ACTIVE", "SUSPENDED"] as const).map((option) => {
                const selected = status === option;
                const isSuspend = option === "SUSPENDED";

                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setStatus(option)}
                    className={`flex min-h-16 items-center justify-between rounded-2xl border-2 px-4 py-3 text-base font-bold transition active:scale-95 ${
                      selected
                        ? isSuspend
                          ? "border-amber-400 bg-amber-50/80 text-amber-900 shadow-sm"
                          : "border-primary-600 bg-primary-50/80 text-primary-900 shadow-sm"
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50/50"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                          isSuspend
                            ? "bg-amber-100 text-amber-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {isSuspend ? <UserX size={17} /> : <UserCheck size={17} />}
                      </div>
                      <span>{option === "ACTIVE" ? "សកម្ម" : "ផ្អាកដំណើរការ"}</span>
                    </div>

                    {selected && (
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-full ${
                          isSuspend
                            ? "bg-amber-500 text-white"
                            : "bg-primary-700 text-white"
                        }`}
                      >
                        <Check size={14} className="stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 border-t border-gray-100 bg-gray-50/50 -mx-6 -mb-6 sm:-mx-8 sm:-mb-8 px-6 py-4 sm:px-8 mt-6">
            <button
              type="button"
              disabled={saving}
              onClick={onClose}
              className="rounded-2xl border border-gray-200 bg-white px-5 py-2.5 text-base font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
            >
              បោះបង់
            </button>

            <button
              type="button"
              disabled={saving || status === user.status}
              onClick={() => void onSubmit(status)}
              className="inline-flex items-center gap-2 rounded-2xl bg-primary-800 px-6 py-2.5 text-base font-bold text-white shadow-md shadow-primary-900/20 transition-all hover:bg-primary-900 hover:scale-[1.02] active:scale-95 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  កំពុងរក្សាទុក...
                </>
              ) : (
                <>
                  <Save size={18} />
                  រក្សាទុក
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
