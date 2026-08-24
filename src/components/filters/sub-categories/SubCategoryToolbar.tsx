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
      className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between"
    >
      {/* Left: Status Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
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

      {/* Right: Search & Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center xl:justify-end">
        {/* Search with autocomplete suggestions */}
        <div className="relative min-w-0 flex-1 sm:w-[380px]">
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
              className="h-[52px] w-full rounded-full border border-gray-200 bg-white pl-11 pr-10 text-lg text-gray-800 transition focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/10"
            />
            {search && (
              <button
                type="button"
                onClick={onClearSearch}
                className="absolute right-3 rounded-full p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Autocomplete suggestions dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-[60px] z-30 max-h-64 overflow-y-auto rounded-2xl border border-gray-100 bg-white p-2 shadow-xl">
              {suggestions.map((item) => (
                <button
                  key={item.uuid}
                  type="button"
                  onClick={() => onSuggestionSelect(item)}
                  className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-lg text-gray-700 transition hover:bg-primary-50 hover:text-primary-800"
                >
                  <span className="font-semibold">{item.name}</span>
                  <span className="font-mono text-lg text-gray-400">
                    {item.code}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Controls: Sort & Size & Reset */}
        <div className="flex items-center gap-2.5">
          {/* Sort Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={onToggleSortOpen}
              className="flex h-[52px] items-center gap-2 rounded-full border border-gray-200 bg-white px-4 text-lg font-medium text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-primary-500/10"
            >
              <ArrowUpDown size={18} className="text-gray-400" />
              <span>{SORT_LABELS[sortMode]}</span>
              <ChevronDown
                size={16}
                className={`text-gray-400 transition-transform ${
                  sortOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {sortOpen && (
              <div className="absolute right-0 top-[60px] z-30 w-48 rounded-2xl border border-gray-100 bg-white p-1.5 shadow-xl">
                {(Object.keys(SORT_LABELS) as SubCategorySortMode[]).map(
                  (key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        onSortModeChange(key);
                        onCloseDropdowns();
                      }}
                      className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-lg transition ${
                        sortMode === key
                          ? "bg-primary-50 font-medium text-primary-800"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <span>{SORT_LABELS[key]}</span>
                      {sortMode === key && (
                        <Check size={16} className="text-primary-800" />
                      )}
                    </button>
                  ),
                )}
              </div>
            )}
          </div>

          {/* Page Size Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={onToggleSizeOpen}
              className="flex h-[52px] items-center gap-2 rounded-full border border-gray-200 bg-white px-4 text-lg font-medium text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-primary-500/10"
            >
              <span>{size} / ទំព័រ</span>
              <ChevronDown
                size={16}
                className={`text-gray-400 transition-transform ${
                  sizeOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {sizeOpen && (
              <div className="absolute right-0 top-[60px] z-30 w-36 rounded-2xl border border-gray-100 bg-white p-1.5 shadow-xl">
                {[10, 20, 50, 100].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      onSizeChange(s);
                      onCloseDropdowns();
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-lg transition ${
                      size === s
                        ? "bg-primary-50 font-medium text-primary-800"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <span>{s} / ទំព័រ</span>
                    {size === s && (
                      <Check size={16} className="text-primary-800" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Reset Button */}
          <button
            type="button"
            onClick={onReset}
            title="កំណត់ឡើងវិញ"
            className="flex h-[52px] w-[52px] items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition hover:bg-gray-50 hover:text-gray-700 focus:outline-none focus:ring-4 focus:ring-primary-500/10"
          >
            <RotateCcw size={20} />
          </button>
        </div>
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
      className={`inline-flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-lg font-medium transition-all duration-200 ${
        active
          ? "bg-primary-800 text-white"
          : "bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50 hover:text-gray-900"
      }`}
    >
      <span>{label}</span>
      <span
        className={`flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-lg font-normal ${
          active
            ? "bg-white/20 text-white"
            : "bg-gray-100 text-gray-600"
        }`}
      >
        {count}
      </span>
    </button>
  );
}
