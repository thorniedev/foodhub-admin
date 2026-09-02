"use client";

import type { ReactNode } from "react";

import { CloudSun, Plus, RefreshCw } from "lucide-react";

type Props = {
  total: number;
  refreshing: boolean;
  onCreate: () => void;
  onRefresh: () => void;
};

export default function WeatherConditionHeader({
  total,
  refreshing,
  onCreate,
  onRefresh,
}: Props) {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-[#14833E] px-4 py-5 text-white shadow-sm sm:px-8 sm:py-8">
      {/* =================================================
          DECORATIVE BACKGROUND
      ================================================== */}

      <div className="pointer-events-none absolute -right-12 -top-16 h-52 w-52 rounded-full bg-white/5" />

      <div className="pointer-events-none absolute -bottom-24 right-20 h-64 w-64 rounded-full bg-white/5" />

      {/* =================================================
          CONTENT
      ================================================== */}

      <div className="relative flex flex-col gap-5 sm:gap-7 lg:flex-row lg:items-start lg:justify-between">
        {/* =================================================
            LEFT SIDE
        ================================================== */}

        <div className="min-w-0">
          {/* Title */}
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-white/15">
              <CloudSun className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-accent-400">
                ស្ថានភាពអាកាសធាតុ
              </p>

              <p className="mt-2 sm:mt-4 max-w-2xl text-lg sm:text-xl leading-relaxed text-white/85">
                គ្រប់គ្រង Weather Conditions ដែលប្រើសម្រាប់ចម្រោះ
                និងការណែនាំម្ហូបនៅក្នុងប្រព័ន្ធ FoodHub។
              </p>
            </div>
          </div>

          {/* =================================================
              STATISTICS
          ================================================== */}

          <div className="mt-5 sm:mt-7 max-w-md">
            <StatCard
              icon={<CloudSun size={20} />}
              label="Active Weather Conditions"
              value={total}
            />
          </div>
        </div>

        {/* =================================================
            ACTION BUTTONS
        ================================================== */}

        <div className="flex w-full flex-col gap-2.5 sm:w-auto sm:flex-row shrink-0">
          {/* Refresh */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-white/25 bg-white/15 px-5 sm:px-6 text-lg font-normal text-white transition hover:bg-white/20 focus:outline-none focus:ring-4 focus:ring-white/20 disabled:cursor-not-allowed disabled:opacity-60 sm:w-fit"
          >
            <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "កំពុង Refresh..." : "Refresh"}
          </button>

          {/* Create */}
          <button
            type="button"
            onClick={onCreate}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-white px-5 sm:px-6 text-lg font-normal text-[#136C34] shadow-sm transition hover:bg-emerald-50 focus:outline-none focus:ring-4 focus:ring-white/20 sm:w-fit"
          >
            <Plus size={20} />
            បន្ថែមស្ថានភាពអាកាសធាតុ
          </button>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl sm:rounded-3xl bg-white/20 px-3.5 py-3 sm:px-5 sm:py-4">
      <div className="flex items-center gap-1.5 sm:gap-2 text-lg sm:text-xl text-white/80">
        <span className="shrink-0">{icon}</span>
        <span className="truncate">{label}</span>
      </div>

      <p className="mt-1 text-2xl font-bold text-white tabular-nums">{value}</p>
    </div>
  );
}
