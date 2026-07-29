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
        <h1 className="text-2xl font-bold text-gray-800">ប្រភេទចំណីអាហារ</h1>
        <p className="text-sm text-gray-500 mt-1">
          កំពុងបង្ហាញប្រភេទចំណីអាហារ {filteredCount} ក្នុងចំណោម {total} ប្រភេទ
        </p>
      </div>

      <button
        onClick={onAddNew}
        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
      >
        <Plus size={18} />
        បន្ថែមប្រភេទចំណីអាហារថ្មី
      </button>
    </div>
  );
}