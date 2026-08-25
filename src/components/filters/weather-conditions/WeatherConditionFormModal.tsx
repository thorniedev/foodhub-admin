"use client";

import type {
  CreateWeatherConditionPayload,
  UpdateWeatherConditionPayload,
  WeatherCondition,
} from "@/src/types/weather-condition";
import {
  Loader2,
  Save,
  X,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

type FormState = {
  code: string;
  name: string;
  localName: string;
  description: string;
  isActive: boolean;
};

const EMPTY: FormState = {
  code: "",
  name: "",
  localName: "",
  description: "",
  isActive: true,
};

export default function WeatherConditionFormModal({
  open,
  item,
  saving,
  onClose,
  onSubmit,
}: {
  open: boolean;
  item: WeatherCondition | null;
  saving: boolean;
  onClose: () => void;
  onSubmit: (
    payload:
      | CreateWeatherConditionPayload
      | UpdateWeatherConditionPayload,
  ) => Promise<void>;
}) {
  const [
    values,
    setValues,
  ] =
    useState<FormState>(
      EMPTY,
    );

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (!item) {
      setValues(
        EMPTY,
      );
      setError(null);
      return;
    }

    setValues({
      code:
        item.code ?? "",
      name:
        item.name ?? "",
      localName:
        item.localName ??
        "",
      description:
        item.description ??
        "",
      isActive:
        item.isActive ??
        item.active ??
        true,
    });

    setError(null);
  }, [item, open]);

  const submit =
    async () => {
      try {
        setError(null);

        const code =
          values.code
            .trim()
            .toUpperCase()
            .replace(
              /\s+/g,
              "_",
            );

        const name =
          values.name.trim();

        if (!code) {
          throw new Error(
            "Code is required.",
          );
        }

        if (!name) {
          throw new Error(
            "Name is required.",
          );
        }

        await onSubmit({
          code,
          name,

          localName:
            values.localName.trim() ||
            null,

          description:
            values.description.trim() ||
            null,

          isActive:
            values.isActive,
        });
      } catch (
        submitError
      ) {
        setError(
          submitError instanceof
          Error
            ? submitError.message
            : "Could not save Weather Condition.",
        );
      }
    };

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[150] overflow-y-auto bg-black/45 p-4 backdrop-blur-[2px]">
      <div className="mx-auto my-8 w-full max-w-2xl rounded-[30px] bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5">
          <div>
            <p className="text-3xl font-black text-primary-800">
              {item
                ? "កែប្រែស្ថានភាពអាកាសធាតុ"
                : "បន្ថែមស្ថានភាពអាកាសធាតុ"}
            </p>

            <p className="mt-2 text-lg leading-7 text-gray-500">
              {item
                ? "កែប្រែ Weather Condition ដែលមានស្រាប់។"
                : "បង្កើត Weather Condition ថ្មីសម្រាប់ Filter និង Recommendation។"}
            </p>
          </div>

          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100"
          >
            <X size={21} />
          </button>
        </div>

        <div className="space-y-5 p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <label>
              <span className={labelClass}>
                Code *
              </span>

              <input
                value={
                  values.code
                }
                onChange={(event) =>
                  setValues(
                    (
                      current,
                    ) => ({
                      ...current,
                      code:
                        event.target.value,
                    }),
                  )
                }
                placeholder="RAINY"
                className={inputClass}
              />
            </label>

            <label>
              <span className={labelClass}>
                Name *
              </span>

              <input
                value={
                  values.name
                }
                onChange={(event) =>
                  setValues(
                    (
                      current,
                    ) => ({
                      ...current,
                      name:
                        event.target.value,
                    }),
                  )
                }
                placeholder="Rainy"
                className={inputClass}
              />
            </label>

            <label className="md:col-span-2">
              <span className={labelClass}>
                ឈ្មោះខ្មែរ
              </span>

              <input
                value={
                  values.localName
                }
                onChange={(event) =>
                  setValues(
                    (
                      current,
                    ) => ({
                      ...current,
                      localName:
                        event.target.value,
                    }),
                  )
                }
                placeholder="ភ្លៀង"
                className={inputClass}
              />
            </label>

            <label className="md:col-span-2">
              <span className={labelClass}>
                Description
              </span>

              <textarea
                rows={4}
                value={
                  values.description
                }
                onChange={(event) =>
                  setValues(
                    (
                      current,
                    ) => ({
                      ...current,
                      description:
                        event.target.value,
                    }),
                  )
                }
                placeholder="Weather condition used for rainy days."
                className={`${inputClass} h-auto py-3`}
              />
            </label>

            <label className="flex items-center gap-3 md:col-span-2">
              <input
                type="checkbox"
                checked={
                  values.isActive
                }
                onChange={(event) =>
                  setValues(
                    (
                      current,
                    ) => ({
                      ...current,
                      isActive:
                        event.target.checked,
                    }),
                  )
                }
                className="h-5 w-5 accent-[#137A3D]"
              />

              <span className="text-lg font-bold text-gray-700">
                Active
              </span>
            </label>
          </div>

          {error && (
            <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-lg text-red-600">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">
            <button
              type="button"
              disabled={saving}
              onClick={onClose}
              className="rounded-full border border-gray-200 px-6 py-3 text-lg font-bold text-gray-600 transition hover:bg-gray-50"
            >
              បោះបង់
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={() =>
                void submit()
              }
              className="inline-flex items-center gap-2 rounded-full bg-primary-800 px-6 py-3 text-lg font-black text-white transition hover:bg-primary-900 disabled:opacity-60"
            >
              {saving ? (
                <Loader2
                  size={18}
                  className="animate-spin"
                />
              ) : (
                <Save
                  size={18}
                />
              )}

              រក្សាទុក
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const labelClass =
  "mb-2 block text-lg font-bold text-gray-800";

const inputClass =
  "h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-lg text-gray-800 outline-none transition focus:border-primary-700 focus:ring-4 focus:ring-emerald-50";
