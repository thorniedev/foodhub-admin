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

        <p className="text-2xl font-bold text-[#0F5A2C]">
          ព័ត៌មានហាង
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
          label="កូដប្រទេស"
          value={values.countryCode}
          onChange={(value) => onChange("countryCode", value)}
          placeholder="ឧ. KH"
          required
        />

        <Field
          label="តំបន់ពេលវេលា"
          value={values.timezone}
          onChange={(value) => onChange("timezone", value)}
          placeholder="ឧ. Asia/Phnom_Penh"
          required
        />

        {/* ===============================================
            OPERATING STATUS
        ================================================ */}

        <label className="block">
          <FieldLabel>ស្ថានភាពដំណើរការ</FieldLabel>

          <StoreSelect
            value={values.operatingStatus}
            onChange={(value) => onChange("operatingStatus", value)}
            options={[
              {
                value: "OPEN",
                label: "បើកដំណើរការ",
              },
              {
                value: "CLOSED",
                label: "បិទដំណើរការ",
              },
              {
                value: "TEMPORARILY_CLOSED",
                label: "ផ្អាកដំណើរការបណ្ដោះអាសន្ន",
              },
              {
                value: "UNKNOWN",
                label: "មិនបានកំណត់",
              },
            ]}
            ariaLabel="Operating status"
          />
        </label>

        <label className="block">
          <FieldLabel>កម្រិតតម្លៃ</FieldLabel>
          <StoreSelect
            value={values.priceLevel}
            onChange={(value) => onChange("priceLevel", value)}
            options={[
              { value: "", label: "— មិនបានកំណត់" },
              { value: "1", label: "កម្រិតទាប (ថោក)" },
              { value: "2", label: "កម្រិតមធ្យម (សមរម្យ)" },
              { value: "3", label: "កម្រិតខ្ពស់ (ថ្លៃ)" },
              { value: "4", label: "កម្រិតប្រណិត (ថ្លៃខ្លាំង)" },
            ]}
            ariaLabel="Price level"
          />
        </label>

        <Field
          label="កម្រិតអនាម័យ "
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