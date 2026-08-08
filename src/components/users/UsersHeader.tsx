import { UserPlus, Users } from "lucide-react";

interface UsersHeaderProps {
  total: number;
  activeCount: number;
  suspendedCount: number;
  onCreate: () => void;
}

export default function UsersHeader({
  total,
  activeCount,
  suspendedCount,
  onCreate,
}: UsersHeaderProps) {
  return (
    <section className="relative overflow-hidden rounded-[28px] bg-[#137A3D] px-6 py-7 text-white shadow-[0_18px_45px_rgba(19,122,61,0.18)] sm:px-8 lg:px-10">
      <div className="absolute -right-16 -top-28 h-72 w-72 rounded-full bg-white/10" />
      <div className="absolute right-40 top-10 h-40 w-40 rounded-full bg-emerald-300/10" />

      <div className="relative flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20">
            <Users size={28} />
          </div>

          <div>
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
              អ្នកប្រើប្រាស់
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-emerald-50 sm:text-base">
              គ្រប់គ្រងគណនីអ្នកប្រើប្រាស់ និងបើកមើល Profile របស់អ្នកប្រើនីមួយៗពី API ពិត។
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onCreate}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-white px-5 font-bold text-[#137A3D] shadow-sm transition hover:bg-emerald-50"
        >
          <UserPlus size={19} />
          បង្កើតអ្នកប្រើថ្មី
        </button>
      </div>

      <div className="relative mt-7 grid gap-3 sm:grid-cols-3">
        <Stat label="អ្នកប្រើសរុប" value={total} />
        <Stat label="សកម្មក្នុងទំព័រនេះ" value={activeCount} />
        <Stat label="ផ្អាកក្នុងទំព័រនេះ" value={suspendedCount} />
      </div>
    </section>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 px-5 py-4 backdrop-blur-sm">
      <p className="text-sm font-medium text-emerald-50">{label}</p>
      <p className="mt-1 text-2xl font-black">{value}</p>
    </div>
  );
}
