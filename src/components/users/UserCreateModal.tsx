"use client";

import { FormEvent, useEffect, useState } from "react";
import { Loader2, UserPlus, X } from "lucide-react";

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
  const [values, setValues] = useState(initialValues);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setValues(initialValues);
    setLocalError(null);
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
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[28px] bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-5">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-black text-gray-900">
              <UserPlus size={21} className="text-[#137A3D]" />
              បង្កើតអ្នកប្រើថ្មី
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              បង្កើត regular FoodHub user និង Keycloak account។
            </p>
          </div>

          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-200 disabled:opacity-40"
          >
            <X size={19} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="First name"
              value={values.firstName}
              onChange={(value) => setValues((prev) => ({ ...prev, firstName: value }))}
              required
            />
            <Field
              label="Last name"
              value={values.lastName}
              onChange={(value) => setValues((prev) => ({ ...prev, lastName: value }))}
              required
            />
            <Field
              label="Username"
              value={values.username}
              onChange={(value) => setValues((prev) => ({ ...prev, username: value }))}
              required
            />
            <Field
              label="Email"
              type="email"
              value={values.email}
              onChange={(value) => setValues((prev) => ({ ...prev, email: value }))}
              required
            />
            <Field
              label="Phone number"
              value={values.phoneNumber}
              onChange={(value) => setValues((prev) => ({ ...prev, phoneNumber: value }))}
              placeholder="+85512345678"
              required
            />
            <div />
            <Field
              label="Password"
              type="password"
              value={values.password}
              onChange={(value) => setValues((prev) => ({ ...prev, password: value }))}
              required
            />
            <Field
              label="Confirm password"
              type="password"
              value={values.confirmedPassword}
              onChange={(value) =>
                setValues((prev) => ({ ...prev, confirmedPassword: value }))
              }
              required
            />
          </div>

          {localError && (
            <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              {localError}
            </div>
          )}

          <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">
            <button
              type="button"
              disabled={saving}
              onClick={onClose}
              className="rounded-xl border border-gray-200 px-5 py-2.5 font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-40"
            >
              បោះបង់
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-[#137A3D] px-5 py-2.5 font-bold text-white hover:bg-[#0f6532] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving && <Loader2 size={17} className="animate-spin" />}
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
      <span className="mb-2 block text-sm font-bold text-gray-700">{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm text-gray-800 outline-none transition placeholder:text-gray-300 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50"
      />
    </label>
  );
}
