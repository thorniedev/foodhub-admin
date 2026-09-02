"use client";

import Link from "next/link";
import { Plus } from "lucide-react";

interface MenuItemsHeaderProps {
  title: string;
  total: number;
  filteredCount: number;
  addHref: string;
  addLabel: string;
}

export default function MenuItemsHeader({
  title,
  total,
  filteredCount,
  addHref,
  addLabel,
}: MenuItemsHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
      <div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#136C34]">
          {title}
        </h1>
        <p className="text-lg sm:text-xl text-[#F97316] mt-2 sm:mt-3">
          កំពុងបង្ហាញ {filteredCount} ក្នុងចំណោម {total}
        </p>
      </div>

      <Link href={addHref} className="w-full sm:w-auto">
        <button
          type="button"
          className="flex items-center justify-center gap-2 bg-[#136C34] hover:bg-emerald-700 text-white text-lg font-normal px-5 py-3 rounded-full transition-colors w-full sm:w-auto shadow-sm"
        >
          <Plus size={20} />
          {addLabel}
        </button>
      </Link>
    </div>
  );
}