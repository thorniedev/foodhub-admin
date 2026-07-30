"use client";

import { ArrowDown, ArrowUp, Pencil, Trash2 } from "lucide-react";
import { FilterOption } from "../../types/dynamicContent";
// import { FilterOption } from "@/types/dynamicContent";

interface DynamicContentTableProps {
  data: FilterOption[];
  onEdit: (item: FilterOption) => void;
  onDelete: (item: FilterOption) => void;
  onToggleActive: (item: FilterOption) => void;
  onMove: (item: FilterOption, direction: "up" | "down") => void;
}

export default function DynamicContentTable({
  data,
  onEdit,
  onDelete,
  onToggleActive,
  onMove,
}: DynamicContentTableProps) {
  const sorted = [...data].sort((a, b) => a.order - b.order);

  return (
    <div className="bg-white border border-gray-100 rounded-xl overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 text-left text-gray-500">
            <th className="py-3 px-4 font-medium">លំដាប់</th>
            <th className="py-3 px-4 font-medium">ឈ្មោះបង្ហាញ</th>
            <th className="py-3 px-4 font-medium">តម្លៃខាងក្នុង (value)</th>
            <th className="py-3 px-4 font-medium">ស្ថានភាព</th>
            <th className="py-3 px-4 font-medium text-right">សកម្មភាព</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((item, i) => (
            <tr
              key={item.id}
              className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50"
            >
              <td className="py-3 px-4">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onMove(item, "up")}
                    disabled={i === 0}
                    className="p-1 rounded text-gray-400 hover:text-emerald-600 disabled:opacity-30"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    onClick={() => onMove(item, "down")}
                    disabled={i === sorted.length - 1}
                    className="p-1 rounded text-gray-400 hover:text-emerald-600 disabled:opacity-30"
                  >
                    <ArrowDown size={14} />
                  </button>
                  <span className="text-gray-400 text-xs ml-1">{item.order}</span>
                </div>
              </td>
              <td className="py-3 px-4 font-medium text-gray-800">{item.label}</td>
              <td className="py-3 px-4 text-gray-500 font-mono text-xs">
                {item.value}
              </td>
              <td className="py-3 px-4">
                <button
                  onClick={() => onToggleActive(item)}
                  className={`text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${
                    item.active
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {item.active ? "កំពុងបង្ហាញ" : "បានលាក់"}
                </button>
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => onEdit(item)}
                    title="កែសម្រួល"
                    className="p-1.5 rounded-md text-gray-400 hover:text-emerald-600 hover:bg-emerald-50"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => onDelete(item)}
                    title="លុប"
                    className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}

          {sorted.length === 0 && (
            <tr>
              <td colSpan={5} className="py-10 text-center text-gray-400">
                មិនមានជម្រើសនៅក្នុងក្រុមនេះទេ
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}