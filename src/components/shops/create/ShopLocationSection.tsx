import { MapPinned } from "lucide-react";

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
    [
      "addressLine",
      "អាសយដ្ឋាន",
      "text",
      true,
      "ឧ. ផ្ទះលេខ ២៥ ផ្លូវលេខ ៣៦០",
    ],
    ["commune", "ឃុំ / សង្កាត់", "text", false, "ឧ. បឹងកេងកង"],
    ["district", "ស្រុក / ខណ្ឌ", "text", false, "ឧ. ចំការមន"],
    ["city", "រាជធានី / ក្រុង", "text", false, "ឧ. ភ្នំពេញ"],
    ["province", "ខេត្ត", "text", false, "ឧ. ភ្នំពេញ"],
    ["postalCode", "លេខកូដប្រៃសណីយ៍", "text", false, "ឧ. 120102"],
    ["latitude", "រយៈទទឹង", "number", true, "ឧ. 11.5484"],
    ["longitude", "រយៈបណ្តោយ", "number", true, "ឧ. 104.9307"],
  ] as const;

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
          <MapPinned size={22} />
        </div>

        <p className="text-2xl font-bold text-[#0F5A2C]">ទីតាំងហាង</p>
      </div>

      {/* =================================================
          LOCATION FIELDS
      ================================================== */}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {fields.map(([key, label, type, required, placeholder]) => (
          <label key={key} className="block">
            <span
              className="
                  mb-2
                  block
                  text-lg
                  font-medium
                  text-primary-800
                "
            >
              {label}

              {required && <span className="text-red-500"> *</span>}
            </span>

            <input
              type={type}
              step={type === "number" ? "any" : undefined}
              required={required}
              value={values[key]}
              onChange={(event) => onChange(key, event.target.value)}
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
        ))}
      </div>
    </section>
  );
}
