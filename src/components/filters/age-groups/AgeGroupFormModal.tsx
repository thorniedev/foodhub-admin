"use client";

import {
  useEffect,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

import {
  AlertTriangle,
  CalendarRange,
  Loader2,
  Users,
  X,
} from "lucide-react";

import type {
  AgeGroup,
  AgeGroupFormValues,
} from "@/src/types/ageGroup";

/* =========================================================
   DEFAULT VALUES
========================================================= */

const EMPTY_FORM: AgeGroupFormValues = {
  code: "",
  name: "",
  minAge: "",
  maxAge: "",
  description: "",
  isActive: true,
};

/* =========================================================
   PROPS
========================================================= */

type Props = {
  open: boolean;
  item: AgeGroup | null;
  saving: boolean;
  onClose: () => void;
  onSubmit: (
    values: AgeGroupFormValues,
  ) => Promise<void>;
};

/* =========================================================
   AGE GROUP FORM MODAL
   UI concept follows ShopEditModal:
   - sticky modal header
   - primary icon surface
   - text-3xl modal title
   - grouped white section cards
   - text-lg minimum normal content
   - h-[52px] inputs
   - primary green labels/focus
   - rounded-full footer actions
   - hidden modal scrollbar
   - body scroll lock
========================================================= */

export default function AgeGroupFormModal({
  open,
  item,
  saving,
  onClose,
  onSubmit,
}: Props) {
  const [form, setForm] =
    useState<AgeGroupFormValues>(
      EMPTY_FORM,
    );

  const [
    validationError,
    setValidationError,
  ] = useState("");

  /* =======================================================
     LOAD FORM VALUES
  ======================================================= */

  useEffect(() => {
    if (!open) {
      return;
    }

    if (item) {
      setForm({
        code: item.code,
        name: item.name,
        minAge: String(
          item.minAge,
        ),
        maxAge: String(
          item.maxAge,
        ),
        description:
          item.description ?? "",
        isActive:
          item.isActive,
      });
    } else {
      setForm(
        EMPTY_FORM,
      );
    }

    setValidationError("");
  }, [open, item]);

  /* =======================================================
     LOCK PAGE SCROLL
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

  /* =======================================================
     SUBMIT
  ======================================================= */

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
        maxAge < minAge
      ) {
        setValidationError(
          "អាយុអតិបរមាត្រូវធំជាង ឬស្មើអាយុអប្បបរមា។",
        );

        return;
      }

      setValidationError("");

      await onSubmit({
        ...form,
        code,
        name,
        minAge: String(
          minAge,
        ),
        maxAge: String(
          maxAge,
        ),
        description:
          form.description.trim(),
      });
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
      {/* =================================================
          MODAL CONTAINER
      ================================================== */}
      <div
        className="
          max-h-[94vh]
          w-full
          max-w-2xl
          overflow-y-auto
          rounded-3xl
          border
          border-gray-100
          bg-white
          shadow-2xl
          [scrollbar-width:none]
          [-ms-overflow-style:none]
          [&::-webkit-scrollbar]:hidden
        "
      >
        {/* =================================================
            HEADER
            Same concept as ShopEditModal
        ================================================== */}
        <div
          className="
            sticky
            top-0
            z-30
            flex
            items-center
            justify-between
            border-b
            border-gray-100
            bg-white/95
            px-6
            py-5
            backdrop-blur-md
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
              <Users size={24} />
            </div>

            <div className="min-w-0">
              <p
                className="
                  text-3xl
                  font-semibold
                  text-primary-800
                "
              >
                {item
                  ? "កែប្រែក្រុមអាយុ"
                  : "បន្ថែមក្រុមអាយុថ្មី"}
              </p>

              <p
                className="
                  mt-1
                  text-lg
                  leading-7
                  text-gray-500
                "
              >
                កំណត់ចន្លោះអាយុដែលប្រព័ន្ធនឹងប្រើ
                សម្រាប់ការណែនាំម្ហូប។
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
            space-y-6
            p-6
            sm:p-8
          "
        >
          {/* =================================================
              SECTION 1: BASIC INFORMATION
          ================================================== */}
          <Section>
            <div
              className="
                grid
                grid-cols-1
                gap-5
                sm:grid-cols-2
              "
            >
              <Field
                label="កូដ"
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
                      code: value,
                    }),
                  )
                }
                placeholder="ADULT"
                required
              />

              <Field
                label="ឈ្មោះ"
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
                      name: value,
                    }),
                  )
                }
                placeholder="Adult"
                required
              />
            </div>

            <div
              className="
                mt-5
                grid
                grid-cols-1
                gap-5
                sm:grid-cols-2
              "
            >
              <Field
                label="អាយុអប្បបរមា"
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
                required
              />

              <Field
                label="អាយុអតិបរមា"
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
                required
              />
            </div>

            {/* Description */}
            <label className="mt-5 block">
              <FieldLabel>
                ការពិពណ៌នា
              </FieldLabel>

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
                className="
                  w-full
                  resize-none
                  rounded-xl
                  border
                  border-gray-200
                  bg-gray-50
                  px-4
                  py-3.5
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
            </label>
          </Section>

          {/* =================================================
              VALIDATION ERROR
          ================================================== */}
          {validationError && (
            <div
              className="
                flex
                items-start
                gap-3
                rounded-2xl
                border
                border-red-100
                bg-red-50
                px-5
                py-4
                text-lg
                leading-7
                text-red-600
              "
            >
              <AlertTriangle
                size={21}
                className="
                  mt-0.5
                  shrink-0
                "
              />

              <span>
                {validationError}
              </span>
            </div>
          )}

          {/* =================================================
              ACTION BUTTONS
              Same concept as ShopEditModal
          ================================================== */}
          <div
            className="
              flex
              flex-col-reverse
              gap-3
              border-t
              border-gray-100
              pt-6
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

/* =========================================================
   SECTION
   Same section-card concept as ShopEditModal
========================================================= */

function Section({
  title,
  icon,
  children,
}: {
  title?: string;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section
      className="
        rounded-2xl
        border
        border-gray-100
        bg-white
        p-5
        sm:p-6
      "
    >
      {title && (
        <div className="mb-6 flex items-center gap-3">
          {icon && (
            <div
              className="
                flex
                h-11
                w-11
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-primary-50
                text-primary-800
              "
            >
              {icon}
            </div>
          )}

          <p
            className="
              text-3xl
              font-semibold
              text-primary-800
            "
          >
            {title}
          </p>
        </div>
      )}

      {children}
    </section>
  );
}

/* =========================================================
   FIELD LABEL
========================================================= */

function FieldLabel({
  children,
  required = false,
}: {
  children: ReactNode;
  required?: boolean;
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

      {required && (
        <span className="text-red-500">
          {" "}*
        </span>
      )}
    </span>
  );
}

/* =========================================================
   INPUT FIELD
========================================================= */

function Field({
  label,
  value,
  onChange,
  type = "text",
  min,
  placeholder,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (
    value: string,
  ) => void;
  type?: string;
  min?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <FieldLabel
        required={
          required
        }
      >
        {label}
      </FieldLabel>

      <input
        type={type}
        min={min}
        required={required}
        value={value}
        onKeyDown={(event) => {
          if (type === "number" && (event.key === "-" || event.key === "e")) {
            event.preventDefault();
          }
        }}
        onChange={(
          event,
        ) => {
          const val = event.target.value;
          if (type === "number" && Number(val) < 0) return;
          onChange(val);
        }}
        placeholder={
          placeholder
        }
        className="
          h-[52px]
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
