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
  return (
    <section className="rounded-[24px] border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-lg font-black">ទីតាំង Store</h2>
      {/* <p className="mt-1 text-sm text-gray-500">
        Latitude -90..90, Longitude -180..180.
      </p> */}
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {(
          [
            ["addressLine", "Address line", "text", true],
            ["commune", "Commune", "text", false],
            ["district", "District", "text", false],
            ["city", "City", "text", false],
            ["province", "Province", "text", false],
            ["postalCode", "Postal code", "text", false],
            ["latitude", "Latitude", "number", true],
            ["longitude", "Longitude", "number", true],
          ] as const
        ).map(([key, label, type, required]) => (
          <label key={key}>
            <span className="mb-2 block text-sm font-bold">{label}</span>
            <input
              type={type}
              step={type === "number" ? "any" : undefined}
              required={required}
              value={values[key]}
              onChange={(e) => onChange(key, e.target.value)}
              className="h-12 w-full rounded-2xl border px-4 text-base"
            />
          </label>
        ))}
      </div>
    </section>
  );
}
