"use client";

import Image from "next/image";
import { Ban, Flame, Pencil, Trash2 } from "lucide-react";
import { MenuItem } from "../../types/menuItem";

interface MenuItemsTableProps {
  data: MenuItem[];
  onEdit: (item: MenuItem) => void;
  onDelete: (item: MenuItem) => void;
  onToggleStatus: (item: MenuItem) => void;
}

const STATUS_BADGE: Record<MenuItem["availabilityStatus"], string> = {
  AVAILABLE: "bg-emerald-50 text-emerald-600",
  UNAVAILABLE: "bg-gray-100 text-gray-400",
  OUT_OF_STOCK: "bg-red-50 text-red-500",
};

export default function MenuItemsTable({
  data,
  onEdit,
  onDelete,
  onToggleStatus,
}: MenuItemsTableProps) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl overflow-x-auto">
      <table className="w-full text-sm min-w-[1100px]">
        <thead>
          <tr className="border-b border-gray-100 text-left text-[#136C34]">
            <th className="py-3 px-4 font-medium text-base lg:text-lg">ម្ហូប</th>
            <th className="py-3 px-4 font-medium text-base lg:text-lg">ហាង</th>
            <th className="py-3 px-4 font-medium text-base lg:text-lg">ប្រភេទ</th>
            <th className="py-3 px-4 font-medium text-base lg:text-lg">ម្ហូបជាតិ</th>
            <th className="py-3 px-4 font-medium text-base lg:text-lg">ហឹរ</th>
            <th className="py-3 px-4 font-medium text-base lg:text-lg">តម្លៃ</th>
            <th className="py-3 px-4 font-medium text-base lg:text-lg">ពេលវេលា</th>
            <th className="py-3 px-4 font-medium text-base lg:text-lg">ស្ថានភាព</th>
            <th className="py-3 px-4 font-medium text-right text-base lg:text-lg">សកម្មភាព</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.uuid} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
              <td className="py-3 px-4">
                <div className="flex items-center gap-3">
                  <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                    <Image
                      src={item.thumbnail || "/Image/fallback.png"}
                      alt={item.localName}
                      fill
                      className="object-cover"
                      sizes="44px"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{item.localName}</p>
                    <p className="text-xs text-gray-400">{item.name}</p>
                  </div>
                </div>
              </td>
              <td className="py-3 px-4 text-gray-600">{item.store.localName || item.store.name}</td>
              <td className="py-3 px-4 text-gray-600">{item.food.category.name}</td>
              <td className="py-3 px-4 text-gray-600">{item.food.cuisine.name}</td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Flame
                      key={i}
                      size={14}
                      className={i < item.food.spiceLevel ? "fill-red-500 text-red-500" : "text-gray-200"}
                    />
                  ))}
                </div>
              </td>
              <td className="py-3 px-4 text-gray-600">
                {item.price.toFixed(2)} {item.currencyCode}
              </td>
              <td className="py-3 px-4 text-gray-600">{item.preparationTimeMinutes} នាទី</td>
              <td className="py-3 px-4">
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_BADGE[item.availabilityStatus]}`}
                >
                  {item.availabilityStatus}
                </span>
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => onToggleStatus(item)}
                    title={item.availabilityStatus === "AVAILABLE" ? "បិទ" : "បើក"}
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
              <td colSpan={9} className="py-10 text-center text-gray-400">
                មិនមានទិន្នន័យ
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}