"use client";

import { Search } from "lucide-react";
import { Feedback, FeedbackCategory, FeedbackStatus } from "@/types/feedback";

interface FeedbackTabsProps {
  data: Feedback[];
  activeTab: FeedbackCategory | "all";
  onTabChange: (tab: FeedbackCategory | "all") => void;
  statusFilter: FeedbackStatus | "all";
  onStatusFilterChange: (status: FeedbackStatus | "all") => void;
  search: string;
  onSearchChange: (value: string) => void;
}

const CATEGORY_TAB_LABELS: { key: FeedbackCategory | "all"; label: string }[] = [
  { key: "all", label: "ទាំងអស់" },
  { key: "app", label: "កម្មវិធី" },
  { key: "food_quality", label: "គុណភាពអាហារ" },
  { key: "delivery", label: "ការដឹកជញ្ជូន" },
  { key: "service", label: "សេវាកម្ម" },
];

const STATUS_FILTER_OPTIONS: { value: FeedbackStatus | "all"; label: string }[] = [
  { value: "all", label: "គ្រប់ស្ថានភាព" },
  { value: "new", label: "ថ្មី" },
  { value: "reviewed", label: "បានពិនិត្យ" },
  { value: "resolved", label: "បានដោះស្រាយ" },
];

export default function FeedbackTabs({
  data,
  activeTab,
  onTabChange,
  statusFilter,
  onStatusFilterChange,
  search,
  onSearchChange,
}: FeedbackTabsProps) {
  const countFor = (key: FeedbackCategory | "all") =>
    key === "all" ? data.length : data.filter((d) => d.category === key).length;

  return (
    <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
      <div className="flex items-center gap-2 flex-wrap">
        {CATEGORY_TAB_LABELS.map((tab) => (
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
      <div className="flex items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value as FeedbackStatus | "all")}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          {STATUS_FILTER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="ស្វែងរកអតិថិជន ឬសារ..."
            className="pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 w-64"
          />
        </div>
      </div>
    </div>
  );
}
