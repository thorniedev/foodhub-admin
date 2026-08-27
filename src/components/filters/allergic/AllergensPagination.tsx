import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  page: number;
  totalPages: number;
  totalElements: number;
  disabled?: boolean;
  onPageChange: (page: number) => void;
};

export default function AllergensPagination({
  page,
  totalPages,
  totalElements,
  disabled = false,
  onPageChange,
}: Props) {
  const pages = Math.max(totalPages, 1);

  return (
    <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-lg text-gray-500">
        សរុប <span className="font-semibold text-gray-700">{totalElements}</span> អាឡែស៊ី
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(0, page - 1))}
          disabled={disabled || page <= 0}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-[#136C34] hover:bg-emerald-50 hover:text-[#136C34] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={20} />
        </button>

        <span className="flex h-10 min-w-10 items-center justify-center rounded-lg bg-[#136C34] px-3.5 text-lg font-semibold text-white">
          {page + 1} / {pages}
        </span>

        <button
          type="button"
          onClick={() => onPageChange(Math.min(pages - 1, page + 1))}
          disabled={disabled || page >= pages - 1}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-[#136C34] hover:bg-emerald-50 hover:text-[#136C34] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
