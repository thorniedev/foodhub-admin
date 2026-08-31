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
        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-[#136C34]">
          ប្រភេទភេសជ្ជៈ
        </h1>
        <p className="text-lg sm:text-xl text-[#F97316] mt-2 sm:mt-3">
          កំពុងបង្ហាញប្រភេទភេសជ្ជៈ {filteredCount} ក្នុងចំណោម {total} ប្រភេទ
        </p>
      </div>

      <Link href={"/food-types/drinks/create"} className="w-full sm:w-auto">
        <button className="flex items-center justify-center gap-2 bg-[#136C34] hover:bg-emerald-700 text-white text-lg font-bold px-5 py-3 rounded-full transition-colors w-full sm:w-auto shadow-sm">
          <Plus size={20} />
          បន្ថែមប្រភេទភេសជ្ជៈថ្មី
        </button>
      </Link>
    </div>
  );
}