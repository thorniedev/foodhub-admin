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
        <p className="text-5xl font-bold text-[#136C34]">អ្នកប្រើប្រាស់</p>
        <p className="text-lg text-[#F97316] mt-3">
          កំពុងបង្ហាញអ្នកប្រើប្រាស់ {filteredCount ?? total} ក្នុងចំណោម {total} នាក់
        </p>
      </div>

      {/* <button
        onClick={onAddNew}
        className="flex items-center gap-2 bg-[#136C34] hover:bg-[#136C34] text-white text-base font-medium px-4 py-2.5 rounded-full transition-colors"
      >
        <Plus size={18} />
        បន្ថែមអ្នកប្រើប្រាស់ថ្មី
      </button> */}
    </div>
  );
}