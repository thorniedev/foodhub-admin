"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface PaginationProps {
  page?: number;
  currentPage?: number;
  totalPages: number;
  totalElements?: number;
  pageSize?: number;
  unit?: string;
  disabled?: boolean;
  zeroIndexed?: boolean;
  onPageChange: (page: number) => void;
  className?: string;
}

export function getVisiblePages(current: number, total: number): (number | string)[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  if (current <= 4) {
    return [1, 2, 3, 4, 5, "...", total];
  }
  if (current >= total - 3) {
    return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
  }
  return [1, "...", current - 1, current, current + 1, "...", total];
}

export default function Pagination({
  page,
  currentPage,
  totalPages,
  totalElements,
  pageSize,
  unit = "មុខ",
  disabled = false,
  zeroIndexed,
  onPageChange,
  className = "",
}: PaginationProps) {
  const isZeroIndexed = zeroIndexed ?? (currentPage === undefined && page !== undefined);
  const current1 = isZeroIndexed ? (page ?? 0) + 1 : (currentPage ?? page ?? 1);
  const total = Math.max(totalPages, 1);

  const visiblePages = getVisiblePages(current1, total);

  const handlePageClick = (p: number) => {
    if (disabled) return;
    if (isZeroIndexed) {
      onPageChange(p - 1);
    } else {
      onPageChange(p);
    }
  };

  const handlePrev = () => {
    if (disabled || current1 <= 1) return;
    if (isZeroIndexed) {
      onPageChange(current1 - 2);
    } else {
      onPageChange(current1 - 1);
    }
  };

  const handleNext = () => {
    if (disabled || current1 >= total) return;
    if (isZeroIndexed) {
      onPageChange(current1);
    } else {
      onPageChange(current1 + 1);
    }
  };

  // Info label text
  let infoText = "";
  if (totalElements !== undefined) {
    if (pageSize) {
      const from = Math.min((current1 - 1) * pageSize + 1, totalElements);
      const to = Math.min(current1 * pageSize, totalElements);
      infoText = totalElements === 0 ? `បង្ហាញ 0 នៃ 0 ${unit}` : `បង្ហាញ ${from} - ${to} នៃ ${totalElements} ${unit}`;
    } else {
      infoText = `សរុប ${totalElements} ${unit}`;
    }
  }

  return (
    <div className={`flex flex-col items-center justify-between gap-3 px-5 py-4 sm:flex-row ${className}`}>
      {infoText ? (
        <p className="text-lg font-normal text-gray-600">
          {infoText}
        </p>
      ) : (
        <div />
      )}

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={disabled || current1 <= 1}
          onClick={handlePrev}
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 active:scale-95"
          aria-label="ទំព័រមុន"
        >
          <ChevronLeft size={20} />
        </button>

        {visiblePages.map((p, index) => {
          if (p === "...") {
            return (
              <span
                key={`ellipsis-${index}`}
                className="flex h-10 w-8 items-center justify-center text-lg font-normal text-gray-400"
              >
                ...
              </span>
            );
          }

          const pageNum = Number(p);
          const active = current1 === pageNum;

          return (
            <button
              key={`page-${pageNum}`}
              type="button"
              disabled={disabled}
              onClick={() => handlePageClick(pageNum)}
              className={`flex h-10 min-w-[40px] cursor-pointer items-center justify-center rounded-full px-3 text-lg font-normal transition active:scale-95 ${
                active
                  ? "bg-primary-800 text-white shadow-xs"
                  : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              {pageNum}
            </button>
          );
        })}

        <button
          type="button"
          disabled={disabled || current1 >= total}
          onClick={handleNext}
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 active:scale-95"
          aria-label="ទំព័របន្ទាប់"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
