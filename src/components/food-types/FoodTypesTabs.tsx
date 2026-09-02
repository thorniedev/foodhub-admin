"use client";

import { Search } from "lucide-react";
import { FoodCategory, FoodType } from "../../types/foodType";

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
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4">
      <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 -mx-1 px-1 lg:mx-0 lg:px-0">
        {TAB_LABELS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`flex items-center gap-2 px-4 h-12 rounded-full text-lg font-normal transition-all whitespace-nowrap shrink-0 ${activeTab === tab.key
                ? "bg-[#136C34] text-white shadow-md shadow-primary-900/15"
                : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
              }`}
          >
            <span>{tab.label}</span>
            <span
              className={`flex h-7 min-w-7 shrink-0 items-center justify-center rounded-full px-2 text-base font-normal ${activeTab === tab.key
                  ? "bg-white/20 text-white"
                  : "bg-gray-100 text-gray-600"
                }`}
            >
              {countFor(tab.key)}
            </span>
          </button>
        ))}
      </div>

      <div className="relative w-full lg:w-72">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          value={tabSearch}
          onChange={(e) => onTabSearchChange(e.target.value)}
          placeholder="ស្វែងរកប្រភេទចំណីអាហារ..."
          className="w-full h-12 pl-11 pr-4 text-lg border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-600"
        />
      </div>
    </div>
  );
}