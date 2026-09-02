import type { ReactNode } from "react";

import { CircleOff, HeartPulse, Plus, ShieldCheck } from "lucide-react";

interface Props {
  total: number;
  activeCount: number;
  inactiveCount: number;
  onAdd: () => void;
}

export default function MedicalConditionsHeader({
  total,
  activeCount,
  inactiveCount,
  onAdd,
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
        {/* Left content */}
        <div className="min-w-0">
          {/* =================================================
              TITLE
          ================================================== */}

          <div className="flex items-start gap-3 sm:gap-4">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-white/15">
              <HeartPulse className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>

            <div className="min-w-0 flex-1">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-accent-400">
                ស្ថានភាពសុខភាព
              </h1>

              <p className="mt-2 sm:mt-4 max-w-2xl text-lg sm:text-xl leading-relaxed text-white/85">
                គ្រប់គ្រង បន្ថែម កែប្រែ និងលុបស្ថានភាពសុខភាពដែលប្រើក្នុងប្រព័ន្ធ FoodHub។
              </p>
            </div>
          </div>

          {/* =================================================
              STATISTICS
          ================================================== */}

          <div className="mt-5 sm:mt-7 grid grid-cols-3 gap-2 sm:gap-3">
            <StatCard
              icon={<HeartPulse size={20} />}
              label="សរុប"
              value={total}
            />

            <StatCard
              icon={<ShieldCheck size={20} />}
              label="សកម្ម"
              value={activeCount}
            />

            <StatCard
              icon={<CircleOff size={20} />}
              label="អសកម្ម"
              value={inactiveCount}
            />
          </div>
        </div>

        {/* =================================================
            ADD BUTTON
        ================================================== */}

        <button
          type="button"
          onClick={onAdd}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-lg font-normal text-[#136C34] shadow-sm transition hover:bg-emerald-50 focus:outline-none focus:ring-4 focus:ring-white/20 sm:w-fit shrink-0"
        >
          <Plus size={20} />
          បន្ថែមស្ថានភាពសុខភាព
        </button>
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

      <p className="mt-1 text-2xl font-bold text-white tabular-nums">
        {value}
      </p>
    </div>
  );
}
