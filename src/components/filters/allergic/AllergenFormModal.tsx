"use client";

import {
  useEffect,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

import {
  AlertTriangle,
  Loader2,
  ShieldAlert,
  X,
} from "lucide-react";

import type {
  Allergen,
  AllergenFormValues,
} from "@/src/types/allergen";

const EMPTY_FORM: AllergenFormValues = {
  code: "",
  name: "",
  description: "",
  active: true,
};

type Props = {
  open: boolean;
  allergen: Allergen | null;
  saving: boolean;
  onClose: () => void;
  onSubmit: (
    values: AllergenFormValues,
  ) => Promise<void>;
};

function createInternalName(
  code: string,
): string {
  const cleanCode =
    code
      .trim()
      .replace(/[_-]+/g, " ");

  if (!cleanCode) {
    return "";
  }

  return cleanCode
    .toLowerCase()
    .replace(
      /\b[a-z]/g,
      (character) =>
        character.toUpperCase(),
    );
}

export default function AllergenFormModal({
  open,
  allergen,
  saving,
  onClose,
  onSubmit,
}: Props) {
  const [form, setForm] =
    useState<AllergenFormValues>(
      EMPTY_FORM,
    );

  const [
    validationError,
    setValidationError,
  ] = useState("");

  useEffect(() => {
    if (!open) return;

    setForm(
      allergen
        ? {
          code: allergen.code,
          name: allergen.name,
          description:
            allergen.description ??
            "",
          active:
            allergen.active,
        }
        : EMPTY_FORM,
    );

    setValidationError("");
  }, [open, allergen]);

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
        form.code.trim();

      if (!code) {
        setValidationError(
          "សូមបំពេញអាឡែស៊ី។",
        );

        return;
      }

      const generatedName =
        createInternalName(code);

      setValidationError("");

      await onSubmit({
        ...form,
        code,
        name: generatedName,
        description:
          form.description.trim(),
      });
    };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[3px]">
      <div className="max-h-[94vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-gray-100 bg-white shadow-2xl [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {/* HEADER */}
        <div className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-100 bg-white/95 px-6 py-5 backdrop-blur-md sm:px-8">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-800">
              <ShieldAlert size={24} />
            </div>

            <div className="min-w-0">
              <p className="text-3xl font-semibold text-primary-800">
                {allergen
                  ? "កែប្រែអាឡែស៊ី"
                  : "បន្ថែមអាឡែស៊ីថ្មី"}
              </p>

              <p className="mt-1 text-lg leading-7 text-gray-500">
                គ្រប់គ្រងព័ត៌មានអាឡែស៊ីដែលប្រើសម្រាប់សុវត្ថិភាពអាហារ។
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
            title="ព័ត៌មានអាឡែស៊ី"
            icon={
              <ShieldAlert
                size={22}
              />
            }
          >
            <Field
              label="ឈ្មោះអាឡែស៊ី"
              value={form.code}
              onChange={(value) =>
                setForm(
                  (previous) => ({
                    ...previous,
                    code: value,
                  }),
                )
              }
              placeholder="ឧ. សណ្ដែកដី"
              required
            />

            <label className="mt-5 block">
              <FieldLabel>
                ការពិពណ៌នា
              </FieldLabel>

              <textarea
                rows={4}
                value={
                  form.description
                }
                onChange={(event) =>
                  setForm(
                    (previous) => ({
                      ...previous,
                      description:
                        event.target.value,
                    }),
                  )
                }
                placeholder="សរសេរការពិពណ៌នាអំពីអាឡែស៊ី..."
                className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-lg leading-8 text-gray-800 outline-none transition placeholder:text-gray-400 hover:border-gray-300 focus:border-primary-600 focus:bg-white focus:ring-4 focus:ring-primary-100"
              />
            </label>
          </Section>

          <Section
            title="ស្ថានភាព"
            icon={
              <AlertTriangle
                size={22}
              />
            }
          >
            <StatusSwitch
              active={form.active}
              description="បើក ដើម្បីឱ្យកំណត់ត្រាអាឡែស៊ីនេះសកម្មក្នុងប្រព័ន្ធ។"
              onChange={() =>
                setForm(
                  (previous) => ({
                    ...previous,
                    active:
                      !previous.active,
                  }),
                )
              }
            />
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
                : allergen
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

function StatusSwitch({
  active,
  description,
  onChange,
}: {
  active: boolean;
  description: string;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-5 rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4">
      <div className="min-w-0">
        <p className="text-lg font-medium text-primary-800">
          សកម្ម
        </p>

        <p className="mt-1 text-lg leading-7 text-gray-500">
          {description}
        </p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={active}
        onClick={onChange}
        className={`relative h-7 w-12 shrink-0 rounded-full transition focus:outline-none focus:ring-4 focus:ring-primary-100 ${active
            ? "bg-primary-700"
            : "bg-gray-300"
          }`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-all ${active
              ? "left-6"
              : "left-1"
            }`}
        />
      </button>
    </div>
  );
}
