"use client";

import { Pencil, Trash2 } from "lucide-react";
import type { FoodRecord } from "@/src/types/menu-management";

function foodName(item: FoodRecord): string {
  return (
    item.localName ||
    item.canonicalName ||
    item.name ||
    "—"
  );
}

function categoryName(item: FoodRecord): string {
  return (
    item.category?.name ||
    item.categoryName ||
    "—"
  );
}

function cuisineName(item: FoodRecord): string {
  return (
    item.cuisine?.name ||
    item.cuisineName ||
    "—"
  );
}

function imageUrl(item: FoodRecord): string | null {
  return (
    item.thumbnail ||
    item.imageUrl ||
    item.primaryMediaUrls?.[0] ||
    item.gallery?.[0] ||
    null
  );
}

export default function FoodCatalogTable({
  items,
  busy,
  onEdit,
  onDelete,
}: {
  items: FoodRecord[];
  busy: boolean;
  onEdit: (item: FoodRecord) => void;
  onDelete: (item: FoodRecord) => void;
}) {
  if (!items.length) {
    return (
      <div className="px-6 py-20 text-center text-gray-400">
        មិនទាន់មាន Food Catalog ទេ។
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/70 text-left text-xs font-black uppercase tracking-wide text-gray-400">
            <th className="px-5 py-4">ម្ហូប</th>
            <th className="px-5 py-4">Category</th>
            <th className="px-5 py-4">Cuisine</th>
            <th className="px-5 py-4">Status</th>
            <th className="px-5 py-4 text-right">
              សកម្មភាព
            </th>
          </tr>
        </thead>

        <tbody>
          {items.map((item) => {
            const image = imageUrl(item);

            return (
              <tr
                key={item.uuid}
                className="border-b border-gray-50 last:border-b-0"
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                      {image ? (
                        <img
                          src={image}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-lg text-gray-300">
                          🍽️
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-bold text-gray-900">
                        {foodName(item)}
                      </p>
                      <p className="mt-1 truncate text-xs text-gray-400">
                        {item.canonicalName}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-5 py-4 text-sm text-gray-600">
                  {categoryName(item)}
                </td>

                <td className="px-5 py-4 text-sm text-gray-600">
                  {cuisineName(item)}
                </td>

                <td className="px-5 py-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      item.isActive === false
                        ? "bg-gray-100 text-gray-500"
                        : "bg-emerald-50 text-emerald-700"
                    }`}
                  >
                    {item.isActive === false
                      ? "អសកម្ម"
                      : "សកម្ម"}
                  </span>
                </td>

                <td className="px-5 py-4">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => onEdit(item)}
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 text-gray-500 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-[#137A3D]"
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => onDelete(item)}
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-100 text-red-400 transition hover:bg-red-50"
                    >
                      <Trash2 size={16} />
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
