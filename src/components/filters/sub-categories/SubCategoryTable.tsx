"use client";

import { CircleMinus, Eye, Pencil, RotateCcw, Trash2 } from "lucide-react";
import type { FoodCategory } from "@/src/types/foodCategory";

type Props = {
  items: FoodCategory[];
  mode: "FOOD" | "DRINK";
  busy: boolean;
  onView: (item: FoodCategory) => void;
  onEdit: (item: FoodCategory) => void;
  onToggleActive: (item: FoodCategory) => void;
  onDelete: (item: FoodCategory) => void;
};

export default function SubCategoryTable({
  items,
  mode,
  busy,
  onView,
  onEdit,
  onToggleActive,
  onDelete,
}: Props) {
  const isDrink = mode === "DRINK";
  const parentDefaultName = isDrink ? "ភេសជ្ជៈ (DRINK)" : "ម្ហូបអាហារ (FOOD)";
  const emptyText = isDrink
    ? "មិនទាន់មានអនុប្រភេទភេសជ្ជៈនៅឡើយទេ។"
    : "មិនទាន់មានអនុប្រភេទម្ហូបនៅឡើយទេ។";

  if (!items.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl bg-white px-6 py-20 text-center shadow-sm">
        <p className="text-xl font-bold text-gray-500">{emptyText}</p>
        <p className="mt-2 text-lg text-gray-400">
          ចុចប៊ូតុង &quot;បន្ថែមអនុប្រភេទ...&quot; ដើម្បីបង្កើតថ្មី។
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/70 text-left text-lg font-semibold text-primary-800">
              <th className="px-6 py-4">ឈ្មោះអនុប្រភេទ</th>
              <th className="px-6 py-4">កូដ</th>
              <th className="px-6 py-4">ប្រភេទមេ</th>
              <th className="px-6 py-4">ការពិពណ៌នា</th>
              <th className="px-6 py-4">ស្ថានភាព</th>
              <th className="px-6 py-4 text-right">សកម្មភាព</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50 text-lg">
            {items.map((item) => {
              const active = item.isActive !== false;
              const parentDisplay =
                item.parentCategoryName || parentDefaultName;

              return (
                <tr
                  key={item.uuid}
                  className="transition hover:bg-gray-50/60"
                >
                  {/* Name */}
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-900">{item.name}</p>
                  </td>

                  {/* Code */}
                  <td className="px-6 py-4">
                    <span className="inline-flex rounded-lg bg-gray-100 px-3 py-1 font-mono text-lg font-semibold text-gray-700">
                      {item.code}
                    </span>
                  </td>

                  {/* Parent Category */}
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 rounded-xl bg-primary-50 px-3.5 py-1 text-lg font-bold text-primary-800">
                      <span className="h-2 w-2 rounded-full bg-primary-600" />
                      {parentDisplay}
                    </span>
                  </td>

                  {/* Description */}
                  <td className="max-w-xs truncate px-6 py-4 text-lg text-gray-500">
                    {item.description || "—"}
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-lg font-bold ${
                        active
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${
                          active ? "bg-emerald-500" : "bg-gray-400"
                        }`}
                      />
                      {active ? "សកម្ម" : "អសកម្ម"}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {/* View Detail */}
                      <button
                        type="button"
                        onClick={() => onView(item)}
                        title="មើលព័ត៌មានលម្អិត"
                        className="rounded-xl p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                      >
                        <Eye size={20} />
                      </button>

                      {/* Edit */}
                      <button
                        type="button"
                        onClick={() => onEdit(item)}
                        title="កែប្រែ"
                        className="rounded-xl p-2 text-gray-400 transition hover:bg-primary-50 hover:text-primary-700"
                      >
                        <Pencil size={20} />
                      </button>

                      {/* Toggle Active (CircleMinus / RotateCcw) */}
                      {active ? (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => onToggleActive(item)}
                          title="បិទដំណើរការ (Deactivate)"
                          className="rounded-xl p-2 text-amber-600 transition hover:bg-amber-50 hover:text-amber-700"
                        >
                          <CircleMinus size={20} />
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => onToggleActive(item)}
                          title="ស្ដារឡើងវិញ (Restore)"
                          className="rounded-xl p-2 text-primary-700 transition hover:bg-primary-50 hover:text-primary-800"
                        >
                          <RotateCcw size={20} />
                        </button>
                      )}

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => onDelete(item)}
                        title="លុប"
                        className="rounded-xl p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
