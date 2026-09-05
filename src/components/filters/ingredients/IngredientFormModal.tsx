"use client";

import {
  useEffect,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

import {
  AlertTriangle,
  Leaf,
  Loader2,
  X,
} from "lucide-react";
import { z } from "zod";

import type {
  Ingredient,
  IngredientFormValues,
} from "@/src/types/ingredient";

const ingredientSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "សូមបំពេញឈ្មោះគ្រឿងផ្សំ។")
    .max(150, "ឈ្មោះមិនអាចលើស 150 តួអក្សរ។"),
  code: z
    .string()
    .trim()
    .min(1, "សូមបំពេញកូដគ្រឿងផ្សំ។")
    .max(80, "កូដមិនអាចលើស 80 តួអក្សរ។"),
});

interface Props {
  open: boolean;
  item: Ingredient | null;
  saving?: boolean;
  onClose: () => void;
  onSubmit: (
    values: IngredientFormValues,
  ) => Promise<void> | void;
}

const emptyValues: IngredientFormValues = {
  code: "",
  name: "",
  description: "",
  isActive: true,
};

export default function IngredientFormModal({
  open,
  item,
  saving = false,
  onClose,
  onSubmit,
}: Props) {
  const [values, setValues] =
    useState<IngredientFormValues>(
      emptyValues,
    );

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const clearFieldError = (key: string) => {
    if (fieldErrors[key]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  useEffect(() => {
    if (!open) return;

    setFieldErrors({});
    setServerError(null);

    setValues(
      item
        ? {
            code: item.code ?? "",
            name: item.name ?? "",
            description:
              item.description ?? "",
            isActive:
              item.isActive,
          }
        : emptyValues,
    );
  }, [open, item]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, [open]);

  if (!open) {
    return null;
  }

  const handleSubmit =
    async (
      event:
        FormEvent<HTMLFormElement>,
    ) => {
      event.preventDefault();
      setServerError(null);

      const result = ingredientSchema.safeParse({
        name: values.name,
        code: values.code,
      });

      if (!result.success) {
        const errs: Record<string, string> = {};
        for (const issue of result.error.issues) {
          const key = String(issue.path[0]);
          if (!errs[key]) {
            errs[key] = issue.message;
          }
        }
        setFieldErrors(errs);
        return;
      }

      setFieldErrors({});

      const code =
        values.code
          .trim()
          .toUpperCase();

      const name =
        values.name.trim();

      try {
        await onSubmit({
          code,
          name,
          description:
            values.description.trim(),
          isActive:
            values.isActive,
        });
      } catch (err: any) {
        const errorMsg =
          err?.data?.message ||
          err?.message ||
          (typeof err === "string" ? err : "មិនអាចរក្សាទុកទិន្នន័យបានទេ។");
        setServerError(errorMsg);
      }
    };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-[3px]">
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-2xl">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-white px-6 py-5 sm:px-8">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-800">
              <Leaf size={24} />
            </div>

            <div className="min-w-0">
              <p className="text-2xl font-semibold text-primary-800">
                {item
                  ? "កែប្រែគ្រឿងផ្សំ"
                  : "បន្ថែម គ្រឿងផ្សំ"}
              </p>

              <p className="mt-0.5 truncate text-lg text-gray-500">
                Ingredients
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
        <form
          onSubmit={handleSubmit}
          className="space-y-4 p-6 sm:p-7"
        >
          {/* Name & Code */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              label="ឈ្មោះ គ្រឿងផ្សំ"
              value={values.name}
              onChange={(value) => {
                setValues(
                  (previous) => ({
                    ...previous,
                    name: value,
                  }),
                );
                clearFieldError("name");
              }}
              placeholder="ឧ. បញ្ចូលឈ្មោះ គ្រឿងផ្សំ"
              required
              error={fieldErrors.name}
            />

            <Field
              label="កូដ (Code)"
              value={values.code}
              onChange={(value) => {
                setValues(
                  (previous) => ({
                    ...previous,
                    code: value.toUpperCase(),
                  }),
                );
                clearFieldError("code");
              }}
              placeholder="ឧ. CODE_NAME"
              required
              error={fieldErrors.code}
            />
          </div>

          {/* Description */}
          <div>
            <FieldLabel>
              ការពិពណ៌នា
            </FieldLabel>

            <textarea
              rows={3}
              value={values.description}
              onChange={(event) =>
                setValues(
                  (previous) => ({
                    ...previous,
                    description: event.target.value,
                  }),
                )
              }
              placeholder="បញ្ចូលការពិពណ៌នា..."
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
                បើក ដើម្បីឱ្យគ្រឿងផ្សំនេះសកម្មក្នុងប្រព័ន្ធ។
              </p>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={values.isActive}
              onClick={() =>
                setValues(
                  (previous) => ({
                    ...previous,
                    isActive: !previous.isActive,
                  }),
                )
              }
              className={`relative h-7 w-12 shrink-0 rounded-full transition focus:outline-none focus:ring-4 focus:ring-primary-100 ${
                values.isActive
                  ? "bg-primary-700"
                  : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-all ${
                  values.isActive
                    ? "left-6"
                    : "left-1"
                }`}
              />
            </button>
          </div>

          {/* Server error */}
          {serverError && (
            <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-lg leading-7 text-red-600">
              <AlertTriangle
                size={18}
                className="mt-0.5 shrink-0"
              />

              <span>
                {serverError}
              </span>
            </div>
          )}

          {/* Footer Action buttons */}
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
              {saving && (
                <Loader2
                  size={20}
                  className="animate-spin"
                />
              )}

              {saving
                ? "កំពុងរក្សាទុក..."
                : item
                  ? "រក្សាទុកការកែប្រែ"
                  : "បន្ថែម គ្រឿងផ្សំ"}
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

      {required && (
        <span className="text-red-500">
          {" "}*
        </span>
      )}
    </span>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  error,
}: {
  label: string;
  value: string;
  onChange: (
    value: string,
  ) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
}) {
  return (
    <label className="block">
      <FieldLabel
        required={required}
      >
        {label}
      </FieldLabel>

      <input
        value={value}
        required={required}
        onChange={(event) =>
          onChange(
            event.target.value,
          )
        }
        placeholder={placeholder}
        className={`h-[52px] w-full rounded-xl border px-4 text-lg text-gray-800 outline-none transition placeholder:text-gray-400 focus:bg-white focus:ring-4 ${
          error
            ? "border-red-400 bg-red-50/40 focus:border-red-500 focus:ring-red-100"
            : "border-gray-200 bg-gray-50 hover:border-gray-300 focus:border-primary-600 focus:ring-primary-100"
        }`}
      />
      {error && (
        <p className="mt-1 text-sm font-normal text-red-500">{error}</p>
      )}
    </label>
  );
}
