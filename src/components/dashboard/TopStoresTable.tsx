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
        cell: ({ row }) => (
          <div className="min-w-0">
            <Link
              href={`/shops/${row.original.storeUuid}`}
              className="truncate font-semibold text-primary-800 underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            >
              {row.original.storeName}
            </Link>
            {row.original.address && (
              <p className="truncate text-sm text-gray-500">
                {row.original.address}
              </p>
            )}
          </div>
        ),
      },
      {
        id: "city",
        header: "ក្រុង",
        meta: { hideOnMobile: true },
        cell: ({ row }) => row.original.city ?? "—",
      },
      {
        id: "rating",
        header: "វាយតម្លៃ",
        meta: { align: "right" },
        cell: ({ row }) => (
          <span className="inline-flex items-center justify-end gap-1">
            <Star size={14} aria-hidden="true" className="text-amber-500" />
            {formatDecimal(row.original.rating)}
          </span>
        ),
      },
      {
        id: "storeViews",
        header: "ការមើល",
        meta: { align: "right" },
        cell: ({ row }) => formatCount(row.original.storeViews),
      },
      {
        id: "clickThroughRate",
        header: "CTR",
        meta: { align: "right" },
        cell: ({ row }) => formatRatio(row.original.clickThroughRate),
      },
      {
        id: "bookmarks",
        header: "រក្សាទុក",
        meta: { align: "right", hideOnMobile: true },
        cell: ({ row }) => formatCount(row.original.bookmarks),
      },
      {
        id: "totalMenuItems",
        header: "មុខម្ហូប",
        meta: { align: "right", hideOnMobile: true },
        cell: ({ row }) => formatCount(row.original.totalMenuItems),
      },
      {
        id: "incompleteMenuItems",
        header: "ខ្វះព័ត៌មាន",
        meta: { align: "right" },
        cell: ({ row }) => {
          const value = row.original.incompleteMenuItems;

          return (
            <span
              className={
                value > 0 ? "font-semibold text-amber-700" : "text-gray-500"
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
        meta: { align: "right" },
        cell: ({ row }) => <ScoreMeter value={row.original.performanceScore} />,
      },
      {
        id: "status",
        header: "ស្ថានភាព",
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1.5">
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
      icon={<Store size={18} aria-hidden="true" />}
      hint="ពិន្ទុសមិទ្ធកម្ម = ៣០% អ្នកមើលផ្សេងគ្នា + ២៥% ការចុច + ២០% ការរក្សាទុក + ១៥% ការវាយតម្លៃ + ១០% ភាពពេញលេញនៃមុខម្ហូប។"
      bodyClassName="px-5 py-4"
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
