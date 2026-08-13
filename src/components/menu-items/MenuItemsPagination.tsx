"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

export default function MenuItemsPagination({
  page,
  totalPages,
  totalElements,
  disabled,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  totalElements: number;
  disabled?: boolean;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-4 py-4 sm:px-5">
      <p className="text-sm text-gray-500">
        សរុប <span className="font-black text-gray-800">{totalElements}</span> records
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={disabled || page <= 0}
          onClick={() => onPageChange(Math.max(page - 1, 0))}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50 disabled:opacity-40"
        >
          <ChevronLeft size={18} />
        </button>

        <span className="min-w-[100px] text-center text-sm font-bold text-gray-600">
          {page + 1} / {Math.max(totalPages, 1)}
        </span>

        <button
          type="button"
          disabled={disabled || page >= totalPages - 1}
          onClick={() => onPageChange(Math.min(page + 1, totalPages - 1))}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50 disabled:opacity-40"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
