import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface UsersPaginationProps {
  page: number;
  totalPages: number;
  totalElements: number;
  disabled?: boolean;
  onPageChange: (page: number) => void;
}

export default function UsersPagination({
  page,
  totalPages,
  totalElements,
  disabled = false,
  onPageChange,
}: UsersPaginationProps) {
  const pages = Math.max(totalPages, 1);

  return (
    <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-lg text-gray-500">
        សរុប{" "}
        <span className="font-semibold text-gray-700">
          {totalElements}
        </span>{" "}
        នាក់
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={disabled || page <= 0}
          onClick={() => onPageChange(Math.max(0, page - 1))}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-500 transition hover:border-primary-300 hover:bg-primary-50 hover:text-primary-800 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Previous page"
        >
          <ChevronLeft size={18} />
        </button>

        <span className="flex h-10 min-w-10 items-center justify-center rounded-xl bg-primary-800 px-3 text-lg font-semibold text-white">
          {page + 1} / {pages}
        </span>

        <button
          type="button"
          disabled={disabled || page >= pages - 1}
          onClick={() =>
            onPageChange(Math.min(pages - 1, page + 1))
          }
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-500 transition hover:border-primary-300 hover:bg-primary-50 hover:text-primary-800 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Next page"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
