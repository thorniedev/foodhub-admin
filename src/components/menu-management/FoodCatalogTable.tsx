"use client";

import { Eye, Pencil, Trash2 } from "lucide-react";
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
            <th className="px-5 py-4">មុខម្ហូប</th>
            <th className="px-5 py-4">ប្រភេទ</th>
            <th className="px-5 py-4">ម្ហូបតាមប្រទេស</th>
            <th className="px-5 py-4">ស្ថានភាព</th>
            <th className="px-5 py-4 text-right">សកម្មភាព</th>
          </tr>
        </thead>

        <tbody>
          {items.map((item) => (
            <tr
              key={item.uuid}
              className="border-b border-gray-50 last:border-b-0 hover:bg-gray-50/40 transition"
            >
              <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                    <FoodAvatar
                      item={item}
                      alt={foodName(item)}
                      fallbackEmoji="🍽️"
                    />
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

              <td className="px-5 py-4 text-sm font-medium text-gray-700">
                {categoryName(item, categories)}
              </td>

              <td className="px-5 py-4 text-sm text-gray-600">
                {cuisineName(item, cuisines)}
              </td>

              <td className="px-5 py-4">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    item.isActive === false
                      ? "bg-gray-100 text-gray-500"
                      : "bg-emerald-50 text-emerald-700"
                  }`}
                >
                  {item.isActive === false ? "អសកម្ម" : "សកម្ម"}
                </span>
              </td>

              <td className="px-5 py-4">
                <div className="flex justify-end gap-2">
                  {onView && (
                    <button
                      type="button"
                      onClick={() => onView(item)}
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 text-gray-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                      title="មើលព័ត៌មានលម្អិត"
                    >
                      <Eye size={16} />
                    </button>
                  )}

                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => onEdit(item)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 text-gray-500 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-[#137A3D]"
                    title="កែប្រែ"
                  >
                    <Pencil size={16} />
                  </button>

                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => onDelete(item)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 text-gray-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                    title="លុប"
                  >
                    <Trash2 size={16} />
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
