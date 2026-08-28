"use client";

import { useEffect, useState, useMemo } from "react";
import { Eye, MinusCircle, Pencil, Trash2 } from "lucide-react";
import MenuItemAvatar from "./MenuItemAvatar";
import Pagination from "@/src/components/ui/Pagination";

import type {
  FoodCategoryOption,
  FoodRecord,
  MenuItemRecord,
} from "@/src/types/menu-management";
import { extractKhmerOnlyName } from "@/src/lib/catalogCategoryHelper";

const ITEMS_PER_PAGE = 6;

function storeName(item: MenuItemRecord, stores: any[] = []): string {
  const direct =
    item.store?.storeName ||
    item.store?.name ||
    item.store?.localName;
  if (direct) return direct;

  if (item.storeUuid && Array.isArray(stores) && stores.length > 0) {
    const matched = stores.find(
      (s) => String(s.uuid || s.id || "") === String(item.storeUuid),
    );
    if (matched) {
      return matched.storeName || matched.name || matched.localName || "";
    }
  }
  return "—";
}

function renderCategoryCell(
  item: MenuItemRecord,
  foods: FoodRecord[] = [],
  categories: FoodCategoryOption[] = [],
) {
  const matched = foods.find(
    (f) => f.uuid === item.foodUuid || f.uuid === item.food?.uuid,
  );

  const catUuid =
    matched?.categoryUuid ||
    matched?.category?.uuid ||
    item.food?.categoryUuid ||
    item.food?.category?.uuid;

  const matchedCat = categories.find((c) => c.uuid === catUuid);
  const rawCatName =
    matchedCat?.name ||
    matched?.categoryName ||
    matched?.category?.name ||
    item.food?.categoryName ||
    item.food?.category?.name;

  const displayCategory = rawCatName ? extractKhmerOnlyName(rawCatName) : "";

  if (!displayCategory) {
    return <span className="line-clamp-1 text-lg font-medium text-gray-400">—</span>;
  }

  return (
    <span className="inline-block max-w-[180px] truncate rounded-xl bg-emerald-50 px-3.5 py-1 text-lg font-normal text-emerald-800 border border-emerald-100/80">
      {displayCategory}
    </span>
  );
}

function MenuItemRowActions({
  item,
  disabled,
  onView,
  onEdit,
  onSoftDelete,
  onHardDelete,
}: {
  item: MenuItemRecord;
  disabled: boolean;
  rowIndex?: number;
  totalRows?: number;
  onView: (item: MenuItemRecord) => void;
  onEdit: (item: MenuItemRecord) => void;
  onSoftDelete?: (item: MenuItemRecord) => void;
  onHardDelete: (item: MenuItemRecord) => void;
}) {
  return (
    <div className="relative flex items-center justify-center gap-2">
      {/* 1. View Detail (Green Eye) */}
      <button
        type="button"
        onClick={() => onView(item)}
        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-100"
        title="មើលព័ត៌មានលម្អិត"
      >
        <Eye size={20} />
      </button>

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

      {/* 3. Soft Delete / Pause Sale (Amber Circle with minus) */}
      {onSoftDelete && (
        <button
          type="button"
          disabled={disabled}
          onClick={() => onSoftDelete(item)}
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl bg-amber-50 text-amber-600 transition hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-100 disabled:cursor-not-allowed disabled:opacity-40"
          title="ផ្អាកលក់"
        >
          <MinusCircle size={20} />
        </button>
      )}

      {/* 4. Hard Delete (Red Dustbin Trash) */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => onHardDelete(item)}
        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl bg-red-50 text-red-500 transition hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-100 disabled:cursor-not-allowed disabled:opacity-40"
        title="លុបចេញពីប្រព័ន្ធ"
      >
        <Trash2 size={20} />
      </button>
    </div>
  );
}

export default function PublishedMenuItemsTable({
  items,
  foods = [],
  categories = [],
  stores = [],
  busy,
  itemsPerPage = 10,
  onView,
  onEdit,
  onSoftDelete,
  onDelete,
}: {
  items: MenuItemRecord[];
  foods?: FoodRecord[];
  categories?: FoodCategoryOption[];
  stores?: any[];
  busy: boolean;
  itemsPerPage?: number;
  onView: (item: MenuItemRecord) => void;
  onEdit: (item: MenuItemRecord) => void;
  onSoftDelete?: (item: MenuItemRecord) => void;
  onDelete: (item: MenuItemRecord) => void;
}) {
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to page 1 if items length changes or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [items.length]);

  const totalPages = Math.ceil(items.length / itemsPerPage) || 1;

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return items.slice(start, start + itemsPerPage);
  }, [items, currentPage, itemsPerPage]);

  if (!items.length) {
    return (
      <div className="px-6 py-16 text-center">
        <p className="text-lg font-medium text-gray-500">
          មិនទាន់មាន ម៉ឺនុយ លើ Website នៅឡើយទេ
        </p>
        <p className="mt-1 text-base text-gray-400">
          សូមចុចប៊ូតុង <strong className="text-primary-800 font-semibold">+ បង្កើត ម៉ឺនុយ</strong> ខាងលើ ដើម្បីជ្រើសរើសមុខម្ហូបពី Catalog កំណត់ហាង និងដាក់លក់លើ Website។
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="w-full min-w-0 max-w-full overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <table className="w-full table-auto border-collapse text-left">
          {/* ================= HEADER ================= */}
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/70 text-left text-lg font-normal text-primary-800">
              <th className="whitespace-nowrap px-4 py-3.5 font-normal min-w-[140px]">
                ម៉ឺនុយ
              </th>

              <th className="whitespace-nowrap px-4 py-3.5 font-normal min-w-[130px]">
                ហាង
              </th>

              <th className="whitespace-nowrap px-4 py-3.5 font-normal min-w-[130px]">
                ប្រភេទ
              </th>

              <th className="whitespace-nowrap px-4 py-3.5 font-normal min-w-[90px]">
                តម្លៃ
              </th>

              <th className="whitespace-nowrap px-4 py-3.5 text-center font-normal min-w-[95px]">
                ស្ថានភាព
              </th>

              <th className="whitespace-nowrap px-4 py-3.5 text-center font-normal min-w-[180px]">
                សកម្មភាព
              </th>
            </tr>
          </thead>

          {/* ================= BODY ================= */}
          <tbody>
            {paginatedItems.map((item, index) => {
              const isAvailable = item.availabilityStatus !== "UNAVAILABLE";

              return (
                <tr
                  key={item.uuid}
                  className="border-b border-gray-100 bg-white transition-colors duration-150 last:border-b-0 hover:bg-gray-50/70"
                >
                  {/* Menu Item Name + Avatar */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-primary-100 bg-primary-50 text-primary-800">
                        <MenuItemAvatar
                          item={item}
                          alt={item.name}
                          fallbackEmoji="🍜"
                        />
                      </div>

                      <div className="min-w-0">
                        <p className="max-w-[200px] truncate text-lg font-normal text-gray-800">
                          {item.name}
                        </p>

                        {item.isFeatured && (
                          <span className="mt-0.5 inline-block rounded-full bg-amber-50 px-2.5 py-0.5 text-base font-normal text-amber-700 border border-amber-100">
                            ពិសេស
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Store Name */}
                  <td className="px-4 py-3.5">
                    <span className="line-clamp-1 text-lg font-normal text-gray-700">
                      {storeName(item, stores)}
                    </span>
                  </td>

                  {/* Category */}
                  <td className="px-4 py-3.5">
                    {renderCategoryCell(item, foods, categories)}
                  </td>

                  {/* Price */}
                  <td className="px-4 py-3.5">
                    <span className="text-xl font-normal text-emerald-800">
                      ${Number(item.price ?? 0).toFixed(2)}
                    </span>
                  </td>

                  {/* Status Badge */}
                  <td className="px-4 py-3.5 text-center">
                    <span
                      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1 text-lg font-normal border ${isAvailable
                        ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                        : "bg-red-50 text-red-600 border-red-100"
                        }`}
                    >
                      <span
                        className={`h-2.5 w-2.5 shrink-0 rounded-full ${isAvailable ? "bg-emerald-500" : "bg-red-500"
                          }`}
                      />
                      {isAvailable ? "មានលក់" : "អស់/បិទ"}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3.5">
                    <MenuItemRowActions
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
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalElements={items.length}
          pageSize={itemsPerPage}
          unit="ម៉ឺនុយ"
          disabled={busy}
          onPageChange={(page) => setCurrentPage(page)}
          className="mt-4"
        />
      )}
    </div>
  );
}
