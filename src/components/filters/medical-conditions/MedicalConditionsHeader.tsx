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
        {/* Left content */}
        <div className="min-w-0">
          {/* =================================================
              TITLE
          ================================================== */}

          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15">
              <HeartPulse size={25} />
            </div>

            <div className="min-w-0">
              <p className="text-5xl font-bold text-accent-400">
                ស្ថានភាពសុខភាព
              </p>

              <p className="mt-6 max-w-2xl text-xl leading-8 text-white/85">
                គ្រប់គ្រង បន្ថែម កែប្រែ និងលុបស្ថានភាពសុខភាពដែលប្រើក្នុងប្រព័ន្ធ FoodHub។
              </p>
            </div>
          </div>

          {/* =================================================
              STATISTICS
          ================================================== */}

          <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-3">
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
          className="
            inline-flex
            min-h-12
            w-full
            items-center
            justify-center
            gap-2
            rounded-full
            bg-white
            px-6
            text-xl
            font-normal
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
          <Plus size={22} />
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
    <div className="rounded-3xl bg-white/20 px-5 py-4">
      <div className="flex items-center gap-2 text-xl text-white/80">
        {icon}

        <span>{label}</span>
      </div>

      <p className="mt-1 text-2xl font-bold text-white">{value}</p>
    </div>
  );
}
