"use client";

import { RefreshCw } from "lucide-react";

import { cn } from "@/src/lib/utils";
import { Button } from "@/src/components/ui/button";
import type { DashboardPeriod } from "@/src/types/adminDashboard";
import { formatLongDate } from "./dashboard-theme";

interface DashboardHeaderProps {
  period: DashboardPeriod | null;
  fallbackRange?: { from: string; to: string };
  lastUpdatedLabel: string | null;
  isFetching: boolean;
  onRefresh: () => void;
}

/**
 * Compact page header. Headline numbers deliberately live in the KPI grid
 * only — repeating them here would duplicate the same figures on one screen.
 */
export default function DashboardHeader({
  period,
  fallbackRange,
  lastUpdatedLabel,
  isFetching,
  onRefresh,
}: DashboardHeaderProps) {
  const activeFrom = period?.from || fallbackRange?.from;
  const activeTo = period?.to || fallbackRange?.to;

  return (
    <header className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
      <div className="min-w-0">
        <h1 className="truncate text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          ទិដ្ឋភាពទូទៅនៃប្រព័ន្ធ
        </h1>

        <p className="mt-1 text-xs leading-5 text-muted-foreground tabular-nums">
          {activeFrom && activeTo ? (
            <>
              <span className="font-medium text-foreground">
                {formatLongDate(activeFrom)} – {formatLongDate(activeTo)}
              </span>
              {period?.previousFrom && period?.previousTo && (
                <span>
                  {" · ធៀបនឹង "}
                  {formatLongDate(period.previousFrom)} –{" "}
                  {formatLongDate(period.previousTo)}
                </span>
              )}
            </>
          ) : (
            "៣០ ថ្ងៃចុងក្រោយ"
          )}
        </p>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <span
          className={cn(
            "inline-flex h-8 items-center gap-1.5 rounded-full border px-2.5 text-[0.6875rem] font-medium",
            isFetching
              ? "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900 dark:bg-blue-950/60 dark:text-blue-300"
              : "border-primary-200 bg-primary-50 text-primary-800 dark:border-primary-900 dark:bg-primary-950/60 dark:text-primary-300",
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              "size-1.5 rounded-full",
              isFetching
                ? "animate-pulse bg-blue-600 dark:bg-blue-400"
                : "bg-primary-600 dark:bg-primary-400",
            )}
          />
          {isFetching ? "កំពុងធ្វើបច្ចុប្បន្នភាព" : "ទិន្នន័យផ្ទាល់"}
          {lastUpdatedLabel && !isFetching && (
            <span className="font-normal opacity-80 tabular-nums">
              · {lastUpdatedLabel}
            </span>
          )}
        </span>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRefresh}
          title="ផ្ទុកទិន្នន័យឡើងវិញ"
        >
          <RefreshCw
            size={14}
            aria-hidden="true"
            className={cn(isFetching && "animate-spin")}
          />
          <span>ធ្វើបច្ចុប្បន្នភាព</span>
        </Button>
      </div>
    </header>
  );
}
