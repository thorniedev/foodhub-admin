"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  Leaf,
  Loader2,
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

const emptyValues: IngredientFormValues =
  {
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
  const [
    values,
    setValues,
  ] =
    useState<IngredientFormValues>(
      emptyValues,
    );

  const [
    validationError,
    setValidationError,
  ] = useState("");

  useEffect(() => {
    if (!open) {
      return;
    }

    setValidationError("");

    if (item) {
      setValues({
        code:
          item.code ??
          "",

        name:
          item.name ??
          "",

        description:
          item.description ??
          "",

        isActive:
          item.isActive,
      });

      return;
    }

    setValues(
      emptyValues,
    );
  }, [
    open,
    item,
  ]);

  if (!open) {
    return null;
  }

  const handleSubmit =
    async () => {
      const code =
        values.code
          .trim()
          .toUpperCase();

      const name =
        values.name.trim();

      if (!code) {
        setValidationError(
          "សូមបំពេញកូដគ្រឿងផ្សំ។",
        );

        return;
      }

      if (!name) {
        setValidationError(
          "សូមបំពេញឈ្មោះគ្រឿងផ្សំ។",
        );

        return;
      }

      if (
        code.length > 80
      ) {
        setValidationError(
          "កូដមិនអាចលើស 80 តួអក្សរ។",
        );

        return;
      }

      if (
        name.length > 150
      ) {
        setValidationError(
          "ឈ្មោះមិនអាចលើស 150 តួអក្សរ។",
        );

        return;
      }

      setValidationError(
        "",
      );

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
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/35 px-4 py-6 backdrop-blur-[2px]">
      <div className="max-h-[92vh] w-full max-w-[680px] overflow-y-auto rounded-[28px] bg-white shadow-2xl">
        {/* HEADER */}

        <div className="flex items-start justify-between border-b border-gray-100 px-7 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-[#136C34]">
              <Leaf
                size={23}
              />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {item
                  ? "កែប្រែគ្រឿងផ្សំ"
                  : "បន្ថែមគ្រឿងផ្សំ"}
              </h2>

              <p className="mt-1 text-sm text-gray-400">
                បំពេញព័ត៌មានគ្រឿងផ្សំខាងក្រោម។
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={
              saving
            }
            onClick={onClose}
            className="rounded-xl p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-40"
          >
            <X size={21} />
          </button>
        </div>

        {/* BODY */}

        <div className="space-y-5 px-7 py-6">
          {validationError && (
            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
              {
                validationError
              }
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            {/* CODE */}

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-gray-700">
                កូដ *
              </span>

              <input
                value={
                  values.code
                }
                onChange={(
                  event,
                ) =>
                  setValues(
                    (
                      current,
                    ) => ({
                      ...current,

                      code:
                        event
                          .target
                          .value,
                    }),
                  )
                }
                placeholder="ឧ. RICE, PORK, FISH_SAUCE"
                className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-base text-gray-800 outline-none transition focus:border-[#136C34] focus:bg-white focus:ring-2 focus:ring-[#136C34]/10"
              />
            </label>

            {/* NAME */}

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-gray-700">
                ឈ្មោះគ្រឿងផ្សំ *
              </span>

              <input
                value={
                  values.name
                }
                onChange={(
                  event,
                ) =>
                  setValues(
                    (
                      current,
                    ) => ({
                      ...current,

                      name:
                        event
                          .target
                          .value,
                    }),
                  )
                }
                placeholder="ឧ. Rice, Pork, Garlic"
                className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-base text-gray-800 outline-none transition focus:border-[#136C34] focus:bg-white focus:ring-2 focus:ring-[#136C34]/10"
              />
            </label>
          </div>

          {/* DESCRIPTION */}

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-gray-700">
              ការពិពណ៌នា
            </span>

            <textarea
              rows={4}
              value={
                values.description
              }
              onChange={(
                event,
              ) =>
                setValues(
                  (
                    current,
                  ) => ({
                    ...current,

                    description:
                      event
                        .target
                        .value,
                  }),
                )
              }
              placeholder="បញ្ចូលការពិពណ៌នាអំពីគ្រឿងផ្សំ..."
              className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-800 outline-none transition focus:border-[#136C34] focus:bg-white focus:ring-2 focus:ring-[#136C34]/10"
            />
          </label>

          {/* ACTIVE */}

          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-4">
            <input
              type="checkbox"
              checked={
                values.isActive
              }
              onChange={(
                event,
              ) =>
                setValues(
                  (
                    current,
                  ) => ({
                    ...current,

                    isActive:
                      event
                        .target
                        .checked,
                  }),
                )
              }
              className="h-5 w-5 accent-[#136C34]"
            />

            <div>
              <p className="font-semibold text-gray-700">
                សកម្ម
              </p>

              <p className="mt-0.5 text-sm text-gray-400">
                គ្រឿងផ្សំសកម្មនឹងអាចជ្រើសបាននៅពេលបង្កើតម្ហូប។
              </p>
            </div>
          </label>
        </div>

        {/* FOOTER */}

        <div className="flex justify-end gap-3 border-t border-gray-100 px-7 py-5">
          <button
            type="button"
            disabled={
              saving
            }
            onClick={onClose}
            className="h-11 rounded-xl border border-gray-200 px-5 text-base text-gray-600 transition hover:bg-gray-50 disabled:opacity-40"
          >
            បោះបង់
          </button>

          <button
            type="button"
            disabled={
              saving
            }
            onClick={() =>
              void handleSubmit()
            }
            className="inline-flex h-11 min-w-[130px] items-center justify-center gap-2 rounded-xl bg-[#136C34] px-5 text-base font-semibold text-white transition hover:bg-[#0f5d2c] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving && (
              <Loader2
                size={17}
                className="animate-spin"
              />
            )}

            {item
              ? "រក្សាទុក"
              : "បន្ថែម"}
          </button>
        </div>
      </div>
    </div>
  );
}