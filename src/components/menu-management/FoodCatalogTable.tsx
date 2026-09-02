"use client";

import { useEffect, useMemo, useState } from "react";
import { Eye, MinusCircle, Pencil } from "lucide-react";
import FoodAvatar from "./FoodAvatar";
import Pagination from "@/src/components/ui/Pagination";
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

function FoodRowActions({
  item,
  disabled,
  onView,
  onEdit,
  onHardDelete,
}: {
  item: FoodRecord;
  disabled: boolean;
  onView?: (item: FoodRecord) => void;
  onEdit: (item: FoodRecord) => void;
  onHardDelete: (item: FoodRecord) => void;
}) {
  return (
    <div className="relative flex items-center justify-center gap-2">
      {/* 1. View Detail (Green Eye) */}
      {onView && (
        <button
          type="button"
          onClick={() => onView(item)}
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-100"
          title="មើលព័ត៌មានលម្អិត"
        >
          <Eye size={20} />
        </button>
      )}

      {/* 2. Primary Action: Edit (Blue Pencil) */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => onEdit(item)}
        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl bg-blue-50 text-blue-500 transition hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-40"
        title="កែប្រែ"
      >
        <Pencil size={20} />
      </button>

      {/* 3. Delete Action: Red Circle Minus (MinusCircle) */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => onHardDelete(item)}
        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl bg-red-50 text-red-500 transition hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-100 disabled:cursor-not-allowed disabled:opacity-40"
        title="លុបចេញពីប្រព័ន្ធ"
      >
        <MinusCircle size={20} />
      </button>
    </div>
  );
}

export default function FoodCatalogTable({
  items,
  categories = [],
  cuisines = [],
  busy,
  itemsPerPage = 10,
  catalogType = "ALL",
  onView,
  onEdit,
  onSoftDelete,
  onDelete,
}: {
  items: FoodRecord[];
  categories?: FoodCategoryOption[];
  cuisines?: CuisineOption[];
  busy: boolean;
  itemsPerPage?: number;
  catalogType?: "FOOD" | "DRINK" | "ALL";
  onView?: (item: FoodRecord) => void;
  onEdit: (item: FoodRecord) => void;
  onSoftDelete?: (item: FoodRecord) => void;
  onDelete: (item: FoodRecord) => void;
}) {
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [items, itemsPerPage]);

  const totalPages = Math.ceil(items.length / itemsPerPage) || 1;

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return items.slice(start, start + itemsPerPage);
  }, [items, currentPage, itemsPerPage]);

  if (!items.length) {
    const emptyTitle =
      catalogType === "FOOD"
        ? "មិនទាន់មានទិន្នន័យមុខម្ហូបទេ"
        : catalogType === "DRINK"
          ? "មិនទាន់មានទិន្នន័យភេសជ្ជៈទេ"
          : "មិនទាន់មានទិន្នន័យ Catalog ទេ";

    const emptyDesc =
      catalogType === "FOOD"
        ? "ទិន្នន័យមុខម្ហូបនឹងបង្ហាញនៅទីនេះ។"
        : catalogType === "DRINK"
          ? "ទិន្នន័យភេសជ្ជៈនឹងបង្ហាញនៅទីនេះ។"
          : "ទិន្នន័យមុខម្ហូប និងភេសជ្ជៈនឹងបង្ហាញនៅទីនេះ។";

    return (
      <div className="px-6 py-16 text-center">
        <p className="text-lg font-medium text-gray-500">{emptyTitle}</p>
        <p className="mt-1 text-base text-gray-400">{emptyDesc}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="w-full min-w-0 max-w-full overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <table className="w-full table-auto border-collapse text-left">
          {/* ================= HEADER ================= */}
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/80 text-left text-xl font-medium text-primary-900">
              <th className="whitespace-nowrap px-4 py-4 font-medium min-w-[150px]">
                {catalogType === "FOOD" ? "មុខម្ហូប" : catalogType === "DRINK" ? "ភេសជ្ជៈ" : "មុខម្ហូប / ភេសជ្ជៈ"}
              </th>

              <th className="whitespace-nowrap px-4 py-4 font-medium min-w-[150px]">
                ឈ្មោះអង់គ្លេស
              </th>

              <th className="whitespace-nowrap px-4 py-4 font-medium min-w-[130px]">
                ប្រភេទ
              </th>

              <th className="whitespace-nowrap px-4 py-4 font-medium min-w-[130px]">
                ម្ហូបតាមប្រទេស
              </th>

              <th className="whitespace-nowrap px-4 py-4 text-center font-medium min-w-[95px]">
                ស្ថានភាព
              </th>

              <th className="whitespace-nowrap px-4 py-4 text-center font-medium min-w-[110px]">
                សកម្មភាព
              </th>
            </tr>
          </thead>

          {/* ================= BODY ================= */}
          <tbody>
            {paginatedItems.map((item, index) => {
              const active = item.isActive !== false;

              return (
                <tr
                  key={item.uuid}
                  className="border-b border-gray-100 bg-white transition-colors duration-150 last:border-b-0 hover:bg-gray-50/70"
                >
                  {/* Food Name + Avatar */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-primary-100 bg-primary-50 text-primary-800">
                        <FoodAvatar
                          item={item}
                          alt={foodName(item)}
                          fallbackEmoji="🍽️"
                        />
                      </div>

                      <div className="min-w-0">
                        <p className="max-w-[200px] truncate text-lg font-normal text-gray-800">
                          {foodName(item)}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* English Name (Canonical Name) */}
                  <td className="px-4 py-3.5">
                    <span className="line-clamp-1 text-lg font-normal text-gray-700">
                      {item.canonicalName || "—"}
                    </span>
                  </td>

                  {/* Category */}
                  <td className="px-4 py-3.5">
                    <span className="line-clamp-1 text-lg font-normal text-gray-700">
                      {categoryName(item, categories)}
                    </span>
                  </td>

                  {/* Cuisine */}
                  <td className="px-4 py-3.5">
                    <span className="line-clamp-1 text-lg font-normal text-gray-700">
                      {cuisineName(item, cuisines)}
                    </span>
                  </td>

                  {/* Status Badge */}
                  <td className="px-4 py-3.5 text-center">
                    <span
                      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1 text-lg font-normal border ${active
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                          : "bg-gray-50 text-gray-600 border-gray-150"
                        }`}
                    >
                      <span
                        className={`h-2.5 w-2.5 shrink-0 rounded-full ${active ? "bg-emerald-500" : "bg-gray-400"
                          }`}
                      />
                      {active ? "សកម្ម" : "អសកម្ម"}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3.5">
                    <FoodRowActions
                      item={item}
                      disabled={busy}
                      onView={onView}
                      onEdit={onEdit}
                      onHardDelete={onDelete}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* PAGINATION CONTROLS */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalElements={items.length}
          pageSize={itemsPerPage}
          unit="មុខ"
          disabled={busy}
          onPageChange={(page) => setCurrentPage(page)}
          className="mt-4"
        />
      )}
    </div>
  );
}
