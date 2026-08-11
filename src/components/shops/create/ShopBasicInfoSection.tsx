import type { StoreOperatingStatus } from "@/src/types/shop";
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
    <section className="rounded-[24px] border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
      <p className="text-4xl font-bold text-gray-900">ព័ត៌មានមូលដ្ឋាន</p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field
          label="ឈ្មោះហាង"
          value={values.storeName}
          onChange={(value) => onChange("storeName", value)}
          required
        />

        <Field
          label="Country code"
          value={values.countryCode}
          onChange={(value) => onChange("countryCode", value)}
          required
        />

        <Field
          label="Timezone"
          value={values.timezone}
          onChange={(value) => onChange("timezone", value)}
          required
        />

        <label>
          <span className="mb-2 block text-xl font-semibold text-[#F97316]">
            Operating status
          </span>
          <StoreSelect
            value={values.operatingStatus}
            onChange={(value) => onChange("operatingStatus", value)}
            options={[
              { value: "OPEN", label: "OPEN" },
              { value: "CLOSED", label: "CLOSED" },
              { value: "TEMPORARILY_CLOSED", label: "TEMPORARILY_CLOSED" },
              { value: "UNKNOWN", label: "UNKNOWN" },
            ]}
            ariaLabel="Operating status"
          />
        </label>

        <Field
          label="Price level"
          type="number"
          value={values.priceLevel}
          onChange={(value) => onChange("priceLevel", value)}
        />

        <Field
          label="Hygiene rating"
          type="number"
          step="0.1"
          value={values.hygieneRating}
          onChange={(value) => onChange("hygieneRating", value)}
        />

        <label className="sm:col-span-2">
          <span className="mb-2 block text-xl font-semibold text-[#F97316]">
            ការពិពណ៌នា
          </span>
          <textarea
            rows={4}
            value={values.description}
            onChange={(event) => onChange("description", event.target.value)}
            placeholder="សរសេរការពិពណ៌នាអំពីហាង..."
            className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-800 outline-none transition focus:border-[#136C34] focus:bg-white focus:ring-2 focus:ring-[#136C34]/10"
          />
        </label>
      </div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  step,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  step?: string;
}) {
  return (
    <label>
      <span className="mb-2 block text-xl font-semibold text-[#F97316]">{label}</span>
      <input
        type={type}
        step={step}
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-base text-gray-800 outline-none transition focus:border-[#136C34] focus:bg-white focus:ring-2 focus:ring-[#136C34]/10"
      />
    </label>
  );
}
