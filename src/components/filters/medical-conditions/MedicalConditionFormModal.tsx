"use client";

import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import {
  AlertTriangle,
  LoaderCircle,
  X,
} from "lucide-react";

import type {
  MedicalCondition,
  MedicalConditionFormValues,
} from "@/src/types/medicalCondition";

const EMPTY_FORM: MedicalConditionFormValues =
  {
    code: "",
    name: "",
    description: "",
    active: true,
  };

type Props = {
  open: boolean;

  item:
    | MedicalCondition
    | null;

  saving: boolean;

  onClose: () => void;

  onSubmit: (
    values: MedicalConditionFormValues,
  ) => Promise<void>;
};

export default function MedicalConditionFormModal({
  open,
  item,
  saving,
  onClose,
  onSubmit,
}: Props) {
  const [form, setForm] =
    useState<MedicalConditionFormValues>(
      EMPTY_FORM,
    );

  const [
    validationError,
    setValidationError,
  ] = useState("");

  /* =======================================================
     INITIAL
  ======================================================= */

  useEffect(() => {
    if (!open) {
      return;
    }

    setForm(
      item
        ? {
            code:
              item.code,

            name:
              item.name,

            description:
              item.description ??
              "",

            active:
              item.active,
          }
        : EMPTY_FORM,
    );

    setValidationError(
      "",
    );
  }, [open, item]);

  if (!open) {
    return null;
  }

  /* =======================================================
     SUBMIT
  ======================================================= */

  const handleSubmit =
    async (
      event: FormEvent,
    ) => {
      event.preventDefault();

      const code =
        form.code.trim();

      const name =
        form.name.trim();

      if (
        !code ||
        !name
      ) {
        setValidationError(
          "សូមបំពេញកូដ និងឈ្មោះស្ថានភាពសុខភាព។",
        );

        return;
      }

      setValidationError(
        "",
      );

      await onSubmit({
        ...form,

        code,

        name,

        description:
          form.description.trim(),
      });
    };

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]">
      <div className="w-full max-w-xl overflow-hidden rounded-[28px] bg-white shadow-2xl">
        {/* HEADER */}

        <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5">
          <p className="text-4xl font-bold text-[#136C34]">
            {item
              ? "កែប្រែស្ថានភាពសុខភាព"
              : "បន្ថែមស្ថានភាពសុខភាពថ្មី"}
          </p>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* FORM */}

        <form
          onSubmit={
            handleSubmit
          }
          className="space-y-5 p-6"
        >
          {/* CODE + NAME */}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-xl font-semibold text-[#F97316]">
                កូដ *
              </label>

              <input
                value={
                  form.code
                }
                onChange={(
                  event,
                ) =>
                  setForm(
                    (
                      previous,
                    ) => ({
                      ...previous,

                      code:
                        event
                          .target
                          .value,
                    }),
                  )
                }
                placeholder="DIABETES"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-800 outline-none transition focus:border-[#136C34] focus:bg-white focus:ring-2 focus:ring-[#136C34]/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-xl font-semibold text-[#F97316]">
                ឈ្មោះ *
              </label>

              <input
                value={
                  form.name
                }
                onChange={(
                  event,
                ) =>
                  setForm(
                    (
                      previous,
                    ) => ({
                      ...previous,

                      name:
                        event
                          .target
                          .value,
                    }),
                  )
                }
                placeholder="Diabetes"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-800 outline-none transition focus:border-[#136C34] focus:bg-white focus:ring-2 focus:ring-[#136C34]/10"
              />
            </div>
          </div>

          {/* DESCRIPTION */}

          <div>
            <label className="mb-2 block text-xl font-semibold text-[#F97316]">
              ការពិពណ៌នា
            </label>

            <textarea
              rows={4}
              value={
                form.description
              }
              onChange={(
                event,
              ) =>
                setForm(
                  (
                    previous,
                  ) => ({
                    ...previous,

                    description:
                      event
                        .target
                        .value,
                  }),
                )
              }
              placeholder="សរសេរការពិពណ៌នាអំពីស្ថានភាពសុខភាព..."
              className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-800 outline-none transition focus:border-[#136C34] focus:bg-white focus:ring-2 focus:ring-[#136C34]/10"
            />
          </div>

          {/* ACTIVE */}

          <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
            <div>
              <p className="text-xl font-semibold text-[#F97316]">
                សកម្ម
              </p>

              <p className="mt-0.5 text-base text-gray-500">
                បើក ដើម្បីឱ្យកំណត់ត្រានេះសកម្ម។
              </p>
            </div>

            <input
              type="checkbox"
              checked={
                form.active
              }
              onChange={(
                event,
              ) =>
                setForm(
                  (
                    previous,
                  ) => ({
                    ...previous,

                    active:
                      event
                        .target
                        .checked,
                  }),
                )
              }
              className="h-5 w-5 accent-[#F97316]"
            />
          </label>

          {/* VALIDATION */}

          {validationError && (
            <div className="flex gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
              <AlertTriangle
                size={18}
                className="shrink-0"
              />

              {
                validationError
              }
            </div>
          )}

          {/* ACTIONS */}

          <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
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
                <LoaderCircle
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