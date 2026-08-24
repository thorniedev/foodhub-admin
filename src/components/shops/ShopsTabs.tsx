import type { StoreReviewFilter } from "@/src/types/shop";

const tabs: Array<{
  value: StoreReviewFilter;
  label: string;
  key: "all" | "pending" | "approved" | "rejected";
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
  counts: { all: number; pending: number; approved: number; rejected: number };
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
            className={`inline-flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-lg font-medium transition-all duration-200 ${
              active
                ? "bg-primary-800 text-white"
                : "bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-lg font-normal ${
                active ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
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
