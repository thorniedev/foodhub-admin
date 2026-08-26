import type { ReactNode } from "react";
import { CircleOff, Coffee, Plus, RotateCcw, ShieldCheck, Utensils } from "lucide-react";

type Props = {
  mode: "FOOD" | "DRINK";
  total: number;
  activeCount: number;
  inactiveCount: number;
  onAdd: () => void;
  onRestoreAll?: () => void;
};

export default function SubCategoryHeader({
  mode,
  total,
  activeCount,
  inactiveCount,
  onAdd,
  onRestoreAll,
}: Props) {
  const isDrink = mode === "DRINK";
  const title = isDrink ? "គ្រប់គ្រងអនុប្រភេទភេសជ្ជៈ" : "គ្រប់គ្រងអនុប្រភេទម្ហូប";
  const description = isDrink
    ? "គ្រប់គ្រង បន្ថែម កែប្រែ និងលុបអនុប្រភេទភេសជ្ជៈក្រោមប្រភេទមេ ភេសជ្ជៈ (DRINK) សម្រាប់ជ្រើសពេលបង្កើតភេសជ្ជៈ។"
    : "គ្រប់គ្រង បន្ថែម កែប្រែ និងលុបអនុប្រភេទម្ហូបក្រោមប្រភេទមេ ម្ហូបអាហារ (FOOD) សម្រាប់ជ្រើសពេលបង្កើតមុខម្ហូប។";
  const buttonText = isDrink ? "បន្ថែមអនុប្រភេទភេសជ្ជៈ" : "បន្ថែមអនុប្រភេទម្ហូប";

  return (
    <section className="relative overflow-hidden rounded-[30px] bg-[#14833E] px-6 py-7 text-white shadow-sm sm:px-8 sm:py-8">
      {/* Decorative background circles */}
      <div className="pointer-events-none absolute -right-12 -top-16 h-52 w-52 rounded-full bg-white/5" />
      <div className="pointer-events-none absolute -bottom-24 right-20 h-64 w-64 rounded-full bg-white/5" />

      <div className="relative flex flex-col gap-7 lg:flex-row lg:items-start lg:justify-between">
        {/* Left content */}
        <div className="min-w-0">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15">
              {isDrink ? <Coffee size={25} /> : <Utensils size={25} />}
            </div>

            <div className="min-w-0">
              <p className="text-3xl font-bold text-accent-400">{title}</p>
              <p className="mt-2 max-w-2xl text-xl leading-7 text-white/85">
                {description}
              </p>
            </div>
          </div>

          {/* Statistics */}
          <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Stat
              icon={isDrink ? <Coffee size={20} /> : <Utensils size={20} />}
              label="សរុប"
              value={total}
            />

            <Stat
              icon={<ShieldCheck size={20} />}
              label="សកម្ម"
              value={activeCount}
            />

            <Stat
              icon={<CircleOff size={20} />}
              label="អសកម្ម"
              value={inactiveCount}
            />
          </div>
        </div>

        {/* Primary actions */}
        <div className="flex flex-wrap items-center gap-3">
          {inactiveCount > 0 && onRestoreAll && (
            <button
              type="button"
              onClick={onRestoreAll}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-amber-400 px-5 py-3 text-lg font-bold text-gray-900 shadow-sm transition hover:bg-amber-300 sm:w-fit"
            >
              <RotateCcw size={20} />
              ស្ដារទាំងអស់ ({inactiveCount})
            </button>
          )}

          <button
            type="button"
            onClick={onAdd}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-lg font-bold text-primary-800 shadow-sm transition hover:bg-primary-50 focus:outline-none focus:ring-4 focus:ring-white/20 sm:w-fit"
          >
            <Plus size={20} />
            {buttonText}
          </button>
        </div>
      </div>
    </section>
  );
}

function Stat({
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
