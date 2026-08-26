import type { StoreReviewFilter } from "@/src/types/shop";

const tabs: Array<{
  value: StoreReviewFilter;
  label: string;
  key: "all" | "approved" | "pending" | "rejected";
}> = [
  { value: "ALL", label: "ទាំងអស់", key: "all" },
  { value: "APPROVED", label: "បានអនុម័ត", key: "approved" },
  { value: "PENDING", label: "រង់ចាំពិនិត្យ", key: "pending" },
  { value: "REJECTED", label: "បានបដិសេធ", key: "rejected" },
];

export default function ShopsTabs({
  value,
  counts,
  onChange,
}: {
  value: StoreReviewFilter;
  counts: {
    all: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  onChange: (value: StoreReviewFilter) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {tabs.map((tab) => {
        const active = tab.value === value;

        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            className={`inline-flex h-11 cursor-pointer items-center gap-2 rounded-2xl px-4 text-base font-semibold transition ${
              active
                ? "bg-primary-800 text-white shadow-xs border border-primary-800"
                : "border border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            {tab.label}
            <span
              className={`flex h-5.5 min-w-5.5 items-center justify-center rounded-full px-1.5 text-xs font-bold ${
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
