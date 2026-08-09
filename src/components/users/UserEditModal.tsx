"use client";

import { useEffect, useState } from "react";
import { Loader2, UserCog, X } from "lucide-react";

import type {
  AdminUser,
  MutableAdminUserStatus,
} from "@/src/types/userProfile";

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
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]">
      <div className="w-full max-w-md rounded-[26px] bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5">
          <div>
            <p className="flex items-center gap-2 text-3xl font-black text-gray-900">
              <UserCog size={21} className="text-[#137A3D]" />
              កែប្រែស្ថានភាព User
            </p>
            <p className="mt-1 text-sm text-gray-500">@{user.username}</p>
          </div>

          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-gray-500"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 p-6">
          {/* <p className="text-sm leading-6 text-gray-500">
            Backend contract អនុញ្ញាតឱ្យ Admin កែតែ account status តាម endpoint
            <span className="mx-1 font-mono text-xs text-gray-700">
              PATCH /admin/users/{"{uuid}"}/status
            </span>
            ។
          </p> */}

          <div className="grid grid-cols-2 gap-3">
            {(["ACTIVE", "SUSPENDED"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setStatus(option)}
                className={`rounded-2xl border px-4 py-4 text-sm font-black transition ${
                  status === option
                    ? "border-[#137A3D] bg-emerald-50 text-[#137A3D]"
                    : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              disabled={saving}
              onClick={onClose}
              className="rounded-xl border border-gray-200 px-4 py-2.5 font-bold text-gray-600"
            >
              បោះបង់
            </button>
            <button
              type="button"
              disabled={saving || status === user.status}
              onClick={() => void onSubmit(status)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#137A3D] px-4 py-2.5 font-bold text-white disabled:opacity-50"
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
