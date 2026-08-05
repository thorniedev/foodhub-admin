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
        <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#136C34]">{title}</p>
        <p className="text-sm sm:text-base lg:text-lg text-[#F97316] mt-2 sm:mt-3">
          កំពុងបង្ហាញ {filteredCount} ក្នុងចំណោម {total}
        </p>
      </div>

      <Link href={addHref} className="w-full sm:w-auto">
        <button className="flex items-center justify-center gap-2 bg-[#136C34] hover:bg-emerald-700 text-white text-sm sm:text-base font-medium px-4 py-2.5 rounded-full transition-colors w-full sm:w-auto">
          <Plus size={18} />
          {addLabel}
        </button>
      </Link>
    </div>
  );
}