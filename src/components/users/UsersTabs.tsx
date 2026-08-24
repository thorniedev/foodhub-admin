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
  activeClass: string;
  badgeClass: string;
}> = [
  {
    value: "ALL",
    label: "ទាំងអស់",
    countKey: "all",
    activeClass: "bg-primary-800 text-white",
    badgeClass: "bg-white/20 text-white",
  },
  {
    value: "ACTIVE",
    label: "សកម្ម",
    countKey: "active",
    activeClass: "bg-emerald-600 text-white",
    badgeClass: "bg-white/20 text-white",
  },
  {
    value: "SUSPENDED",
    label: "ផ្អាកដំណើរការ",
    countKey: "suspended",
    activeClass: "bg-amber-500 text-white",
    badgeClass: "bg-white/20 text-white",
  },
];

export default function UsersTabs({
  value,
  counts,
  onChange,
}: UsersTabsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {tabs.map((tab) => {
        const active = tab.value === value;
        const count = counts[tab.countKey];

        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
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
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
