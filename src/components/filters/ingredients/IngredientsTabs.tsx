import type {
  IngredientStatusFilter,
} from "@/src/types/ingredient";

interface Props {
  value: IngredientStatusFilter;
  allCount: number;
  activeCount: number;
  inactiveCount: number;
  onChange: (
    value: IngredientStatusFilter,
  ) => void;
}

const tabs: Array<{
  value: IngredientStatusFilter;
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

export default function IngredientsTabs({
  value,
  allCount,
  activeCount,
  inactiveCount,
  onChange,
}: Props) {
  const counts: Record<
    IngredientStatusFilter,
    number
  > = {
    ALL: allCount,
    ACTIVE: activeCount,
    INACTIVE: inactiveCount,
  };

  return (
    <div className="flex items-center gap-2">
      {tabs.map((tab) => {
        const active =
          value ===
          tab.value;

        return (
          <button
            key={tab.value}
            type="button"
            onClick={() =>
              onChange(
                tab.value,
              )
            }
            className={`inline-flex h-12 items-center gap-2 rounded-full px-5 text-lg transition ${
              active
                ? "bg-primary-800 text-white shadow-sm"
                : "bg-white text-gray-500 hover:bg-primary-50 hover:text-primary-800"
            }`}
          >
            <span>
              {tab.label}
            </span>

            <span
              className={`flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-lg ${
                active
                  ? "bg-white/20 text-white"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {
                counts[
                  tab.value
                ]
              }
            </span>
          </button>
        );
      })}
    </div>
  );
}