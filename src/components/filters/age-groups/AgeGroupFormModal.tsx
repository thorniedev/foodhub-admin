"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";

import { AlertTriangle, Loader2, Users, X } from "lucide-react";

import type { AgeGroup, AgeGroupFormValues } from "@/src/types/ageGroup";

const EMPTY_FORM: AgeGroupFormValues = {
  code: "",
  name: "",
  minAge: "",
  maxAge: "",
  description: "",
  isActive: true,
};

type Props = {
  open: boolean;
  item: AgeGroup | null;
  saving: boolean;
  onClose: () => void;
  onSubmit: (values: AgeGroupFormValues) => Promise<void>;
};

export default function AgeGroupFormModal({
  open,
  item,
  saving,
  onClose,
  onSubmit,
}: Props) {
  const [form, setForm] = useState<AgeGroupFormValues>(EMPTY_FORM);
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    if (!open) {
      return;
    }

    if (item) {
      setForm({
        code: item.code,
        name: item.name,
        minAge: String(item.minAge),
        maxAge: String(item.maxAge),
        description: item.description ?? "",
        isActive: item.isActive,
      });
    } else {
      setForm(EMPTY_FORM);
    }

    setValidationError("");
  }, [open, item]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) {
    return null;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const code = form.code.trim().toUpperCase();
    const name = form.name.trim();
    const minAge = Number(form.minAge);
    const maxAge = Number(form.maxAge);

    if (!name) {
      setValidationError("សូមបំពេញឈ្មោះក្រុមអាយុ។");
      return;
    }

    if (!code) {
      setValidationError("សូមបំពេញកូដក្រុមអាយុ។");
      return;
    }

    if (!form.minAge.trim() || !form.maxAge.trim()) {
      setValidationError("សូមបំពេញអាយុអប្បបរមា និងអាយុអតិបរមា។");
      return;
    }

    if (
      !Number.isInteger(minAge) ||
      !Number.isInteger(maxAge) ||
      minAge < 0 ||
      maxAge < 0
    ) {
      setValidationError("អាយុត្រូវតែជាចំនួនគត់ និងមិនតិចជាង 0។");
      return;
    }

    if (maxAge < minAge) {
      setValidationError("អាយុអតិបរមាត្រូវធំជាង ឬស្មើអាយុអប្បបរមា។");
      return;
    }

    setValidationError("");

    await onSubmit({
      ...form,
      code,
      name,
      minAge: String(minAge),
      maxAge: String(maxAge),
      description: form.description.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[3px]">
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-2xl">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-white px-6 py-5 sm:px-8">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-800">
              <Users size={24} />
            </div>

            <div className="min-w-0">
              <p className="text-2xl font-semibold text-primary-800">
                {item ? "កែប្រែក្រុមអាយុ" : "បន្ថែម ក្រុមអាយុ"}
              </p>

              <p className="mt-0.5 truncate text-lg text-gray-500">
                Age Groups
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

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4 p-6 sm:p-7">
          {/* Name & Code */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              label="ឈ្មោះ ក្រុមអាយុ"
              value={form.name}
              onChange={(value) =>
                setForm((prev) => ({
                  ...prev,
                  name: value,
                }))
              }
              placeholder="ឧ. កុមារ, មនុស្សពេញវ័យ"
              required
            />

            <Field
              label="កូដ (Code)"
              value={form.code}
              onChange={(value) =>
                setForm((prev) => ({
                  ...prev,
                  code: value.toUpperCase(),
                }))
              }
              placeholder="ឧ. CHILD, ADULT"
              required
            />
          </div>

          {/* Min Age & Max Age */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              label="អាយុអប្បបរមា (Min Age)"
              type="number"
              value={form.minAge}
              onChange={(value) =>
                setForm((prev) => ({
                  ...prev,
                  minAge: value,
                }))
              }
              placeholder="ឧ. 0"
              required
            />

            <Field
              label="អាយុអតិបរមា (Max Age)"
              type="number"
              value={form.maxAge}
              onChange={(value) =>
                setForm((prev) => ({
                  ...prev,
                  maxAge: value,
                }))
              }
              placeholder="ឧ. 12"
              required
            />
          </div>

          {/* Description */}
          <div>
            <FieldLabel>ការពិពណ៌នា</FieldLabel>

            <textarea
              rows={3}
              value={form.description}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  description: event.target.value,
                }))
              }
              placeholder="បញ្ចូលការពិពណ៌នាអំពីក្រុមអាយុ..."
              className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-lg leading-8 text-gray-800 outline-none transition placeholder:text-gray-400 hover:border-gray-300 focus:border-primary-600 focus:bg-white focus:ring-4 focus:ring-primary-100"
            />
          </div>

          {/* Status */}
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-gray-50 px-5 py-3.5">
            <div className="min-w-0">
              <p className="text-lg font-medium text-primary-800">
                ស្ថានភាព
              </p>

              <p className="text-base text-gray-500">
                បើក ដើម្បីឱ្យក្រុមអាយុនេះសកម្មក្នុងប្រព័ន្ធ។
              </p>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={form.isActive}
              onClick={() =>
                setForm((prev) => ({
                  ...prev,
                  isActive: !prev.isActive,
                }))
              }
              className={`relative h-7 w-12 shrink-0 rounded-full transition focus:outline-none focus:ring-4 focus:ring-primary-100 ${
                form.isActive ? "bg-primary-700" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-all ${
                  form.isActive ? "left-6" : "left-1"
                }`}
              />
            </button>
          </div>

          {/* Validation error */}
          {validationError && (
            <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-lg leading-7 text-red-600">
              <AlertTriangle size={18} className="mt-0.5 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              disabled={saving}
              onClick={onClose}
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-gray-200 bg-white px-7 text-lg font-normal text-gray-600 transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              បោះបង់
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary-800 px-7 text-lg font-normal text-white transition hover:bg-primary-900 focus:outline-none focus:ring-4 focus:ring-primary-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving && <Loader2 size={20} className="animate-spin" />}
              {saving
                ? "កំពុងរក្សាទុក..."
                : item
                  ? "រក្សាទុកការកែប្រែ"
                  : "បន្ថែម ក្រុមអាយុ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FieldLabel({
  children,
  required = false,
}: {
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <span className="mb-2 block text-lg font-medium text-primary-800">
      {children}
      {required && <span className="text-red-500"> *</span>}
    </span>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className="block">
      <FieldLabel required={required}>{label}</FieldLabel>

      <input
        type={type}
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-[52px] w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-lg text-gray-800 outline-none transition placeholder:text-gray-400 hover:border-gray-300 focus:border-primary-600 focus:bg-white focus:ring-4 focus:ring-primary-100"
      />
    </label>
  );
}
