"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type RowData,
} from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import { cn } from "@/src/lib/utils";
import DashboardEmptyState from "./DashboardEmptyState";
import DashboardErrorState from "./DashboardErrorState";
import { TableSkeleton } from "./DashboardLoadingSkeleton";

declare module "@tanstack/react-table" {
  /* eslint-disable @typescript-eslint/no-unused-vars */
  interface ColumnMeta<TData extends RowData, TValue> {
    align?: "left" | "right";
    /** Hidden below the md breakpoint to keep phones readable. */
    hideOnMobile?: boolean;
    headerLabel?: string;
  }
  /* eslint-enable @typescript-eslint/no-unused-vars */
}

const PAGE_SIZES = [10, 20, 50];

export interface DataTableProps<TData> {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onSizeChange: (size: number) => void;
  isLoading?: boolean;
  isFetching?: boolean;
  error?: unknown;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  getRowId?: (row: TData, index: number) => string;
  caption: string;
}

export default function DataTable<TData>({
  columns,
  data,
  page,
  size,
  totalElements,
  totalPages,
  onPageChange,
  onSizeChange,
  isLoading = false,
  isFetching = false,
  error,
  onRetry,
  emptyTitle,
  emptyDescription,
  getRowId,
  caption,
}: DataTableProps<TData>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: Math.max(totalPages, 1),
    getRowId,
    state: { pagination: { pageIndex: page, pageSize: size } },
  });

  if (error) {
    return <DashboardErrorState error={error} onRetry={onRetry} compact />;
  }

  if (isLoading) {
    return <TableSkeleton />;
  }

  if (data.length === 0) {
    return (
      <DashboardEmptyState
        title={emptyTitle}
        description={emptyDescription}
        compact
      />
    );
  }

  const lastPage = Math.max(totalPages - 1, 0);
  const firstRow = page * size + 1;
  const lastRow = Math.min(page * size + data.length, totalElements);

  return (
    <div className={cn("transition-opacity", isFetching && "opacity-60")}>
      <div className="-mx-5 overflow-x-auto">
        <table className="w-full min-w-[860px] border-collapse text-left">
          <caption className="sr-only">{caption}</caption>

          <thead className="sticky top-0 z-10 bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const meta = header.column.columnDef.meta;

                  return (
                    <th
                      key={header.id}
                      scope="col"
                      className={cn(
                        "border-b border-gray-200 px-4 py-3 text-base font-semibold whitespace-nowrap text-gray-600",
                        meta?.align === "right" && "text-right",
                        meta?.hideOnMobile && "hidden md:table-cell",
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>

          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-gray-100 transition-colors last:border-0 hover:bg-primary-50/40"
              >
                {row.getVisibleCells().map((cell) => {
                  const meta = cell.column.columnDef.meta;

                  return (
                    <td
                      key={cell.id}
                      className={cn(
                        "px-4 py-3 align-middle text-base text-gray-800",
                        meta?.align === "right" && "text-right tabular-nums",
                        meta?.hideOnMobile && "hidden md:table-cell",
                      )}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
        <p className="text-base text-gray-600 tabular-nums" aria-live="polite">
          បង្ហាញ {firstRow}–{lastRow} ក្នុងចំណោម {totalElements}
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 text-base text-gray-600">
            ជួរក្នុងមួយទំព័រ
            <select
              value={size}
              onChange={(event) => onSizeChange(Number(event.target.value))}
              className="h-10 rounded-xl border border-gray-200 bg-white px-2 text-base text-gray-800 focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-100"
            >
              {PAGE_SIZES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-center gap-1">
            <PagerButton
              label="ទំព័រដំបូង"
              disabled={page <= 0}
              onClick={() => onPageChange(0)}
            >
              <ChevronsLeft size={18} aria-hidden="true" />
            </PagerButton>

            <PagerButton
              label="ទំព័រមុន"
              disabled={page <= 0}
              onClick={() => onPageChange(page - 1)}
            >
              <ChevronLeft size={18} aria-hidden="true" />
            </PagerButton>

            <span className="px-2 text-base font-semibold text-gray-700 tabular-nums">
              {page + 1} / {Math.max(totalPages, 1)}
            </span>

            <PagerButton
              label="ទំព័របន្ទាប់"
              disabled={page >= lastPage}
              onClick={() => onPageChange(page + 1)}
            >
              <ChevronRight size={18} aria-hidden="true" />
            </PagerButton>

            <PagerButton
              label="ទំព័រចុងក្រោយ"
              disabled={page >= lastPage}
              onClick={() => onPageChange(lastPage)}
            >
              <ChevronsRight size={18} aria-hidden="true" />
            </PagerButton>
          </div>
        </div>
      </div>
    </div>
  );
}

function PagerButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-600 transition hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}
