"use client";

import {
  FILTER_GROUPS,
  FilterGroupKey,
  FilterOption,
} from "../../../types/dynamicContent";

// import { FILTER_GROUPS, FilterGroupKey, FilterOption } from "@/types/dynamicContent";

interface DynamicContentGroupTabsProps {
  data: FilterOption[];
  activeGroup: FilterGroupKey;
  onGroupChange: (group: FilterGroupKey) => void;
}

export default function DynamicContentGroupTabs({
  data,
  activeGroup,
  onGroupChange,
}: DynamicContentGroupTabsProps) {
  const countFor = (key: FilterGroupKey) =>
    data.filter((o) => o.groupKey === key).length;

  return (
    <div className="flex items-center gap-2 flex-wrap mb-4">
      {FILTER_GROUPS.map((group) => (
        <button
          key={group.key}
          onClick={() => onGroupChange(group.key)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-base font-medium transition-colors ${
            activeGroup === group.key
              ? "bg-[#136C34] text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {group.label}
          <span
            className={`text-xs rounded-full px-1.5 py-0.5 ${
              activeGroup === group.key
                ? "bg-white/20 text-white"
                : "bg-white text-gray-500"
            }`}
          >
            {countFor(group.key)}
          </span>
        </button>
      ))}
    </div>
  );
}
