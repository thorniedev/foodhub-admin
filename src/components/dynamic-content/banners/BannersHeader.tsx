"use client";

interface BannersHeaderProps {
  total: number;
  search: string;
  onSearchChange: (value: string) => void;
  onAddNew: () => void;
}

export default function BannersHeader({
  total,
  search,
  onSearchChange,
  onAddNew,
}: BannersHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">រូបបែនណី</h1>
          <p className="text-sm text-gray-500">
            កំពុងបង្ហាញរូបបែនណី: {total} សរុប
          </p>
        </div>
        <button
          onClick={onAddNew}
          className="flex items-center gap-2 rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800"
        >
          <span className="text-lg leading-none">+</span>
          បន្ថែមរូបបែនណីថ្មី
        </button>
      </div>

      <div className="mt-4">
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="ស្វែងរករូបបែនណី..."
          className="w-full max-w-sm rounded-lg border border-gray-200 px-4 py-2 text-sm outline-none focus:border-green-600 sm:w-72"
        />
      </div>
    </div>
  );
}
