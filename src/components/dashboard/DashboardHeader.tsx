"use client";

import { RefreshCw } from "lucide-react";

import { cn } from "@/src/lib/utils";
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
    <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border/70 bg-background px-1 pb-5 pt-1">
      <div className="flex min-w-0 items-center gap-3.5">
        <div className="min-w-0">
          <div>
            <h1 className="truncate text-2xl font-semibold tracking-tight text-gray-900">
              ផ្ទាំងគ្រប់គ្រង
            </h1>
            <p className="mt-0.5 text-sm text-gray-500">មើលស្ថានភាពអាជីវកម្ម FoodHub របស់អ្នក</p>
          </div>

          <p className="mt-1 truncate text-sm leading-6 text-gray-500 tabular-nums">
            {activeFrom && activeTo ? (
              <>
                {formatLongDate(activeFrom)} – {formatLongDate(activeTo)}
                {period?.previousFrom && period?.previousTo && (
                  <span className="text-gray-400">
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
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <span
          className={cn(
            "inline-flex h-8 items-center gap-1.5 rounded-full border px-2.5 text-xs font-medium",
            isFetching
              ? "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300"
              : "border-primary-200 bg-primary-50 text-primary-800 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300",
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              "h-2 w-2 rounded-full",
              isFetching ? "animate-pulse bg-blue-600" : "bg-primary-600 dark:bg-emerald-400",
            )}
          />
          {isFetching ? "កំពុងធ្វើបច្ចុប្បន្នភាព…" : "ទិន្នន័យផ្ទាល់"}
        </span>

        <span className="text-xs text-muted-foreground tabular-nums">
          {lastUpdatedLabel ? `ធ្វើបច្ចុប្បន្នភាព ${lastUpdatedLabel}` : "ទើបផ្ទុកថ្មី"}
        </span>

        <button
          type="button"
          onClick={onRefresh}
          title="ផ្ទុកទិន្នន័យឡើងវិញ"
          aria-label="ផ្ទុកទិន្នន័យឡើងវិញ"
          className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border border-border/80 bg-background px-3 text-xs font-medium text-foreground shadow-xs transition hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <RefreshCw
            size={14}
            aria-hidden="true"
            className={cn(isFetching && "animate-spin")}
          />
          <span>ធ្វើបច្ចុប្បន្នភាព</span>
        </button>
      </div>
    </header>
  );
}
