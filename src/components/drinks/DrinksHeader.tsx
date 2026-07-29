"use client";

import { Plus } from "lucide-react";

interface DrinksHeaderProps {
  total: number;
  filteredCount: number;
  onAddNew: () => void;
}

export default function DrinksHeader({
  total,
  filteredCount,
  onAddNew,
}: DrinksHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">ប្រភេទភេសជ្ជៈ</h1>
        <p className="text-sm text-gray-500 mt-1">
          កំពុងបង្ហាញប្រភេទភេសជ្ជៈ {filteredCount} ក្នុងចំណោម {total} ប្រភេទ
        </p>
      </div>

      <button
        onClick={onAddNew}
        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
      >
        <Plus size={18} />
        បន្ថែមប្រភេទភេសជ្ជៈថ្មី
      </button>
    </div>
  );
}