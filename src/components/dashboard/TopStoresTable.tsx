"use client";

import { useMemo } from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { Star, Store } from "lucide-react";

import type { AdminPageResponse, StorePerformance } from "@/src/types/adminDashboard";
import SectionCard from "./SectionCard";
import DataTable from "./DataTable";
import ScoreMeter from "./ScoreMeter";
import StatusBadge from "@/src/components/ui/StatusBadge";
import {
  OPERATING_STATUS_LABELS,
  REVIEW_STATUS_LABELS,
  formatCount,
  formatDecimal,
  formatRatio,
  labelFor,
  operatingStatusTone,
  reviewStatusTone,
} from "./dashboard-theme";

interface TopStoresTableProps {
  page: AdminPageResponse<StorePerformance> | undefined;
  pageIndex: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  isLoading?: boolean;
  isFetching?: boolean;
  error?: unknown;
  onRetry?: () => void;
}

export default function TopStoresTable({
  page,
  pageIndex,
  pageSize,
  onPageChange,
  onPageSizeChange,
  isLoading,
  isFetching,
  error,
  onRetry,
}: TopStoresTableProps) {
  const columns = useMemo<ColumnDef<StorePerformance, unknown>[]>(
    () => [
      {
        id: "store",
        header: "ហាង",
        // Capped so the name column stops absorbing the table's spare width
        // and squeezing every numeric column to its right.
        meta: { width: "26%" },
        cell: ({ row }) => (
          <div className="min-w-0 max-w-[22rem]">
            <Link
              href={`/shops/${row.original.storeUuid}`}
              title={row.original.storeName}
              className="block truncate font-medium text-primary underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              {row.original.storeName}
            </Link>
            {row.original.address && (
              <p
                className="truncate text-[0.6875rem] text-muted-foreground"
                title={row.original.address}
              >
                {row.original.address}
              </p>
            )}
          </div>
        ),
      },
      {
        id: "city",
        header: "ក្រុង",
        meta: { hideOnMobile: true, width: "11%" },
        cell: ({ row }) => (
          <span className="block truncate" title={row.original.city ?? undefined}>
            {row.original.city ?? "—"}
          </span>
        ),
      },
      {
        id: "rating",
        header: "វាយតម្លៃ",
        meta: { align: "right", width: "8%" },
        cell: ({ row }) => (
          <span className="inline-flex items-center justify-end gap-1">
            <Star
              size={12}
              aria-hidden="true"
              className={
                row.original.rating > 0
                  ? "fill-amber-400 text-amber-500"
                  : "text-muted-foreground/40"
              }
            />
            {formatDecimal(row.original.rating)}
          </span>
        ),
      },
      {
        id: "storeViews",
        header: "ការមើល",
        meta: { align: "right", width: "8%" },
        cell: ({ row }) => formatCount(row.original.storeViews),
      },
      {
        id: "clickThroughRate",
        header: "CTR",
        meta: { align: "right", width: "7%" },
        cell: ({ row }) => formatRatio(row.original.clickThroughRate),
      },
      {
        id: "bookmarks",
        header: "រក្សាទុក",
        meta: { align: "right", hideOnMobile: true, width: "7%" },
        cell: ({ row }) => formatCount(row.original.bookmarks),
      },
      {
        id: "totalMenuItems",
        header: "មុខម្ហូប",
        meta: { align: "right", hideOnMobile: true, width: "7%" },
        cell: ({ row }) => formatCount(row.original.totalMenuItems),
      },
      {
        id: "incompleteMenuItems",
        header: "ខ្វះព័ត៌មាន",
        meta: { align: "right", width: "8%" },
        cell: ({ row }) => {
          const value = row.original.incompleteMenuItems;

          return (
            <span
              className={
                value > 0
                  ? "font-semibold text-amber-700 dark:text-amber-400"
                  : "text-muted-foreground"
              }
            >
              {formatCount(value)}
            </span>
          );
        },
      },
      {
        id: "performanceScore",
        header: "ពិន្ទុសមិទ្ធកម្ម",
        meta: { align: "right", width: "10%" },
        cell: ({ row }) => <ScoreMeter value={row.original.performanceScore} />,
      },
      {
        id: "status",
        header: "ស្ថានភាព",
        meta: { width: "8%" },
        cell: ({ row }) => (
          <div className="flex flex-col items-start gap-1">
            <StatusBadge tone={reviewStatusTone(row.original.reviewStatus)}>
              {labelFor(REVIEW_STATUS_LABELS, row.original.reviewStatus)}
            </StatusBadge>
            <StatusBadge tone={operatingStatusTone(row.original.operatingStatus)}>
              {labelFor(OPERATING_STATUS_LABELS, row.original.operatingStatus)}
            </StatusBadge>
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <SectionCard
      title="សមិទ្ធកម្មហាង"
      description="តម្រៀបតាមពិន្ទុសមិទ្ធកម្ម ក្នុងចន្លោះកាលបរិច្ឆេទ និងតម្រងទីតាំងបច្ចុប្បន្ន"
      icon={<Store size={16} aria-hidden="true" />}
      hint="ពិន្ទុសមិទ្ធកម្ម = ៣០% អ្នកមើលផ្សេងគ្នា + ២៥% ការចុច + ២០% ការរក្សាទុក + ១៥% ការវាយតម្លៃ + ១០% ភាពពេញលេញនៃមុខម្ហូប។"
    >
      <DataTable<StorePerformance>
        caption="តារាងសមិទ្ធកម្មហាង"
        reportName="សមិទ្ធកម្មហាង"
        columns={columns}
        data={page?.contents ?? []}
        page={pageIndex}
        size={pageSize}
        totalElements={page?.totalElements ?? 0}
        totalPages={page?.totalPages ?? 0}
        onPageChange={onPageChange}
        onSizeChange={onPageSizeChange}
        isLoading={isLoading}
        isFetching={isFetching}
        error={error}
        onRetry={onRetry}
        getRowId={(row) => row.storeUuid}
        emptyTitle="គ្មានហាងត្រូវនឹងតម្រងនេះ"
        emptyDescription="សូមពង្រីកកាំស្វែងរក ឬដកតម្រងក្រុង/ខេត្តចេញ។"
      />
    </SectionCard>
  );
}
