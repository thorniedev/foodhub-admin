"use client";

import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

interface AuditLogPaginationProps {
  page: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  loading: boolean;
  onPageChange: (newPage: number) => void;
  onPageSizeChange: (newSize: number) => void;
}

export default function AuditLogPagination({
  page,
  pageSize,
  totalElements,
  totalPages,
  loading,
  onPageChange,
  onPageSizeChange,
}: AuditLogPaginationProps) {
  if (totalElements === 0) return null;

  const startRecord = page * pageSize + 1;
  const endRecord = Math.min(totalElements, (page + 1) * pageSize);

  // Generate page numbers with smart windowing
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 0; i < totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(0);

      let start = Math.max(1, page - 1);
      let end = Math.min(totalPages - 2, page + 1);

      if (page <= 2) {
        start = 1;
        end = 3;
      } else if (page >= totalPages - 3) {
        start = totalPages - 4;
        end = totalPages - 2;
      }

      if (start > 1) {
        pages.push("ellipsis-1");
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 2) {
        pages.push("ellipsis-2");
      }

      pages.push(totalPages - 1);
    }

    return pages;
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-t border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-850/40 text-xs text-zinc-500 dark:text-zinc-400">
      {/* Results Count Summary */}
      <div className="flex items-center gap-1.5">
        <span>Showing</span>
        <span className="font-semibold text-zinc-900 dark:text-zinc-100">
          {startRecord.toLocaleString()} - {endRecord.toLocaleString()}
        </span>
        <span>of</span>
        <span className="font-semibold text-zinc-900 dark:text-zinc-100">
          {totalElements.toLocaleString()}
        </span>
        <span>results</span>
      </div>

      {/* Page Controls & Size Selector */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Page Size Selector */}
        <div className="flex items-center gap-1.5">
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            disabled={loading}
            className="px-2.5 py-1 border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-lg text-xs font-medium text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer disabled:opacity-50"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>

        {/* Page Navigation Buttons */}
        <div className="flex items-center gap-1">
          {/* Jump to first */}
          <button
            type="button"
            onClick={() => onPageChange(0)}
            disabled={page === 0 || loading}
            title="First Page"
            className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>

          {/* Prev */}
          <button
            type="button"
            onClick={() => onPageChange(Math.max(0, page - 1))}
            disabled={page === 0 || loading}
            title="Previous Page"
            className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Numbered Buttons */}
          <div className="flex items-center gap-1 mx-1">
            {getPageNumbers().map((item, index) => {
              if (typeof item === "string") {
                return (
                  <span
                    key={`ellipsis-${index}`}
                    className="px-1 text-zinc-400 select-none"
                  >
                    ...
                  </span>
                );
              }

              const isCurrent = item === page;
              return (
                <button
                  key={`page-${item}`}
                  type="button"
                  onClick={() => onPageChange(item)}
                  disabled={loading}
                  className={`min-w-[28px] h-7 px-2 text-xs font-semibold rounded-lg transition cursor-pointer ${
                    isCurrent
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-transparent"
                  }`}
                >
                  {item + 1}
                </button>
              );
            })}
          </div>

          {/* Next */}
          <button
            type="button"
            onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
            disabled={page >= totalPages - 1 || loading}
            title="Next Page"
            className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Jump to last */}
          <button
            type="button"
            onClick={() => onPageChange(totalPages - 1)}
            disabled={page >= totalPages - 1 || loading}
            title="Last Page"
            className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
