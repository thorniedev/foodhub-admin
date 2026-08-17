import type { StoreOperatingStatus } from "@/src/types/shop";

import { Store } from "lucide-react";

import StoreSelect from "../StoreSelect";

export default function ShopBasicInfoSection({
  values,
  onChange,
}: {
  values: {
    storeName: string;
    description: string;
    countryCode: string;
    timezone: string;
    priceLevel: string;
    hygieneRating: string;
    operatingStatus: StoreOperatingStatus;
  };
  onChange: (
    key:
      | "storeName"
      | "description"
      | "countryCode"
      | "timezone"
      | "priceLevel"
      | "hygieneRating"
      | "operatingStatus",
    value: string,
  ) => void;
}) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6">
      {/* =================================================
          SECTION HEADER
      ================================================== */}

      <div className="mb-6 flex items-center gap-3">
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
          <Store size={22} />
        </div>

        <p className="text-3xl font-semibold text-primary-800">
          ព័ត៌មានមូលដ្ឋាន
        </p>
      </div>

      {/* =================================================
          FIELDS
      ================================================== */}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field
          label="ឈ្មោះហាង"
          value={values.storeName}
          onChange={(value) => onChange("storeName", value)}
          placeholder="ឧ. Sovann Kitchen"
          required
        />

        <Field
          label="Country code"
          value={values.countryCode}
          onChange={(value) => onChange("countryCode", value)}
          placeholder="ឧ. KH"
          required
        />

        <Field
          label="Timezone"
          value={values.timezone}
          onChange={(value) => onChange("timezone", value)}
          placeholder="ឧ. Asia/Phnom_Penh"
          required
        />

        {/* ===============================================
            OPERATING STATUS
        ================================================ */}

        <label className="block">
          <FieldLabel>Operating status</FieldLabel>

          <StoreSelect
            value={values.operatingStatus}
            onChange={(value) => onChange("operatingStatus", value)}
            options={[
              {
                value: "OPEN",
                label: "OPEN",
              },
              {
                value: "CLOSED",
                label: "CLOSED",
              },
              {
                value: "TEMPORARILY_CLOSED",
                label: "TEMPORARILY_CLOSED",
              },
              {
                value: "UNKNOWN",
                label: "UNKNOWN",
              },
            ]}
            ariaLabel="Operating status"
          />
        </label>

        <Field
          label="Price level"
          type="number"
          value={values.priceLevel}
          onChange={(value) => onChange("priceLevel", value)}
          placeholder="ឧ. 2"
        />

        <Field
          label="Hygiene rating"
          type="number"
          step="0.1"
          value={values.hygieneRating}
          onChange={(value) => onChange("hygieneRating", value)}
          placeholder="ឧ. 4.5"
        />

        {/* ===============================================
            DESCRIPTION
        ================================================ */}

        <label className="block sm:col-span-2">
          <FieldLabel>ការពិពណ៌នា</FieldLabel>

          <textarea
            rows={4}
            value={values.description}
            onChange={(event) => onChange("description", event.target.value)}
            placeholder="សរសេរការពិពណ៌នាអំពីហាង..."
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
      </div>
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
  children: React.ReactNode;
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

      {required && <span className="text-red-500"> *</span>}
    </span>
  );
}

/* =========================================================
   FIELD
========================================================= */

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  step,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  step?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <FieldLabel required={required}>{label}</FieldLabel>

      <input
        type={type}
        step={step}
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
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
