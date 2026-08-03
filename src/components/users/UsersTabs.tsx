"use client";

import { Search } from "lucide-react";
import { UserProfile } from "../../types/userProfile";

export type UserFilter = "all" | "active" | "inactive";

interface UsersTabsProps {
  data: UserProfile[];
  activeTab: UserFilter;
  onTabChange: (tab: UserFilter) => void;
  search: string;
  onSearchChange: (value: string) => void;
}

const TABS: { key: UserFilter; label: string }[] = [
  { key: "all", label: "ទាំងអស់" },
  { key: "active", label: "សកម្ម" },
  { key: "inactive", label: "អសកម្ម" },
];

export default function UsersTabs({
  data,
  activeTab,
  onTabChange,
  search,
  onSearchChange,
}: UsersTabsProps) {
  const countFor = (key: UserFilter) => {
    if (key === "all") return data.length;
    return data.filter((p) => (key === "active" ? p.isActive : !p.isActive)).length;
  };

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4">
      <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 -mx-1 px-1 lg:mx-0 lg:px-0">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm sm:text-base font-medium transition-colors whitespace-nowrap shrink-0 ${
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

      <div className="relative w-full lg:w-64">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="ស្វែងរកឈ្មោះ..."
          className="w-full pl-9 pr-3 py-2 text-sm sm:text-base border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#136C34]"
        />
      </div>
    </div>
  );
}