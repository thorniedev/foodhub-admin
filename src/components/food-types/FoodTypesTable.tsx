"use client";

import Image from "next/image";
import { Ban, Pencil, Star, Trash2 } from "lucide-react";
import { FoodType } from "../../types/foodType";
// import { FoodType } from "@/types/foodType";

interface FoodTypesTableProps {
  data: FoodType[];
  onEdit: (item: FoodType) => void;
  onDelete: (item: FoodType) => void;
  onToggleStatus: (item: FoodType) => void;
}

const DIET_LABEL: Record<FoodType["dietType"], string> = {
  halal: "ហាឡាល់",
  vegetarian: "បួស",
  vegan: "វេហ្គិន",
  normal: "ធម្មតា",
};

const MEAL_LABEL: Record<FoodType["mealTime"], string> = {
  breakfast: "ព្រឹក",
  lunch: "ថ្ងៃត្រង់",
  evening: "ល្ងាច",
};

export default function FoodTypesTable({
  data,
  onEdit,
  onDelete,
  onToggleStatus,
}: FoodTypesTableProps) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 text-left text-[#136C34]">
            <th className="py-3 px-4 font-medium text-lg">
              លេខសម្គាល់និងឈ្មោះចំណីអាហារ
            </th>
            <th className="py-3 px-4 font-medium text-lg">ឈ្មោះហាង</th>
            <th className="py-3 px-4 font-medium text-lg">ការវាយតម្លៃ</th>
            <th className="py-3 px-4 font-medium text-lg">របបអាហារ</th>
            <th className="py-3 px-4 font-medium text-lg">ពេលវេលា</th>
            <th className="py-3 px-4 font-medium text-lg">ចម្ងាយ</th>
            <th className="py-3 px-4 font-medium text-lg">ទំហំ</th>
            <th className="py-3 px-4 font-medium text-lg">ការពិពណ៌នា</th>
            <th className="py-3 px-4 font-medium text-right text-lg">សកម្មភាព</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr
              key={item.id}
              className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50"
            >
              <td className="py-3 px-4">
                <div className="flex items-center gap-3">
                  <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="44px"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{item.name}</p>
                    <p className="text-xs text-gray-400">{item.id}</p>
                  </div>
                </div>
              </td>
              <td className="py-3 px-4 text-gray-600">{item.shopName}</td>
              <td className="py-3 px-4">
                <span className="flex items-center gap-1 text-amber-500 font-medium">
                  <Star size={14} className="fill-amber-500" />
                  {item.rating}
                </span>
              </td>
              <td className="py-3 px-4">
                <span className="bg-emerald-50 text-emerald-600 text-xs font-medium px-2.5 py-1 rounded-full">
                  {DIET_LABEL[item.dietType]}
                </span>
              </td>
              <td className="py-3 px-4 text-gray-600">
                {MEAL_LABEL[item.mealTime]}
              </td>
              <td className="py-3 px-4 text-gray-600">{item.distance}</td>
              <td className="py-3 px-4 text-gray-600">{item.portionSize}</td>
              <td className="py-3 px-4 text-gray-500 max-w-xs truncate">
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