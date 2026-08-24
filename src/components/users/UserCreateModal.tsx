"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertCircle, Loader2, UserPlus, X } from "lucide-react";
import type { CreateAdminUserPayload } from "@/src/types/userProfile";
import { getAdminApiErrorMessage } from "@/src/lib/adminApiError";

const userSchema = z
  .object({
    firstName: z.string().trim().min(1, "សូមបញ្ចូលនាមខ្លួន (First name)"),
    lastName: z.string().trim().min(1, "សូមបញ្ចូលនាមត្រកូល (Last name)"),
    username: z
      .string()
      .trim()
      .min(3, "ឈ្មោះគណនីត្រូវមានយ៉ាងហោចណាស់ 3 តួអក្សរ")
      .max(30, "ឈ្មោះគណនីមិនអាចលើសពី 30 តួអក្សរ"),
    email: z
      .string()
      .trim()
      .min(1, "សូមបញ្ចូលអ៊ីមែល")
      .email("ទម្រង់អ៊ីមែលមិនត្រឹមត្រូវ (ឧ. example@gmail.com)"),
    phoneNumber: z.string().trim().min(1, "សូមបញ្ចូលលេខទូរស័ព្ទ"),
    password: z
      .string()
      .min(6, "ពាក្យសម្ងាត់ត្រូវមានយ៉ាងហោចណាស់ 6 តួអក្សរ"),
    confirmedPassword: z.string().min(1, "សូមបញ្ជាក់ពាក្យសម្ងាត់"),
  })
  .refine((data) => data.password === data.confirmedPassword, {
    message: "ពាក្យសម្ងាត់ និងការបញ្ជាក់ពាក្យសម្ងាត់មិនដូចគ្នាទេ",
    path: ["confirmedPassword"],
  });

type UserFormData = z.infer<typeof userSchema>;

interface UserCreateModalProps {
  open: boolean;
  saving: boolean;
  onClose: () => void;
  onSubmit: (values: CreateAdminUserPayload) => Promise<void>;
}

export default function UserCreateModal({
  open,
  saving,
  onClose,
  onSubmit,
}: UserCreateModalProps) {
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      phoneNumber: "",
      password: "",
      confirmedPassword: "",
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        firstName: "",
        lastName: "",
        username: "",
        email: "",
        phoneNumber: "",
        password: "",
        confirmedPassword: "",
      });
      setApiError(null);
    }
  }, [open, reset]);

  if (!open) return null;

  const onFormSubmit = async (data: UserFormData) => {
    setApiError(null);
    try {
      await onSubmit(data);
      reset();
      onClose();
    } catch (err) {
      setApiError(getAdminApiErrorMessage(err));
    }
  };

  const isBusy = saving || isSubmitting;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/45 p-4 backdrop-blur-[3px]">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[30px] border border-gray-100 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-emerald-50/70 via-white to-emerald-50/40 px-8 py-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary-800 text-white shadow-md shadow-primary-900/20 ring-1 ring-primary-700/20">
              <UserPlus size={26} />
            </div>
            <div>
              <p className="text-3xl font-black tracking-tight text-gray-900">
                បង្កើតគណនីអ្នកប្រើប្រាស់ថ្មី
              </p>
              <p className="mt-1 text-lg font-medium text-gray-500">
                បញ្ចូលព័ត៌មានដើម្បីបង្កើតគណនីគណនីអ្នកប្រើប្រាស់ក្នុងប្រព័ន្ធ
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={isBusy}
            onClick={onClose}
            aria-label="Close"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
          >
            <X size={22} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6 p-8">
          {apiError && (
            <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-lg font-medium text-red-700">
              <AlertCircle size={22} className="shrink-0 text-red-500 mt-0.5" />
              <div className="flex-1 font-medium">{apiError}</div>
            </div>
          )}

          <div className="grid gap-6 sm:grid-cols-2">
            {/* First Name */}
            <div className="space-y-2">
              <label className="text-xl font-bold text-gray-700">
                នាមខ្លួន (First Name) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register("firstName")}
                disabled={isBusy}
                placeholder="ឧ. សុខ"
                className={`h-14 w-full rounded-2xl border bg-white px-5 text-lg font-medium text-gray-800 outline-none transition focus:ring-4 disabled:bg-gray-50 ${
                  errors.firstName
                    ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                    : "border-gray-200 focus:border-primary-600 focus:ring-primary-100"
                }`}
              />
              {errors.firstName && (
                <p className="text-lg font-medium text-red-500">{errors.firstName.message}</p>
              )}
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <label className="text-xl font-bold text-gray-700">
                នាមត្រកូល (Last Name) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register("lastName")}
                disabled={isBusy}
                placeholder="ឧ. គឹម"
                className={`h-14 w-full rounded-2xl border bg-white px-5 text-lg font-medium text-gray-800 outline-none transition focus:ring-4 disabled:bg-gray-50 ${
                  errors.lastName
                    ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                    : "border-gray-200 focus:border-primary-600 focus:ring-primary-100"
                }`}
              />
              {errors.lastName && (
                <p className="text-lg font-medium text-red-500">{errors.lastName.message}</p>
              )}
            </div>

            {/* Username */}
            <div className="space-y-2">
              <label className="text-xl font-bold text-gray-700">
                ឈ្មោះគណនី (Username) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register("username")}
                disabled={isBusy}
                placeholder="username"
                className={`h-14 w-full rounded-2xl border bg-white px-5 text-lg font-medium text-gray-800 outline-none transition focus:ring-4 disabled:bg-gray-50 ${
                  errors.username
                    ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                    : "border-gray-200 focus:border-primary-600 focus:ring-primary-100"
                }`}
              />
              {errors.username && (
                <p className="text-lg font-medium text-red-500">{errors.username.message}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-xl font-bold text-gray-700">
                អ៊ីមែល (Email) <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                {...register("email")}
                disabled={isBusy}
                placeholder="example@gmail.com"
                className={`h-14 w-full rounded-2xl border bg-white px-5 text-lg font-medium text-gray-800 outline-none transition focus:ring-4 disabled:bg-gray-50 ${
                  errors.email
                    ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                    : "border-gray-200 focus:border-primary-600 focus:ring-primary-100"
                }`}
              />
              {errors.email && (
                <p className="text-lg font-medium text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <label className="text-xl font-bold text-gray-700">
                លេខទូរស័ព្ទ (Phone Number) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register("phoneNumber")}
                disabled={isBusy}
                placeholder="+85512345678"
                className={`h-14 w-full rounded-2xl border bg-white px-5 text-lg font-medium text-gray-800 outline-none transition focus:ring-4 disabled:bg-gray-50 ${
                  errors.phoneNumber
                    ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                    : "border-gray-200 focus:border-primary-600 focus:ring-primary-100"
                }`}
              />
              {errors.phoneNumber && (
                <p className="text-lg font-medium text-red-500">{errors.phoneNumber.message}</p>
              )}
            </div>

            <div className="hidden sm:block" />

            {/* Password */}
            <div className="space-y-2">
              <label className="text-xl font-bold text-gray-700">
                ពាក្យសម្ងាត់ (Password) <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                {...register("password")}
                disabled={isBusy}
                placeholder="យ៉ាងហោចណាស់ 6 តួអក្សរ"
                className={`h-14 w-full rounded-2xl border bg-white px-5 text-lg font-medium text-gray-800 outline-none transition focus:ring-4 disabled:bg-gray-50 ${
                  errors.password
                    ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                    : "border-gray-200 focus:border-primary-600 focus:ring-primary-100"
                }`}
              />
              {errors.password && (
                <p className="text-lg font-medium text-red-500">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="text-xl font-bold text-gray-700">
                បញ្ជាក់ពាក្យសម្ងាត់ (Confirm Password) <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                {...register("confirmedPassword")}
                disabled={isBusy}
                placeholder="បញ្ចូលពាក្យសម្ងាត់ម្តងទៀត"
                className={`h-14 w-full rounded-2xl border bg-white px-5 text-lg font-medium text-gray-800 outline-none transition focus:ring-4 disabled:bg-gray-50 ${
                  errors.confirmedPassword
                    ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                    : "border-gray-200 focus:border-primary-600 focus:ring-primary-100"
                }`}
              />
              {errors.confirmedPassword && (
                <p className="text-lg font-medium text-red-500">{errors.confirmedPassword.message}</p>
              )}
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-4 border-t border-gray-100 pt-6">
            <button
              type="button"
              disabled={isBusy}
              onClick={onClose}
              className="rounded-2xl border border-gray-200 bg-white px-6 py-3 text-lg font-bold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 active:scale-95"
            >
              បោះបង់
            </button>

            <button
              type="submit"
              disabled={isBusy}
              className="inline-flex items-center gap-2 rounded-2xl bg-primary-800 px-7 py-3.5 text-xl font-bold text-white shadow-md shadow-primary-900/20 transition-all hover:bg-primary-900 hover:scale-[1.02] active:scale-95 disabled:opacity-50"
            >
              {isBusy ? (
                <>
                  <Loader2 size={22} className="animate-spin" />
                  កំពុងបង្កើត...
                </>
              ) : (
                <>
                  <UserPlus size={22} />
                  បង្កើតគណនីអ្នកប្រើប្រាស់
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
