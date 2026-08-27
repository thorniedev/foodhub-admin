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
  onPrefetch,
}: {
  value: StoreReviewFilter;
  counts: {
    all: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  onChange: (value: StoreReviewFilter) => void;
  onPrefetch?: (value: StoreReviewFilter) => void;
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
            onMouseEnter={() => onPrefetch?.(tab.value)}
            onFocus={() => onPrefetch?.(tab.value)}
            className={`group relative inline-flex h-12 cursor-pointer items-center gap-2.5 rounded-2xl px-5 text-lg font-semibold transition-all duration-200 ease-out active:scale-95 ${
              active
                ? "bg-primary-800 text-white shadow-md shadow-primary-900/15 border border-primary-800"
                : "border border-gray-200 bg-white text-gray-700 hover:border-primary-300 hover:bg-gray-50/80 hover:text-gray-900"
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`flex h-7 min-w-7 items-center justify-center rounded-full px-2.5 text-lg font-bold transition-colors duration-200 ${
                active
                  ? "bg-white/20 text-white backdrop-blur-xs"
                  : "bg-gray-100 text-gray-600 group-hover:bg-primary-50 group-hover:text-primary-800"
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
