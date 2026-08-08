import { ChevronLeft, ChevronRight } from "lucide-react";

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
  const safeTotalPages = Math.max(totalPages, 1);

  return (
    <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-4 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
      <p>
        សរុប <span className="font-bold text-gray-800">{totalElements}</span> នាក់
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={disabled || page <= 0}
          onClick={() => onPageChange(Math.max(0, page - 1))}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={18} />
        </button>

        <div className="rounded-xl bg-[#137A3D] px-4 py-2.5 font-bold text-white">
          {page + 1} / {safeTotalPages}
        </div>

        <button
          type="button"
          disabled={disabled || page >= safeTotalPages - 1}
          onClick={() =>
            onPageChange(Math.min(safeTotalPages - 1, page + 1))
          }
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
