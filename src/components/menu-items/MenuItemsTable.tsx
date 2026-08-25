"use client";

import { ImageIcon, Star } from "lucide-react";

import { normalizeCatalogAssetUrl } from "@/src/lib/menuItemMediaClient";
import type { CatalogMenuItem } from "@/src/types/menuItem";

function money(price?: number | null, currencyCode?: string | null) {
  if (typeof price !== "number") return "—";
  return `${currencyCode || "USD"} ${price.toFixed(2)}`;
}

export default function MenuItemsTable({ items }: { items: CatalogMenuItem[] }) {
  if (items.length === 0) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center px-5 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-50 text-[#F97316]">
          <ImageIcon size={28} />
        </div>
        <h3 className="mt-4 text-xl font-black text-gray-800">មិនទាន់មាន Published Menu Item</h3>
        <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">
          ជ្រើស Food Catalog + Store + តម្លៃ + រូបភាព ហើយ Publish។ Item នោះនឹងចូល public Menu Item feed។
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-[1150px] w-full">
        <thead className="bg-gray-50 text-left text-xs font-black uppercase tracking-wide text-gray-500">
          <tr>
            <th className="px-5 py-4">Menu Item</th>
            <th className="px-5 py-4">Store</th>
            <th className="px-5 py-4">Food master</th>
            <th className="px-5 py-4">Price</th>
            <th className="px-5 py-4">Availability</th>
            <th className="px-5 py-4">Prep time</th>
            <th className="px-5 py-4">Source</th>
            <th className="px-5 py-4">Published</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100 bg-white">
          {items.map((item) => {
            const image = normalizeCatalogAssetUrl(item.thumbnail ?? item.gallery?.[0]);
            const available = item.availabilityStatus === "AVAILABLE";

            return (
              <tr key={item.uuid} className="transition hover:bg-emerald-50/20">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 text-gray-300">
                      {image ? (
                        <img src={image} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <ImageIcon size={22} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-black text-gray-900">{item.localName || item.name}</p>
                        {item.isFeatured && <Star size={14} className="fill-amber-400 text-amber-400" />}
                      </div>
                      {item.localName && (
                        <p className="mt-0.5 text-sm text-gray-500">{item.name}</p>
                      )}
                      <p className="mt-1 max-w-[260px] truncate text-xs text-gray-400">
                        {item.description || item.uuid}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <p className="text-sm font-black text-gray-700">
                    {item.store?.storeName || item.store?.name || "—"}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">{item.store?.city || ""}</p>
                </td>
                <td className="px-5 py-4 text-sm font-semibold text-gray-600">
                  {item.food?.localName || item.food?.canonicalName || "—"}
                </td>
                <td className="px-5 py-4 text-sm font-black text-[#137A3D]">
                  {money(item.price, item.currencyCode)}
                </td>
                <td className="px-5 py-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-black ${available
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-orange-50 text-orange-600"
                      }`}
                  >
                    {item.availabilityStatus || "UNKNOWN"}
                  </span>
                </td>
                <td className="px-5 py-4 text-sm font-semibold text-gray-600">
                  {item.preparationTimeMinutes ?? "—"} min
                </td>
                <td className="px-5 py-4 text-sm font-semibold text-gray-500">
                  {item.source || "—"}
                </td>
                <td className="px-5 py-4">
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-600">
                    WEBSITE
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
