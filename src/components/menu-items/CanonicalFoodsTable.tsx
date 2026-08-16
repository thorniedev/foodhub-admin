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
      <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 text-primary-800">
          <ImageIcon size={30} />
        </div>

        <p className="mt-4 text-2xl font-semibold text-primary-800">
          មិនទាន់មាន Food Catalog
        </p>

        <p className="mt-2 max-w-xl text-lg leading-8 text-gray-500">
          បង្កើត Food master មុន។ បន្ទាប់មក Store អាចយក Food នោះទៅបង្កើត Menu
          Item របស់ខ្លួន។
        </p>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 max-w-full overflow-x-auto">
      <table className="w-full min-w-[1250px] border-collapse text-left">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/70">
            <th className="px-6 py-4 text-xl font-semibold text-primary-800">
              Food
            </th>

            <th className="px-6 py-4 text-xl font-semibold text-primary-800">
              Category
            </th>

            <th className="px-6 py-4 text-xl font-semibold text-primary-800">
              Cuisine
            </th>

            <th className="px-6 py-4 text-xl font-semibold text-primary-800">
              Spice
            </th>

            <th className="px-6 py-4 text-xl font-semibold text-primary-800">
              Nutrition
            </th>

            <th className="px-6 py-4 text-xl font-semibold text-primary-800">
              Status
            </th>

            <th className="px-6 py-4 text-right text-xl font-semibold text-primary-800">
              Store action
            </th>
          </tr>
        </thead>

        <tbody>
          {items.map((food) => {
            const image = normalizeCatalogAssetUrl(
              food.thumbnail ?? food.gallery?.[0] ?? null,
            );

            const active = food.isActive ?? food.active ?? true;

            const nutrition = food.nutritionData ?? food.nutrition;

            return (
              <tr
                key={food.uuid}
                className="border-b border-gray-100 bg-white transition-colors duration-150 last:border-b-0 hover:bg-gray-50/70"
              >
                <td className="px-6 py-4">
                  <div className="flex min-w-[320px] items-center gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-primary-100 bg-primary-50 text-primary-700">
                      {image ? (
                        <img
                          src={image}
                          alt={food.localName || food.canonicalName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <ImageIcon size={22} />
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="max-w-[280px] truncate text-lg font-medium text-gray-800">
                        {food.localName || food.canonicalName}
                      </p>

                      {food.localName && (
                        <p className="mt-1 max-w-[280px] truncate text-lg text-gray-500">
                          {food.canonicalName}
                        </p>
                      )}

                      <p className="mt-1 max-w-[320px] truncate text-lg text-gray-400">
                        {food.description || food.uuid}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 text-lg text-gray-600">
                  {food.category?.name ?? "—"}
                </td>

                <td className="px-6 py-4 text-lg text-gray-600">
                  {food.cuisine?.name ?? "—"}
                </td>

                <td className="px-6 py-4">
                  <span className="inline-flex rounded-full bg-secondary-50 px-3.5 py-1.5 text-lg font-medium text-secondary-600 ring-1 ring-inset ring-secondary-100">
                    {food.spiceLevel ?? food.defaultSpiceLevel ?? 0}
                    /5
                  </span>
                </td>

                <td className="px-6 py-4">
                  <div className="space-y-1 text-lg text-gray-500">
                    <p>{nutrition?.calories ?? 0} kcal</p>

                    <p>
                      P {nutrition?.proteinGrams ?? 0}g · C{" "}
                      {nutrition?.carbsGrams ?? 0}g
                    </p>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <StatusBadge active={active} />
                </td>

                <td className="px-6 py-4">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      disabled={!active}
                      onClick={() => onPublish(food)}
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary-800 px-5 text-lg font-medium text-white transition hover:bg-primary-900 focus:outline-none focus:ring-4 focus:ring-primary-200 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Globe2 size={19} />
                      Publish for Store
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full px-3.5 py-1.5 text-lg font-medium ring-1 ring-inset ${
        active
          ? "bg-primary-50 text-primary-700 ring-primary-100"
          : "bg-gray-100 text-gray-500 ring-gray-200"
      }`}
    >
      <span
        className={`h-2 w-2 shrink-0 rounded-full ${
          active ? "bg-primary-600" : "bg-gray-400"
        }`}
      />

      {active ? "ACTIVE" : "INACTIVE"}
    </span>
  );
}
