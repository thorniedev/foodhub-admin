"use client";

import Image from "next/image";
import { Ban, Pencil, Trash2 } from "lucide-react";
import { FoodByAreaImage } from "@/src/types/foodByArea";

interface FoodByAreaTableProps {
  data: FoodByAreaImage[];
  onEdit: (item: FoodByAreaImage) => void;
  onDelete: (item: FoodByAreaImage) => void;
  onToggleStatus: (item: FoodByAreaImage) => void;
}

const STATUS_BADGE: Record<FoodByAreaImage["status"], string> = {
  active: "bg-emerald-50 text-emerald-600",
  pending: "bg-amber-50 text-amber-600",
  disabled: "bg-gray-100 text-gray-400",
};

const STATUS_LABEL: Record<FoodByAreaImage["status"], string> = {
  active: "កំពុងបង្ហាញ",
  pending: "កំពុងរង់ចាំ",
  disabled: "បានបិទ",
};

export default function FoodByAreaTable({
  data,
  onEdit,
  onDelete,
  onToggleStatus,
}: FoodByAreaTableProps) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 text-left text-[#136C34] text-lg">
            <th className="py-3 px-4 font-medium">រូបភាព</th>
            <th className="py-3 px-4 font-medium">ចំណងជើង</th>
            <th className="py-3 px-4 font-medium">ការពិពណ៌នា</th>
            <th className="py-3 px-4 font-medium">ស្ថានភាព</th>
            <th className="py-3 px-4 font-medium text-right">សកម្មភាព</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr
              key={item.id}
              className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 align-top"
            >
              <td className="py-3 px-4">
                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
              </td>
              <td className="py-3 px-4">
                <p className="font-medium text-gray-800">{item.title}</p>
                <p className="text-xs text-gray-400">{item.id}</p>
              </td>
              <td className="py-3 px-4 text-gray-500 max-w-md">
                {item.description}
              </td>
              <td className="py-3 px-4">
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    STATUS_BADGE[item.status]
                  }`}
                >
                  {STATUS_LABEL[item.status]}
                </span>
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => onToggleStatus(item)}
                    title={item.status === "disabled" ? "បើក" : "បិទ"}
                    className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50"
                  >
                    <Ban size={16} />
                  </button>
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

          {data.length === 0 && (
            <tr>
              <td colSpan={5} className="py-10 text-center text-gray-400">
                មិនមានទិន្នន័យ
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
