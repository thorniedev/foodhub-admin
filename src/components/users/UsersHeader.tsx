"use client";

import { Plus } from "lucide-react";

interface UsersHeaderProps {
  total: number;
  filteredCount?: number;
  onAddNew: () => void;
}

export default function UsersHeader({
  total,
  filteredCount,
  onAddNew,
}: UsersHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">អ្នកប្រើប្រាស់</h1>
        <p className="text-sm text-gray-500 mt-1">
          កំពុងបង្ហាញអ្នកប្រើប្រាស់ {filteredCount ?? total} ក្នុងចំណោម {total} នាក់
        </p>
      </div>

      <button
        onClick={onAddNew}
        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
      >
        <Plus size={18} />
        បន្ថែមអ្នកប្រើប្រាស់ថ្មី
      </button>
    </div>
  );
}