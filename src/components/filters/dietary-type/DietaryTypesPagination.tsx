import { ChevronLeft, ChevronRight } from "lucide-react";

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
  const safeTotalPages = Math.max(totalPages, 1);

  return (
    <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-gray-500">
        ទំព័រ <span className="font-semibold text-gray-700">{page + 1}</span> 
        នៃ <span className="font-semibold text-gray-700">{safeTotalPages}</span>
        {" · "}សរុប {totalElements}
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(0, page - 1))}
          disabled={disabled || page <= 0}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={18} />
        </button>

        <span className="flex h-9 min-w-9 items-center justify-center rounded-lg bg-[#136C34] px-3 text-sm font-semibold text-white">
          {page + 1}
        </span>

        <button
          type="button"
          onClick={() => onPageChange(Math.min(safeTotalPages - 1, page + 1))}
          disabled={disabled || page >= safeTotalPages - 1}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
