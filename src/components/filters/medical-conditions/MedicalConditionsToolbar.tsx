import { RefreshCw, Search } from "lucide-react";

type Props = {
  search: string;
  size: number;
  refreshing: boolean;
  onSearchChange: (value: string) => void;
  onSizeChange: (value: number) => void;
  onRefresh: () => void;
};

export default function MedicalConditionsToolbar({
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
          size={18}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="ស្វែងរកតាមឈ្មោះ កូដ ឬការពិពណ៌នា..."
          className="w-full rounded-full border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm text-gray-700 outline-none transition focus:border-[#136C34] focus:ring-2 focus:ring-[#136C34]/10"
        />
      </div>

      <select
        value={size}
        onChange={(event) => onSizeChange(Number(event.target.value))}
        className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-600 outline-none focus:border-[#136C34]"
      >
        <option value={10}>10 / ទំព័រ</option>
        <option value={20}>20 / ទំព័រ</option>
        <option value={50}>50 / ទំព័រ</option>
      </select>

      <button
        type="button"
        onClick={onRefresh}
        disabled={refreshing}
        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition hover:bg-gray-50 hover:text-[#136C34] disabled:opacity-50"
        aria-label="Refresh"
      >
        <RefreshCw size={17} className={refreshing ? "animate-spin" : ""} />
      </button>
    </div>
  );
}
