"use client";

import type { ReactNode } from "react";
import { LayoutGrid, RefreshCw } from "lucide-react";

import { cn } from "@/src/lib/utils";
import type { DashboardPeriod } from "@/src/types/adminDashboard";
import { formatLongDate, TONE_STYLES, type Tone } from "./dashboard-theme";

export interface DashboardHeaderStat {
  label: string;
  value: string;
  icon: ReactNode;
  tone: Tone;
}

interface DashboardHeaderProps {
  period: DashboardPeriod | null;
  fallbackRange?: { from: string; to: string };
  lastUpdatedLabel: string | null;
  isFetching: boolean;
  onRefresh: () => void;
  summary?: DashboardHeaderStat[];
}

export default function DashboardHeader({
  period,
  fallbackRange,
  lastUpdatedLabel,
  isFetching,
  onRefresh,
  summary = [],
}: DashboardHeaderProps) {
  const activeFrom = period?.from || fallbackRange?.from;
  const activeTo = period?.to || fallbackRange?.to;

  return (
    <section className="relative overflow-hidden rounded-[32px] border border-[#1d7a43] bg-[#14833E] px-5 py-5 text-white shadow-[0_14px_30px_rgba(20,131,62,0.18)] sm:px-7">
      <div className="relative grid gap-5 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
        <div className="space-y-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
              <LayoutGrid size={22} aria-hidden="true" />
            </span>

            <div className="min-w-0">
              <p className="text-2xl font-bold text-white sm:text-3xl">
                ទិន្នន័យវិភាគ FoodHub
              </p>

              <p className="mt-1 text-sm text-white/80 sm:text-base">
                {activeFrom && activeTo ? (
                  <>
                    {formatLongDate(activeFrom)} – {formatLongDate(activeTo)}
                    {period?.previousFrom && period?.previousTo && (
                      <span className="text-white/60">
                        {" "}
                        · ធៀបនឹង {formatLongDate(period.previousFrom)} –{" "}
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

          <div className="flex flex-wrap items-center gap-2 text-sm font-semibold">
            <span className="inline-flex min-h-9 items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 text-white">
              <span className="h-2 w-2 rounded-full bg-emerald-300" aria-hidden="true" />
              ទិន្នន័យផ្ទាល់
            </span>

            <span className="inline-flex min-h-9 items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 text-white/90">
              {isFetching ? "កំពុងធ្វើបច្ចុប្បន្នភាព…" : "ស្ថានភាពល្អ"}
            </span>

            <span className="inline-flex min-h-9 items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 text-white/75">
              {lastUpdatedLabel
                ? `ធ្វើបច្ចុប្បន្នភាព ${lastUpdatedLabel}`
                : "ទើបផ្ទុកថ្មី"}
            </span>
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
          <div className="grid grid-cols-2 gap-3">
            {summary.map((item) => {
              const styles = TONE_STYLES[item.tone];

              return (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/10 bg-white/10 p-3 shadow-[0_1px_0_rgba(255,255,255,0.04)]"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border",
                        styles.surface,
                        styles.border,
                        styles.icon,
                      )}
                    >
                      {item.icon}
                    </span>

                    <p className="min-w-0 truncate text-[11px] font-semibold text-white/70">
                      {item.label}
                    </p>
                  </div>

                  <p className="mt-2 text-2xl font-bold tabular-nums text-white">
                    {item.value}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="text-sm text-white/70">
              ការវិភាគត្រូវបានភ្ជាប់ដោយផ្ទាល់ទៅ backend ផ្ទាល់។
            </p>

            <button
              type="button"
              onClick={onRefresh}
              title="ផ្ទុកទិន្នន័យឡើងវិញ"
              aria-label="ផ្ទុកទិន្នន័យឡើងវិញ"
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-4 text-sm font-bold text-primary-800 transition hover:bg-primary-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/30"
            >
              <RefreshCw
                size={18}
                aria-hidden="true"
                className={cn(isFetching && "animate-spin")}
              />
              <span>ធ្វើបច្ចុប្បន្នភាព</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
