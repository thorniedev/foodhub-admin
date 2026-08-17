"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  page: number;
  totalPages: number;
  totalElements: number;
  onPageChange: (page: number) => void;
}

export default function WeatherConditionPagination({
  page,
  totalPages,
  totalElements,
  onPageChange,
}: Props) {
  const safeTotalPages = Math.max(totalPages, 1);

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-lg text-gray-500">
        Page <span className="font-semibold text-gray-800">{page + 1}</span> /{" "}
        <span className="font-semibold text-gray-800">{safeTotalPages}</span>
        {" · "}
        សរុប{" "}
        <span className="font-semibold text-primary-800">{totalElements}</span>
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page <= 0}
          onClick={() => onPageChange(Math.max(0, page - 1))}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-4 text-lg font-medium text-gray-600 transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={19} />
          មុន
        </button>

        <button
          type="button"
          disabled={page >= safeTotalPages - 1}
          onClick={() => onPageChange(Math.min(safeTotalPages - 1, page + 1))}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-4 text-lg font-medium text-gray-600 transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          បន្ទាប់
          <ChevronRight size={19} />
        </button>
      </div>
    </div>
  );
}
