"use client";

import { Search } from "lucide-react";
import { User, UserStatus } from "../../types/user";

export type UserFilter = "all" | UserStatus;

interface UsersTabsProps {
  data: User[];
  activeTab: UserFilter;
  onTabChange: (tab: UserFilter) => void;
  search: string;
  onSearchChange: (value: string) => void;
}

const TABS: { key: UserFilter; label: string }[] = [
  { key: "all", label: "ទាំងអស់" },
  { key: "active", label: "កំពុងដំណើរការ" },
  { key: "pending", label: "កំពុងរង់ចាំ" },
  { key: "banned", label: "បានផ្អាក" },
];

export default function UsersTabs({
  data,
  activeTab,
  onTabChange,
  search,
  onSearchChange,
}: UsersTabsProps) {
  const countFor = (key: UserFilter) =>
    key === "all" ? data.length : data.filter((u) => u.status === key).length;

  return (
    <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
      <div className="flex items-center gap-2 flex-wrap">
        {TABS.map((tab) => (
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
          placeholder="ស្វែងរកឈ្មោះ, លេខទូរស័ព្ទ..."
          className="pl-9 pr-3 py-2 text-base border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#136C34] w-64"
        />
      </div>
    </div>
  );
}