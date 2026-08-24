"use client";

import { useState } from "react";
import {
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";

import MenuItemAvatar from "./MenuItemAvatar";

import type {
  FoodRecord,
  MenuItemRecord,
} from "@/src/types/menu-management";

function storeName(
  item: MenuItemRecord,
): string {
  return (
    item.store?.storeName ||
    item.store?.name ||
    item.store?.localName ||
    "—"
  );
}

function renderBaseFoodCell(
  item: MenuItemRecord,
  foods: FoodRecord[] = [],
) {
  const matched = foods.find(
    (f) => f.uuid === item.foodUuid || f.uuid === item.food?.uuid,
  );
  const local = matched?.localName || item.food?.localName;
  const canonical = matched?.canonicalName || item.food?.canonicalName;

  if (!local && !canonical) {
    return <span className="text-gray-400">—</span>;
  }

  return (
    <div className="min-w-0">
      <p className="text-xl font-bold text-gray-800 truncate">
        {local || canonical}
      </p>
      {canonical && local && canonical.toLowerCase() !== local.toLowerCase() && (
        <p className="text-lg font-medium text-gray-400 truncate">
          {canonical}
        </p>
      )}
    </div>
  );
}

export default function PublishedMenuItemsTable({
  items,
  foods = [],
  busy,
  onView,
  onEdit,
  onDelete,
}: {
  items: MenuItemRecord[];
  foods?: FoodRecord[];
  busy: boolean;
  onView: (
    item: MenuItemRecord,
  ) => void;
  onEdit: (
    item: MenuItemRecord,
  ) => void;
  onDelete: (
    item: MenuItemRecord,
  ) => void;
}) {
  if (!items.length) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-24 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-50 text-[#137A3D]">
          <Eye size={36} />
        </div>
        <p className="mt-5 text-2xl font-bold text-gray-800">
          មិនទាន់មាន Menu Item លើ Website នៅឡើយទេ
        </p>
        <p className="mt-2 max-w-md text-lg text-gray-500 leading-relaxed">
          សូមចុចប៊ូតុង <strong className="text-emerald-700 font-bold">+ បង្កើត Menu Item</strong> ខាងលើ ដើម្បីជ្រើសរើសមុខម្ហូបពី Catalog កំណត់ហាង និងដាក់លក់លើ Website។
        </p>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 max-w-full overflow-x-auto">
      <table className="w-full min-w-[1050px] border-collapse text-left">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/70">
            <th className="px-6 py-5 text-xl font-bold text-primary-800">Menu Item</th>
            <th className="px-6 py-5 text-xl font-bold text-primary-800">ហាង</th>
            <th className="px-6 py-5 text-xl font-bold text-primary-800">មុខម្ហូបមេ</th>
            <th className="px-6 py-5 text-xl font-bold text-primary-800">តម្លៃ</th>
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
                    <MenuItemAvatar
                      item={item}
                      alt={item.name}
                      fallbackEmoji="🍜"
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-xl font-bold text-gray-900">
                      {item.name}
                    </p>

                    {item.isFeatured && (
                      <span className="mt-1 inline-block rounded-full bg-orange-50 px-3 py-1 text-lg font-bold text-orange-600">
                        FEATURED
                      </span>
                    )}
                  </div>
                </div>
              </td>

              <td className="px-6 py-5 text-lg font-medium text-gray-700">
                {storeName(item)}
              </td>

              <td className="px-6 py-5 text-lg font-medium text-gray-600">
                {renderBaseFoodCell(item, foods)}
              </td>

              <td className="px-6 py-5 text-xl font-black text-emerald-800">
                {Number(item.price ?? 0).toFixed(2)} {item.currencyCode || "USD"}
              </td>

              <td className="px-6 py-5">
                <span className="inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-emerald-50 px-4 py-1.5 text-lg font-bold text-emerald-700 ring-1 ring-inset ring-emerald-100">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
                  {item.availabilityStatus || "AVAILABLE"}
                </span>
              </td>

              <td className="px-6 py-5">
                <div className="flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => onView(item)}
                    className="flex h-11 w-11 items-center justify-center rounded-xl text-emerald-600 transition hover:bg-emerald-50 focus:outline-none focus:ring-4 focus:ring-emerald-100"
                    title="មើលព័ត៌មានលម្អិត"
                  >
                    <Eye size={22} />
                  </button>

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
                    className="flex h-11 w-11 items-center justify-center rounded-xl text-red-600 transition hover:bg-red-50 focus:outline-none focus:ring-4 focus:ring-red-100 disabled:opacity-40"
                    title="លុប"
                  >
                    <Trash2 size={22} />
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
