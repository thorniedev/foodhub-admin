"use client";

import { useMemo } from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { AlertCircle, Utensils } from "lucide-react";

import type { AdminPageResponse, ItemPerformance } from "@/src/types/adminDashboard";
import SectionCard from "./SectionCard";
import DataTable from "./DataTable";
import ScoreMeter from "./ScoreMeter";
import StatusBadge from "@/src/components/ui/StatusBadge";
import {
  AVAILABILITY_STATUS_LABELS,
  availabilityTone,
  formatCount,
  formatRatio,
  labelFor,
} from "./dashboard-theme";

interface PopularItemsTableProps {
  page: AdminPageResponse<ItemPerformance> | undefined;
  pageIndex: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  isLoading?: boolean;
  isFetching?: boolean;
  error?: unknown;
  onRetry?: () => void;
}

export default function PopularItemsTable({
  page,
  pageIndex,
  pageSize,
  onPageChange,
  onPageSizeChange,
  isLoading,
  isFetching,
  error,
  onRetry,
}: PopularItemsTableProps) {
  const columns = useMemo<ColumnDef<ItemPerformance, unknown>[]>(
    () => [
      {
        id: "item",
        header: "មុខម្ហូប",
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 truncate text-lg font-normal text-gray-800">
              {row.original.itemName}
              {row.original.missingContentCount > 0 && (
                <AlertCircle
                  size={16}
                  className="shrink-0 text-amber-600"
                  aria-label="ខ្វះព័ត៌មានមុខម្ហូប"
                />
              )}
            </p>
            {row.original.foodName && (
              <p className="truncate text-lg font-normal text-gray-400">
                {row.original.foodName}
              </p>
            )}
          </div>
        ),
      },
      {
        id: "categoryName",
        header: "ប្រភេទ",
        meta: { hideOnMobile: true },
        cell: ({ row }) => row.original.categoryName ?? "—",
      },
      {
        id: "store",
        header: "ហាង",
        cell: ({ row }) =>
          row.original.storeUuid ? (
            <Link
              href={`/shops/${row.original.storeUuid}`}
              className="truncate text-primary-800 underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            >
              {row.original.storeName ?? "—"}
            </Link>
          ) : (
            (row.original.storeName ?? "—")
          ),
      },
      {
        id: "views",
        header: "ការមើល",
        meta: { align: "right" },
        cell: ({ row }) => formatCount(row.original.views),
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
        id: "recommendationAppearances",
        header: "លេចក្នុងការណែនាំ",
        meta: { align: "right", hideOnMobile: true },
        cell: ({ row }) => formatCount(row.original.recommendationAppearances),
      },
      {
        id: "popularityScore",
        header: "ពិន្ទុប្រជាប្រិយ",
        meta: { align: "right" },
        cell: ({ row }) => <ScoreMeter value={row.original.popularityScore} />,
      },
      {
        id: "availabilityStatus",
        header: "ភាពអាចរកបាន",
        cell: ({ row }) => (
          <StatusBadge tone={availabilityTone(row.original.availabilityStatus)}>
            {labelFor(AVAILABILITY_STATUS_LABELS, row.original.availabilityStatus)}
          </StatusBadge>
        ),
      },
    ],
    [],
  );

  return (
    <SectionCard
      title="មុខម្ហូបពេញនិយម"
      description="តម្រៀបតាមពិន្ទុប្រជាប្រិយ ក្នុងតម្រងបច្ចុប្បន្ន"
      icon={<Utensils size={18} aria-hidden="true" />}
      hint="ពិន្ទុប្រជាប្រិយ = ៤៥% អ្នកមើលផ្សេងគ្នា + ៣០% ការចុច + ២៥% ការរក្សាទុក។"
      bodyClassName="px-5 py-4"
    >
      <DataTable<ItemPerformance>
        caption="តារាងមុខម្ហូបពេញនិយម"
        reportName="មុខម្ហូបពេញនិយម"
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
        getRowId={(row) => row.menuItemUuid}
        emptyTitle="គ្មានមុខម្ហូបត្រូវនឹងតម្រងនេះ"
        emptyDescription="សូមប្ដូរប្រភេទម្ហូប ឬពង្រីកចន្លោះកាលបរិច្ឆេទ។"
      />
    </SectionCard>
  );
}
