import type { ReactNode } from "react";
import { CircleOff, CupSoda, Plus, ShieldCheck, UtensilsCrossed } from "lucide-react";

type Props = {
  mode: "FOOD" | "DRINK";
  total: number;
  activeCount: number;
  inactiveCount: number;
  onAdd: () => void;
};

export default function SubCategoryHeader({
  mode,
  total,
  activeCount,
  inactiveCount,
  onAdd,
}: Props) {
  const isDrink = mode === "DRINK";
  const title = isDrink ? "គ្រប់គ្រងអនុប្រភេទភេសជ្ជៈ" : "គ្រប់គ្រងអនុប្រភេទម្ហូប";
  const description = isDrink
    ? "គ្រប់គ្រង បន្ថែម កែប្រែ និងលុបអនុប្រភេទភេសជ្ជៈក្រោមប្រភេទមេ ភេសជ្ជៈ សម្រាប់ជ្រើសពេលបង្កើតភេសជ្ជៈ។"
    : "គ្រប់គ្រង បន្ថែម កែប្រែ និងលុបអនុប្រភេទម្ហូបក្រោមប្រភេទមេ ម្ហូបអាហារ សម្រាប់ជ្រើសពេលបង្កើតមុខម្ហូប។";
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
              {isDrink ? <CupSoda size={25} /> : <UtensilsCrossed size={25} />}
            </div>

            <div className="min-w-0">
              <p className="text-5xl font-bold text-accent-400">{title}</p>
              <p className="mt-6 max-w-2xl text-xl leading-8 text-white/85">
                {description}
              </p>
            </div>
          </div>

          {/* Statistics */}
          <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Stat
              icon={isDrink ? <CupSoda size={20} /> : <UtensilsCrossed size={20} />}
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
          <button
            type="button"
            onClick={onAdd}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-xl font-normal text-primary-800 shadow-sm transition hover:bg-primary-50 focus:outline-none focus:ring-4 focus:ring-white/20 sm:w-fit"
          >
            <Plus size={22} />
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
