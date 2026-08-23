"use client";

import { CloudSun, Plus, RefreshCw, RotateCcw } from "lucide-react";

export default function WeatherConditionHeader({
  total,
  activeCount,
  inactiveCount,
  refreshing,
  onCreate,
  onRefresh,
  onRestoreAll,
}: {
  total: number;
  activeCount: number;
  inactiveCount: number;
  refreshing: boolean;
  onCreate: () => void;
  onRefresh: () => void;
  onRestoreAll?: () => void;
}) {
  return (
    <section className="overflow-hidden rounded-[30px] bg-[linear-gradient(135deg,#0f7a39,#159447)] p-5 text-white shadow-[0_18px_50px_rgba(19,122,61,0.18)] sm:p-7">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15">
            <CloudSun size={26} />
          </div>

          <div>
            <p className="text-3xl font-black sm:text-4xl">
              ស្ថានភាពអាកាសធាតុ
            </p>

            <p className="mt-2 max-w-2xl text-lg leading-8 text-emerald-50/90">
              គ្រប់គ្រង Weather Conditions ដែលប្រើសម្រាប់ចម្រោះ និងការណែនាំម្ហូប។
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {inactiveCount > 0 && onRestoreAll && (
            <button
              type="button"
              onClick={onRestoreAll}
              className="inline-flex h-12 items-center gap-2 rounded-full bg-amber-400 px-5 text-lg font-bold text-gray-900 shadow-sm transition hover:bg-amber-300"
            >
              <RotateCcw size={18} />
              ស្ដារទាំងអស់ ({inactiveCount})
            </button>
          )}

          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            className="inline-flex h-12 items-center gap-2 rounded-full border border-white/25 bg-white/10 px-5 text-lg font-bold text-white transition hover:bg-white/20 disabled:opacity-60"
          >
            <RefreshCw
              size={18}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>

          <button
            type="button"
            onClick={onCreate}
            className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-5 text-lg font-black text-primary-800 shadow-sm transition hover:bg-emerald-50"
          >
            <Plus size={18} />
            បន្ថែម Weather
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
          <p className="text-lg font-semibold text-emerald-50">សរុប (Total)</p>
          <p className="mt-1 text-2xl font-black">{total}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
          <p className="text-lg font-semibold text-emerald-50">សកម្ម (Active)</p>
          <p className="mt-1 text-2xl font-black text-emerald-300">
            {activeCount}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
          <p className="text-lg font-semibold text-emerald-50">
            អសកម្ម (Inactive / Deleted)
          </p>
          <p className="mt-1 text-2xl font-black text-amber-200">
            {inactiveCount}
          </p>
        </div>
      </div>
    </section>
  );
}
