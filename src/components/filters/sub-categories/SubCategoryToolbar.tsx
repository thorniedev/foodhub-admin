"use client";

import { useRef, useEffect } from "react";
import {
  ArrowUpDown,
  Check,
  ChevronDown,
  RotateCcw,
  Search,
  SlidersHorizontal,
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
  showSuggestions: boolean;
  suggestions: FoodCategory[];
  totalCount: number;
  activeCount: number;
  inactiveCount: number;
  onSearchChange: (value: string) => void;
  onSearchFocus: () => void;
  onClearSearch: () => void;
  onSuggestionSelect: (item: FoodCategory) => void;
  onStatusFilterChange: (status: SubCategoryStatusFilter) => void;
  onSortModeChange: (sort: SubCategorySortMode) => void;
  onSizeChange: (size: number) => void;
  onToggleSortOpen: () => void;
  onToggleSizeOpen: () => void;
  onCloseDropdowns: () => void;
  onReset: () => void;
};

const SORT_LABELS: Record<SubCategorySortMode, string> = {
  A_Z: "ឈ្មោះ (A-Z)",
  Z_A: "ឈ្មោះ (Z-A)",
  NEWEST: "ថ្មីបំផុត",
  OLDEST: "ចាស់បំផុត",
};

export default function SubCategoryToolbar({
  mode,
  search,
  statusFilter,
  sortMode,
  size,
  sortOpen,
  sizeOpen,
  showSuggestions,
  suggestions,
  totalCount,
  activeCount,
  inactiveCount,
  onSearchChange,
  onSearchFocus,
  onClearSearch,
  onSuggestionSelect,
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
      ? "ស្វែងរកអនុប្រភេទភេសជ្ជៈ..."
      : "ស្វែងរកអនុប្រភេទម្ហូប...";

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
    <div
      ref={containerRef}
      className="flex flex-col gap-4 rounded-3xl bg-white p-4 shadow-sm sm:p-5"
    >
      {/* Top row: Search & Actions */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Search with autocomplete suggestions */}
        <div className="relative flex-1">
          <div className="relative flex items-center">
            <Search
              size={20}
              className="pointer-events-none absolute left-4 text-gray-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={onSearchFocus}
              placeholder={placeholder}
              className="h-[50px] w-full rounded-2xl border border-gray-200 bg-gray-50/50 pl-11 pr-10 text-base text-gray-800 transition focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10"
            />
            {search && (
              <button
                type="button"
                onClick={onClearSearch}
                className="absolute right-3 rounded-full p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Autocomplete suggestions dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full z-30 mt-2 max-h-64 overflow-y-auto rounded-2xl border border-gray-100 bg-white p-2 shadow-xl">
              {suggestions.map((item) => (
                <button
                  key={item.uuid}
                  type="button"
                  onClick={() => onSuggestionSelect(item)}
                  className="flex w-full items-center justify-between rounded-xl px-4 py-2.5 text-left text-sm text-gray-700 transition hover:bg-primary-50 hover:text-primary-800"
                >
                  <span className="font-semibold">{item.name}</span>
                  <span className="font-mono text-xs text-gray-400">
                    {item.code}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Controls: Sort & Size & Reset */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Sort Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={onToggleSortOpen}
              className="flex h-[50px] items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 text-base font-semibold text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-primary-500/10"
            >
              <ArrowUpDown size={18} className="text-gray-400" />
              <span>{SORT_LABELS[sortMode]}</span>
              <ChevronDown
                size={18}
                className={`text-gray-400 transition ${sortOpen ? "rotate-180" : ""}`}
              />
            </button>

            {sortOpen && (
              <div className="absolute right-0 top-full z-30 mt-2 w-48 rounded-2xl border border-gray-100 bg-white p-2 shadow-xl">
                {(Object.keys(SORT_LABELS) as SubCategorySortMode[]).map(
                  (key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        onSortModeChange(key);
                        onCloseDropdowns();
                      }}
                      className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-base transition ${
                        sortMode === key
                          ? "bg-primary-50 font-bold text-primary-800"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <span>{SORT_LABELS[key]}</span>
                      {sortMode === key && (
                        <Check size={18} className="text-primary-700" />
                      )}
                    </button>
                  ),
                )}
              </div>
            )}
          </div>

          {/* Size Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={onToggleSizeOpen}
              className="flex h-[50px] items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 text-base font-semibold text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-primary-500/10"
            >
              <SlidersHorizontal size={18} className="text-gray-400" />
              <span>{size} ជួរ</span>
              <ChevronDown
                size={18}
                className={`text-gray-400 transition ${sizeOpen ? "rotate-180" : ""}`}
              />
            </button>

            {sizeOpen && (
              <div className="absolute right-0 top-full z-30 mt-2 w-36 rounded-2xl border border-gray-100 bg-white p-2 shadow-xl">
                {[10, 20, 50, 100].map((pageSize) => (
                  <button
                    key={pageSize}
                    type="button"
                    onClick={() => {
                      onSizeChange(pageSize);
                      onCloseDropdowns();
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-base transition ${
                      size === pageSize
                        ? "bg-primary-50 font-bold text-primary-800"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span>{pageSize} ជួរ</span>
                    {size === pageSize && (
                      <Check size={18} className="text-primary-700" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Reset button */}
          <button
            type="button"
            onClick={onReset}
            title="កំណត់ឡើងវិញ"
            className="flex h-[50px] w-[50px] items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-500 transition hover:bg-gray-50 hover:text-gray-700 focus:outline-none focus:ring-4 focus:ring-primary-500/10"
          >
            <RotateCcw size={18} />
          </button>
        </div>
      </div>

      {/* Bottom row: Status Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3">
        <TabButton
          active={statusFilter === "ALL"}
          label="ទាំងអស់"
          count={totalCount}
          onClick={() => onStatusFilterChange("ALL")}
        />
        <TabButton
          active={statusFilter === "ACTIVE"}
          label="សកម្ម"
          count={activeCount}
          onClick={() => onStatusFilterChange("ACTIVE")}
        />
        <TabButton
          active={statusFilter === "INACTIVE"}
          label="អសកម្ម"
          count={inactiveCount}
          onClick={() => onStatusFilterChange("INACTIVE")}
        />
      </div>
    </div>
  );
}

function TabButton({
  active,
  label,
  count,
  onClick,
}: {
  active: boolean;
  label: string;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition ${
        active
          ? "bg-primary-800 text-white shadow-sm"
          : "bg-gray-100/70 text-gray-600 hover:bg-gray-200/70"
      }`}
    >
      <span>{label}</span>
      <span
        className={`rounded-lg px-2 py-0.5 text-xs font-black ${
          active
            ? "bg-white/20 text-white"
            : "bg-gray-200 text-gray-600"
        }`}
      >
        {count}
      </span>
    </button>
  );
}
