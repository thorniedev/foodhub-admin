"use client";

import Image from "next/image";
import { Ban, Pencil, Trash2, Star } from "lucide-react";
import { Shop } from "../../types/shop";

interface ShopsTableProps {
  shops: Shop[];
  onEdit: (shop: Shop) => void;
  onDelete: (shop: Shop) => void;
  onToggleStatus: (shop: Shop) => void;
}

export default function ShopsTable({
  shops,
  onEdit,
  onDelete,
  onToggleStatus,
}: ShopsTableProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[#136C34] border-b border-gray-100">
            <th className="py-3 px-5 font-medium text-lg text-lg">ហាង</th>
            <th className="py-3 px-5 font-medium text-lg">ការវាយតម្លៃ</th>
            <th className="py-3 px-5 font-medium text-lg">ម៉ោងបើក/បិទ</th>
            <th className="py-3 px-5 font-medium text-lg">ខេត្ត/ក្រុង</th>
            <th className="py-3 px-5 font-medium text-lg">អាសយដ្ឋាន</th>
            <th className="py-3 px-5 font-medium text-lg">លេខទូរស័ព្ទ</th>
            <th className="py-3 px-5 font-medium text-lg text-right">សកម្មភាព</th>
          </tr>
        </thead>
        <tbody>
          {shops.map((shop) => (
            <tr key={shop.id} className="border-b border-gray-50 last:border-0">
              <td className="py-3 px-5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg overflow-hidden bg-gray-100 shrink-0 relative">
                    <Image
                      src={shop.logo}
                      alt={shop.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <span className="text-gray-700">{shop.name}</span>
                </div>
              </td>
              <td className="py-3 px-5">
                <span className="flex items-center gap-1 text-gray-700">
                  <Star size={14} className="fill-yellow-400 text-yellow-400" />
                  {shop.rating}
                </span>
              </td>
              <td className="py-3 px-5 text-gray-500">
                {shop.openingHours} - {shop.closingHours}
              </td>
              <td className="py-3 px-5 text-gray-500">{shop.province}</td>
              <td className="py-3 px-5 text-gray-500 max-w-xs truncate">
                {shop.address}
              </td>
              <td className="py-3 px-5 text-gray-500">{shop.phone}</td>
              <td className="py-3 px-5">
                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={() => onToggleStatus(shop)}
                    title={shop.status === "banned" ? "ដកហាមឃាត់" : "ហាមឃាត់"}
                    className="text-red-400 hover:text-red-600"
                  >
                    <Ban size={16} />
                  </button>
                  <button
                    onClick={() => onEdit(shop)}
                    title="កែសម្រួល"
                    className="text-blue-400 hover:text-blue-600"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => onDelete(shop)}
                    title="លុប"
                    className="text-red-400 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}

          {shops.length === 0 && (
            <tr>
              <td colSpan={7} className="py-10 text-center text-gray-400">
                មិនមានទិន្នន័យ
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}