"use client";

import { createCodeFromLabel } from "@/src/lib/filterCatalogStorage";
import type {
  CreateWeatherConditionPayload,
  UpdateWeatherConditionPayload,
  WeatherCondition,
} from "@/src/types/weather-condition";
import {
  AlertTriangle,
  CloudRain,
  Loader2,
  X,
} from "lucide-react";
import {
  useEffect,
  useState,
  type FormEvent,
  type ReactNode,
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
  const [values, setValues] = useState<FormState>(EMPTY);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    if (!item) {
      setValues(EMPTY);
      setError(null);
      return;
    }

    setValues({
      code: item.code ?? "",
      name: item.name ?? "",
      localName: item.localName ?? "",
      description: item.description ?? "",
      isActive: item.isActive ?? item.active ?? true,
    });

    setError(null);
  }, [item, open]);

  /* Lock background scroll while modal is open */
  useEffect(() => {
    if (!open) return;

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
    try {
      setError(null);

      const enteredName = values.name.trim() || values.localName.trim();

      if (!enteredName) {
        throw new Error("សូមបញ្ចូលឈ្មោះស្ថានភាពអាកាសធាតុ។");
      }

      const code =
        values.code.trim().toUpperCase().replace(/\s+/g, "_") ||
        item?.code?.trim() ||
        createCodeFromLabel(enteredName);

      await onSubmit({
        code,
        name: enteredName,
        localName: enteredName,
        description: values.description.trim() || null,
        isActive: values.isActive,
      });
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "មិនអាចរក្សាទុកស្ថានភាពអាកាសធាតុបានទេ។",
      );
    }
  };

  return (
    <div
      className="
        fixed
        inset-0
        z-[150]
        flex
        items-center
        justify-center
        bg-black/40
        p-4
        backdrop-blur-[3px]
      "
    >
      {/* Modal Container */}
      <div
        className="
          w-full
          max-w-2xl
          overflow-hidden
          rounded-3xl
          border
          border-gray-100
          bg-white
          shadow-2xl
        "
      >
        {/* ================= HEADER ================= */}
        <div
          className="
            flex
            items-center
            justify-between
            border-b
            border-gray-100
            bg-white
            px-6
            py-5
            sm:px-8
          "
        >
          <div className="flex min-w-0 items-center gap-4">
            <div
              className="
                flex
                h-12
                w-12
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-primary-50
                text-primary-800
              "
            >
              <CloudRain size={24} />
            </div>

            <div className="min-w-0">
              <p
                className="
                  text-2xl
                  font-semibold
                  text-primary-800
                "
              >
                {item
                  ? "កែប្រែស្ថានភាពអាកាសធាតុ"
                  : "បន្ថែមស្ថានភាពអាកាសធាតុ"}
              </p>

              <p
                className="
                  mt-0.5
                  truncate
                  text-lg
                  text-gray-500
                "
              >
                Weather conditions
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            aria-label="Close"
            className="
              flex
              h-11
              w-11
              shrink-0
              items-center
              justify-center
              rounded-full
              text-gray-400
              transition
              hover:bg-gray-100
              hover:text-gray-700
              focus:outline-none
              focus:ring-4
              focus:ring-gray-100
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            <X size={22} />
          </button>
        </div>

        {/* ================= FORM ================= */}
        <form
          onSubmit={handleSubmit}
          className="
            space-y-4
            p-6
            sm:p-7
          "
        >
          {/* Code (English Name) */}
          <Field
            label="ឈ្មោះជាភាសាអង់គ្លេស"
            value={values.code}
            onChange={(value) =>
              setValues((previous) => ({
                ...previous,
                code: value,
              }))
            }
            placeholder="ឧ. RAINY / HOT"
          />

          {/* Name */}
          <Field
            label="ឈ្មោះស្ថានភាពអាកាសធាតុ"
            value={values.localName || values.name}
            required
            onChange={(value) =>
              setValues((previous) => ({
                ...previous,
                name: value,
                localName: value,
              }))
            }
            placeholder="ឧ. ភ្លៀង / មានពពក"
          />

          {/* Description */}
          <div>
            <FieldLabel>ការពិពណ៌នា</FieldLabel>
            <textarea
              rows={3}
              value={values.description}
              onChange={(event) =>
                setValues((previous) => ({
                  ...previous,
                  description: event.target.value,
                }))
              }
              placeholder="បញ្ចូលការពិពណ៌នាអំពីស្ថានភាពអាកាសធាតុ..."
              className="
                w-full
                resize-none
                rounded-xl
                border
                border-gray-200
                bg-gray-50
                px-4
                py-3
                text-lg
                leading-8
                text-gray-800
                outline-none
                transition
                placeholder:text-gray-400
                hover:border-gray-300
                focus:border-primary-600
                focus:bg-white
                focus:ring-4
                focus:ring-primary-100
              "
            />
          </div>

          {/* Status */}
          <div
            className="
              flex
              items-center
              justify-between
              gap-4
              rounded-2xl
              border
              border-gray-100
              bg-gray-50
              px-5
              py-3.5
            "
          >
            <div className="min-w-0">
              <p
                className="
                  text-lg
                  font-medium
                  text-primary-800
                "
              >
                ស្ថានភាព
              </p>

              <p
                className="
                  text-base
                  text-gray-500
                "
              >
                បើក ដើម្បីឱ្យស្ថានភាពអាកាសធាតុនេះសកម្មក្នុងប្រព័ន្ធ។
              </p>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={values.isActive}
              onClick={() =>
                setValues((previous) => ({
                  ...previous,
                  isActive: !previous.isActive,
                }))
              }
              className={`
                relative
                h-7
                w-12
                shrink-0
                rounded-full
                transition
                focus:outline-none
                focus:ring-4
                focus:ring-primary-100
                ${
                  values.isActive
                    ? "bg-primary-700"
                    : "bg-gray-300"
                }
              `}
            >
              <span
                className={`
                  absolute
                  top-1
                  h-5
                  w-5
                  rounded-full
                  bg-white
                  shadow-sm
                  transition-all
                  ${
                    values.isActive
                      ? "left-6"
                      : "left-1"
                  }
                `}
              />
            </button>
          </div>

          {/* Validation Error */}
          {error && (
            <div
              className="
                flex
                items-start
                gap-3
                rounded-2xl
                border
                border-red-100
                bg-red-50
                px-4
                py-3
                text-lg
                leading-7
                text-red-600
              "
            >
              <AlertTriangle
                size={18}
                className="
                  mt-0.5
                  shrink-0
                "
              />

              <span>{error}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div
            className="
              flex
              flex-col-reverse
              gap-3
              border-t
              border-gray-100
              pt-4
              sm:flex-row
              sm:items-center
              sm:justify-end
            "
          >
            <button
              type="button"
              disabled={saving}
              onClick={onClose}
              className="
                inline-flex
                min-h-12
                items-center
                justify-center
                rounded-full
                border
                border-gray-200
                bg-white
                px-7
                text-lg
                font-medium
                text-gray-600
                transition
                hover:border-primary-200
                hover:bg-primary-50
                hover:text-primary-800
                focus:outline-none
                focus:ring-4
                focus:ring-primary-100
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              បោះបង់
            </button>

            <button
              type="submit"
              disabled={saving}
              className="
                inline-flex
                min-h-12
                items-center
                justify-center
                gap-2
                rounded-full
                bg-primary-800
                px-7
                text-lg
                font-medium
                text-white
                transition
                hover:bg-primary-900
                focus:outline-none
                focus:ring-4
                focus:ring-primary-200
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              {saving && (
                <Loader2
                  size={18}
                  className="animate-spin"
                />
              )}

              {saving
                ? "កំពុងរក្សាទុក..."
                : item
                  ? "រក្សាទុកការកែប្រែ"
                  : "បន្ថែមស្ថានភាពអាកាសធាតុ"}
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
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <FieldLabel>
        {label}
        {required ? " *" : ""}
      </FieldLabel>

      <input
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="
          h-[50px]
          w-full
          rounded-xl
          border
          border-gray-200
          bg-gray-50
          px-4
          text-lg
          text-gray-800
          outline-none
          transition
          placeholder:text-gray-400
          hover:border-gray-300
          focus:border-primary-600
          focus:bg-white
          focus:ring-4
          focus:ring-primary-100
        "
      />
    </label>
  );
}

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <span
      className="
        mb-2
        block
        text-lg
        font-medium
        text-primary-800
      "
    >
      {children}
    </span>
  );
}
