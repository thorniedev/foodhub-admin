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
    <div className="overflow-x-auto rounded-3xl border border-gray-100 bg-white">
      <table className="min-w-[1050px] w-full text-lg font-normal">
        <thead className="bg-gray-50/70 text-left text-lg font-normal text-primary-800">
          <tr className="border-b border-gray-100">
            <th className="px-5 py-4 font-normal">Food</th>
            <th className="px-5 py-4 font-normal">Category</th>
            <th className="px-5 py-4 font-normal">Cuisine</th>
            <th className="px-5 py-4 font-normal">Spice</th>
            <th className="px-5 py-4 font-normal">Nutrition</th>
            <th className="px-5 py-4 font-normal">Status</th>
            <th className="px-5 py-4 text-right font-normal">Store action</th>
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
              <tr key={food.uuid} className="transition hover:bg-gray-50/70">
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
                      <p className="text-lg font-normal text-gray-900">
                        {food.localName || food.canonicalName}
                      </p>
                      {food.localName && (
                        <p className="mt-0.5 text-base font-normal text-gray-500">{food.canonicalName}</p>
                      )}
                      <p className="mt-1 max-w-[280px] truncate text-sm font-normal text-gray-400">
                        {food.description || food.uuid}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-lg font-normal text-gray-600">
                  {food.category?.name ?? "—"}
                </td>
                <td className="px-5 py-4 text-lg font-normal text-gray-600">
                  {food.cuisine?.name ?? "—"}
                </td>
                <td className="px-5 py-4 text-lg font-normal text-gray-600">
                  {food.spiceLevel ?? food.defaultSpiceLevel ?? 0}/5
                </td>
                <td className="px-5 py-4 text-sm leading-5 text-gray-500">
                  <div>{nutrition?.calories ?? 0} kcal</div>
                  <div>P {nutrition?.proteinGrams ?? 0}g · C {nutrition?.carbsGrams ?? 0}g</div>
                </td>
                <td className="px-5 py-4">
                  <span
                    className={`inline-flex rounded-full px-3.5 py-1 text-lg font-normal border ${active
                        ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                        : "bg-gray-100 text-gray-500 border-gray-200"
                      }`}
                  >
                    {active ? "ACTIVE" : "INACTIVE"}
                  </span>
                </td>
                <td className="px-5 py-4 text-right">
                  <button
                    type="button"
                    onClick={() => onPublish(food)}
                    className="inline-flex h-10 items-center gap-1.5 rounded-full border border-primary-800 bg-white px-4 text-lg font-normal text-primary-800 transition hover:bg-primary-50 active:scale-95"
                  >
                    <Globe2 size={16} />
                    <span>Publish</span>
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
