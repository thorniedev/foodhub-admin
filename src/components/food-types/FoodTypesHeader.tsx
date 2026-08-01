"use client";

import { Plus } from "lucide-react";

interface FoodTypesHeaderProps {
  total: number;
  filteredCount: number;
  search: string;
  onSearchChange: (value: string) => void;
  onAddNew: () => void;
}

export default function FoodTypesHeader({
  total,
  filteredCount,
  search,
  onSearchChange,
  onAddNew,
}: FoodTypesHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <p className="text-5xl font-bold text-[#136C34]">ប្រភេទចំណីអាហារ</p>
        <p className="text-lg text-[#F97316] mt-3">
          កំពុងបង្ហាញប្រភេទចំណីអាហារ {filteredCount} ក្នុងចំណោម {total} ប្រភេទ
        </p>
      </div>

      <button
        onClick={onAddNew}
        className="flex items-center gap-2 bg-[#136C34] hover:bg-emerald-700 text-white text-base font-medium px-4 py-2.5 rounded-full transition-colors"
      >
        <Plus size={18} />
        បន្ថែមប្រភេទចំណីអាហារថ្មី
      </button>
    </div>
  );
}
