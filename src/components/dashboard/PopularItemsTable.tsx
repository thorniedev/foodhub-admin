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
        // Same reasoning as the store table: cap the wide text columns so the
        // numeric ones keep their natural width.
        meta: { width: "22%" },
        cell: ({ row }) => (
          <div className="min-w-0 max-w-[18rem]">
            <p
              className="flex items-center gap-1.5 truncate font-medium text-foreground"
              title={row.original.itemName}
            >
              {row.original.itemName}
              {row.original.missingContentCount > 0 && (
                <AlertCircle
                  size={13}
                  className="shrink-0 text-amber-600 dark:text-amber-400"
                  aria-label="ខ្វះព័ត៌មានមុខម្ហូប"
                />
              )}
            </p>
            {row.original.foodName && (
              <p
                className="truncate text-[0.6875rem] text-muted-foreground"
                title={row.original.foodName}
              >
                {row.original.foodName}
              </p>
            )}
          </div>
        ),
      },
      {
        id: "categoryName",
        header: "ប្រភេទ",
        meta: { hideOnMobile: true, width: "12%" },
        cell: ({ row }) => (
          <span
            className="block truncate text-muted-foreground"
            title={row.original.categoryName ?? undefined}
          >
            {row.original.categoryName ?? "—"}
          </span>
        ),
      },
      {
        id: "store",
        header: "ហាង",
        meta: { width: "18%" },
        cell: ({ row }) =>
          row.original.storeUuid ? (
            <Link
              href={`/shops/${row.original.storeUuid}`}
              title={row.original.storeName ?? undefined}
              className="block max-w-[14rem] truncate font-medium text-primary underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              {row.original.storeName ?? "—"}
            </Link>
          ) : (
            <span className="block max-w-[14rem] truncate text-foreground">
              {row.original.storeName ?? "—"}
            </span>
          ),
      },
      {
        id: "views",
        header: "ការមើល",
        meta: { align: "right", width: "8%" },
        cell: ({ row }) => formatCount(row.original.views),
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
        meta: { align: "right", hideOnMobile: true, width: "8%" },
        cell: ({ row }) => formatCount(row.original.bookmarks),
      },
      {
        id: "recommendationAppearances",
        header: "លេចក្នុងការណែនាំ",
        meta: { align: "right", hideOnMobile: true, width: "11%" },
        cell: ({ row }) => formatCount(row.original.recommendationAppearances),
      },
      {
        id: "popularityScore",
        header: "ពិន្ទុប្រជាប្រិយ",
        meta: { align: "right", width: "10%" },
        cell: ({ row }) => <ScoreMeter value={row.original.popularityScore} />,
      },
      {
        id: "availabilityStatus",
        header: "ភាពអាចរកបាន",
        meta: { width: "9%" },
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
      icon={<Utensils size={16} aria-hidden="true" />}
      hint="ពិន្ទុប្រជាប្រិយ = ៤៥% អ្នកមើលផ្សេងគ្នា + ៣០% ការចុច + ២៥% ការរក្សាទុក។"
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
