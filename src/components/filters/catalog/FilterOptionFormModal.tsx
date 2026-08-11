"use client";

import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import {
  AlertTriangle,
  Loader2,
  X,
} from "lucide-react";

import type {
  FilterCatalogOption,
  FilterCatalogOptionFormValues,
  FilterGroupDefinition,
} from "@/src/types/filterCatalog";

const EMPTY_FORM: FilterCatalogOptionFormValues = {
  localName: "",
  name: "",
  description: "",
  numericValue: "",
  unit: "",
  active: true,
};

export default function FilterOptionFormModal({
  open,
  group,
  item,
  saving,
  onClose,
  onSubmit,
}: {
  open: boolean;
  group: FilterGroupDefinition;
  item: FilterCatalogOption | null;
  saving: boolean;
  onClose: () => void;
  onSubmit: (
    values: FilterCatalogOptionFormValues,
  ) => Promise<void>;
}) {
  const [form, setForm] =
    useState<FilterCatalogOptionFormValues>(
      EMPTY_FORM,
    );

  const [
    validationError,
    setValidationError,
  ] = useState("");

  useEffect(() => {
    if (!open) {
      return;
    }

    setForm(
      item
        ? {
            localName:
              item.localName,
            name: item.name,
            description:
              item.description ??
              "",
            numericValue:
              item.numericValue ===
              null
                ? ""
                : String(
                    item.numericValue,
                  ),
            unit:
              item.unit ?? "",
            active:
              item.active,
          }
        : EMPTY_FORM,
    );

    setValidationError("");
  }, [open, item]);

  if (!open) {
    return null;
  }

  const handleSubmit =
    async (
      event:
        FormEvent<HTMLFormElement>,
    ) => {
      event.preventDefault();

      if (
        !form.localName.trim() &&
        !form.name.trim()
      ) {
        setValidationError(
          "សូមបំពេញឈ្មោះស្លាកត្រង។",
        );

        return;
      }

      if (
        form.numericValue.trim() &&
        !Number.isFinite(
          Number(
            form.numericValue,
          ),
        )
      ) {
        setValidationError(
          "តម្លៃលេខមិនត្រឹមត្រូវ។",
        );

        return;
      }

      setValidationError("");

      await onSubmit(form);
    };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[28px] bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-gray-100 bg-white px-6 py-5">
          <div>
            <p className="text-3xl font-bold text-[#136C34]">
              {item
                ? `កែប្រែ ${group.labelKm}`
                : `បន្ថែម ${group.labelKm}`}
            </p>

            <p className="mt-2 text-base text-gray-500">
              {group.labelEn}
            </p>
          </div>

          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
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
              label="ឈ្មោះសម្រាប់បង្ហាញ *"
              value={
                form.localName
              }
              onChange={(value) =>
                setForm(
                  (previous) => ({
                    ...previous,
                    localName:
                      value,
                  }),
                )
              }
              placeholder="ឧ. ម្ហូបថៃ"
            />

            <Field
              label="English name"
              value={form.name}
              onChange={(value) =>
                setForm(
                  (previous) => ({
                    ...previous,
                    name: value,
                  }),
                )
              }
              placeholder="e.g. Thai Food"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Numeric value"
              type="number"
              step="any"
              value={
                form.numericValue
              }
              onChange={(value) =>
                setForm(
                  (previous) => ({
                    ...previous,
                    numericValue:
                      value,
                  }),
                )
              }
              placeholder="Optional"
            />

            <Field
              label="Unit"
              value={form.unit}
              onChange={(value) =>
                setForm(
                  (previous) => ({
                    ...previous,
                    unit: value,
                  }),
                )
              }
              placeholder="MINUTE, KM, G, STAR..."
            />
          </div>

          <div>
            <label className="mb-2 block text-xl font-semibold text-[#F97316]">
              ការពិពណ៌នា
            </label>

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
                      event.target
                        .value,
                  }),
                )
              }
              className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-800 outline-none transition focus:border-[#136C34] focus:bg-white focus:ring-2 focus:ring-[#136C34]/10"
            />
          </div>

          <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
            <div>
              <p className="text-xl font-semibold text-[#F97316]">
                សកម្ម
              </p>

              <p className="mt-1 text-base text-gray-500">
                បើក ដើម្បីឱ្យស្លាកនេះបង្ហាញនៅក្នុង Form បង្កើតម្ហូប។
              </p>
            </div>

            <input
              type="checkbox"
              checked={
                form.active
              }
              onChange={(event) =>
                setForm(
                  (previous) => ({
                    ...previous,
                    active:
                      event.target
                        .checked,
                  }),
                )
              }
              className="h-5 w-5 accent-[#F97316]"
            />
          </label>

          {validationError && (
            <div className="flex gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
              <AlertTriangle
                size={18}
                className="shrink-0"
              />
              {validationError}
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
                <Loader2
                  size={17}
                  className="animate-spin"
                />
              )}

              {item
                ? "រក្សាទុកការកែប្រែ"
                : "បន្ថែម"}
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
  step,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (
    value: string,
  ) => void;
  type?: string;
  step?: string;
  placeholder?: string;
}) {
  return (
    <label>
      <span className="mb-2 block text-xl font-semibold text-[#F97316]">
        {label}
      </span>

      <input
        type={type}
        step={step}
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value,
          )
        }
        placeholder={
          placeholder
        }
        className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-base text-gray-800 outline-none transition focus:border-[#136C34] focus:bg-white focus:ring-2 focus:ring-[#136C34]/10"
      />
    </label>
  );
}
