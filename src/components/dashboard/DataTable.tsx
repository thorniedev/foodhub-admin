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
import { isEndpointUnavailable } from "@/src/lib/adminApiError";
import DashboardEmptyState from "./DashboardEmptyState";
import DashboardErrorState from "./DashboardErrorState";
import DashboardUnavailableState from "./DashboardUnavailableState";
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
  /** Human name of the report, used when the server exposes no such endpoint. */
  reportName?: string;
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
  reportName,
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
    // A 404 means the server exposes no such report, which is an operational
    // fact the admin can act on — not a generic request failure.
    if (isEndpointUnavailable(error)) {
      return (
        <DashboardUnavailableState
          reportName={reportName}
          onRetry={onRetry}
          compact
        />
      );
    }

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

          <thead className="sticky top-0 z-10 bg-muted/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const meta = header.column.columnDef.meta;

                  return (
                    <th
                      key={header.id}
                      scope="col"
                      className={cn(
                        "border-b border-border/70 px-4 py-2.5 text-xs font-medium whitespace-nowrap text-muted-foreground",
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
                className="border-b border-border/60 transition-colors last:border-0 hover:bg-primary-50/40 dark:hover:bg-emerald-950/20"
              >
                {row.getVisibleCells().map((cell) => {
                  const meta = cell.column.columnDef.meta;

                  return (
                    <td
                      key={cell.id}
                      className={cn(
                        "px-4 py-3 align-middle text-sm text-foreground",
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

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4">
        <p className="text-xs text-muted-foreground tabular-nums" aria-live="polite">
          បង្ហាញ {firstRow}–{lastRow} ក្នុងចំណោម {totalElements}
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <span>ជួរក្នុងមួយទំព័រ</span>
            <select
              value={size}
              onChange={(event) => onSizeChange(Number(event.target.value))}
              className="h-8 rounded-lg border border-border/80 bg-background px-2.5 text-xs font-medium text-foreground focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-100"
            >
              {PAGE_SIZES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-center gap-1.5">
            <PagerButton
              label="ទំព័រដំបូង"
              disabled={page <= 0}
              onClick={() => onPageChange(0)}
            >
              <ChevronsLeft size={15} aria-hidden="true" />
            </PagerButton>

            <PagerButton
              label="ទំព័រមុន"
              disabled={page <= 0}
              onClick={() => onPageChange(page - 1)}
            >
              <ChevronLeft size={15} aria-hidden="true" />
            </PagerButton>

            <span className="px-2 text-xs font-medium text-foreground tabular-nums">
              {page + 1} / {Math.max(totalPages, 1)}
            </span>

            <PagerButton
              label="ទំព័របន្ទាប់"
              disabled={page >= lastPage}
              onClick={() => onPageChange(page + 1)}
            >
              <ChevronRight size={15} aria-hidden="true" />
            </PagerButton>

            <PagerButton
              label="ទំព័រចុងក្រោយ"
              disabled={page >= lastPage}
              onClick={() => onPageChange(lastPage)}
            >
              <ChevronsRight size={15} aria-hidden="true" />
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
      className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-border/80 text-muted-foreground transition hover:bg-muted hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}
