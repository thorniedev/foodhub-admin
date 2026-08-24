"use client";

import { CircleMinus, Eye, Pencil } from "lucide-react";
import FoodAvatar from "./FoodAvatar";
import { extractKhmerOnlyName } from "@/src/lib/catalogCategoryHelper";

import type {
  CuisineOption,
  FoodCategoryOption,
  FoodRecord,
} from "@/src/types/menu-management";

function foodName(item: FoodRecord): string {
  return (
    item.localName ||
    item.canonicalName ||
    item.name ||
    "—"
  );
}

function categoryName(
  item: FoodRecord,
  categories: FoodCategoryOption[] = [],
): string {
  const cat = categories.find(
    (c) =>
      c.uuid === item.categoryUuid ||
      c.uuid === item.category?.uuid ||
      c.name === item.category?.name ||
      c.name === item.categoryName,
  );
  const raw = cat?.name || item.category?.name || item.categoryName || "";
  if (!raw) return "—";
  return extractKhmerOnlyName(raw);
}

function cuisineName(
  item: FoodRecord,
  cuisines: CuisineOption[] = [],
): string {
  const cui = cuisines.find(
    (c) =>
      c.uuid === item.cuisineUuid ||
      c.uuid === item.cuisine?.uuid ||
      c.name === item.cuisine?.name ||
      c.name === item.cuisineName,
  );
  return cui?.name || item.cuisine?.name || item.cuisineName || "—";
}

export default function FoodCatalogTable({
  items,
  categories = [],
  cuisines = [],
  busy,
  onView,
  onEdit,
  onDelete,
}: {
  items: FoodRecord[];
  categories?: FoodCategoryOption[];
  cuisines?: CuisineOption[];
  busy: boolean;
  onView?: (item: FoodRecord) => void;
  onEdit: (item: FoodRecord) => void;
  onDelete: (item: FoodRecord) => void;
}) {
  if (!items.length) {
    return (
      <div className="px-6 py-24 text-center">
        <p className="text-2xl font-bold text-gray-400">មិនទាន់មានទិន្នន័យ Catalog ទេ</p>
        <p className="mt-2 text-lg text-gray-400">ទិន្នន័យមុខម្ហូប និងភេសជ្ជៈនឹងបង្ហាញនៅទីនេះ។</p>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 max-w-full overflow-x-auto">
      <table className="w-full min-w-[1050px] border-collapse text-left">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/70">
            <th className="px-6 py-5 text-xl font-bold text-primary-800">មុខម្ហូប / ភេសជ្ជៈ</th>
            <th className="px-6 py-5 text-xl font-bold text-primary-800">ប្រភេទ</th>
            <th className="px-6 py-5 text-xl font-bold text-primary-800">ម្ហូបតាមប្រទេស</th>
            <th className="px-6 py-5 text-xl font-bold text-primary-800">ស្ថានភាព</th>
            <th className="px-6 py-5 text-right text-xl font-bold text-primary-800">សកម្មភាព</th>
          </tr>
        </thead>

        <tbody>
          {items.map((item) => (
            <tr
              key={item.uuid}
              className="border-b border-gray-100 bg-white transition-colors duration-150 last:border-b-0 hover:bg-gray-50/70"
            >
              <td className="px-6 py-5">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-gray-100 ring-1 ring-black/5 shadow-xs">
                    <FoodAvatar
                      item={item}
                      alt={foodName(item)}
                      fallbackEmoji="🍽️"
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-xl font-bold text-gray-900">
                      {foodName(item)}
                    </p>

                    {item.canonicalName && (
                      <p className="mt-1 truncate text-lg font-medium text-gray-400">
                        {item.canonicalName}
                      </p>
                    )}
                  </div>
                </div>
              </td>

              <td className="px-6 py-5">
                <span className="inline-flex rounded-full bg-secondary-50 px-4 py-1.5 text-lg font-medium text-secondary-700 ring-1 ring-inset ring-secondary-100">
                  {categoryName(item, categories)}
                </span>
              </td>

              <td className="px-6 py-5 text-lg font-medium text-gray-600">
                {cuisineName(item, cuisines)}
              </td>

              <td className="px-6 py-5">
                <span
                  className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-1.5 text-lg font-medium ring-1 ring-inset ${item.isActive === false
                      ? "bg-gray-100 text-gray-500 ring-gray-200"
                      : "bg-primary-50 text-primary-700 ring-primary-100"
                    }`}
                >
                  <span
                    className={`h-2.5 w-2.5 shrink-0 rounded-full ${item.isActive === false ? "bg-gray-400" : "bg-primary-600"
                      }`}
                  />
                  {item.isActive === false ? "អសកម្ម" : "សកម្ម"}
                </span>
              </td>

              <td className="px-6 py-5">
                <div className="flex items-center justify-end gap-2.5">
                  {onView && (
                    <button
                      type="button"
                      onClick={() => onView(item)}
                      className="flex h-11 w-11 items-center justify-center rounded-xl text-emerald-600 transition hover:bg-emerald-50 focus:outline-none focus:ring-4 focus:ring-emerald-100"
                      title="មើលព័ត៌មានលម្អិត"
                    >
                      <Eye size={22} />
                    </button>
                  )}

                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => onEdit(item)}
                    className="flex h-11 w-11 items-center justify-center rounded-xl text-blue-600 transition hover:bg-blue-50 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:opacity-40"
                    title="កែប្រែ"
                  >
                    <Pencil size={22} />
                  </button>

                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => onDelete(item)}
                    className="flex h-11 w-11 items-center justify-center rounded-xl text-amber-600 transition hover:bg-amber-50 focus:outline-none focus:ring-4 focus:ring-amber-100 disabled:opacity-40"
                    title="បិទ / អសកម្ម"
                  >
                    <CircleMinus size={22} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
