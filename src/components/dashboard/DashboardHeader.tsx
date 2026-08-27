"use client";

import { LayoutGrid, RefreshCw } from "lucide-react";

import { cn } from "@/src/lib/utils";
import type { DashboardPeriod } from "@/src/types/adminDashboard";
import { formatLongDate } from "./dashboard-theme";

interface DashboardHeaderProps {
  period: DashboardPeriod | null;
  lastUpdatedLabel: string | null;
  isFetching: boolean;
  onRefresh: () => void;
}

export default function DashboardHeader({
  period,
  lastUpdatedLabel,
  isFetching,
  onRefresh,
}: DashboardHeaderProps) {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-[#14833E] px-5 py-5 text-white sm:px-7">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 -top-16 h-44 w-44 rounded-full bg-white/5"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-20 right-24 h-52 w-52 rounded-full bg-white/5"
      />

      <div className="relative flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/15">
            <LayoutGrid size={22} aria-hidden="true" />
          </span>

          <div className="min-w-0">
            <p className="text-2xl font-bold text-accent-400 sm:text-3xl">
              ទិន្នន័យវិភាគ FoodHub
            </p>

            <p className="mt-1 text-base text-white/85 sm:text-lg">
              {period?.from && period?.to ? (
                <>
                  {formatLongDate(period.from)} – {formatLongDate(period.to)}
                  <span className="text-white/60">
                    {" "}
                    · ធៀបនឹង {formatLongDate(period.previousFrom)} –{" "}
                    {formatLongDate(period.previousTo)}
                  </span>
                </>
              ) : (
                "កំពុងកំណត់ចន្លោះកាលបរិច្ឆេទ…"
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span
            aria-live="polite"
            className="hidden text-base text-white/80 sm:inline"
          >
            {isFetching
              ? "កំពុងធ្វើបច្ចុប្បន្នភាព…"
              : lastUpdatedLabel
                ? `ធ្វើបច្ចុប្បន្នភាព ${lastUpdatedLabel}`
                : ""}
          </span>

          <button
            type="button"
            onClick={onRefresh}
            title="ផ្ទុកទិន្នន័យឡើងវិញ"
            aria-label="ផ្ទុកទិន្នន័យឡើងវិញ"
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-4 text-base font-bold text-primary-800 transition hover:bg-primary-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/30"
          >
            <RefreshCw
              size={18}
              aria-hidden="true"
              className={cn(isFetching && "animate-spin")}
            />
            <span className="hidden sm:inline">ធ្វើបច្ចុប្បន្នភាព</span>
          </button>
        </div>
      </div>
    </section>
  );
}
