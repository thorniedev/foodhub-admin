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
    <section className="relative overflow-hidden rounded-[30px] bg-[#14833E] px-6 py-7 text-white shadow-sm sm:px-8 sm:py-8">
      {/* Decoration */}
      <div className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-white/5" />

      <div className="pointer-events-none absolute -bottom-24 right-20 h-56 w-56 rounded-full bg-white/5" />

      <div className="relative z-10">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15">
              <Leaf size={25} />
            </div>

            <div>
              <p className="text-3xl font-bold text-accent-400">
                គ្រប់គ្រងគ្រឿងផ្សំ
              </p>

              <p className="mt-2 text-lg text-white/85">
                គ្រប់គ្រងគ្រឿងផ្សំដែលប្រើសម្រាប់ម្ហូប និងការត្រងក្នុង MhouBahar។
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onAdd}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-lg font-bold text-primary-800 shadow-sm transition hover:bg-primary-50"
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
    <div className="rounded-[22px] bg-white/20 px-6 py-5 backdrop-blur-sm">
      <p className="text-lg text-white/80">
        {label}
      </p>

      <p className="mt-1 text-3xl font-bold">
        {value}
      </p>
    </div>
  );
}