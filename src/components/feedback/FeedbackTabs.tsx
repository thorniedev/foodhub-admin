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
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        {CATEGORY_TAB_LABELS.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onTabChange(tab.key)}
              className={`inline-flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-lg font-medium transition-all duration-200 ${
                active
                  ? "bg-primary-800 text-white"
                  : "bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-lg font-normal ${
                  active ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
                }`}
              >
                {countFor(tab.key)}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value as FeedbackStatus | "all")}
          className="h-[52px] rounded-full border border-gray-200 bg-white px-5 text-lg font-medium text-gray-700 outline-none transition focus:border-primary-600 focus:ring-4 focus:ring-primary-100"
        >
          {STATUS_FILTER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <div className="relative w-full sm:w-[360px]">
          <Search
            size={20}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="ស្វែងរកអតិថិជន ឬសារ..."
            className="h-[52px] w-full rounded-full border border-gray-200 bg-white pl-12 pr-4 text-lg font-medium outline-none transition focus:border-primary-600 focus:ring-4 focus:ring-primary-100"
          />
        </div>
      </div>
    </div>
  );
}
