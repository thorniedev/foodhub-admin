"use client";

import { CalendarDays, Plus } from "lucide-react";

interface SeasonalFoodBannerProps {
  total: number;
  activeCount: number;
  pendingCount: number;
  onAddNew: () => void;
}

export default function SeasonalFoodBanner({
  total,
  activeCount,
  pendingCount,
  onAddNew,
}: SeasonalFoodBannerProps) {
  return (
    <section className="relative overflow-hidden rounded-[30px] bg-[#14833E] px-6 py-7 text-white shadow-sm sm:px-8 sm:py-8">
      <div className="pointer-events-none absolute -right-12 -top-16 h-52 w-52 rounded-full bg-white/5" />
      <div className="pointer-events-none absolute -bottom-24 right-20 h-64 w-64 rounded-full bg-white/5" />

      <div className="relative flex flex-col gap-7 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15">
              <CalendarDays size={25} />
            </div>

            <div>
              <p className="text-5xl font-bold text-accent-400">
                រូបអាហារតាមរដូវកាល
              </p>
              <p className="mt-6 max-w-2xl text-xl text-white/85">
                គ្រប់គ្រងរូបភាព និងខ្លឹមសារអាហារពិសេសសម្រាប់រដូវកាលនីមួយៗ ដែលបង្ហាញនៅលើកម្មវិធីអតិថិជន។
              </p>
            </div>
          </div>

          <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-3xl bg-white/20 px-5 py-4">
              <div className="flex items-center gap-2 text-xl text-white/80">
                <CalendarDays size={20} />
                <span>សរុបទាំងអស់</span>
              </div>
              <p className="mt-1 text-2xl font-bold">{total}</p>
            </div>

            <div className="rounded-3xl bg-white/20 px-5 py-4">
              <div className="flex items-center gap-2 text-xl text-white/80">
                <span>កំពុងបង្ហាញ</span>
              </div>
              <p className="mt-1 text-2xl font-bold">{activeCount}</p>
            </div>

            <div className="rounded-3xl bg-white/20 px-5 py-4">
              <div className="flex items-center gap-2 text-xl text-white/80">
                <span>កំពុងរង់ចាំ</span>
              </div>
              <p className="mt-1 text-2xl font-bold">{pendingCount}</p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onAddNew}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-lg font-bold text-[#136C34] shadow-sm transition hover:bg-emerald-50 sm:w-fit"
        >
          <Plus size={20} />
          <span>បន្ថែមរូបភាពថ្មី</span>
        </button>
      </div>
    </section>
  );
}