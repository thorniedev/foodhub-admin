"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Eye, MinusCircle, MoreVertical, Pencil, Trash2 } from "lucide-react";
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

function FoodRowActions({
  item,
  disabled,
  rowIndex = 0,
  totalRows = 1,
  onView,
  onEdit,
  onSoftDelete,
  onHardDelete,
}: {
  item: FoodRecord;
  disabled: boolean;
  rowIndex?: number;
  totalRows?: number;
  onView?: (item: FoodRecord) => void;
  onEdit: (item: FoodRecord) => void;
  onSoftDelete?: (item: FoodRecord) => void;
  onHardDelete: (item: FoodRecord) => void;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const openUpward = totalRows > 2 && rowIndex >= totalRows - 2;

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="relative flex items-center justify-center gap-2">
      {/* 1. View Detail (Green Eye) */}
      {onView && (
        <button
          type="button"
          onClick={() => onView(item)}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-100"
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
        className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-500 transition hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-40"
        title="កែប្រែ"
      >
        <Pencil size={20} />
      </button>

      {/* 3. More (3-dots) for extra actions */}
      <div className="relative" ref={menuRef}>
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen((prev) => !prev)}
          className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800 focus:outline-none ${
            open ? "bg-gray-200 text-gray-900 ring-2 ring-gray-300/60" : ""
          }`}
          title="ផ្សេងទៀត"
          aria-label="More actions"
        >
          <MoreVertical size={20} />
        </button>

        {open && (
          <div
            className={`absolute right-0 z-[100] min-w-max whitespace-nowrap overflow-hidden rounded-2xl border border-gray-100 bg-white p-2 shadow-2xl animate-in fade-in zoom-in-95 duration-150 ${
              openUpward ? "bottom-full mb-2" : "top-full mt-2"
            }`}
          >
            {/* Soft Delete / Disable */}
            {onSoftDelete && (
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onSoftDelete(item);
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-lg font-semibold text-amber-700 transition hover:bg-amber-50 whitespace-nowrap"
              >
                <MinusCircle size={18} className="shrink-0" />
                <span>កំណត់អសកម្ម</span>
              </button>
            )}

            {/* Hard Delete */}
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onHardDelete(item);
              }}
              className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-lg font-semibold text-red-600 transition hover:bg-red-50 whitespace-nowrap"
            >
              <Trash2 size={18} className="shrink-0" />
              <span>លុបចេញពីប្រព័ន្ធ</span>
            </button>
          </div>
        )}
      </div>
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
            <tr className="border-b border-gray-100 bg-gray-50/70">
              <th className="whitespace-nowrap px-3 py-3.5 text-lg font-semibold text-primary-800 min-w-[140px]">
                {catalogType === "FOOD" ? "មុខម្ហូប" : catalogType === "DRINK" ? "ភេសជ្ជៈ" : "មុខម្ហូប / ភេសជ្ជៈ"}
              </th>

              <th className="whitespace-nowrap px-3 py-3.5 text-lg font-semibold text-primary-800 min-w-[130px]">
                ប្រភេទ
              </th>

              <th className="whitespace-nowrap px-3 py-3.5 text-lg font-semibold text-primary-800 min-w-[130px]">
                ម្ហូបតាមប្រទេស
              </th>

              <th className="whitespace-nowrap px-2 py-3.5 text-center text-lg font-semibold text-primary-800 min-w-[95px]">
                ស្ថានភាព
              </th>

              <th className="whitespace-nowrap px-3 py-3.5 text-center text-lg font-semibold text-primary-800 min-w-[110px]">
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
                        <p className="max-w-[200px] truncate text-lg font-bold text-gray-900">
                          {foodName(item)}
                        </p>

                        {item.canonicalName && (
                          <p className="max-w-[200px] truncate text-base font-medium text-gray-400">
                            {item.canonicalName}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-3 py-3.5">
                    <span className="line-clamp-1 text-lg font-semibold text-gray-700">
                      {categoryName(item, categories)}
                    </span>
                  </td>

                  {/* Cuisine */}
                  <td className="px-3 py-3.5">
                    <span className="line-clamp-1 text-lg font-semibold text-gray-700">
                      {cuisineName(item, cuisines)}
                    </span>
                  </td>

                  {/* Status Badge */}
                  <td className="px-2 py-3.5 text-center">
                    <span
                      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-1.5 text-lg font-semibold border ${
                        active
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                          : "bg-gray-50 text-gray-600 border-gray-150"
                      }`}
                    >
                      <span
                        className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                          active ? "bg-emerald-500" : "bg-gray-400"
                        }`}
                      />
                      {active ? "សកម្ម" : "អសកម្ម"}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-3 py-3.5">
                    <FoodRowActions
                      item={item}
                      disabled={busy}
                      rowIndex={index}
                      totalRows={paginatedItems.length}
                      onView={onView}
                      onEdit={onEdit}
                      onSoftDelete={onSoftDelete}
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
        <div className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-gray-50/50 p-3.5 sm:flex-row">
          <p className="text-lg font-semibold text-gray-600">
            បង្ហាញ {Math.min((currentPage - 1) * itemsPerPage + 1, items.length)} -{" "}
            {Math.min(currentPage * itemsPerPage, items.length)} នៃ {items.length} មុខ
          </p>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="ទំព័រមុន"
            >
              <ChevronLeft size={20} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                className={`flex h-10 min-w-[40px] cursor-pointer items-center justify-center rounded-xl px-3 text-lg font-bold transition ${
                  currentPage === page
                    ? "bg-primary-800 text-white shadow-xs"
                    : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="ទំព័របន្ទាប់"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
