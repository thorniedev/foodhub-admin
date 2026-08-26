"use client";

import { Eye, Pencil, Power, Trash2 } from "lucide-react";
import type { FoodCategory } from "@/src/types/foodCategory";
import { formatAdminDate } from "@/src/types/safetyResource";

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
      <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
        <p className="text-lg font-medium text-gray-500">{emptyText}</p>
        <p className="mt-1 text-base text-gray-400">
          ចុចប៊ូតុង &quot;បន្ថែមអនុប្រភេទ...&quot; ដើម្បីបង្កើតថ្មី។
        </p>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 max-w-full overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <table className="w-full min-w-[700px] table-auto border-collapse text-left">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/70">
            <th className="whitespace-nowrap px-4 py-3.5 text-lg font-semibold text-primary-800">
              ឈ្មោះអនុប្រភេទ
            </th>
            <th className="whitespace-nowrap px-4 py-3.5 text-lg font-semibold text-primary-800">
              កូដ
            </th>
            <th className="whitespace-nowrap px-4 py-3.5 text-lg font-semibold text-primary-800">
              ប្រភេទមេ
            </th>
            <th className="whitespace-nowrap px-4 py-3.5 text-lg font-semibold text-primary-800">
              ការពិពណ៌នា
            </th>
            <th className="whitespace-nowrap px-4 py-3.5 text-center text-lg font-semibold text-primary-800">
              ស្ថានភាព
            </th>
            <th className="whitespace-nowrap px-4 py-3.5 text-lg font-semibold text-primary-800">
              កាលបរិច្ឆេទបង្កើត
            </th>
            <th className="whitespace-nowrap px-4 py-3.5 text-center text-lg font-semibold text-primary-800 min-w-[120px]">
              សកម្មភាព
            </th>
          </tr>
        </thead>

        <tbody>
          {items.map((item) => {
            const active = item.isActive !== false;
            const parentDisplay =
              item.parentCategoryName || parentDefaultName;

            return (
              <tr
                key={item.uuid}
                className="border-b border-gray-100 bg-white transition-colors duration-150 last:border-b-0 hover:bg-gray-50/70"
              >
                {/* Name */}
                <td className="px-4 py-3">
                  <p className="text-base font-semibold text-gray-800">{item.name}</p>
                </td>

                {/* Code */}
                <td className="whitespace-nowrap px-4 py-3">
                  <span className="inline-flex rounded-lg bg-gray-100 px-2.5 py-1 font-mono text-base font-semibold text-gray-700">
                    {item.code}
                  </span>
                </td>

                {/* Parent Category */}
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-primary-100 bg-primary-50 px-3.5 py-1 text-base font-medium text-primary-700">
                    <span className="h-2 w-2 shrink-0 rounded-full bg-primary-600" />
                    {parentDisplay}
                  </span>
                </td>

                {/* Description */}
                <td className="max-w-xs truncate px-4 py-3 text-base font-normal text-gray-500">
                  {item.description || "—"}
                </td>

                {/* Status */}
                <td className="px-4 py-3 text-center">
                  <span
                    className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1 text-base font-semibold border ${
                      active
                        ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                        : "border-gray-200 bg-gray-50 text-gray-600"
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

                {/* Created Date */}
                <td className="whitespace-nowrap px-4 py-3 text-base font-normal text-gray-500">
                  {formatAdminDate(item.createdAt)}
                </td>

                {/* Actions */}
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    {/* View Detail */}
                    <button
                      type="button"
                      onClick={() => onView(item)}
                      title="មើលព័ត៌មានលម្អិត"
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                    >
                      <Eye size={18} />
                    </button>

                    {/* Edit */}
                    <button
                      type="button"
                      onClick={() => onEdit(item)}
                      title="កែប្រែ"
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-500 transition hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    >
                      <Pencil size={18} />
                    </button>

                    {/* Quick Toggle Active */}
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => onToggleActive(item)}
                      title={active ? "បិទដំណើរការ" : "បើកដំណើរការ"}
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 transition hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-100 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Power size={18} />
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => onDelete(item)}
                      title="លុប"
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-500 transition hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-100"
                    >
                      <Trash2 size={18} />
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
