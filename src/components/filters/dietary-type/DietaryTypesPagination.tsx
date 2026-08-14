import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

type Props = {
  page: number;
  totalPages: number;
  totalElements: number;
  disabled?: boolean;
  onPageChange: (page: number) => void;
};

export default function DietaryTypesPagination({
  page,
  totalPages,
  totalElements,
  disabled = false,
  onPageChange,
}: Props) {
  const safeTotalPages =
    Math.max(totalPages, 1);

  return (
    <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-lg text-gray-500">
        ទំព័រ{" "}
        <span className="font-semibold text-gray-800">
          {page + 1}
        </span>{" "}
        នៃ{" "}
        <span className="font-semibold text-gray-800">
          {safeTotalPages}
        </span>
        {" · "}
        សរុប{" "}
        <span className="font-semibold text-primary-800">
          {totalElements}
        </span>
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() =>
            onPageChange(
              Math.max(0, page - 1),
            )
          }
          disabled={
            disabled || page <= 0
          }
          aria-label="Previous page"
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={19} />
        </button>

        <span className="flex h-11 min-w-11 items-center justify-center rounded-xl bg-primary-800 px-3 text-lg font-semibold text-white">
          {page + 1}
        </span>

        <button
          type="button"
          onClick={() =>
            onPageChange(
              Math.min(
                safeTotalPages - 1,
                page + 1,
              ),
            )
          }
          disabled={
            disabled ||
            page >= safeTotalPages - 1
          }
          aria-label="Next page"
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight size={19} />
        </button>
      </div>
    </div>
  );
}
