"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  page: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  onPageChange: (page: number) => void;
};

export default function SubCategoryPagination({
  page,
  totalPages,
  totalElements,
  pageSize,
  onPageChange,
}: Props) {
  if (totalPages <= 1 && totalElements <= pageSize) {
    return null;
  }

  const start = totalElements === 0 ? 0 : page * pageSize + 1;
  const end = Math.min((page + 1) * pageSize, totalElements);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 0; i < totalPages; i++) pages.push(i);
    } else {
      pages.push(0);
      if (page > 2) pages.push("...");

      const startPage = Math.max(1, page - 1);
      const endPage = Math.min(totalPages - 2, page + 1);

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (page < totalPages - 3) pages.push("...");
      pages.push(totalPages - 1);
    }

    return pages;
  };

  return (
    <div className="flex flex-col items-center justify-between gap-4 rounded-3xl bg-white px-6 py-4 shadow-sm sm:flex-row">
      <p className="text-lg font-semibold text-gray-500">
        បង្ហាញ <span className="font-bold text-gray-800">{start}</span> ដល់{" "}
        <span className="font-bold text-gray-800">{end}</span> នៃ{" "}
        <span className="font-bold text-gray-800">{totalElements}</span> ទិន្នន័យ
      </p>

      <div className="flex items-center gap-1.5">
        {/* Previous Button */}
        <button
          type="button"
          disabled={page === 0}
          onClick={() => onPageChange(page - 1)}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={18} />
        </button>

        {/* Page numbers */}
        {getPageNumbers().map((p, index) =>
          typeof p === "string" ? (
            <span
              key={`ellipsis-${index}`}
              className="flex h-11 w-11 items-center justify-center text-lg font-bold text-gray-400"
            >
              ...
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              className={`flex h-11 min-w-[44px] items-center justify-center rounded-xl px-3 text-lg font-bold transition ${page === p
                  ? "bg-primary-800 text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-100"
                }`}
            >
              {p + 1}
            </button>
          ),
        )}

        {/* Next Button */}
        <button
          type="button"
          disabled={page >= totalPages - 1}
          onClick={() => onPageChange(page + 1)}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
