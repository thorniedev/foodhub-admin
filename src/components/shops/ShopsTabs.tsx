import type { StoreReviewFilter } from "@/src/types/shop";

const tabs: Array<{
  value: StoreReviewFilter;
  label: string;
  key: "all" | "pending" | "approved" | "rejected";
}> = [
  { value: "ALL", label: "ទាំងអស់", key: "all" },
  { value: "PENDING", label: "Pending", key: "pending" },
  { value: "APPROVED", label: "Approved", key: "approved" },
  { value: "REJECTED", label: "Rejected", key: "rejected" },
];

export default function ShopsTabs({
  value,
  counts,
  onChange,
}: {
  value: StoreReviewFilter;
  counts: { all: number; pending: number; approved: number; rejected: number };
  onChange: (value: StoreReviewFilter) => void;
}) {
  return (
    <div className="flex items-center gap-2  ">
      {tabs.map((tab) => {
        const active = tab.value === value;

        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            className={`inline-flex cursor-pointer items-center gap-2 rounded-full px-3 py-1.5 text-lg transition ${
              active
                ? "bg-[#136C34] text-white"
                : "bg-white text-gray-500 hover:bg-emerald-50 hover:text-[#136C34]"
            }`}
          >
            {tab.label}
            <span
              className={`flex h-6 min-w-6 items-center justify-center rounded-full px-1 text-sm ${
                active ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
              }`}
            >
              {counts[tab.key]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
