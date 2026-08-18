import type { UserStatusFilter } from "@/src/types/userProfile";

interface UsersTabsProps {
  value: UserStatusFilter;
  counts: {
    all: number;
    active: number;
    suspended: number;
    disabled: number;
  };
  onChange: (value: UserStatusFilter) => void;
}

const tabs: Array<{
  value: UserStatusFilter;
  label: string;
  countKey: keyof UsersTabsProps["counts"];
}> = [
  { value: "ALL", label: "ទាំងអស់", countKey: "all" },
  { value: "ACTIVE", label: "សកម្ម", countKey: "active" },
  { value: "SUSPENDED", label: "Suspended", countKey: "suspended" },
  { value: "DISABLED", label: "Disabled", countKey: "disabled" },
];

export default function UsersTabs({
  value,
  counts,
  onChange,
}: UsersTabsProps) {
  return (
    <div className="flex max-w-full items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      {tabs.map((tab) => {
        const active = tab.value === value;

        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            className={`inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-full px-3.5 py-2 text-lg font-medium transition ${
              active
                ? "bg-primary-800 text-white shadow-sm"
                : "bg-white text-gray-500 hover:bg-primary-50 hover:text-primary-800"
            }`}
          >
            {tab.label}

            <span
              className={`flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-base ${
                active
                  ? "bg-white/20 text-white"
                  : tab.value === "DISABLED" && counts.disabled > 0
                    ? "bg-red-50 text-red-600"
                    : "bg-gray-100 text-gray-500"
              }`}
            >
              {counts[tab.countKey]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
