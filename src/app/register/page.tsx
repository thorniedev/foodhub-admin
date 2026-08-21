"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthLayout from "@/src/components/auth/AuthLayout";
import {
  EyeIcon,
  EyeOffIcon,
  GitHubIcon,
  GoogleIcon,
} from "@/src/components/auth/icons";

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field error on change
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validate = () => {
    const errors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      errors.firstName = "សូមបញ្ចូលនាមខ្លួន (First Name is required)";
    }
    if (!formData.lastName.trim()) {
      errors.lastName = "សូមបញ្ចូលនាមត្រកូល (Last Name is required)";
    }
    if (!formData.email.trim()) {
      errors.email = "សូមបញ្ចូលអ៊ីមែល (Email is required)";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = "ទម្រង់អ៊ីមែលមិនត្រឹមត្រូវ (Invalid email format)";
    }
    if (!formData.password) {
      errors.password = "សូមបញ្ចូលពាក្យសម្ងាត់ (Password is required)";
    } else if (formData.password.length < 8) {
      errors.password = "ពាក្យសម្ងាត់ត្រូវមានយ៉ាងតិច ៨ តួអក្សរ (Min 8 characters)";
    }
    if (!formData.confirmPassword) {
      errors.confirmPassword = "សូមបញ្ជាក់ពាក្យសម្ងាត់ (Confirm password is required)";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "ពាក្យសម្ងាត់មិនត្រូវគ្នាទេ (Passwords do not match)";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError(null);
    setSuccessMessage(null);

    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "ការចុះឈ្មោះបរាជ័យ។ សូមព្យាយាមម្តងទៀត។ (Registration failed)",
        );
      }

      setSuccessMessage(
        "ការចុះឈ្មោះបានជោគជ័យ! កំពុងបញ្ជូនទៅកាន់ផ្ទាំងចូលគណនី... (Account created successfully! Redirecting to login...)",
      );

      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (err: unknown) {
      setGlobalError(
        err instanceof Error
          ? err.message
          : "មានបញ្ហាបច្ចេកទេស។ សូមព្យាយាមម្តងទៀត។ (Unexpected error occurred)",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full">
        {/* Header */}
        <div className="mb-6 text-center sm:text-left">
          <h1 className="text-[30px] sm:text-[35px] font-extrabold tracking-[0.4px] text-[#111827] dark:text-white">
            បង្កើតគណនី FoodHub
          </h1>
          <p className="mt-1 text-[16px] text-[#6b6559] dark:text-[#9ca3af]">
            ចូលរួមជាមួយ FoodHub ហើយរកមើលអាហារឆ្ងាញ់ៗ
          </p>
        </div>

        {/* Global Error Banner */}
        {globalError && (
          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-300">
            <span className="text-lg font-bold">⚠️</span>
            <span>{globalError}</span>
          </div>
        )}

        {/* Global Success Banner */}
        {successMessage && (
          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
            <span className="text-lg font-bold">✅</span>
            <span>{successMessage}</span>
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Row 1: First Name & Last Name */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label
                htmlFor="firstName"
                className="mb-1.5 block text-[13px] font-semibold text-[#1f2937] dark:text-[#f9fafb]"
              >
                នាមខ្លួន (First Name) <span className="text-red-500">*</span>
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="First Name / នាមខ្លួន"
                disabled={loading}
                className="w-full rounded-[14px] border-[1.5px] border-transparent bg-[#e9e3d7] px-[22px] py-[15px] text-[16px] text-[#111827] placeholder-[#a39c8d] transition-all outline-none focus:border-[#84cc16] focus:bg-white focus:shadow-[0_0_0_4px_rgba(132,204,22,0.16)] dark:bg-[#1f2937] dark:text-white dark:placeholder-[#9ca3af] dark:focus:bg-[#111827]"
              />
              {fieldErrors.firstName && (
                <p className="mt-1.5 text-[13px] font-medium text-[#dc2626]">
                  {fieldErrors.firstName}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="lastName"
                className="mb-1.5 block text-[13px] font-semibold text-[#1f2937] dark:text-[#f9fafb]"
              >
                នាមត្រកូល (Last Name) <span className="text-red-500">*</span>
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Last Name / នាមត្រកូល"
                disabled={loading}
                className="w-full rounded-[14px] border-[1.5px] border-transparent bg-[#e9e3d7] px-[22px] py-[15px] text-[16px] text-[#111827] placeholder-[#a39c8d] transition-all outline-none focus:border-[#84cc16] focus:bg-white focus:shadow-[0_0_0_4px_rgba(132,204,22,0.16)] dark:bg-[#1f2937] dark:text-white dark:placeholder-[#9ca3af] dark:focus:bg-[#111827]"
              />
              {fieldErrors.lastName && (
                <p className="mt-1.5 text-[13px] font-medium text-[#dc2626]">
                  {fieldErrors.lastName}
                </p>
              )}
            </div>
          </div>

          {/* Row 2: Email */}
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-[13px] font-semibold text-[#1f2937] dark:text-[#f9fafb]"
            >
              អ៊ីមែល (E-mail) <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="E-mail / អ៊ីមែល"
              disabled={loading}
              className="w-full rounded-[14px] border-[1.5px] border-transparent bg-[#e9e3d7] px-[22px] py-[15px] text-[16px] text-[#111827] placeholder-[#a39c8d] transition-all outline-none focus:border-[#84cc16] focus:bg-white focus:shadow-[0_0_0_4px_rgba(132,204,22,0.16)] dark:bg-[#1f2937] dark:text-white dark:placeholder-[#9ca3af] dark:focus:bg-[#111827]"
            />
            {fieldErrors.email && (
              <p className="mt-1.5 text-[13px] font-medium text-[#dc2626]">
                {fieldErrors.email}
              </p>
            )}
          </div>

          {/* Row 3: Password */}
          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-[13px] font-semibold text-[#1f2937] dark:text-[#f9fafb]"
            >
              ពាក្យសម្ងាត់ (Password) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password / ពាក្យសម្ងាត់"
                disabled={loading}
                className="w-full rounded-[14px] border-[1.5px] border-transparent bg-[#e9e3d7] px-[22px] py-[15px] pr-12 text-[16px] text-[#111827] placeholder-[#a39c8d] transition-all outline-none focus:border-[#84cc16] focus:bg-white focus:shadow-[0_0_0_4px_rgba(132,204,22,0.16)] dark:bg-[#1f2937] dark:text-white dark:placeholder-[#9ca3af] dark:focus:bg-[#111827]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6b6559] transition hover:text-[#111827] dark:text-[#9ca3af] dark:hover:text-white"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="mt-1.5 text-[13px] font-medium text-[#dc2626]">
                {fieldErrors.password}
              </p>
            )}
          </div>

          {/* Row 4: Confirm Password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-1.5 block text-[13px] font-semibold text-[#1f2937] dark:text-[#f9fafb]"
            >
              បញ្ជាក់ពាក្យសម្ងាត់ (Confirm Password) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm Password / បញ្ជាក់ពាក្យសម្ងាត់"
                disabled={loading}
                className="w-full rounded-[14px] border-[1.5px] border-transparent bg-[#e9e3d7] px-[22px] py-[15px] pr-12 text-[16px] text-[#111827] placeholder-[#a39c8d] transition-all outline-none focus:border-[#84cc16] focus:bg-white focus:shadow-[0_0_0_4px_rgba(132,204,22,0.16)] dark:bg-[#1f2937] dark:text-white dark:placeholder-[#9ca3af] dark:focus:bg-[#111827]"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6b6559] transition hover:text-[#111827] dark:text-[#9ca3af] dark:hover:text-white"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {fieldErrors.confirmPassword && (
              <p className="mt-1.5 text-[13px] font-medium text-[#dc2626]">
                {fieldErrors.confirmPassword}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-[12px] bg-[#84cc16] px-[28px] py-[17px] text-[18px] font-bold text-white shadow-[0_6px_16px_rgba(132,204,22,0.32)] transition-all duration-150 hover:-translate-y-0.5 hover:bg-[#65a30d] hover:shadow-[0_8px_20px_rgba(132,204,22,0.4)] active:translate-y-0 disabled:pointer-events-none disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="h-5 w-5 animate-spin text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  កំពុងដំណើរការ...
                </span>
              ) : (
                "Register / បង្កើតគណនី"
              )}
            </button>
          </div>
        </form>

        {/* Social Divider */}
        <div className="my-[24px] flex items-center gap-4">
          <div className="h-[1.5px] flex-1 bg-[#84cc16]/40" />
          <span className="text-[14px] font-semibold text-[#65a30d] dark:text-[#a3e635]">
            ឬចូលគណនីជាមួយ
          </span>
          <div className="h-[1.5px] flex-1 bg-[#84cc16]/40" />
        </div>

        {/* Social OAuth Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <a
            href="/api/auth/login"
            className="flex items-center justify-center gap-2.5 rounded-[12px] border-[1.5px] border-[#dcd5c7] bg-white py-3 text-[14px] font-semibold text-[#1f2937] shadow-sm transition hover:-translate-y-0.5 hover:border-[#84cc16] hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:border-[#84cc16]"
          >
            <GoogleIcon className="h-5 w-5" />
            <span>Google</span>
          </a>
          <a
            href="/api/auth/login"
            className="flex items-center justify-center gap-2.5 rounded-[12px] border-[1.5px] border-[#dcd5c7] bg-white py-3 text-[14px] font-semibold text-[#1f2937] shadow-sm transition hover:-translate-y-0.5 hover:border-[#84cc16] hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:border-[#84cc16]"
          >
            <GitHubIcon className="h-5 w-5" />
            <span>GitHub</span>
          </a>
        </div>

        {/* Footer Link */}
        <div className="mt-7 text-center text-[15px] text-[#6b6559] dark:text-[#9ca3af]">
          <span>មានគណនីរួចហើយ? </span>
          <Link
            href="/login"
            className="font-bold text-[#65a30d] hover:underline dark:text-[#a3e635]"
          >
            ចូលគណនី
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
