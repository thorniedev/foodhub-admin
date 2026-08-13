"use client";

import { Globe2, ImageIcon } from "lucide-react";

import { normalizeCatalogAssetUrl } from "@/src/lib/menuItemMediaClient";
import type { CatalogFood } from "@/src/types/menuItem";

export default function CanonicalFoodsTable({
  items,
  onPublish,
}: {
  items: CatalogFood[];
  onPublish: (food: CatalogFood) => void;
}) {
  if (items.length === 0) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center px-5 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-[#137A3D]">
          <ImageIcon size={28} />
        </div>
        <h3 className="mt-4 text-xl font-black text-gray-800">មិនទាន់មាន Food Catalog</h3>
        <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">
          បង្កើត Food master មុន។ បន្ទាប់មក Store អាចយក Food នោះទៅបង្កើត Menu Item របស់ខ្លួន។
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-[1050px] w-full">
        <thead className="bg-gray-50 text-left text-xs font-black uppercase tracking-wide text-gray-500">
          <tr>
            <th className="px-5 py-4">Food</th>
            <th className="px-5 py-4">Category</th>
            <th className="px-5 py-4">Cuisine</th>
            <th className="px-5 py-4">Spice</th>
            <th className="px-5 py-4">Nutrition</th>
            <th className="px-5 py-4">Status</th>
            <th className="px-5 py-4 text-right">Store action</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100 bg-white">
          {items.map((food) => {
            const image = normalizeCatalogAssetUrl(
              food.thumbnail ?? food.gallery?.[0] ?? null,
            );
            const active = food.isActive ?? food.active ?? true;
            const nutrition = food.nutritionData ?? food.nutrition;

            return (
              <tr key={food.uuid} className="transition hover:bg-emerald-50/20">
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
                      <p className="font-black text-gray-900">
                        {food.localName || food.canonicalName}
                      </p>
                      {food.localName && (
                        <p className="mt-0.5 text-sm text-gray-500">{food.canonicalName}</p>
                      )}
                      <p className="mt-1 max-w-[280px] truncate text-xs text-gray-400">
                        {food.description || food.uuid}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-sm font-semibold text-gray-600">
                  {food.category?.name ?? "—"}
                </td>
                <td className="px-5 py-4 text-sm font-semibold text-gray-600">
                  {food.cuisine?.name ?? "—"}
                </td>
                <td className="px-5 py-4 text-sm font-bold text-gray-600">
                  {food.spiceLevel ?? food.defaultSpiceLevel ?? 0}/5
                </td>
                <td className="px-5 py-4 text-xs leading-5 text-gray-500">
                  <div>{nutrition?.calories ?? 0} kcal</div>
                  <div>P {nutrition?.proteinGrams ?? 0}g · C {nutrition?.carbsGrams ?? 0}g</div>
                </td>
                <td className="px-5 py-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-black ${
                      active
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {active ? "ACTIVE" : "INACTIVE"}
                  </span>
                </td>
                <td className="px-5 py-4 text-right">
                  <button
                    type="button"
                    disabled={!active}
                    onClick={() => onPublish(food)}
                    className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#137A3D] px-4 text-sm font-black text-white transition hover:bg-[#0f6333] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Globe2 size={15} />
                    Publish for Store
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
