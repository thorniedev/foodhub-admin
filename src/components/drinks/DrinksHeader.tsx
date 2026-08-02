"use client";

import { Plus } from "lucide-react";
import Link from "next/link";

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
        <p className="text-5xl font-bold text-[#136C34]">ប្រភេទភេសជ្ជៈ</p>
        <p className="text-lg text-[#F97316] mt-3">
          កំពុងបង្ហាញប្រភេទភេសជ្ជៈ {filteredCount} ក្នុងចំណោម {total} ប្រភេទ
        </p>
      </div>

      <Link href={"/food-types/drinks/create"}>
        <button className="flex items-center gap-2 bg-[#136C34] hover:bg-emerald-700 text-white text-base font-medium px-4 py-2.5 rounded-full transition-colors">
          <Plus size={18} />
          បន្ថែមប្រភេទភេសជ្ជៈថ្មី
        </button>
      </Link>
    </div>
  );
}
