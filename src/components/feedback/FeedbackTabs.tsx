"use client";

import { Search } from "lucide-react";

import {
  Feedback,
  FeedbackCategory,
  FeedbackStatus,
} from "@/src/types/feedback";

interface FeedbackTabsProps {
  data: Feedback[];
  activeTab: FeedbackCategory | "all";
  onTabChange: (tab: FeedbackCategory | "all") => void;
  statusFilter: FeedbackStatus | "all";
  onStatusFilterChange: (status: FeedbackStatus | "all") => void;
  search: string;
  onSearchChange: (value: string) => void;
}

const CATEGORY_TAB_LABELS: {
  key: FeedbackCategory | "all";
  label: string;
}[] = [
  {
    key: "all",
    label: "ទាំងអស់",
  },
  {
    key: "app",
    label: "កម្មវិធី",
  },
  {
    key: "food_quality",
    label: "គុណភាពអាហារ",
  },
  {
    key: "delivery",
    label: "ការដឹកជញ្ជូន",
  },
  {
    key: "service",
    label: "សេវាកម្ម",
  },
];

const STATUS_FILTER_OPTIONS: {
  value: FeedbackStatus | "all";
  label: string;
}[] = [
  {
    value: "all",
    label: "គ្រប់ស្ថានភាព",
  },
  {
    value: "new",
    label: "ថ្មី",
  },
  {
    value: "reviewed",
    label: "បានពិនិត្យ",
  },
  {
    value: "resolved",
    label: "បានដោះស្រាយ",
  },
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
  const countFor = (key: FeedbackCategory | "all") => {
    if (key === "all") {
      return data.length;
    }

    return data.filter((item) => item.category === key).length;
  };

  return (
    <div className="w-full min-w-0 py-6 space-y-4">
      {/* ===============================================
          PINTEREST STYLE HORIZONTAL FILTER TABS
      ================================================ */}

      <div className="relative w-full min-w-0">
        <div
          className="
            flex
            w-full
            min-w-0
            snap-x
            snap-mandatory
            flex-nowrap
            items-center
            gap-3
            overflow-x-auto
            scroll-smooth
            pb-1

            [scrollbar-width:none]
            [-ms-overflow-style:none]
            [&::-webkit-scrollbar]:hidden
          "
        >
          {CATEGORY_TAB_LABELS.map((tab) => {
            const isActive = activeTab === tab.key;

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => onTabChange(tab.key)}
                className={`
                    inline-flex
                    min-h-[52px]
                    shrink-0
                    snap-start
                    items-center
                    justify-center
                    gap-2
                    whitespace-nowrap
                    rounded-full
                    px-5
                    text-lg
                    font-semibold
                    transition-all
                    duration-200
                    focus:outline-none
                    focus:ring-4
                    focus:ring-primary-100

                    ${
                      isActive
                        ? "bg-primary-800 text-white shadow-sm"
                        : "border border-gray-200 bg-white text-gray-600 hover:border-primary-200 hover:bg-primary-50 hover:text-primary-800"
                    }
                  `}
              >
                <span>{tab.label}</span>

                <span
                  className={`
                      inline-flex
                      h-8
                      min-w-8
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      px-2
                      text-lg
                      font-semibold

                      ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-gray-100 text-gray-500"
                      }
                    `}
                >
                  {countFor(tab.key)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ===============================================
          STATUS + SEARCH
      ================================================ */}

      <div className="flex w-full flex-col gap-3 sm:flex-row">
        {/* Status */}

        <select
          value={statusFilter}
          onChange={(event) =>
            onStatusFilterChange(event.target.value as FeedbackStatus | "all")
          }
          className="
            h-[52px]
            w-full
            cursor-pointer
            rounded-xl
            border
            border-gray-200
            bg-white
            px-4
            text-lg
            font-medium
            text-gray-700
            outline-none
            transition
            hover:border-gray-300
            focus:border-primary-600
            focus:ring-4
            focus:ring-primary-100
            sm:w-[250px]
          "
        >
          {STATUS_FILTER_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Search */}

        <div className="relative w-full sm:max-w-[400px]">
          <Search
            size={21}
            className="
              pointer-events-none
              absolute
              left-4
              top-1/2
              -translate-y-1/2
              text-gray-400
            "
          />

          <input
            type="text"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="ស្វែងរកអតិថិជន ឬសារ..."
            className="
              h-[52px]
              w-full
              rounded-xl
              border
              border-gray-200
              bg-white
              pl-12
              pr-4
              text-lg
              text-gray-700
              outline-none
              transition
              placeholder:text-gray-400
              hover:border-gray-300
              focus:border-primary-600
              focus:ring-4
              focus:ring-primary-100
            "
          />
        </div>
      </div>
    </div>
  );
}
