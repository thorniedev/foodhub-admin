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
  Settings2,
  X,
} from "lucide-react";

import type {
  Ingredient,
  IngredientFormValues,
} from "@/src/types/ingredient";

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

  const [
    validationError,
    setValidationError,
  ] = useState("");

  useEffect(() => {
    if (!open) return;

    setValidationError("");

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

      const code =
        values.code
          .trim()
          .toUpperCase();

      const name =
        values.name.trim();

      if (!code) {
        setValidationError(
          "សូមបំពេញឈ្មោះជាភាសាអង់គ្លេស។",
        );
        return;
      }

      if (!name) {
        setValidationError(
          "សូមបំពេញឈ្មោះគ្រឿងផ្សំ។",
        );
        return;
      }

      if (code.length > 80) {
        setValidationError(
          "ឈ្មោះជាភាសាអង់គ្លេសមិនអាចលើស 80 តួអក្សរ។",
        );
        return;
      }

      if (name.length > 150) {
        setValidationError(
          "ឈ្មោះមិនអាចលើស 150 តួអក្សរ។",
        );
        return;
      }

      setValidationError("");

      await onSubmit({
        code,
        name,
        description:
          values.description.trim(),
        isActive:
          values.isActive,
      });
    };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[3px]">
      <div className="max-h-[94vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-gray-100 bg-white shadow-2xl [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <div className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-100 bg-white/95 px-6 py-5 backdrop-blur-md sm:px-8">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-800">
              <Leaf size={24} />
            </div>

            <div className="min-w-0">
              <p className="text-3xl font-semibold text-primary-800">
                {item
                  ? "កែប្រែគ្រឿងផ្សំ"
                  : "បន្ថែមគ្រឿងផ្សំថ្មី"}
              </p>

              <p className="mt-1 text-lg leading-7 text-gray-500">
                គ្រប់គ្រងទិន្នន័យគ្រឿងផ្សំសម្រាប់ប្រើប្រាស់ក្នុងមុខម្ហូប និងអាហារូបត្ថម្ភ។
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

        <form
          onSubmit={handleSubmit}
          className="space-y-6 p-6 sm:p-8"
        >
          <Section
            title="ព័ត៌មានគ្រឿងផ្សំ"
            icon={<Leaf size={22} />}
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label="ឈ្មោះជាភាសាអង់គ្លេស"
                value={values.code}
                onChange={(value) =>
                  setValues(
                    (previous) => ({
                      ...previous,
                      code: value,
                    }),
                  )
                }
                placeholder="ឧ. RICE, PORK, FISH_SAUCE"
                required
              />

              <Field
                label="ឈ្មោះគ្រឿងផ្សំ"
                value={values.name}
                onChange={(value) =>
                  setValues(
                    (previous) => ({
                      ...previous,
                      name: value,
                    }),
                  )
                }
                placeholder="ឧ. Rice, Pork, Garlic"
                required
              />
            </div>

            <label className="mt-5 block">
              <FieldLabel>
                ការពិពណ៌នា
              </FieldLabel>

              <textarea
                rows={4}
                value={
                  values.description
                }
                onChange={(event) =>
                  setValues(
                    (previous) => ({
                      ...previous,
                      description:
                        event.target.value,
                    }),
                  )
                }
                placeholder="បញ្ចូលការពិពណ៌នាអំពីគ្រឿងផ្សំ..."
                className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-lg leading-8 text-gray-800 outline-none transition placeholder:text-gray-400 hover:border-gray-300 focus:border-primary-600 focus:bg-white focus:ring-4 focus:ring-primary-100"
              />
            </label>
          </Section>

          <Section
            title="ស្ថានភាព"
            icon={<Settings2 size={22} />}
          >
            <div className="flex items-center justify-between gap-5 rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4">
              <div className="min-w-0">
                <p className="text-lg font-medium text-primary-800">
                  សកម្ម
                </p>

                <p className="mt-1 text-lg leading-7 text-gray-500">
                  គ្រឿងផ្សំសកម្មនឹងអាចជ្រើសបាននៅពេលបង្កើតម្ហូប។
                </p>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={
                  values.isActive
                }
                onClick={() =>
                  setValues(
                    (previous) => ({
                      ...previous,
                      isActive:
                        !previous.isActive,
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
          </Section>

          {validationError && (
            <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-lg leading-7 text-red-600">
              <AlertTriangle
                size={21}
                className="mt-0.5 shrink-0"
              />

              <span>
                {validationError}
              </span>
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
                  : "បន្ថែម"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-800">
          {icon}
        </div>

        <p className="text-3xl font-semibold text-primary-800">
          {title}
        </p>
      </div>

      {children}
    </section>
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
}: {
  label: string;
  value: string;
  onChange: (
    value: string,
  ) => void;
  placeholder?: string;
  required?: boolean;
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
        className="h-[52px] w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-lg text-gray-800 outline-none transition placeholder:text-gray-400 hover:border-gray-300 focus:border-primary-600 focus:bg-white focus:ring-4 focus:ring-primary-100"
      />
    </label>
  );
}
