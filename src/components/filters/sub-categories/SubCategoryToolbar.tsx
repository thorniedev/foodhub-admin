"use client";

import { useRef, useEffect } from "react";
import {
  ArrowUpDown,
  Check,
  ChevronDown,
  RotateCcw,
  Search,
  X,
} from "lucide-react";
import type { FoodCategory } from "@/src/types/foodCategory";

export type SubCategorySortMode = "A_Z" | "Z_A" | "NEWEST" | "OLDEST";
export type SubCategoryStatusFilter = "ALL" | "ACTIVE" | "INACTIVE";

type Props = {
  mode: "FOOD" | "DRINK";
  search: string;
  statusFilter: SubCategoryStatusFilter;
  sortMode: SubCategorySortMode;
  size: number;
  sortOpen: boolean;
  sizeOpen: boolean;
  totalCount: number;
  activeCount: number;
  inactiveCount: number;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
  onStatusFilterChange: (status: SubCategoryStatusFilter) => void;
  onSortModeChange: (sort: SubCategorySortMode) => void;
  onSizeChange: (size: number) => void;
  onToggleSortOpen: () => void;
  onToggleSizeOpen: () => void;
  onCloseDropdowns: () => void;
  onReset: () => void;
};

const SORT_LABELS: Record<SubCategorySortMode, string> = {
  NEWEST: "ថ្មីបំផុត",
  OLDEST: "ចាស់បំផុត",
  A_Z: "ឈ្មោះ (A-Z)",
  Z_A: "ឈ្មោះ (Z-A)",
};

const TABS: Array<{
  value: SubCategoryStatusFilter;
  label: string;
}> = [
  { value: "ALL", label: "ទាំងអស់" },
  { value: "ACTIVE", label: "សកម្ម" },
  { value: "INACTIVE", label: "អសកម្ម" },
];

export default function SubCategoryToolbar({
  mode,
  search,
  statusFilter,
  sortMode,
  size,
  sortOpen,
  sizeOpen,
  totalCount,
  activeCount,
  inactiveCount,
  onSearchChange,
  onClearSearch,
  onStatusFilterChange,
  onSortModeChange,
  onSizeChange,
  onToggleSortOpen,
  onToggleSizeOpen,
  onCloseDropdowns,
  onReset,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const placeholder =
    mode === "DRINK"
      ? "ស្វែងរកភេសជ្ជៈ (ឈ្មោះ, កូដ)..."
      : "ស្វែងរកម្ហូប (ឈ្មោះ, កូដ)...";

  const counts: Record<SubCategoryStatusFilter, number> = {
    ALL: totalCount,
    ACTIVE: activeCount,
    INACTIVE: inactiveCount,
  };

  const hasActiveFilters = Boolean(
    search.trim() || statusFilter !== "ALL" || sortMode !== "NEWEST" || size !== 20,
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        onCloseDropdowns();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onCloseDropdowns]);

  return (
    <div ref={containerRef} className="flex w-full flex-wrap items-center justify-between gap-3">
      {/* Status Tabs (Left) */}
      <div className="flex flex-wrap items-center gap-2">
        {TABS.map((tab) => {
          const active = tab.value === statusFilter;

          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => onStatusFilterChange(tab.value)}
              className={`group relative inline-flex h-12 cursor-pointer items-center gap-2.5 rounded-full px-5 text-lg font-normal transition-all duration-200 ease-out active:scale-95 ${
                active
                  ? "border border-primary-800 bg-primary-800 text-white shadow-md shadow-primary-900/15"
                  : "border border-gray-200 bg-white text-gray-700 hover:border-primary-300 hover:bg-gray-50/80 hover:text-gray-900"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`flex h-7 min-w-7 items-center justify-center rounded-full px-2.5 text-lg font-normal transition-colors duration-200 ${
                  active
                    ? "bg-white/20 text-white backdrop-blur-xs"
                    : "bg-gray-100 text-gray-600 group-hover:bg-primary-50 group-hover:text-primary-800"
                }`}
              >
                {counts[tab.value]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Controls (Right): Search + Sort + Page Size + Reset */}
      <div className="flex min-w-[320px] flex-1 flex-wrap items-center justify-end gap-2.5">
        {/* Search Input */}
        <div className="relative min-w-[220px] max-w-[360px] flex-1">
          <Search
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={placeholder}
            className="h-12 w-full rounded-full border border-gray-200 bg-white py-2 pl-11 pr-10 text-lg text-gray-700 outline-none transition focus:border-primary-600 focus:ring-2 focus:ring-primary-100"
          />
          {search && (
            <button
              type="button"
              onClick={onClearSearch}
              className="absolute right-3 top-1/2 z-10 -translate-y-1/2 text-gray-400 transition hover:text-gray-700"
              aria-label="Clear search"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Page Size Select */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={onToggleSizeOpen}
            className={`flex h-12 min-w-[140px] items-center justify-between gap-2.5 rounded-full border bg-white px-4 text-lg font-normal transition ${
              sizeOpen
                ? "border-primary-600 ring-2 ring-primary-100"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <span className="text-gray-700">{size} / ទំព័រ</span>
            <ChevronDown
              size={18}
              className={`text-gray-400 transition-transform duration-200 ${
                sizeOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {sizeOpen && (
            <div className="absolute right-0 top-[52px] z-[110] w-[180px] rounded-2xl border border-gray-100 bg-white p-2 shadow-xl">
              <p className="px-3 pb-2 pt-1 text-lg text-secondary-600">
                ទំហំទំព័រ
              </p>
              {[10, 20, 50, 100].map((value) => {
                const selected = size === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      onSizeChange(value);
                      onCloseDropdowns();
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-lg font-normal transition ${
                      selected
                        ? "bg-primary-50 text-primary-800"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span>{value} / ទំព័រ</span>
                    {selected && (
                      <Check size={18} className="text-primary-800" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Sort Dropdown */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={onToggleSortOpen}
            className={`flex h-12 w-12 items-center justify-center rounded-full border transition ${
              sortOpen
                ? "border-primary-800 bg-primary-50 text-primary-800"
                : "border-gray-200 bg-white text-gray-600 hover:border-primary-800 hover:bg-primary-50 hover:text-primary-800"
            }`}
            title="តម្រៀប"
          >
            <ArrowUpDown size={18} />
          </button>

          {sortOpen && (
            <div className="absolute right-0 top-[52px] z-[110] w-[200px] rounded-2xl border border-gray-100 bg-white p-2 shadow-xl">
              <p className="px-3 pb-2 pt-1 text-lg font-normal text-secondary-600">
                តម្រៀប
              </p>
              {(Object.keys(SORT_LABELS) as SubCategorySortMode[]).map((key) => {
                const selected = sortMode === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      onSortModeChange(key);
                      onCloseDropdowns();
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-lg font-normal transition ${
                      selected
                        ? "bg-primary-50 text-primary-800"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span>{SORT_LABELS[key]}</span>
                    {selected && (
                      <Check size={18} className="text-primary-800" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Reset Filters Button */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 active:scale-95"
            title="កំណត់ឡើងវិញ"
          >
            <RotateCcw size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
