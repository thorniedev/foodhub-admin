"use client";

import { useMemo, useState } from "react";
import { GlassWater, Search } from "lucide-react";
import { useGetRestaurantsQuery } from "@/src/app/store/restaurantApi";

interface DrinkShopSectionProps {
  shopId: string;
  shopName: string;
  onSelect: (id: string, name: string, address: string) => void;
}

export default function DrinkShopSection({
  shopId,
  shopName,
  onSelect,
}: DrinkShopSectionProps) {
  const { data } = useGetRestaurantsQuery();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const results = useMemo(() => {
    const all = data ?? [];
    const q = query.trim().toLowerCase();
    if (q === "") return all;
    return all.filter((r) => r.name.toLowerCase().includes(q));
  }, [data, query]);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 relative">
      <h2 className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-4">
        <GlassWater size={18} className="text-emerald-600" />
        ហាង
      </h2>

      <label className="text-sm text-gray-600 mb-1 block">
        ឈ្មោះហាង <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          value={shopName || query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="ស្វែងរក ឬជ្រើសរើសហាង..."
          className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {open && (
        <div className="absolute left-6 right-6 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-y-auto z-10">
          {results.length === 0 && (
            <p className="px-3 py-2 text-sm text-gray-400">រកមិនឃើញហាង</p>
          )}
          {results.map((r) => (
            <button
              key={r.id}
              onClick={() => {
                onSelect(r.id, r.name, r.address);
                setQuery("");
                setOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-emerald-50 ${
                shopId === r.id ? "bg-emerald-50 text-emerald-700" : "text-gray-600"
              }`}
            >
              <p className="font-medium">{r.name}</p>
              <p className="text-xs text-gray-400">{r.address}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}