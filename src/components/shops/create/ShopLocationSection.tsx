type Key =
  | "addressLine"
  | "commune"
  | "district"
  | "city"
  | "province"
  | "postalCode"
  | "latitude"
  | "longitude";

export default function ShopLocationSection({
  values,
  onChange,
}: {
  values: Record<Key, string>;
  onChange: (key: Key, value: string) => void;
}) {
  const fields = [
    ["addressLine", "Address line", "text", true],
    ["commune", "Commune", "text", false],
    ["district", "District", "text", false],
    ["city", "City", "text", false],
    ["province", "Province", "text", false],
    ["postalCode", "Postal code", "text", false],
    ["latitude", "Latitude", "number", true],
    ["longitude", "Longitude", "number", true],
  ] as const;

  return (
    <section className="rounded-[24px] border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
      <p className="text-4xl font-bold text-gray-900">ទីតាំង Store</p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {fields.map(([key, label, type, required]) => (
          <label key={key}>
            <span className="mb-2 block text-xl font-semibold text-[#F97316]">{label}</span>
            <input
              type={type}
              step={type === "number" ? "any" : undefined}
              required={required}
              value={values[key]}
              onChange={(event) => onChange(key, event.target.value)}
              className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-base text-gray-800 outline-none transition focus:border-[#136C34] focus:bg-white focus:ring-2 focus:ring-[#136C34]/10"
            />
          </label>
        ))}
      </div>
    </section>
  );
}
