"use client";

import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import {
  AlertTriangle,
  Loader2,
  UserPlus,
  X,
} from "lucide-react";

import type { CreateAdminUserPayload } from "@/src/types/userProfile";

interface UserCreateModalProps {
  open: boolean;
  saving: boolean;
  onClose: () => void;
  onSubmit: (
    values: CreateAdminUserPayload,
  ) => Promise<void>;
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
  const [values, setValues] =
    useState<CreateAdminUserPayload>(initialValues);

  const [localError, setLocalError] =
    useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    setValues(initialValues);
    setLocalError(null);
  }, [open]);

  if (!open) {
    return null;
  }

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setLocalError(null);

    if (
      values.password !==
      values.confirmedPassword
    ) {
      setLocalError(
        "Password និង Confirm password មិនដូចគ្នាទេ។",
      );
      return;
    }

    if (values.password.length < 6) {
      setLocalError(
        "Password ត្រូវមានយ៉ាងហោចណាស់ 6 តួអក្សរ។",
      );
      return;
    }

    await onSubmit(values);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[28px] bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-gray-100 bg-white px-6 py-5">
          <div>
            <p className="flex items-center gap-3 text-4xl font-bold text-[#136C34]">
              <UserPlus size={28} />
              បង្កើតអ្នកប្រើថ្មី
            </p>

            <p className="mt-2 text-base text-gray-500">
              បង្កើត regular FoodHub user និង Keycloak account។
            </p>
          </div>

          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 p-6"
        >
          <div className="grid gap-4 sm:grid-cols-2">
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

            <div />

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
            <div className="flex gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
              <AlertTriangle
                size={18}
                className="shrink-0"
              />
              {localError}
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={saving}
              onClick={onClose}
              className="rounded-xl border border-gray-200 px-5 py-2.5 text-lg text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
            >
              បោះបង់
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#136C34] px-5 py-2.5 text-lg text-white transition hover:bg-[#0f592b] disabled:opacity-60"
            >
              {saving && (
                <Loader2 size={17} className="animate-spin" />
              )}

              {saving
                ? "កំពុងបង្កើត..."
                : "បង្កើតអ្នកប្រើ"}
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
      <span className="mb-2 block text-xl font-semibold text-[#F97316]">
        {label}
        {required ? " *" : ""}
      </span>

      <input
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-base text-gray-800 outline-none transition placeholder:text-gray-300 focus:border-[#136C34] focus:bg-white focus:ring-2 focus:ring-[#136C34]/10"
      />
    </label>
  );
}
