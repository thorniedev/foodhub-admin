"use client";

import { Search } from "lucide-react";
import { Drink, DrinkCategory } from "../../types/drink";
// import { Drink, DrinkCategory } from "@/types/drink";

interface DrinksTabsProps {
  data: Drink[];
  activeTab: DrinkCategory | "all";
  onTabChange: (tab: DrinkCategory | "all") => void;
  search: string;
  onSearchChange: (value: string) => void;
}

const DRINK_TAB_LABELS: { key: DrinkCategory | "all"; label: string }[] = [
  { key: "all", label: "ទាំងអស់" },
  { key: "hot", label: "ភេសជ្ជៈក្តៅ" },
  { key: "cold", label: "ភេសជ្ជៈត្រជាក់" },
  { key: "juice", label: "ទឹកផ្លែឈើ" },
  { key: "other", label: "ភេសជ្ជៈផ្សេងៗ" },
];

export default function DrinksTabs({
  data,
  activeTab,
  onTabChange,
  search,
  onSearchChange,
}: DrinksTabsProps) {
  const countFor = (key: DrinkCategory | "all") =>
    key === "all" ? data.length : data.filter((d) => d.category === key).length;

  return (
    <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
      <div className="flex items-center gap-2 flex-wrap">
        {DRINK_TAB_LABELS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-base font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-[#136C34] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {tab.label}
            <span
              className={`text-xs rounded-full px-1.5 py-0.5 ${
                activeTab === tab.key
                  ? "bg-white/20 text-white"
                  : "bg-white text-gray-500"
              }`}
            >
              {countFor(tab.key)}
            </span>
          </button>
        ))}
      </div>

      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="ស្វែងរកប្រភេទចំណីអាហារ..."
          className="pl-9 pr-3 py-2 text-base border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 w-64"
        />
      </div>
    </div>
  );
}