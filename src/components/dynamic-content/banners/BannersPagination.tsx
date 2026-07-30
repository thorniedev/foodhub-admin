"use client";

interface BannersPaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function BannersPagination({
  page,
  totalPages,
  onPageChange,
}: BannersPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-4 flex items-center justify-end gap-2">
      <button
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-600 disabled:opacity-40"
      >
        មុន
      </button>
      <span className="text-sm text-gray-500">
        ទំព័រ {page} នៃ {totalPages}
      </span>
      <button
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className="rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-600 disabled:opacity-40"
      >
        បន្ទាប់
      </button>
    </div>
  );
}
