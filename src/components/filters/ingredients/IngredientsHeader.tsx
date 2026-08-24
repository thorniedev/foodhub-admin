import {
  Leaf,
  Plus,
  RotateCcw,
} from "lucide-react";

interface Props {
  total: number;
  activeCount: number;
  inactiveCount: number;
  onAdd: () => void;
  onRestoreAll?: () => void;
}

export default function IngredientsHeader({
  total,
  activeCount,
  inactiveCount,
  onAdd,
  onRestoreAll,
}: Props) {
  return (
    <section className="relative overflow-hidden rounded-[30px] bg-[#14833E] px-6 py-7 text-white shadow-sm sm:px-8 sm:py-8">
      <div className="pointer-events-none absolute -right-12 -top-16 h-52 w-52 rounded-full bg-white/5" />
      <div className="pointer-events-none absolute -bottom-24 right-20 h-64 w-64 rounded-full bg-white/5" />

      <div className="relative flex flex-col gap-7 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15">
              <Leaf size={25} />
            </div>

            <div>
              <p className="text-5xl font-bold text-accent-400">
                គ្រប់គ្រងគ្រឿងផ្សំ
              </p>

              <p className="mt-6 max-w-2xl text-xl text-white/85">
                គ្រប់គ្រងគ្រឿងផ្សំដែលប្រើសម្រាប់ម្ហូប និងការត្រងក្នុង ម្ហូបអាហារ។
              </p>
            </div>
          </div>

          <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <StatCard label="គ្រឿងផ្សំសរុប" value={total} icon={<Leaf size={20} />} />
            <StatCard label="សកម្ម" value={activeCount} />
            <StatCard label="អសកម្ម" value={inactiveCount} />
          </div>
        </div>

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
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-lg font-bold text-[#136C34] shadow-sm transition hover:bg-emerald-50 sm:w-fit"
          >
            <Plus size={20} />
            បន្ថែមគ្រឿងផ្សំ
          </button>
        </div>
      </div>
    </section>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl bg-white/20 px-5 py-4">
      <div className="flex items-center gap-2 text-xl text-white/80">
        {icon}
        <span>{label}</span>
      </div>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}