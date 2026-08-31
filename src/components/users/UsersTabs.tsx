import type { UserStatusFilter } from "@/src/types/userProfile";

export interface UsersTabsProps {
  value: UserStatusFilter;
  counts: {
    all: number;
    active: number;
    suspended: number;
  };
  onChange: (status: UserStatusFilter) => void;
}

const tabs: Array<{
  value: UserStatusFilter;
  label: string;
  countKey: keyof UsersTabsProps["counts"];
}> = [
  {
    value: "ALL",
    label: "ទាំងអស់",
    countKey: "all",
  },
  {
    value: "ACTIVE",
    label: "សកម្ម",
    countKey: "active",
  },
  {
    value: "SUSPENDED",
    label: "ផ្អាកដំណើរការ",
    countKey: "suspended",
  },
];

export default function UsersTabs({
  value,
  counts,
  onChange,
}: UsersTabsProps) {
  return (
    <div className="contents sm:flex sm:flex-wrap sm:items-center sm:gap-2">
      {tabs.map((tab) => {
        const active = tab.value === value;
        const count = counts[tab.countKey];

        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            className={`group relative flex w-full sm:w-auto h-12 cursor-pointer items-center justify-between sm:justify-start gap-2 sm:gap-2.5 rounded-full px-4 sm:px-5 text-lg font-normal transition-all duration-200 ease-out active:scale-95 ${
              active
                ? "border border-primary-800 bg-primary-800 text-white shadow-md shadow-primary-900/15"
                : "border border-gray-200 bg-white text-gray-700 hover:border-primary-300 hover:bg-gray-50/80 hover:text-gray-900"
            }`}
          >
            <span className="truncate text-lg">{tab.label}</span>
            <span
              className={`flex h-7 min-w-7 shrink-0 items-center justify-center rounded-full px-2 text-base sm:text-lg font-normal transition-colors duration-200 ${
                active
                  ? "bg-white/20 text-white backdrop-blur-xs"
                  : "bg-gray-100 text-gray-600 group-hover:bg-primary-50 group-hover:text-primary-800"
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
