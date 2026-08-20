"use client";

interface BannersPaginationProps {
  /** 0-indexed current page, matching the backend PageResponse contract. */
  page: number;
  totalPages: number;
  totalElements: number;
  onPageChange: (page: number) => void;
}

export default function BannersPagination({
  page,
  totalPages,
  totalElements,
  onPageChange,
}: BannersPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
      <span className="text-sm text-gray-500">សរុប {totalElements}</span>
      <div className="flex items-center gap-2">
        <button
          disabled={page <= 0}
          onClick={() => onPageChange(page - 1)}
          className="rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-600 disabled:opacity-40"
        >
          មុន
        </button>
        <span className="text-sm text-gray-500">
          ទំព័រ {page + 1} នៃ {totalPages}
        </span>
        <button
          disabled={page >= totalPages - 1}
          onClick={() => onPageChange(page + 1)}
          className="rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-600 disabled:opacity-40"
        >
          បន្ទាប់
        </button>
      </div>
    </div>
  );
}
