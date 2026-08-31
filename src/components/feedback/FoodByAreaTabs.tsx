"use client";

import { Search } from "lucide-react";
import { Area, FoodByAreaImage } from "@/src/types/foodByArea";

interface FoodByAreaTabsProps {
  data: FoodByAreaImage[];
  activeTab: Area | "all";
  onTabChange: (tab: Area | "all") => void;
  search: string;
  onSearchChange: (value: string) => void;
}

const AREA_TAB_LABELS: { key: Area | "all"; label: string }[] = [
  { key: "all", label: "ទាំងអស់" },
  { key: "phnom_penh", label: "ភ្នំពេញ" },
  { key: "siem_reap", label: "សៀមរាប" },
  { key: "battambang", label: "បាត់ដំបង" },
  { key: "kampot", label: "កំពត" },
  { key: "kratie", label: "ក្រចេះ" },
];

export default function FoodByAreaTabs({
  data,
  activeTab,
  onTabChange,
  search,
  onSearchChange,
}: FoodByAreaTabsProps) {
  const countFor = (key: Area | "all") =>
    key === "all" ? data.length : data.filter((d) => d.location === key).length;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
      <div className="flex items-center gap-2 flex-wrap">
        {AREA_TAB_LABELS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`flex items-center gap-2 px-4 h-12 rounded-full text-lg font-normal transition-all ${
              activeTab === tab.key
                ? "bg-[#136C34] text-white shadow-md shadow-primary-900/15"
                : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-base font-normal ${
                activeTab === tab.key
                  ? "bg-white/20 text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {countFor(tab.key)}
            </span>
          </button>
        ))}
      </div>
      <div className="relative w-full sm:w-72 shrink-0">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="ស្វែងរករូបភាពអាហារ..."
          className="w-full h-12 pl-11 pr-4 text-lg border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-600"
        />
      </div>
    </div>
  );
}
