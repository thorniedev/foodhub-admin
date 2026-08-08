import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ShopsPagination({
  page,
  totalPages,
  totalElements,
  disabled = false,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  totalElements: number;
  disabled?: boolean;
  onPageChange: (page: number) => void;
}) {
  const pages = Math.max(totalPages, 1);
  return (
    <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-4 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
      <p>សរុប <span className="font-black text-gray-800">{totalElements}</span> ហាង</p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={disabled || page <= 0}
          onClick={() => onPageChange(Math.max(0, page - 1))}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white disabled:opacity-40"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="rounded-xl bg-[#137A3D] px-4 py-2.5 font-black text-white">{page + 1} / {pages}</span>
        <button
          type="button"
          disabled={disabled || page >= pages - 1}
          onClick={() => onPageChange(Math.min(pages - 1, page + 1))}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white disabled:opacity-40"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
