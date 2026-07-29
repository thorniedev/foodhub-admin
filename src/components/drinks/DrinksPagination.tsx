"use client";

interface DrinksPaginationProps {
  total: number;
  shown: number;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function DrinksPagination({
  total,
  shown,
  page,
  totalPages,
  onPageChange,
}: DrinksPaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
      <p>
        បង្ហាញ {shown} ក្នុងចំណោម {total}
      </p>

      <div className="flex items-center gap-1">
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`w-8 h-8 rounded-md text-sm font-medium transition-colors ${
              page === p
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