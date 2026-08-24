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
    <div className="flex flex-col gap-4 border-t border-gray-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between bg-white">
      <p className="text-lg text-gray-500 font-medium">
        សរុប{" "}
        <span className="font-bold text-gray-800">
          {totalElements}
        </span>{" "}
        នាក់
      </p>

      <div className="flex items-center gap-2.5">
        <button
          type="button"
          disabled={disabled || page <= 0}
          onClick={() => onPageChange(Math.max(0, page - 1))}
          className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-gray-200 text-gray-600 transition hover:border-primary-300 hover:bg-primary-50 hover:text-primary-800 disabled:cursor-not-allowed disabled:opacity-40 active:scale-95"
          aria-label="Previous page"
        >
          <ChevronLeft size={22} />
        </button>

        <span className="flex h-12 min-w-12 items-center justify-center rounded-2xl bg-primary-800 px-4 text-lg font-bold text-white shadow-xs">
          {page + 1} / {pages}
        </span>

        <button
          type="button"
          disabled={disabled || page >= pages - 1}
          onClick={() =>
            onPageChange(Math.min(pages - 1, page + 1))
          }
          className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-gray-200 text-gray-600 transition hover:border-primary-300 hover:bg-primary-50 hover:text-primary-800 disabled:cursor-not-allowed disabled:opacity-40 active:scale-95"
          aria-label="Next page"
        >
          <ChevronRight size={22} />
        </button>
      </div>
    </div>
  );
}
