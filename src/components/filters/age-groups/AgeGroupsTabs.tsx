import type { ResourceStatusFilter } from "@/src/types/safetyResource";

type Props = {
  value: ResourceStatusFilter;
  allCount: number;
  activeCount: number;
  inactiveCount: number;
  onChange: (value: ResourceStatusFilter) => void;
};

const tabs: Array<{
  value: ResourceStatusFilter;
  label: string;
}> = [
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

export default function AgeGroupsTabs({
  value,
  allCount,
  activeCount,
  inactiveCount,
  onChange,
}: Props) {
  const counts: Record<ResourceStatusFilter, number> = {
    ALL: allCount,
    ACTIVE: activeCount,
    INACTIVE: inactiveCount,
  };

  return (
    <div className="flex w-full min-w-0 gap-2 overflow-x-auto pb-1 xl:w-auto">
      {tabs.map((tab) => {
        const selected = value === tab.value;

        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-lg font-normal transition ${
              selected
                ? "bg-primary-800 text-white"
                : "bg-white text-gray-500 hover:bg-emerald-50 hover:text-[#136C34]"
            }`}
          >
            {tab.label}

            <span
              className={`flex h-7 min-w-7 items-center justify-center rounded-full px-1.5 text-lg font-normal ${
                selected ? "bg-white/20 text-white" : "bg-white text-gray-500"
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