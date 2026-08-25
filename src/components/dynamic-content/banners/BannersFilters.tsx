"use client";

import { Search } from "lucide-react";
import {
  BANNER_CATEGORIES,
  BANNER_CATEGORY_LABELS,
  BannerCategory,
} from "../../../types/banner";

export type PublishedFilter = "ALL" | "PUBLISHED" | "UNPUBLISHED";

interface BannersFiltersProps {
  category: BannerCategory | "ALL";
  onCategoryChange: (category: BannerCategory | "ALL") => void;
  published: PublishedFilter;
  onPublishedChange: (value: PublishedFilter) => void;
  search: string;
  onSearchChange: (value: string) => void;
}

const PUBLISHED_LABELS: Record<PublishedFilter, string> = {
  ALL: "ស្ថានភាពទាំងអស់",
  PUBLISHED: "បានបង្ហាញ",
  UNPUBLISHED: "មិនទាន់បង្ហាញ",
};

export default function BannersFilters({
  category,
  onCategoryChange,
  published,
  onPublishedChange,
  search,
  onSearchChange,
}: BannersFiltersProps) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 -mx-1 px-1">
        <button
          onClick={() => onCategoryChange("ALL")}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${category === "ALL"
              ? "bg-[#136C34] text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
        >
          ទាំងអស់
        </button>
        {BANNER_CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => onCategoryChange(c)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${category === c
                ? "bg-[#136C34] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
          >
            {BANNER_CATEGORY_LABELS[c]}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <select
          value={published}
          onChange={(e) => onPublishedChange(e.target.value as PublishedFilter)}
          className="h-10 rounded-full border border-gray-200 bg-white px-4 text-sm text-gray-600 outline-none focus:border-[#136C34] focus:ring-2 focus:ring-[#136C34]/10"
        >
          {(Object.keys(PUBLISHED_LABELS) as PublishedFilter[]).map((key) => (
            <option key={key} value={key}>
              {PUBLISHED_LABELS[key]}
            </option>
          ))}
        </select>

        <div className="relative w-full sm:w-64 shrink-0">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="ស្វែងរកតាមចំណងជើង..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>
    </div>
  );
}
