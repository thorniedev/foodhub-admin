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
    <section>
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        {/* Status tabs */}
        <div className="flex w-full min-w-0 gap-2 overflow-x-auto pb-1 xl:w-auto">
          {statusTabs.map((tab) => {
            const active = statusFilter === tab.value;

            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => onStatusChange(tab.value)}
                className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-lg font-normal transition ${
                  active
                    ? "bg-primary-800 text-white"
                    : "bg-white text-gray-500 hover:bg-emerald-50 hover:text-[#136C34]"
                }`}
              >
                {tab.label}

                <span
                  className={`flex h-7 min-w-7 items-center justify-center rounded-full px-1.5 text-lg font-normal ${
                    active ? "bg-white/20 text-white" : "bg-white text-gray-500"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search + controls */}
        <div className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-center xl:w-auto">
          {/* Search input */}
          <div
            ref={searchContainerRef}
            className="relative min-w-0 flex-1 sm:min-w-[340px]"
          >
            <Search
              size={20}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              value={search}
              onChange={(event) => {
                const value = event.target.value;
                onSearchChange(value);
              }}
              placeholder="ស្វែងរក ស្ថានភាពអាកាសធាតុ..."
              className="h-[52px] w-full rounded-full border border-gray-200 bg-gray-50 pl-12 pr-11 text-lg text-gray-800 outline-none transition placeholder:text-gray-400 hover:border-gray-300 focus:border-primary-600 focus:bg-white focus:ring-4 focus:ring-primary-100"
            />

            {search && (
              <button
                type="button"
                onClick={() => {
                  onClearSearch();
                }}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Page size */}
          <div ref={sizeContainerRef} className="relative shrink-0">
            <button
              type="button"
              onClick={() => {
                setSizeOpen((prev) => !prev);
                setSortOpen(false);
              }}
              className="flex h-[52px] min-w-[150px] items-center justify-between gap-3 rounded-full border border-gray-200 bg-white px-4 text-lg font-medium text-gray-700 transition hover:border-primary-200 hover:bg-primary-50"
            >
              {size} / ទំព័រ
              <ChevronDown size={18} />
            </button>

            {sizeOpen && (
              <div className="absolute right-0 top-[60px] z-[100] w-[180px] rounded-2xl border border-gray-100 bg-white p-2 shadow-xl">
                <p className="px-3 pb-2 pt-1 text-lg text-secondary-600">
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
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-lg transition ${
                      size === value
                        ? "bg-primary-50 font-medium text-primary-800"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {value} / ទំព័រ
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
              <div className="absolute right-0 top-[56px] z-[100] w-[190px] rounded-2xl border border-gray-100 bg-white p-2 shadow-xl">
                <p className="px-3 pb-2 pt-1 text-lg text-secondary-600">
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
    </section>
  );
}
