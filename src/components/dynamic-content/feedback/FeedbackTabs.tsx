"use client";

import { Search } from "lucide-react";
import { Feedback, FeedbackCategory, FeedbackStatus } from "@/src/types/feedback";

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
    <div className="space-y-3 mb-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Category Tabs */}
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-2">
          {CATEGORY_TAB_LABELS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => onTabChange(tab.key)}
              className={`flex items-center justify-between sm:justify-start gap-2 h-12 px-4 rounded-full text-lg font-normal transition-all active:scale-95 ${activeTab === tab.key
                  ? "bg-primary-800 text-white shadow-md shadow-primary-900/15"
                  : "border border-gray-200 bg-white text-gray-700 hover:border-primary-300 hover:bg-gray-50/80 hover:text-gray-900"
                }`}
            >
              <span className="truncate">{tab.label}</span>
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

        {/* Status Filter & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value as FeedbackStatus | "all")}
            className="h-12 px-4 text-lg border border-gray-200 bg-white rounded-full focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-600"
          >
            {STATUS_FILTER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <div className="relative flex-1 sm:w-64">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="ស្វែងរកអតិថិជន ឬសារ..."
              className="h-12 w-full pl-11 pr-4 text-lg border border-gray-200 bg-white rounded-full focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-600"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
