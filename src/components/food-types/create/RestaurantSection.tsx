// "use client";

// import { useState } from "react";
// import { ChefHat, Search } from "lucide-react";

// interface Restaurant {
//   id: string;
//   name: string;
// }

// interface RestaurantSectionProps {
//   restaurants: Restaurant[];
//   selectedRestaurantId: string | null;
//   onSelect: (id: string) => void;
// }

// export default function RestaurantSection({
//   restaurants,
//   selectedRestaurantId,
//   onSelect,
// }: RestaurantSectionProps) {
//   const [query, setQuery] = useState("");
//   const [open, setOpen] = useState(false);

//   const selected = restaurants.find((r) => r.id === selectedRestaurantId);
//   const filtered = restaurants.filter((r) =>
//     r.name.toLowerCase().includes(query.toLowerCase())
//   );

//   return (
//     <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 space-y-4">
//       <div className="flex items-center gap-2">
//         <ChefHat size={20} className="text-[#136C34]" />
//         <h2 className="text-lg sm:text-xl font-bold text-gray-800">ភោជនីយដ្ឋាន</h2>
//       </div>

//       <div>
//         <label className="text-sm font-medium text-gray-600 mb-2 block">
//           ជ្រើសភោជនីយដ្ឋាន <span className="text-red-500">*</span>
//         </label>
//         <div className="relative">
//           <Search
//             size={16}
//             className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
//           />
//           <input
//             type="text"
//             value={selected ? selected.name : query}
//             onChange={(e) => {
//               setQuery(e.target.value);
//               setOpen(true);
//             }}
//             onFocus={() => setOpen(true)}
//             placeholder="ស្វែងរក ឬជ្រើសរើសភោជនីយដ្ឋាន..."
//             className="w-full pl-11 pr-4 py-3 text-sm bg-[#F7F3EC] rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
//           />

//           {open && filtered.length > 0 && (
//             <div className="absolute z-10 mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-lg max-h-56 overflow-y-auto">
//               {filtered.map((r) => (
//                 <button
//                   key={r.id}
//                   type="button"
//                   onClick={() => {
//                     onSelect(r.id);
//                     setQuery("");
//                     setOpen(false);
//                   }}
//                   className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50"
//                 >
//                   {r.name}
//                 </button>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }



"use client";

import { useMemo, useState } from "react";
import { ChefHat, Search } from "lucide-react";

import type { StoreRef } from "@/src/types/menuItem";

interface RestaurantSectionProps {
  restaurants: StoreRef[];
  selectedRestaurantUuid: string;
  onSelect: (restaurant: StoreRef) => void;
}

function normalizeText(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFKC");
}

function getAddress(restaurant: StoreRef): string {
  return [
    restaurant.addressLine,
    restaurant.district,
    restaurant.city,
  ]
    .filter(Boolean)
    .join(", ");
}

export default function RestaurantSection({
  restaurants,
  selectedRestaurantUuid,
  onSelect,
}: RestaurantSectionProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const selectedRestaurant = restaurants.find(
    (restaurant) => restaurant.uuid === selectedRestaurantUuid,
  );

  const filteredRestaurants = useMemo(() => {
    const normalizedQuery = normalizeText(query);

    if (!normalizedQuery) {
      return restaurants;
    }

    return restaurants.filter((restaurant) => {
      const searchableText = normalizeText(
        [
          restaurant.name,
          restaurant.localName,
          restaurant.addressLine,
          restaurant.district,
          restaurant.city,
        ].join(" "),
      );

      return searchableText.includes(normalizedQuery);
    });
  }, [query, restaurants]);

  const inputValue =
    !open && selectedRestaurant
      ? selectedRestaurant.localName?.trim() || selectedRestaurant.name
      : query;

  return (
    <section className="space-y-4 rounded-2xl border border-gray-100 bg-white p-6 sm:p-8">
      <div className="flex items-center gap-2">
        <ChefHat size={20} className="text-[#136C34]" />
        <h2 className="text-lg font-bold text-gray-800 sm:text-xl">
          ភោជនីយដ្ឋាន
        </h2>
      </div>

      <div>
        <label
          htmlFor="restaurant-search"
          className="mb-2 block text-sm font-medium text-gray-600"
        >
          ជ្រើសភោជនីយដ្ឋាន <span className="text-red-500">*</span>
        </label>

        <div className="relative">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            id="restaurant-search"
            type="text"
            value={inputValue}
            onFocus={() => {
              setOpen(true);

              if (selectedRestaurant) {
                setQuery("");
              }
            }}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
            }}
            placeholder="ស្វែងរក ឬជ្រើសរើសភោជនីយដ្ឋាន..."
            autoComplete="off"
            className="w-full rounded-xl bg-[#F7F3EC] py-3 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
          />

          {open && (
            <div className="absolute z-30 mt-2 max-h-60 w-full overflow-y-auto rounded-xl border border-gray-100 bg-white p-1 shadow-lg">
              {filteredRestaurants.length > 0 ? (
                filteredRestaurants.map((restaurant) => (
                  <button
                    key={restaurant.uuid}
                    type="button"
                    onClick={() => {
                      onSelect(restaurant);
                      setQuery("");
                      setOpen(false);
                    }}
                    className="w-full rounded-lg px-4 py-3 text-left hover:bg-gray-50"
                  >
                    <p className="text-sm font-medium text-gray-800">
                      {restaurant.localName?.trim() || restaurant.name}
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      {restaurant.name}
                      {getAddress(restaurant)
                        ? ` • ${getAddress(restaurant)}`
                        : ""}
                    </p>
                  </button>
                ))
              ) : (
                <p className="px-4 py-6 text-center text-sm text-gray-400">
                  រកមិនឃើញភោជនីយដ្ឋាន
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
