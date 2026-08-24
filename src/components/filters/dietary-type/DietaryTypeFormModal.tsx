"use client";

import { useEffect, useState, type FormEvent } from "react";

import { AlertTriangle, ChevronDown, Loader2, Salad, X } from "lucide-react";

import type {
  DietaryType,
  DietaryTypeFormValues,
} from "@/src/types/dietaryType";

import { DIETARY_TYPE_CATEGORIES } from "@/src/types/dietaryType";

const initialValues: DietaryTypeFormValues = {
  code: "",
  name: "",
  category: "LIFESTYLE",
  description: "",
  active: true,
};

interface DietaryTypeFormModalProps {
  open: boolean;
  item: DietaryType | null;
  saving: boolean;
  onClose: () => void;
  onSubmit: (values: DietaryTypeFormValues) => Promise<void>;
}

export default function DietaryTypeFormModal({
  open,
  item,
  saving,
  onClose,
  onSubmit,
}: DietaryTypeFormModalProps) {
  const [values, setValues] = useState<DietaryTypeFormValues>(initialValues);

  const [localError, setLocalError] = useState<string | null>(null);

  /* =========================================================
     RESET FORM WHEN MODAL OPENS
  ========================================================= */

  useEffect(() => {
    if (!open) return;

    setValues(
      item
        ? {
            code: item.code,
            name: item.name,
            category: item.category,
            description: item.description ?? "",
            active: item.active,
          }
        : initialValues,
    );

    setLocalError(null);
  }, [open, item]);

  /* =========================================================
     LOCK PAGE SCROLL
  ========================================================= */

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) return null;

  /* =========================================================
     SUBMIT
  ========================================================= */

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLocalError(null);

    const code = values.code.trim();

    const name = values.name.trim();

    const category = values.category.trim();

    if (!code) {
      setLocalError("សូមបញ្ចូលកូដរបបអាហារ។");
      return;
    }

    if (!name) {
      setLocalError("សូមបញ្ចូលឈ្មោះរបបអាហារ។");
      return;
    }

    if (!category) {
      setLocalError("សូមជ្រើសរើសប្រភេទរបបអាហារ។");
      return;
    }

    await onSubmit({
      ...values,
      code,
      name,
      category,
      description: values.description.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[3px]">
      <div className="max-h-[94vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-gray-100 bg-white shadow-2xl [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {/* =================================================
            HEADER
            Same concept as UserCreateModal
        ================================================== */}
        <div className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-100 bg-white/95 px-6 py-5 backdrop-blur-md sm:px-8">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-800">
              <Salad size={24} />
            </div>

            <div className="min-w-0">
              <p className="text-2xl font-semibold text-primary-800">
                {item ? "កែប្រែរបបអាហារ" : "បន្ថែមរបបអាហារថ្មី"}
              </p>

              <p className="mt-1 text-lg text-gray-500">
                {item
                  ? "កែប្រែព័ត៌មានរបបអាហារ និងរក្សាទុកការផ្លាស់ប្តូរ។"
                  : "បង្កើតរបបអាហារថ្មីសម្រាប់ប្រើក្នុង FoodHub។"}
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

        {/* =================================================
            FORM
        ================================================== */}
        <form onSubmit={handleSubmit} className="space-y-6 p-6 sm:p-8">
          {/* Code + Name */}
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="កូដ"
              value={values.code}
              disabled={Boolean(item)}
              onChange={(value) =>
                setValues((previous) => ({
                  ...previous,
                  code: value.toUpperCase(),
                }))
              }
              placeholder="VEGAN"
              required
              helperText={
                item
                  ? "កូដសម្គាល់មិនអាចកែប្រែបានទេ (Fixed Identifier)"
                  : undefined
              }
            />

            <Field
              label="ឈ្មោះ"
              value={values.name}
              onChange={(value) =>
                setValues((previous) => ({
                  ...previous,
                  name: value,
                }))
              }
              placeholder="Vegan"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block">
              <span className="mb-2 block text-lg font-medium text-primary-800">
                ប្រភេទ *
              </span>

              <div className="relative">
                <select
                  value={values.category}
                  onChange={(event) =>
                    setValues((previous) => ({
                      ...previous,
                      category: event.target.value,
                    }))
                  }
                  className="h-[52px] w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 px-4 pr-12 text-lg text-gray-800 outline-none transition hover:border-gray-300 focus:border-primary-600 focus:bg-white focus:ring-4 focus:ring-primary-100"
                >
                  {DIETARY_TYPE_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={20}
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                />
              </div>
            </label>
          </div>

          {/* Description */}
          <div>
            <label className="block">
              <span className="mb-2 block text-lg font-medium text-primary-800">
                ការពិពណ៌នា
              </span>

              <textarea
                rows={4}
                value={values.description}
                onChange={(event) =>
                  setValues((previous) => ({
                    ...previous,
                    description: event.target.value,
                  }))
                }
                placeholder="សរសេរការពិពណ៌នាអំពីរបបអាហារ..."
                className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-lg leading-8 text-gray-800 outline-none transition placeholder:text-gray-400 hover:border-gray-300 focus:border-primary-600 focus:bg-white focus:ring-4 focus:ring-primary-100"
              />
            </label>
          </div>



          {/* Validation error */}
          {localError && (
            <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-lg leading-7 text-red-600">
              <AlertTriangle size={21} className="mt-0.5 shrink-0" />

              <span>{localError}</span>
            </div>
          )}

          {/* =================================================
              FOOTER ACTIONS
              Same concept as UserCreateModal
          ================================================== */}
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

              {saving
                ? "កំពុងរក្សាទុក..."
                : item
                  ? "រក្សាទុកការកែប្រែ"
                  : "បន្ថែមរបបអាហារ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* =========================================================
   REUSABLE FIELD
   Same field concept as UserCreateModal
========================================================= */

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
  disabled,
  helperText,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  helperText?: string;
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
        disabled={disabled}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={`h-[52px] w-full rounded-xl border border-gray-200 px-4 text-lg outline-none transition ${
          disabled
            ? "cursor-not-allowed bg-gray-100/80 font-mono text-gray-500 shadow-inner select-none"
            : "bg-gray-50 text-gray-800 placeholder:text-gray-400 hover:border-gray-300 focus:border-primary-600 focus:bg-white focus:ring-4 focus:ring-primary-100"
        }`}
      />

      {helperText && (
        <span className="mt-1.5 block text-sm font-medium text-gray-400">
          {helperText}
        </span>
      )}
    </label>
  );
}
