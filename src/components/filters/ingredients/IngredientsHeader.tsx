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
    <section className="relative overflow-hidden rounded-[30px] bg-[#14833E] px-6 py-7 text-white shadow-sm sm:px-8 sm:py-8">
      {/* =================================================
          DECORATIVE BACKGROUND
      ================================================== */}

      <div className="pointer-events-none absolute -right-12 -top-16 h-52 w-52 rounded-full bg-white/5" />

      <div className="pointer-events-none absolute -bottom-24 right-20 h-64 w-64 rounded-full bg-white/5" />

      {/* =================================================
          CONTENT
      ================================================== */}

      <div className="relative flex flex-col gap-7 lg:flex-row lg:items-start lg:justify-between">
        {/* =================================================
            LEFT CONTENT
        ================================================== */}

        <div className="min-w-0">
          {/* Title */}
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15">
              <CloudSun size={25} />
            </div>

            <div className="min-w-0">
              <p className="text-5xl font-bold text-accent-400">
                ស្ថានភាពអាកាសធាតុ
              </p>

              <p className="mt-6 max-w-2xl text-xl leading-8 text-white/85">
                គ្រប់គ្រង Weather Conditions ដែលប្រើសម្រាប់ចម្រោះ
                និងការណែនាំម្ហូបនៅក្នុងប្រព័ន្ធ FoodHub។
              </p>
            </div>
          </div>

          {/* =================================================
              STATISTICS
          ================================================== */}

          <div className="mt-7 max-w-md">
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

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          {/* Refresh */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            className="
              inline-flex
              min-h-12
              w-full
              items-center
              justify-center
              gap-2
              rounded-full
              border
              border-white/25
              bg-white/15
              px-5
              text-lg
              font-bold
              text-white
              transition
              hover:bg-white/20
              focus:outline-none
              focus:ring-4
              focus:ring-white/20
              disabled:cursor-not-allowed
              disabled:opacity-60
              sm:w-fit
            "
          >
            <RefreshCw size={20} className={refreshing ? "animate-spin" : ""} />

            {refreshing ? "កំពុង Refresh..." : "Refresh"}
          </button>

          {/* Create */}
          <button
            type="button"
            onClick={onCreate}
            className="
              inline-flex
              min-h-12
              w-full
              items-center
              justify-center
              gap-2
              rounded-full
              bg-white
              px-5
              text-lg
              font-bold
              text-primary-800
              shadow-sm
              transition
              hover:bg-primary-50
              focus:outline-none
              focus:ring-4
              focus:ring-white/20
              sm:w-fit
            "
          >
            <Plus size={20} />
            បន្ថែម Weather
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
    <div className="rounded-3xl bg-white/20 px-5 py-4">
      <div className="flex items-center gap-2 text-xl text-white/80">
        {icon}

        <span>{label}</span>
      </div>

      <p className="mt-1 text-2xl font-bold text-white">{value}</p>
    </div>
  );
}
