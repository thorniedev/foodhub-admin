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
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => {
        const active = tab.value === value;

        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            className={`inline-flex min-h-10 items-center gap-2 rounded-full px-4 text-sm font-bold transition ${
              active
                ? "bg-[#137A3D] text-white shadow-sm"
                : "border border-gray-100 bg-white text-gray-600 hover:border-emerald-100 hover:bg-emerald-50"
            }`}
          >
            {tab.label}
            <span
              className={`rounded-full px-2 py-0.5 text-xs ${
                active ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
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
