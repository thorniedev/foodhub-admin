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
    if (!user) return;

    setStatus(
      user.status === "SUSPENDED"
        ? "SUSPENDED"
        : "ACTIVE",
    );
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [user]);

  if (!user) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[3px]">
      <div className="w-full max-w-xl overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 bg-white px-6 py-5 sm:px-8">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-800">
              <UserCog size={24} />
            </div>

            <div className="min-w-0">
              <p className="text-2xl font-semibold text-primary-800">
                កែប្រែស្ថានភាព User
              </p>

              <p className="mt-1 truncate text-lg text-gray-500">
                @{user.username}
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            aria-label="Close"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={22} />
          </button>
        </div>

        <div className="space-y-6 p-6 sm:p-8">
          <div>
            <p className="mb-3 text-lg font-medium text-primary-800">
              ស្ថានភាពគណនី
            </p>

            <div className="grid grid-cols-2 gap-3">
              {(["ACTIVE", "SUSPENDED"] as const).map((option) => {
                const selected = status === option;
                const warning = option === "SUSPENDED";

                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setStatus(option)}
                    className={`flex min-h-14 items-center justify-between rounded-2xl border px-4 text-lg font-medium transition focus:outline-none focus:ring-4 ${
                      selected
                        ? warning
                          ? "border-secondary-200 bg-secondary-50 text-secondary-600 focus:ring-secondary-100"
                          : "border-primary-200 bg-primary-50 text-primary-800 focus:ring-primary-100"
                        : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50 focus:ring-gray-100"
                    }`}
                  >
                    {option}
                    {selected && <Check size={19} />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              disabled={saving}
              onClick={onClose}
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-gray-200 bg-white px-7 text-lg font-medium text-gray-600 transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              បោះបង់
            </button>

            <button
              type="button"
              disabled={saving || status === user.status}
              onClick={() => void onSubmit(status)}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary-800 px-7 text-lg font-medium text-white transition hover:bg-primary-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving && (
                <Loader2 size={20} className="animate-spin" />
              )}
              រក្សាទុក
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
