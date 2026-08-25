"use client";

interface SeasonalFoodPaginationProps {
  total: number;
  shown: number;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function SeasonalFoodPagination({
  total,
  shown,
  page,
  totalPages,
  onPageChange,
}: SeasonalFoodPaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4 text-sm text-gray-500">
      <p>
        បង្ហាញ {shown} ក្នុងចំណោម {total}
      </p>

      <div className="flex items-center gap-1 overflow-x-auto">
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`w-8 h-8 rounded-md text-sm font-medium transition-colors shrink-0 ${page === p
                ? "bg-emerald-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
              }`}
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}