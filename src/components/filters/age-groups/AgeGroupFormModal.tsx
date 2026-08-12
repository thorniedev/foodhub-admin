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
  AgeGroup,
  AgeGroupFormValues,
} from "@/src/types/ageGroup";

const EMPTY_FORM: AgeGroupFormValues =
  {
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

  onSubmit: (
    values:
      AgeGroupFormValues,
  ) => Promise<void>;
};

export default function AgeGroupFormModal({
  open,

  item,

  saving,

  onClose,

  onSubmit,
}: Props) {
  const [
    form,
    setForm,
  ] =
    useState<AgeGroupFormValues>(
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

    if (item) {
      setForm({
        code:
          item.code,

        name:
          item.name,

        minAge:
          String(
            item.minAge,
          ),

        maxAge:
          String(
            item.maxAge,
          ),

        description:
          item.description ??
          "",

        isActive:
          item.isActive,
      });
    } else {
      setForm(
        EMPTY_FORM,
      );
    }

    setValidationError(
      "",
    );
  }, [
    open,
    item,
  ]);

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
        form.code
          .trim()
          .toUpperCase();

      const name =
        form.name.trim();

      const minAge =
        Number(
          form.minAge,
        );

      const maxAge =
        Number(
          form.maxAge,
        );

      if (
        !code ||
        !name ||
        !form.minAge.trim() ||
        !form.maxAge.trim()
      ) {
        setValidationError(
          "សូមបំពេញ កូដ ឈ្មោះ អាយុអប្បបរមា និងអាយុអតិបរមា។",
        );

        return;
      }

      if (
        !Number.isInteger(
          minAge,
        ) ||
        !Number.isInteger(
          maxAge,
        ) ||
        minAge < 0 ||
        maxAge < 0
      ) {
        setValidationError(
          "អាយុត្រូវតែជាចំនួនគត់ និងមិនតិចជាង 0។",
        );

        return;
      }

      if (
        maxAge <
        minAge
      ) {
        setValidationError(
          "អាយុអតិបរមាត្រូវធំជាង ឬស្មើអាយុអប្បបរមា។",
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

        minAge:
          String(
            minAge,
          ),

        maxAge:
          String(
            maxAge,
          ),

        description:
          form.description.trim(),
      });
    };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[28px] bg-white shadow-2xl">
        {/* HEADER */}
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-gray-100 bg-white px-6 py-5">
          <div>
            <p className="text-4xl font-bold text-[#136C34]">
              {item
                ? "កែប្រែក្រុមអាយុ"
                : "បន្ថែមក្រុមអាយុថ្មី"}
            </p>

            <p className="mt-2 text-base text-gray-500">
              កំណត់ចន្លោះអាយុដែលប្រព័ន្ធនឹងប្រើសម្រាប់ការណែនាំម្ហូប។
            </p>
          </div>

          <button
            type="button"
            onClick={
              onClose
            }
            disabled={
              saving
            }
            className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
          >
            <X
              size={
                20
              }
            />
          </button>
        </div>

        {/* FORM */}
        <form
          onSubmit={
            handleSubmit
          }
          className="space-y-5 p-6"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              label="កូដ *"
              value={
                form.code
              }
              onChange={(
                value,
              ) =>
                setForm(
                  (
                    previous,
                  ) => ({
                    ...previous,

                    code:
                      value,
                  }),
                )
              }
              placeholder="ADULT"
            />

            <Field
              label="ឈ្មោះ *"
              value={
                form.name
              }
              onChange={(
                value,
              ) =>
                setForm(
                  (
                    previous,
                  ) => ({
                    ...previous,

                    name:
                      value,
                  }),
                )
              }
              placeholder="Adult"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              label="អាយុអប្បបរមា *"
              type="number"
              min="0"
              value={
                form.minAge
              }
              onChange={(
                value,
              ) =>
                setForm(
                  (
                    previous,
                  ) => ({
                    ...previous,

                    minAge:
                      value,
                  }),
                )
              }
              placeholder="18"
            />

            <Field
              label="អាយុអតិបរមា *"
              type="number"
              min="0"
              value={
                form.maxAge
              }
              onChange={(
                value,
              ) =>
                setForm(
                  (
                    previous,
                  ) => ({
                    ...previous,

                    maxAge:
                      value,
                  }),
                )
              }
              placeholder="59"
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
              placeholder="សរសេរការពិពណ៌នាអំពីក្រុមអាយុ..."
              className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-800 outline-none transition focus:border-[#136C34] focus:bg-white focus:ring-2 focus:ring-[#136C34]/10"
            />
          </div>

          <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-gray-100 bg-gray-50 px-4 py-4">
            <div>
              <p className="text-xl font-semibold text-[#F97316]">
                សកម្ម
              </p>

              <p className="mt-1 text-base text-gray-500">
                បើក ដើម្បីឱ្យក្រុមអាយុនេះសកម្ម។
              </p>
            </div>

            <input
              type="checkbox"
              checked={
                form.isActive
              }
              onChange={(
                event,
              ) =>
                setForm(
                  (
                    previous,
                  ) => ({
                    ...previous,

                    isActive:
                      event
                        .target
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
                size={
                  18
                }
                className="shrink-0"
              />

              {
                validationError
              }
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={
                onClose
              }
              disabled={
                saving
              }
              className="rounded-xl border border-gray-200 px-5 py-2.5 text-lg text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
            >
              បោះបង់
            </button>

            <button
              type="submit"
              disabled={
                saving
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#136C34] px-5 py-2.5 text-lg text-white transition hover:bg-[#0f592b] disabled:opacity-60"
            >
              {saving && (
                <LoaderCircle
                  size={
                    17
                  }
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

  min,

  placeholder,
}: {
  label: string;

  value: string;

  onChange: (
    value: string,
  ) => void;

  type?: string;

  min?: string;

  placeholder?: string;
}) {
  return (
    <label>
      <span className="mb-2 block text-xl font-semibold text-[#F97316]">
        {label}
      </span>

      <input
        type={
          type
        }
        min={
          min
        }
        value={
          value
        }
        onChange={(
          event,
        ) =>
          onChange(
            event.target
              .value,
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