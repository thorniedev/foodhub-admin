"use client";

import { ArrowDownAZ, ArrowUpAZ, Search } from "lucide-react";
import { SortDirection } from "../../../types/dynamicContent";

interface DynamicContentSearchSortProps {
  search: string;
  onSearchChange: (value: string) => void;
  sortDirection: SortDirection;
  onToggleSort: () => void;
}

export default function DynamicContentSearchSort({
  search,
  onSearchChange,
  sortDirection,
  onToggleSort,
}: DynamicContentSearchSortProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-4">
      <div className="relative flex-1">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="ស្វែងរកជម្រើសក្នុងក្រុមនេះ..."
          className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <button
        onClick={onToggleSort}
        className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 shrink-0"
      >
        {sortDirection === "asc" ? <ArrowDownAZ size={16} /> : <ArrowUpAZ size={16} />}
        តម្រៀប {sortDirection === "asc" ? "ក-អ" : "អ-ក"}
      </button>
    </div>
  );
}