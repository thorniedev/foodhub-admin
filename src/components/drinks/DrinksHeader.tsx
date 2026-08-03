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
    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
      <div>
        <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#136C34]">
          ប្រភេទភេសជ្ជៈ
        </p>
        <p className="text-sm sm:text-base lg:text-lg text-[#F97316] mt-2 sm:mt-3">
          កំពុងបង្ហាញប្រភេទភេសជ្ជៈ {filteredCount} ក្នុងចំណោម {total} ប្រភេទ
        </p>
      </div>

      <Link href={"/food-types/drinks/create"} className="w-full sm:w-auto">
        <button className="flex items-center justify-center gap-2 bg-[#136C34] hover:bg-emerald-700 text-white text-sm sm:text-base font-medium px-4 py-2.5 rounded-full transition-colors w-full sm:w-auto">
          <Plus size={18} />
          បន្ថែមប្រភេទភេសជ្ជៈថ្មី
        </button>
      </Link>
    </div>
  );
}