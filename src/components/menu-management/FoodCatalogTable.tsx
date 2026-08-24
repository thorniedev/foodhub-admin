"use client";

import { useEffect, useRef, useState } from "react";
import { Eye, MinusCircle, MoreVertical, Pencil, Trash2 } from "lucide-react";
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
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-100"
          title="មើលព័ត៌មានលម្អិត"
        >
          <Eye size={18} />
        </button>
      )}

      {/* 2. Primary Action: Edit (Blue Pencil) */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => onEdit(item)}
        className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-500 transition hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-40"
        title="កែប្រែ"
      >
        <Pencil size={18} />
      </button>

      {/* 3. More (3-dots) for extra actions */}
      <div className="relative" ref={menuRef}>
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen((prev) => !prev)}
          className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gray-50 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800 focus:outline-none ${
            open ? "bg-gray-200 text-gray-900 ring-2 ring-gray-300/60" : ""
          }`}
          title="ផ្សេងទៀត"
          aria-label="More actions"
        >
          <MoreVertical size={18} />
        </button>

        {open && (
          <div
            className={`absolute right-0 z-[100] min-w-[185px] overflow-hidden rounded-2xl border border-gray-100 bg-white p-1.5 shadow-2xl animate-in fade-in zoom-in-95 duration-150 ${
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
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-50"
              >
                <MinusCircle size={16} />
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
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
            >
              <Trash2 size={16} />
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
  onView,
  onEdit,
  onSoftDelete,
  onDelete,
}: {
  items: FoodRecord[];
  categories?: FoodCategoryOption[];
  cuisines?: CuisineOption[];
  busy: boolean;
  onView?: (item: FoodRecord) => void;
  onEdit: (item: FoodRecord) => void;
  onSoftDelete?: (item: FoodRecord) => void;
  onDelete: (item: FoodRecord) => void;
}) {
  if (!items.length) {
    return (
      <div className="px-6 py-16 text-center">
        <p className="text-lg font-medium text-gray-500">
          មិនទាន់មានទិន្នន័យ Catalog ទេ
        </p>
        <p className="mt-1 text-base text-gray-400">
          ទិន្នន័យមុខម្ហូប និងភេសជ្ជៈនឹងបង្ហាញនៅទីនេះ។
        </p>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 max-w-full overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <table className="w-full table-auto border-collapse text-left">
        {/* ================= HEADER ================= */}
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/70">
            <th className="whitespace-nowrap px-3 py-3.5 text-lg font-semibold text-primary-800 min-w-[140px]">
              មុខម្ហូប / ភេសជ្ជៈ
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
          {items.map((item, index) => {
            const active = item.isActive !== false;

            return (
              <tr
                key={item.uuid}
                className="border-b border-gray-100 bg-white transition-colors duration-150 last:border-b-0 hover:bg-gray-50/70"
              >
                {/* Food Name + Avatar */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-primary-100 bg-primary-50 text-primary-800">
                      <FoodAvatar
                        item={item}
                        alt={foodName(item)}
                        fallbackEmoji="🍽️"
                      />
                    </div>

                    <div className="min-w-0">
                      <p className="max-w-[160px] truncate text-base font-semibold text-gray-800">
                        {foodName(item)}
                      </p>

                      {item.canonicalName && (
                        <p className="max-w-[160px] truncate text-xs font-medium text-gray-400">
                          {item.canonicalName}
                        </p>
                      )}
                    </div>
                  </div>
                </td>

                {/* Category */}
                <td className="px-3 py-3">
                  <span className="line-clamp-1 text-sm font-medium text-gray-500">
                    {categoryName(item, categories)}
                  </span>
                </td>

                {/* Cuisine */}
                <td className="px-3 py-3">
                  <span className="line-clamp-1 text-sm font-medium text-gray-500">
                    {cuisineName(item, cuisines)}
                  </span>
                </td>

                {/* Status Badge */}
                <td className="px-2 py-3 text-center">
                  <span
                    className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1 text-sm font-semibold border ${
                      active
                        ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                        : "bg-gray-50 text-gray-600 border-gray-150"
                    }`}
                  >
                    <span
                      className={`h-2 w-2 shrink-0 rounded-full ${
                        active ? "bg-emerald-500" : "bg-gray-400"
                      }`}
                    />
                    {active ? "សកម្ម" : "អសកម្ម"}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-3 py-3">
                  <FoodRowActions
                    item={item}
                    disabled={busy}
                    rowIndex={index}
                    totalRows={items.length}
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
  );
}
