"use client";

import { Search } from "lucide-react";
import { FoodCategory, FoodType } from "../../types/foodType";
// import { FoodCategory, FoodType } from "@/types/foodType";

interface FoodTypesTabsProps {
  data: FoodType[];
  activeTab: FoodCategory | "all";
  onTabChange: (tab: FoodCategory | "all") => void;
  tabSearch: string;
  onTabSearchChange: (value: string) => void;
}

const TAB_LABELS: { key: FoodCategory | "all"; label: string }[] = [
  { key: "all", label: "ទាំងអស់" },
  { key: "breakfast", label: "អាហារពេលព្រឹក" },
  { key: "regional", label: "អាហារតាមតំបន់" },
  { key: "seasonal", label: "អាហារតាមរដូវកាល" },
  { key: "age", label: "អាហារតាមវ័យ" },
];

export default function FoodTypesTabs({
  data,
  activeTab,
  onTabChange,
  tabSearch,
  onTabSearchChange,
}: FoodTypesTabsProps) {
  const countFor = (key: FoodCategory | "all") =>
    key === "all" ? data.length : data.filter((d) => d.category === key).length;

  return (
    <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
      <div className="flex items-center gap-2 flex-wrap">
        {TAB_LABELS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-emerald-600 text-white"
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
          value={tabSearch}
          onChange={(e) => onTabSearchChange(e.target.value)}
          placeholder="ស្វែងរកប្រភេទចំណីអាហារ..."
          className="pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 w-64"
        />
      </div>
    </div>
  );
}