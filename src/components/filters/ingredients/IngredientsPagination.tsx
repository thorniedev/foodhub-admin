import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface Props {
  page: number;
  totalPages: number;
  totalElements: number;
  disabled?: boolean;

  onPageChange: (
    page: number,
  ) => void;
}

export default function IngredientsPagination({
  page,
  totalPages,
  totalElements,
  disabled = false,
  onPageChange,
}: Props) {
  const safeTotalPages =
    Math.max(
      totalPages,
      1,
    );

  return (
    <div className="flex items-center justify-between border-t border-gray-100 px-5 py-4">
      <p className="text-base text-gray-500">
        សរុប{" "}
        <span className="font-semibold text-gray-700">
          {
            totalElements
          }
        </span>{" "}
        គ្រឿងផ្សំ
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={
            disabled ||
            page <= 0
          }
          onClick={() =>
            onPageChange(
              page - 1,
            )
          }
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-100 text-gray-400 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft
            size={18}
          />
        </button>

        <div className="flex h-10 min-w-10 items-center justify-center rounded-xl bg-[#136C34] px-3 text-sm font-semibold text-white">
          {page + 1}
        </div>

        <span className="text-sm text-gray-400">
          /{" "}
          {
            safeTotalPages
          }
        </span>

        <button
          type="button"
          disabled={
            disabled ||
            page >=
              safeTotalPages -
                1
          }
          onClick={() =>
            onPageChange(
              page + 1,
            )
          }
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-100 text-gray-400 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight
            size={18}
          />
        </button>
      </div>
    </div>
  );
}