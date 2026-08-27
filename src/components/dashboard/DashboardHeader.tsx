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
    <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 rounded-2xl border border-primary-100 bg-white px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <span
          aria-hidden="true"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-600 text-white"
        >
          <LayoutGrid size={20} />
        </span>

        <div className="min-w-0">
          <h1 className="truncate text-lg font-bold text-gray-900">
            ទិន្នន័យវិភាគ FoodHub
          </h1>

          <p className="mt-0.5 truncate text-sm text-gray-500 tabular-nums">
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

      <div className="flex flex-wrap items-center gap-2">
        <span
          className={cn(
            "inline-flex min-h-9 items-center gap-2 rounded-full border px-3 text-sm font-semibold",
            isFetching
              ? "border-blue-200 bg-blue-50 text-blue-800"
              : "border-primary-200 bg-primary-50 text-primary-800",
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              "h-2 w-2 rounded-full",
              isFetching ? "animate-pulse bg-blue-600" : "bg-primary-600",
            )}
          />
          {isFetching ? "កំពុងធ្វើបច្ចុប្បន្នភាព…" : "ទិន្នន័យផ្ទាល់"}
        </span>

        <span className="text-sm text-gray-500 tabular-nums">
          {lastUpdatedLabel ? `ធ្វើបច្ចុប្បន្នភាព ${lastUpdatedLabel}` : "ទើបផ្ទុកថ្មី"}
        </span>

        <button
          type="button"
          onClick={onRefresh}
          title="ផ្ទុកទិន្នន័យឡើងវិញ"
          aria-label="ផ្ទុកទិន្នន័យឡើងវិញ"
          className="inline-flex min-h-9 items-center gap-2 rounded-full border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700 transition hover:border-primary-300 hover:bg-primary-50 hover:text-primary-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        >
          <RefreshCw
            size={16}
            aria-hidden="true"
            className={cn(isFetching && "animate-spin")}
          />
          <span>ធ្វើបច្ចុប្បន្នភាព</span>
        </button>
      </div>
    </header>
  );
}
