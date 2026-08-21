"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertCircle, Loader2, Save, UserCog, X } from "lucide-react";
import type { AdminUser } from "@/src/types/userProfile";
import { getAdminApiErrorMessage } from "@/src/lib/adminApiError";

const userProfileEditSchema = z.object({
  firstName: z.string().trim().min(1, "សូមបញ្ចូលនាមខ្លួន"),
  lastName: z.string().trim().min(1, "សូមបញ្ចូលនាមត្រកូល"),
  username: z.string().trim().min(3, "ឈ្មោះគណនីត្រូវមានយ៉ាងហោចណាស់ 3 តួអក្សរ"),
  email: z.string().trim().email("ទម្រង់អ៊ីមែលមិនត្រឹមត្រូវ"),
});

type UserProfileEditFormData = z.infer<typeof userProfileEditSchema>;

interface UserProfileEditModalProps {
  user: AdminUser | null;
  saving: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
  }) => Promise<void>;
}

export default function UserProfileEditModal({
  user,
  saving,
  onClose,
  onSubmit,
}: UserProfileEditModalProps) {
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UserProfileEditFormData>({
    resolver: zodResolver(userProfileEditSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      username: "",
      email: "",
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        username: user.username || "",
        email: user.primaryEmail || "",
      });
      setApiError(null);
    }
  }, [user, reset]);

  if (!user) return null;

  const onFormSubmit = async (data: UserProfileEditFormData) => {
    setApiError(null);
    try {
      await onSubmit({
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        username: data.username.trim(),
        email: data.email.trim(),
      });
    } catch (err) {
      setApiError(getAdminApiErrorMessage(err));
    }
  };

  const isBusy = saving || isSubmitting;

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
                កែប្រែព័ត៌មានគណនី
              </p>
              <p className="mt-0.5 text-sm text-gray-400">@{user.username}</p>
            </div>
          </div>

          <button
            type="button"
            disabled={isBusy}
            onClick={onClose}
            aria-label="Close"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onFormSubmit)}>
          <div className="space-y-4 p-6 sm:p-8">
            {apiError && (
              <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <AlertCircle size={18} className="shrink-0 text-red-500 mt-0.5" />
                <div className="flex-1 font-medium">{apiError}</div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {/* First Name */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">
                  នាមខ្លួន (First Name) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register("firstName")}
                  disabled={isBusy}
                  placeholder="ឧ. សុខ"
                  className={`h-12 w-full rounded-2xl border bg-white px-4 text-base text-gray-800 outline-none transition focus:ring-2 disabled:bg-gray-50 ${
                    errors.firstName
                      ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                      : "border-gray-200 focus:border-primary-600 focus:ring-primary-100"
                  }`}
                />
                {errors.firstName && (
                  <p className="text-xs font-medium text-red-500">{errors.firstName.message}</p>
                )}
              </div>

              {/* Last Name */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">
                  នាមត្រកូល (Last Name) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register("lastName")}
                  disabled={isBusy}
                  placeholder="ឧ. គឹម"
                  className={`h-12 w-full rounded-2xl border bg-white px-4 text-base text-gray-800 outline-none transition focus:ring-2 disabled:bg-gray-50 ${
                    errors.lastName
                      ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                      : "border-gray-200 focus:border-primary-600 focus:ring-primary-100"
                  }`}
                />
                {errors.lastName && (
                  <p className="text-xs font-medium text-red-500">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            {/* Username */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">
                ឈ្មោះគណនី (Username) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register("username")}
                disabled={isBusy}
                placeholder="username"
                className={`h-12 w-full rounded-2xl border bg-white px-4 text-base text-gray-800 outline-none transition focus:ring-2 disabled:bg-gray-50 ${
                  errors.username
                    ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                    : "border-gray-200 focus:border-primary-600 focus:ring-primary-100"
                }`}
              />
              {errors.username && (
                <p className="text-xs font-medium text-red-500">{errors.username.message}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">
                អ៊ីមែល (Email) <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                {...register("email")}
                disabled={isBusy}
                placeholder="example@mail.com"
                className={`h-12 w-full rounded-2xl border bg-white px-4 text-base text-gray-800 outline-none transition focus:ring-2 disabled:bg-gray-50 ${
                  errors.email
                    ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                    : "border-gray-200 focus:border-primary-600 focus:ring-primary-100"
                }`}
              />
              {errors.email && (
                <p className="text-xs font-medium text-red-500">{errors.email.message}</p>
              )}
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 border-t border-gray-100 bg-gray-50/50 px-6 py-4 sm:px-8">
            <button
              type="button"
              disabled={isBusy}
              onClick={onClose}
              className="rounded-2xl border border-gray-200 bg-white px-5 py-2.5 text-base font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
            >
              បោះបង់
            </button>

            <button
              type="submit"
              disabled={isBusy}
              className="inline-flex items-center gap-2 rounded-2xl bg-primary-800 px-6 py-2.5 text-base font-bold text-white shadow-md shadow-primary-900/20 transition-all hover:bg-primary-900 hover:scale-[1.02] active:scale-95 disabled:opacity-50"
            >
              {isBusy ? (
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
        </form>
      </div>
    </div>
  );
}
