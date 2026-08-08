import type { StoreReviewFilter } from "@/src/types/shop";

const tabs: Array<{ value: StoreReviewFilter; label: string; key: "all" | "pending" | "approved" | "rejected" }> = [
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
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => {
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            className={`inline-flex min-h-10 items-center gap-2 rounded-full px-4 text-sm font-black transition ${
              active
                ? "bg-[#137A3D] text-white shadow-sm"
                : "border border-gray-100 bg-white text-gray-600 hover:bg-emerald-50"
            }`}
          >
            {tab.label}
            <span className={`rounded-full px-2 py-0.5 text-xs ${active ? "bg-white/20" : "bg-gray-100 text-gray-500"}`}>
              {counts[tab.key]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
