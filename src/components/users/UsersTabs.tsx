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
  { value: "SUSPENDED", label: "ផ្អាក", countKey: "suspended" },
  { value: "DISABLED", label: "បិទ", countKey: "disabled" },
];

export default function UsersTabs({
  value,
  counts,
  onChange,
}: UsersTabsProps) {
  return (
    <div className="flex items-center gap-2">
      {tabs.map((tab) => {
        const active = tab.value === value;

        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-lg transition ${
              active
                ? "bg-[#136C34] text-white"
                : "bg-white text-gray-500 hover:bg-emerald-50 hover:text-[#136C34]"
            }`}
          >
            {tab.label}

            <span
              className={`flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-sm ${
                active
                  ? "bg-white/20 text-white"
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
