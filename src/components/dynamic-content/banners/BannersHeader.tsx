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
          <p className="text-5xl font-bold text-[#136C34]">រូបបែនណឺ</p>
          <p className="text-lg text-[#F97316] mt-3">
            កំពុងបង្ហាញរូបបែនណី: {total} សរុប
          </p>
        </div>
        <button
          onClick={onAddNew}
          className="flex items-center gap-2 rounded-full bg-green-700 px-4 py-2 text-base font-medium text-white hover:bg-green-800"
        >
          <span className="text-base leading-none">+</span>
          បន្ថែមរូបបែនណីថ្មី
        </button>
      </div>

      <div className="mt-4">
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="ស្វែងរករូបបែនណី..."
          className="w-full max-w-sm rounded-full border border-gray-200 px-4 py-2 text-base outline-none focus:border-green-600 sm:w-72"
        />
      </div>
    </div>
  );
}
