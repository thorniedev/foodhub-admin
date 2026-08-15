import {
  Leaf,
  Plus,
} from "lucide-react";

interface Props {
  total: number;
  activeCount: number;
  inactiveCount: number;
  onAdd: () => void;
}

export default function IngredientsHeader({
  total,
  activeCount,
  inactiveCount,
  onAdd,
}: Props) {
  return (
    <section className="relative overflow-hidden rounded-[30px] bg-[#138A3C] px-8 py-8 text-white shadow-sm lg:px-10">
      {/* Decoration */}
      <div className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-white/5" />

      <div className="pointer-events-none absolute -bottom-24 right-20 h-56 w-56 rounded-full bg-white/5" />

      <div className="relative z-10">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15">
              <Leaf size={27} />
            </div>

            <div>
              <h1 className="text-4xl font-bold leading-tight lg:text-5xl">
                គ្រប់គ្រងគ្រឿងផ្សំ
              </h1>

              <p className="mt-2 text-lg text-white/85">
                គ្រប់គ្រងគ្រឿងផ្សំដែលប្រើសម្រាប់ម្ហូប និងការត្រងក្នុង MhouBahar។
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onAdd}
            className="inline-flex h-14 shrink-0 items-center justify-center gap-2 rounded-full bg-white px-7 text-lg font-semibold text-[#136C34] shadow-sm transition hover:bg-emerald-50"
          >
            <Plus size={20} />

            បន្ថែមគ្រឿងផ្សំ
          </button>
        </div>

        <div className="mt-8 grid max-w-[800px] gap-3 sm:grid-cols-3">
          <StatCard
            label="គ្រឿងផ្សំសរុប"
            value={total}
          />

          <StatCard
            label="សកម្ម"
            value={
              activeCount
            }
          />

          <StatCard
            label="អសកម្ម"
            value={
              inactiveCount
            }
          />
        </div>
      </div>
    </section>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-[22px] bg-white/10 px-6 py-5 backdrop-blur-sm">
      <p className="text-lg text-white/80">
        {label}
      </p>

      <p className="mt-1 text-3xl font-bold">
        {value}
      </p>
    </div>
  );
}