"use client";

import Image from "next/image";
import { Ban, Pencil, Trash2 } from "lucide-react";
import { Drink } from "../../types/drink";

interface DrinksTableProps {
  data: Drink[];
  onEdit: (item: Drink) => void;
  onDelete: (item: Drink) => void;
  onToggleStatus: (item: Drink) => void;
}

const TYPE_LABEL: Record<Drink["drinkType"], string> = {
  hot: "ក្តៅ",
  cold: "ត្រជាក់",
  juice: "ទឹកផ្លែឈើ",
  other: "ផ្សេងៗ",
};

export default function DrinksTable({
  data,
  onEdit,
  onDelete,
  onToggleStatus,
}: DrinksTableProps) {
  return (
    <div className="bg-white border border-gray-100 rounded-3xl overflow-x-auto">
      <table className="w-full text-lg font-normal min-w-[900px]">
        <thead>
          <tr className="border-b border-gray-100 text-left text-lg font-normal text-primary-800 bg-gray-50/70">
            <th className="py-3.5 px-4 font-normal">លេខសម្គាល់និងឈ្មោះភេសជ្ជៈ</th>
            <th className="py-3.5 px-4 font-normal">ឈ្មោះហាង</th>
            <th className="py-3.5 px-4 font-normal">ប្រភេទ</th>
            <th className="py-3.5 px-4 font-normal">កម្រិតជាតិស្ករ</th>
            <th className="py-3.5 px-4 font-normal">ចម្ងាយ</th>
            <th className="py-3.5 px-4 font-normal">ពេលវេលា</th>
            <th className="py-3.5 px-4 font-normal">ការពិពណ៌នា</th>
            <th className="py-3.5 px-4 font-normal text-right">សកម្មភាព</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr
              key={item.id}
              className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50"
            >
              <td className="py-3.5 px-4">
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-2xl overflow-hidden bg-gray-100 shrink-0">
                    <Image
                      src={item.image || "/Image/fallback.png"}
                      alt={item.name}
                      className="object-cover"
                      width={48}
                      height={48}
                    />
                  </div>
                  <div>
                    <p className="text-lg font-normal text-gray-800">{item.name}</p>
                    <p className="text-sm font-normal text-gray-400">{item.id}</p>
                  </div>
                </div>
              </td>
              <td className="py-3.5 px-4 text-lg font-normal text-gray-700">{item.shopName}</td>
              <td className="py-3.5 px-4">
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-lg font-normal px-3 py-1 rounded-full">
                  {TYPE_LABEL[item.drinkType]}
                </span>
              </td>
              <td className="py-3.5 px-4 text-lg font-normal text-gray-700">{item.sugarLevel}</td>
              <td className="py-3.5 px-4 text-lg font-normal text-gray-700">{item.distance}</td>
              <td className="py-3.5 px-4 text-lg font-normal text-gray-700">{item.portionSize}</td>
              <td className="py-3.5 px-4 text-lg font-normal text-gray-500 max-w-xs truncate">
                {item.description}
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => onToggleStatus(item)}
                    title={item.status === "active" ? "បិទ" : "បើក"}
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
              <td colSpan={8} className="py-10 text-center text-[#F97316]">
                មិនមានទិន្នន័យ
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}