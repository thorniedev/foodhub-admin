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
  SlidersHorizontal,
  X,
} from "lucide-react";
import { z } from "zod";

import { createCodeFromLabel } from "@/src/lib/filterCatalogStorage";

import type {
  FilterCatalogOption,
  FilterCatalogOptionFormValues,
  FilterGroupDefinition,
} from "@/src/types/filterCatalog";

/* =========================================================
   DEFAULT FORM VALUES
========================================================= */

const EMPTY_FORM: FilterCatalogOptionFormValues = {
  code: "",
  localName: "",
  name: "",
  description: "",
  parentUuid: "",
  numericValue: "",
  unit: "",
  startTime: "",
  endTime: "",
  active: true,
};

const createFilterOptionSchema = (isMealType: boolean) =>
  z.object({
    localName: z.string().trim().min(1, "សូមបំពេញឈ្មោះស្លាកត្រង។"),
    code: z.string().optional(),
    numericValue: z
      .string()
      .refine((val) => !val.trim() || Number.isFinite(Number(val)), {
        message: "តម្លៃលេខមិនត្រឹមត្រូវ។",
      }),
    startTime: isMealType
      ? z
          .string()
          .trim()
          .min(1, "សូមបញ្ចូលម៉ោងចាប់ផ្តើម។ (Start time is required)")
      : z.string().optional(),
    endTime: isMealType
      ? z
          .string()
          .trim()
          .min(1, "សូមបញ្ចូលម៉ោងបញ្ចប់។ (End time is required)")
      : z.string().optional(),
  });

export default function FilterOptionFormModal({
  open,
  group,
  item,
  saving,
  options,
  onClose,
  onSubmit,
}: {
  open: boolean;
  group: FilterGroupDefinition;
  item: FilterCatalogOption | null;
  saving: boolean;
  options?: FilterCatalogOption[];
  onClose: () => void;
  onSubmit: (
    values: FilterCatalogOptionFormValues,
  ) => Promise<void>;
}) {
  const [form, setForm] =
    useState<FilterCatalogOptionFormValues>(
      EMPTY_FORM,
    );

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const clearFieldError = (field: string) => {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  /* =======================================================
     LOAD FORM VALUES
  ======================================================= */

  useEffect(() => {
    if (!open) {
      return;
    }

    if (item) {
      setForm({
        code: item.code ?? "",
        localName:
          item.localName || item.name,
        name:
          item.localName || item.name,
        description:
          item.description ?? "",
        parentUuid:
          item.parentUuid ?? "",
        numericValue:
          item.numericValue === null || item.numericValue === undefined
            ? ""
            : String(
                item.numericValue,
              ),
        unit:
          item.unit ?? "",
        startTime:
          item.startTime ?? "",
        endTime:
          item.endTime ?? "",
        active:
          item.active,
      });
    } else {
      setForm(EMPTY_FORM);
    }

    setFieldErrors({});
    setServerError(null);
  }, [open, item]);

  /* =======================================================
     LOCK BACKGROUND SCROLL
  ======================================================= */

  useEffect(() => {
    if (!open) {
      return;
    }

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

  const isMealType = group.source === "MEAL_TYPE_API";
  const hasValueFields = ["PREPARATION_TIME", "DISTANCE", "SPICE_LEVEL"].includes(group.code);

  /* =======================================================
     SUBMIT + VALIDATION
  ======================================================= */

  const handleSubmit =
    async (
      event:
        FormEvent<HTMLFormElement>,
    ) => {
      event.preventDefault();
      setServerError(null);

      const label = form.localName.trim() || form.name.trim();
      const schema = createFilterOptionSchema(isMealType);
      const result = schema.safeParse({
        localName: label,
        code: form.code,
        numericValue: form.numericValue,
        startTime: form.startTime,
        endTime: form.endTime,
      });

      if (!result.success) {
        const errMap: Record<string, string> = {};
        for (const issue of result.error.issues) {
          const field = String(issue.path[0]);
          if (!errMap[field]) {
            errMap[field] = issue.message;
          }
        }
        setFieldErrors(errMap);
        return;
      }

      setFieldErrors({});

      const code = form.code?.trim().toUpperCase() || createCodeFromLabel(label);

      try {
        await onSubmit({
          ...form,
          code,
          name: label,
          localName: label,
        });
      } catch (err: any) {
        const errorMsg =
          err?.data?.message ||
          err?.message ||
          (typeof err === "string" ? err : "មិនអាចរក្សាទុកទិន្នន័យបានទេ។");
        setServerError(errorMsg);
      }
    };

  const handleNameChange = (val: string) => {
    setForm((prev) => ({
      ...prev,
      name: val,
      localName: val,
    }));
    clearFieldError("localName");
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
        bg-slate-900/40
        p-4
        backdrop-blur-[3px]
      "
    >
      {/* =================================================
          MODAL
      ================================================== */}
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
        {/* =================================================
            HEADER
        ================================================== */}
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
              <SlidersHorizontal
                size={24}
              />
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
                  ? `កែប្រែ ${group.labelKm}`
                  : `បន្ថែម ${group.labelKm}`}
              </p>

              <p
                className="
                  mt-0.5
                  truncate
                  text-lg
                  text-gray-500
                "
              >
                {group.labelEn}
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

        {/* =================================================
            FORM
        ================================================== */}
        <form
          onSubmit={
            handleSubmit
          }
          className="
            space-y-4
            p-6
            sm:p-7
          "
        >
          {/* Name & Code */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              label={`ឈ្មោះ ${group.labelKm}`}
              value={form.localName || form.name}
              onChange={handleNameChange}
              placeholder={`ឧ. បញ្ចូលឈ្មោះ ${group.labelKm}`}
              required
              error={fieldErrors.localName}
            />

            <Field
              label="កូដ (Code)"
              value={form.code || ""}
              onChange={(value) => {
                setForm((prev) => ({
                  ...prev,
                  code: value.toUpperCase(),
                }));
                clearFieldError("code");
              }}
              placeholder="ឧ. CODE_NAME"
              error={fieldErrors.code}
            />
          </div>

          {/* Numeric Value & Unit for specific groups */}
          {hasValueFields && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field
                label="តម្លៃលេខ (Value)"
                type="number"
                value={form.numericValue}
                onChange={(value) => {
                  setForm((prev) => ({
                    ...prev,
                    numericValue: value,
                  }));
                  clearFieldError("numericValue");
                }}
                placeholder="ឧ. 10"
                error={fieldErrors.numericValue}
              />

              <Field
                label="ឯកតា (Unit)"
                value={form.unit}
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    unit: value,
                  }))
                }
                placeholder={
                  group.code === "PREPARATION_TIME"
                    ? "MINUTE"
                    : group.code === "DISTANCE"
                      ? "KM"
                      : group.code === "SPICE_LEVEL"
                        ? "LEVEL"
                        : "ឧ. នាទី / km"
                }
              />
            </div>
          )}

          {/* Parent category */}
          {group.source ===
            "FOOD_CATEGORY_API" && (
            <div>
              <FieldLabel>
                ប្រភេទមេ
                (Parent Category)
              </FieldLabel>

              <select
                value={
                  form.parentUuid ||
                  ""
                }
                onChange={(
                  event,
                ) =>
                  setForm(
                    (
                      previous,
                    ) => ({
                      ...previous,
                      parentUuid:
                        event.target
                          .value,
                    }),
                  )
                }
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
                  hover:border-gray-300
                  focus:border-primary-600
                  focus:bg-white
                  focus:ring-4
                  focus:ring-primary-100
                "
              >
                <option value="">
                  គ្មាន
                  (Top Level)
                </option>

                {options
                  ?.filter(
                    (
                      option,
                    ) =>
                      option.active &&
                      option.uuid !==
                        item?.uuid &&
                      !option.parentUuid,
                  )
                  .map(
                    (
                      option,
                    ) => (
                      <option
                        key={
                          option.uuid
                        }
                        value={
                          option.uuid
                        }
                      >
                        {option.localName ||
                          option.name}
                      </option>
                    ),
                  )}
              </select>
            </div>
          )}

          {/* Description */}
          {!isMealType && (
            <div>
              <FieldLabel>
                ការពិពណ៌នា
              </FieldLabel>

              <textarea
                rows={3}
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
                        event.target
                          .value,
                    }),
                  )
                }
                placeholder="បញ្ចូលការពិពណ៌នា..."
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
          )}

          {/* Meal start/end time */}
          {isMealType && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="ម៉ោងចាប់ផ្តើម"
                type="time"
                step="1"
                required
                value={form.startTime || ""}
                onChange={(value) => {
                  setForm((previous) => ({
                    ...previous,
                    startTime: value,
                  }));
                  clearFieldError("startTime");
                }}
                error={fieldErrors.startTime}
              />

              <Field
                label="ម៉ោងបញ្ចប់"
                type="time"
                step="1"
                required
                value={form.endTime || ""}
                onChange={(value) => {
                  setForm((previous) => ({
                    ...previous,
                    endTime: value,
                  }));
                  clearFieldError("endTime");
                }}
                error={fieldErrors.endTime}
              />
            </div>
          )}

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
                បើក ដើម្បីឱ្យស្លាកនេះសកម្មក្នុងប្រព័ន្ធ។
              </p>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={
                form.active
              }
              onClick={() =>
                setForm(
                  (
                    previous,
                  ) => ({
                    ...previous,
                    active:
                      !previous.active,
                  }),
                )
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
                  form.active
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
                    form.active
                      ? "left-6"
                      : "left-1"
                  }
                `}
              />
            </button>
          </div>

          {/* Server error (e.g. network/backend failure) */}
          {serverError && (
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

              <span>
                {serverError}
              </span>
            </div>
          )}

          {/* Action buttons */}
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
                font-normal
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
                font-normal
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
                  : `បន្ថែម ${group.labelKm}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* =========================================================
   REUSABLE FIELD
========================================================= */

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
  step,
  error,
}: {
  label: string;
  value: string;
  onChange: (
    value: string,
  ) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  step?: string;
  error?: string;
}) {
  return (
    <label className="block">
      <FieldLabel>
        {label}
        {required
          ? " *"
          : ""}
      </FieldLabel>

      <input
        type={type}
        step={step}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(
          event,
        ) =>
          onChange(
            event.target
              .value,
          )
        }
        className={`
          h-[50px]
          w-full
          rounded-xl
          border
          px-4
          text-lg
          text-gray-800
          outline-none
          transition
          placeholder:text-gray-400
          focus:bg-white
          focus:ring-4
          ${
            error
              ? "border-red-400 bg-red-50/40 focus:border-red-500 focus:ring-red-100"
              : "border-gray-200 bg-gray-50 hover:border-gray-300 focus:border-primary-600 focus:ring-primary-100"
          }
        `}
      />
      {error && (
        <p className="mt-1 text-sm font-normal text-red-500">
          {error}
        </p>
      )}
    </label>
  );
}

function FieldLabel({
  children,
}: {
  children: ReactNode;
}) {
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
