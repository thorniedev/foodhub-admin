"use client";

interface BannersPaginationProps {
  /** 0-indexed current page, matching the backend PageResponse contract. */
  page: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  pageSizeOptions: readonly number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export default function BannersPagination({
  page,
  totalPages,
  totalElements,
  pageSize,
  pageSizeOptions,
  onPageChange,
  onPageSizeChange,
}: BannersPaginationProps) {
  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span>សរុប {totalElements}</span>
        <label className="flex items-center gap-1.5">
          <span>ក្នុងមួយទំព័រ</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="rounded-md border border-gray-200 px-2 py-1 text-sm text-gray-600 outline-none focus:border-[#136C34]"
          >
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center gap-2">
          <button
            type="button"
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
            type="button"
            disabled={page >= totalPages - 1}
            onClick={() => onPageChange(page + 1)}
            className="rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-600 disabled:opacity-40"
          >
            បន្ទាប់
          </button>
        </div>
      )}
    </div>
  );
}
