import type { AllergenStatusFilter } from "@/src/types/allergen";

type AllergensTabsProps = {
  value: AllergenStatusFilter;
  allCount: number;
  activeCount: number;
  inactiveCount: number;
  onChange: (value: AllergenStatusFilter) => void;
};

const tabs: {
  value: AllergenStatusFilter;
  label: string;
}[] = [
  {
    value: "ALL",
    label: "ទាំងអស់",
  },
  {
    value: "ACTIVE",
    label: "សកម្ម",
  },
  {
    value: "INACTIVE",
    label: "អសកម្ម",
  },
];

export default function AllergensTabs({
  value,
  allCount,
  activeCount,
  inactiveCount,
  onChange,
}: AllergensTabsProps) {
  const counts: Record<AllergenStatusFilter, number> = {
    ALL: allCount,
    ACTIVE: activeCount,
    INACTIVE: inactiveCount,
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {tabs.map((tab) => {
        const active = value === tab.value;

        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
              active
                ? "bg-[#136C34] text-white"
                : "bg-white text-gray-500 hover:bg-emerald-50 hover:text-[#136C34]"
            }`}
          >
            {tab.label}

            <span
              className={`rounded-full px-2 py-0.5 text-xs ${
                active
                  ? "bg-white/20 text-white"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {counts[tab.value]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
