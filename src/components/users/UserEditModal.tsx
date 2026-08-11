"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  Check,
  Loader2,
  UserCog,
  X,
} from "lucide-react";

import type {
  AdminUser,
  MutableAdminUserStatus,
} from "@/src/types/userProfile";

interface UserEditModalProps {
  user: AdminUser | null;
  saving: boolean;
  onClose: () => void;
  onSubmit: (
    status: MutableAdminUserStatus,
  ) => Promise<void>;
}

export default function UserEditModal({
  user,
  saving,
  onClose,
  onSubmit,
}: UserEditModalProps) {
  const [status, setStatus] =
    useState<MutableAdminUserStatus>("ACTIVE");

  useEffect(() => {
    if (!user) {
      return;
    }

    setStatus(
      user.status === "SUSPENDED"
        ? "SUSPENDED"
        : "ACTIVE",
    );
  }, [user]);

  if (!user) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]">
      <div className="w-full max-w-md overflow-hidden rounded-[28px] bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5">
          <div>
            <p className="flex items-center gap-3 text-3xl font-bold text-[#136C34]">
              <UserCog size={24} />
              កែប្រែស្ថានភាព User
            </p>

            <p className="mt-2 text-base text-gray-500">
              @{user.username}
            </p>
          </div>

          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-5 p-6">
          <div>
            <p className="mb-3 text-xl font-semibold text-[#F97316]">
              ស្ថានភាពគណនី
            </p>

            <div className="grid grid-cols-2 gap-3">
              {(["ACTIVE", "SUSPENDED"] as const).map((option) => {
                const selected = status === option;

                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setStatus(option)}
                    className={`flex min-h-14 items-center justify-between rounded-2xl border px-4 text-base font-semibold transition ${
                      selected
                        ? "border-[#137A3D] bg-emerald-50 text-[#137A3D]"
                        : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {option}
                    {selected && <Check size={18} />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">
            <button
              type="button"
              disabled={saving}
              onClick={onClose}
              className="rounded-xl border border-gray-200 px-5 py-2.5 text-lg text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
            >
              បោះបង់
            </button>

            <button
              type="button"
              disabled={saving || status === user.status}
              onClick={() => void onSubmit(status)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#136C34] px-5 py-2.5 text-lg text-white transition hover:bg-[#0f592b] disabled:opacity-50"
            >
              {saving && <Loader2 size={17} className="animate-spin" />}
              រក្សាទុក
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
