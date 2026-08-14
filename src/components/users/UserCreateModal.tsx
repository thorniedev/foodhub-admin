"use client";

import { useEffect, useState, type FormEvent } from "react";

import { AlertTriangle, Loader2, UserPlus, X } from "lucide-react";

import type { CreateAdminUserPayload } from "@/src/types/userProfile";

interface UserCreateModalProps {
  open: boolean;
  saving: boolean;
  onClose: () => void;
  onSubmit: (values: CreateAdminUserPayload) => Promise<void>;
}

const initialValues: CreateAdminUserPayload = {
  username: "",
  password: "",
  confirmedPassword: "",
  email: "",
  firstName: "",
  lastName: "",
  phoneNumber: "",
};

export default function UserCreateModal({
  open,
  saving,
  onClose,
  onSubmit,
}: UserCreateModalProps) {
  const [values, setValues] = useState<CreateAdminUserPayload>(initialValues);

  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    setValues(initialValues);
    setLocalError(null);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLocalError(null);

    if (values.password !== values.confirmedPassword) {
      setLocalError("Password និង Confirm password មិនដូចគ្នាទេ។");
      return;
    }

    if (values.password.length < 6) {
      setLocalError("Password ត្រូវមានយ៉ាងហោចណាស់ 6 តួអក្សរ។");
      return;
    }

    await onSubmit(values);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[3px]">
      <div className="max-h-[94vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-gray-100 bg-white shadow-2xl [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <div className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-100 bg-white/95 px-6 py-5 backdrop-blur-md sm:px-8">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-800">
              <UserPlus size={24} />
            </div>

            <div className="min-w-0">
              <p className="text-2xl font-semibold text-primary-800">
                បង្កើតអ្នកប្រើថ្មី
              </p>

              <p className="mt-1 text-lg text-gray-500">
                បង្កើត regular FoodHub user និង Keycloak account។
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

        <form onSubmit={handleSubmit} className="space-y-6 p-6 sm:p-8">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="First name"
              value={values.firstName}
              onChange={(value) =>
                setValues((previous) => ({
                  ...previous,
                  firstName: value,
                }))
              }
              required
            />

            <Field
              label="Last name"
              value={values.lastName}
              onChange={(value) =>
                setValues((previous) => ({
                  ...previous,
                  lastName: value,
                }))
              }
              required
            />

            <Field
              label="Username"
              value={values.username}
              onChange={(value) =>
                setValues((previous) => ({
                  ...previous,
                  username: value,
                }))
              }
              required
            />

            <Field
              label="Email"
              type="email"
              value={values.email}
              onChange={(value) =>
                setValues((previous) => ({
                  ...previous,
                  email: value,
                }))
              }
              required
            />

            <Field
              label="Phone number"
              value={values.phoneNumber}
              onChange={(value) =>
                setValues((previous) => ({
                  ...previous,
                  phoneNumber: value,
                }))
              }
              placeholder="+85512345678"
              required
            />

            <div className="hidden sm:block" />

            <Field
              label="Password"
              type="password"
              value={values.password}
              onChange={(value) =>
                setValues((previous) => ({
                  ...previous,
                  password: value,
                }))
              }
              required
            />

            <Field
              label="Confirm password"
              type="password"
              value={values.confirmedPassword}
              onChange={(value) =>
                setValues((previous) => ({
                  ...previous,
                  confirmedPassword: value,
                }))
              }
              required
            />
          </div>

          {localError && (
            <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-lg leading-7 text-red-600">
              <AlertTriangle size={21} className="mt-0.5 shrink-0" />
              <span>{localError}</span>
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              disabled={saving}
              onClick={onClose}
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-gray-200 bg-white px-7 text-lg font-medium text-gray-600 transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              បោះបង់
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary-800 px-7 text-lg font-medium text-white transition hover:bg-primary-900 focus:outline-none focus:ring-4 focus:ring-primary-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving && <Loader2 size={20} className="animate-spin" />}

              {saving ? "កំពុងបង្កើត..." : "បង្កើតអ្នកប្រើ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-lg font-medium text-primary-800">
        {label}
        {required ? " *" : ""}
      </span>

      <input
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="h-[52px] w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-lg text-gray-800 outline-none transition placeholder:text-gray-400 hover:border-gray-300 focus:border-primary-600 focus:bg-white focus:ring-4 focus:ring-primary-100"
      />
    </label>
  );
}
