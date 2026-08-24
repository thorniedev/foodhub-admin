import { RefreshCw, Search } from "lucide-react";

type Props = {
  search: string;
  size: number;
  refreshing: boolean;
  onSearchChange: (value: string) => void;
  onSizeChange: (value: number) => void;
  onRefresh: () => void;
};

export default function DietaryTypesToolbar({
  search,
  size,
  refreshing,
  onSearchChange,
  onSizeChange,
  onRefresh,
}: Props) {
  return (
    <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
      <div className="relative w-full sm:max-w-md">
        <Search
          size={20}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="ស្វែងរកតាមឈ្មោះ កូដ ប្រភេទ ឬការពិពណ៌នា..."
          className="h-[52px] w-full rounded-full border border-gray-200 bg-white pl-12 pr-4 text-lg text-gray-800 outline-none transition placeholder:text-gray-400 hover:border-gray-300 focus:border-primary-600 focus:bg-white focus:ring-4 focus:ring-primary-100"
        />
      </div>

      <select
        value={size}
        onChange={(event) => onSizeChange(Number(event.target.value))}
        className="h-[52px] rounded-full border border-gray-200 bg-white px-4 text-lg text-gray-700 outline-none transition hover:border-gray-300 focus:border-primary-600 focus:ring-4 focus:ring-primary-100"
      >
        <option value={10}>10 / ទំព័រ</option>

        <option value={20}>20 / ទំព័រ</option>

        <option value={50}>50 / ទំព័រ</option>
      </select>

      <button
        type="button"
        onClick={onRefresh}
        disabled={refreshing}
        className="inline-flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-800 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Refresh"
      >
        <RefreshCw size={20} className={refreshing ? "animate-spin" : ""} />
      </button>
    </div>
  );
}
