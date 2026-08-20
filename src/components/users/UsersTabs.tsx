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
    activeClass: "bg-primary-800 text-white shadow-md shadow-primary-900/20",
    badgeClass: "bg-white/20 text-white",
  },
  {
    value: "ACTIVE",
    label: "សកម្ម",
    countKey: "active",
    activeClass: "bg-emerald-600 text-white shadow-md shadow-emerald-900/20",
    badgeClass: "bg-white/20 text-white",
  },
  {
    value: "SUSPENDED",
    label: "ផ្អាកដំណើរការ",
    countKey: "suspended",
    activeClass: "bg-amber-500 text-white shadow-md shadow-amber-900/20",
    badgeClass: "bg-white/20 text-white",
  },
];

export default function UsersTabs({
  value,
  counts,
  onChange,
}: UsersTabsProps) {
  return (
    <div className="flex max-w-full items-center gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      {tabs.map((tab) => {
        const active = tab.value === value;
        const count = counts[tab.countKey];

        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            className={`group inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
              active
                ? tab.activeClass
                : "bg-white text-gray-500 shadow-sm ring-1 ring-gray-100 hover:bg-gray-50 hover:text-gray-700 hover:shadow-md"
            }`}
          >
            {tab.label}

            <span
              className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-bold transition-all duration-200 ${
                active
                  ? tab.badgeClass
                  : tab.value === "SUSPENDED" && count > 0
                    ? "bg-amber-50 text-amber-600 ring-1 ring-amber-100"
                    : "bg-gray-100 text-gray-400"
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
