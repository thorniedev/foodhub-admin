"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowUpDown,
  Check,
  ChevronDown,
  Search,
  X,
} from "lucide-react";
import type { WeatherCondition } from "@/src/types/weather-condition";

export type StatusFilter = "ALL" | "ACTIVE" | "INACTIVE";
export type SortMode = "A_Z" | "Z_A" | "NEWEST" | "OLDEST";

interface Props {
  search: string;
  statusFilter: StatusFilter;
  sortMode: SortMode;
  size: number;
  totalCount: number;
  activeCount: number;
  inactiveCount: number;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
  onStatusChange: (value: StatusFilter) => void;
  onSortChange: (value: SortMode) => void;
  onSizeChange: (value: number) => void;
}

const sortOptions: Array<{ value: SortMode; label: string }> = [
  {
    value: "A_Z",
    label: "A → Z",
  },
  {
    value: "Z_A",
    label: "Z → A",
  },
  {
    value: "NEWEST",
    label: "ថ្មីបំផុត",
  },
  {
    value: "OLDEST",
    label: "ចាស់បំផុត",
  },
];

export default function WeatherConditionToolbar({
  search,
  statusFilter,
  sortMode,
  size,
  totalCount,
  activeCount,
  inactiveCount,
  onSearchChange,
  onClearSearch,
  onStatusChange,
  onSortChange,
  onSizeChange,
}: Props) {
  const [sortOpen, setSortOpen] = useState(false);
  const [sizeOpen, setSizeOpen] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const sizeContainerRef = useRef<HTMLDivElement>(null);
  const sortContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        sizeContainerRef.current &&
        !sizeContainerRef.current.contains(target)
      ) {
        setSizeOpen(false);
      }
      if (
        sortContainerRef.current &&
        !sortContainerRef.current.contains(target)
      ) {
        setSortOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const statusTabs = [
    {
      value: "ALL" as const,
      label: "ទាំងអស់",
      count: totalCount,
    },
    {
      value: "ACTIVE" as const,
      label: "សកម្ម",
      count: activeCount,
    },
    {
      value: "INACTIVE" as const,
      label: "អសកម្ម",
      count: inactiveCount,
    },
  ];

  return (
    <section className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Mobile 2x2 Grid: 3 Tabs + Controls in Slot 4 */}
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-2 w-full sm:w-auto">
          {statusTabs.map((tab) => {
            const active = statusFilter === tab.value;

            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => onStatusChange(tab.value)}
                className={`flex w-full sm:w-auto h-12 cursor-pointer items-center justify-between sm:justify-start gap-2 sm:gap-2.5 rounded-full px-4 sm:px-5 text-lg font-normal transition-all duration-200 ease-out active:scale-95 ${
                  active
                    ? "border border-primary-800 bg-primary-800 text-white shadow-md shadow-primary-900/15"
                    : "border border-gray-200 bg-white text-gray-700 hover:border-primary-300 hover:bg-gray-50/80 hover:text-gray-900"
                }`}
              >
                <span className="truncate">{tab.label}</span>

                <span
                  className={`flex h-7 min-w-7 shrink-0 items-center justify-center rounded-full px-2 text-base sm:text-lg font-normal transition-colors duration-200 ${
                    active
                      ? "bg-white/20 text-white backdrop-blur-xs"
                      : "bg-gray-100 text-gray-600 group-hover:bg-primary-50 group-hover:text-primary-800"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}

          {/* Slot 4 on Mobile: Page Size + Sort */}
          <div className="flex sm:hidden items-center gap-1.5 w-full">
            {/* Page Size */}
            <div ref={sizeContainerRef} className="relative flex-1 min-w-0">
              <button
                type="button"
                onClick={() => {
                  setSizeOpen((prev) => !prev);
                  setSortOpen(false);
                }}
                className="flex h-12 w-full items-center justify-between gap-1.5 rounded-full border border-gray-200 bg-white px-3 text-lg font-normal text-gray-700 transition hover:border-primary-200 hover:bg-primary-50"
              >
                <span className="truncate">{size} / ទំព័រ</span>
                <ChevronDown size={18} className="shrink-0" />
              </button>

              {sizeOpen && (
                <div className="absolute right-0 top-[52px] z-[100] w-[180px] rounded-2xl border border-gray-100 bg-white p-2 shadow-xl">
                  <p className="px-3 pb-2 pt-1 text-base text-secondary-600">
                    ទំហំទំព័រ
                  </p>
                  {[10, 20, 50].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => {
                        onSizeChange(value);
                        setSizeOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-lg transition ${
                        size === value
                          ? "bg-primary-50 font-normal text-primary-800"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <span>{value} / ទំព័រ</span>
                      {size === value && <Check size={18} />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sort */}
            <div ref={sortContainerRef} className="relative shrink-0">
              <button
                type="button"
                onClick={() => {
                  setSortOpen((prev) => !prev);
                  setSizeOpen(false);
                }}
                aria-label="Sort"
                title="តម្រៀប"
                className={`flex h-12 w-12 items-center justify-center rounded-full border transition ${
                  sortOpen
                    ? "border-primary-800 bg-primary-50 text-primary-800"
                    : "border-gray-200 bg-white text-gray-600 hover:border-primary-800 hover:bg-primary-50 hover:text-primary-800"
                }`}
              >
                <ArrowUpDown size={18} />
              </button>

              {sortOpen && (
                <div className="absolute right-0 top-[52px] z-[100] w-[190px] rounded-2xl border border-gray-100 bg-white p-2 shadow-xl">
                  <p className="px-3 pb-2 pt-1 text-base text-secondary-600">
                    តម្រៀប
                  </p>

                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        onSortChange(option.value);
                        setSortOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-lg transition ${
                        sortMode === option.value
                          ? "bg-primary-50 text-primary-800"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <span>{option.label}</span>
                      {sortMode === option.value && (
                        <Check size={16} className="text-primary-800" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Search + controls */}
        <div className="hidden sm:flex sm:min-w-[320px] sm:flex-1 sm:items-center sm:justify-end sm:gap-2.5">
          {/* Search input */}
          <div
            ref={searchContainerRef}
            className="relative min-w-[220px] max-w-[360px] flex-1"
          >
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              value={search}
              onChange={(event) => {
                const value = event.target.value;
                onSearchChange(value);
              }}
              placeholder="ស្វែងរក ស្ថានភាពអាកាសធាតុ..."
              className="h-12 w-full rounded-full border border-gray-200 bg-white pl-11 pr-10 text-lg font-normal text-gray-700 outline-none transition focus:border-primary-600 focus:ring-2 focus:ring-primary-100"
            />

            {search && (
              <button
                type="button"
                onClick={() => {
                  onClearSearch();
                }}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 cursor-pointer"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Page size */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => {
                setSizeOpen((prev) => !prev);
                setSortOpen(false);
              }}
              className="flex h-12 min-w-[140px] items-center justify-between gap-2.5 rounded-full border border-gray-200 bg-white px-4 text-lg font-normal text-gray-700 transition hover:border-gray-300"
            >
              <span>{size} / ទំព័រ</span>
              <ChevronDown size={18} />
            </button>

            {sizeOpen && (
              <div className="absolute right-0 top-[52px] z-[100] w-[180px] rounded-2xl border border-gray-100 bg-white p-2 shadow-xl">
                <p className="px-3 pb-2 pt-1 text-base text-secondary-600">
                  ទំហំទំព័រ
                </p>
                {[10, 20, 50].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      onSizeChange(value);
                      setSizeOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-lg font-normal transition ${
                      size === value
                        ? "bg-primary-50 text-primary-800"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span>{value} / ទំព័រ</span>
                    {size === value && <Check size={18} />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sort */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => {
                setSortOpen((prev) => !prev);
                setSizeOpen(false);
              }}
              aria-label="Sort"
              title="តម្រៀប"
              className={`flex h-12 w-12 items-center justify-center rounded-full border transition ${
                sortOpen
                  ? "border-primary-800 bg-primary-50 text-primary-800"
                  : "border-gray-200 bg-white text-gray-600 hover:border-primary-800 hover:bg-primary-50 hover:text-primary-800"
              }`}
            >
              <ArrowUpDown size={18} />
            </button>

            {sortOpen && (
              <div className="absolute right-0 top-[52px] z-[100] w-[190px] rounded-2xl border border-gray-100 bg-white p-2 shadow-xl">
                <p className="px-3 pb-2 pt-1 text-base text-secondary-600">
                  តម្រៀប
                </p>

                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onSortChange(option.value);
                      setSortOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-lg font-normal transition ${
                      sortMode === option.value
                        ? "bg-primary-50 text-primary-800"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span>{option.label}</span>
                    {sortMode === option.value && (
                      <Check size={18} className="text-primary-800" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search Bar (Full Width Row) */}
      <div className="relative sm:hidden w-full">
        <Search
          size={18}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <input
          value={search}
          onChange={(event) => {
            const value = event.target.value;
            onSearchChange(value);
          }}
          placeholder="ស្វែងរក ស្ថានភាពអាកាសធាតុ..."
          className="h-12 w-full rounded-full border border-gray-200 bg-white pl-11 pr-10 text-lg font-normal text-gray-700 outline-none transition focus:border-primary-600 focus:ring-2 focus:ring-primary-100"
        />

        {search && (
          <button
            type="button"
            onClick={() => {
              onClearSearch();
            }}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 cursor-pointer"
          >
            <X size={18} />
          </button>
        )}
      </div>
    </section>
  );
}
