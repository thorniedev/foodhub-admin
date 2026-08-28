"use client";

import { LayoutGrid, RefreshCw } from "lucide-react";

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
    <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 rounded-3xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex min-w-0 items-center gap-3.5">
        <span
          aria-hidden="true"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-600 text-white"
        >
          <LayoutGrid size={24} />
        </span>

        <div className="min-w-0">
          <h1 className="truncate text-2xl font-medium text-gray-800">
            ទិន្នន័យវិភាគ
          </h1>

          <p className="mt-0.5 truncate text-lg font-normal text-gray-500 tabular-nums">
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

      <div className="flex flex-wrap items-center gap-3">
        <span
          className={cn(
            "inline-flex min-h-11 items-center gap-2.5 rounded-full border px-4 text-lg font-normal",
            isFetching
              ? "border-blue-200 bg-blue-50 text-blue-800"
              : "border-primary-200 bg-primary-50 text-primary-800",
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              "h-2.5 w-2.5 rounded-full",
              isFetching ? "animate-pulse bg-blue-600" : "bg-primary-600",
            )}
          />
          {isFetching ? "កំពុងធ្វើបច្ចុប្បន្នភាព…" : "ទិន្នន័យផ្ទាល់"}
        </span>

        <span className="text-lg font-normal text-gray-500 tabular-nums">
          {lastUpdatedLabel ? `ធ្វើបច្ចុប្បន្នភាព ${lastUpdatedLabel}` : "ទើបផ្ទុកថ្មី"}
        </span>

        <button
          type="button"
          onClick={onRefresh}
          title="ផ្ទុកទិន្នន័យឡើងវិញ"
          aria-label="ផ្ទុកទិន្នន័យឡើងវិញ"
          className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-gray-200 bg-white px-5 text-lg font-normal text-gray-700 shadow-sm transition hover:border-primary-300 hover:bg-primary-50 hover:text-primary-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        >
          <RefreshCw
            size={18}
            aria-hidden="true"
            className={cn(isFetching && "animate-spin")}
          />
          <span>ធ្វើបច្ចុប្បន្នភាព</span>
        </button>
      </div>
    </header>
  );
}
