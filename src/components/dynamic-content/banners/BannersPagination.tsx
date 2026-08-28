"use client";

import Pagination from "@/src/components/ui/Pagination";

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
      <div className="flex items-center gap-2 text-lg font-normal text-gray-500">
        <span>សរុប {totalElements}</span>
        <label className="flex items-center gap-1.5">
          <span>ក្នុងមួយទំព័រ</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="rounded-full border border-gray-200 px-3 py-1 text-lg font-normal text-gray-600 outline-none focus:border-[#136C34]"
          >
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        totalElements={totalElements}
        pageSize={pageSize}
        unit="ផ្ទាំង"
        zeroIndexed={true}
        onPageChange={onPageChange}
      />
    </div>
  );
}
