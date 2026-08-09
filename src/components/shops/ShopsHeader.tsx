import type { ReactNode } from "react";
import Link from "next/link";
import { Building2, MapPinned, Plus, ShieldCheck, Store } from "lucide-react";

export default function ShopsHeader({
  total,
  approved,
  pending,
}: {
  total: number;
  approved: number;
  pending: number;
}) {
  return (
    <section className="relative overflow-hidden rounded-[30px] bg-[#137A3D] px-6 py-7 text-white shadow-[0_22px_55px_rgba(19,122,61,0.18)] sm:px-8 lg:px-10">
      <div className="absolute -right-20 -top-28 h-80 w-80 rounded-full bg-white/10" />
      <div className="absolute right-52 top-8 h-44 w-44 rounded-full bg-emerald-300/10" />

      <div className="relative flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20">
            <Store size={28} />
          </div>
          <div>
            <p className="text-5xl font-black tracking-tight ">គ្រប់គ្រងហាង</p>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-emerald-50 sm:text-base">
              គ្រប់គ្រង Store ពិតពី FoodHub API — ព័ត៌មានហាង, approval,
              account status, operating status, ម៉ោងបើកបិទ និង Google Places។
            </p>
          </div>
        </div>

        <Link
          href="/shops/create"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-white px-5 font-black text-[#137A3D] shadow-sm transition hover:bg-emerald-50"
        >
          <Plus size={19} />
          បង្កើតហាងថ្មី
        </Link>
      </div>

      <div className="relative mt-7 grid gap-3 sm:grid-cols-3">
        <Stat icon={<Building2 size={18} />} label="ហាងសរុប" value={total} />
        <Stat icon={<ShieldCheck size={18} />} label="Approved ក្នុងទំព័រនេះ" value={approved} />
        <Stat icon={<MapPinned size={18} />} label="Pending ក្នុងទំព័រនេះ" value={pending} />
      </div>
    </section>
  );
}

function Stat({ icon, label, value }: { icon: ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 px-5 py-4 backdrop-blur-sm">
      <div className="flex items-center gap-2 text-sm font-semibold text-emerald-50">
        {icon}
        {label}
      </div>
      <p className="mt-1 text-2xl font-black">{value}</p>
    </div>
  );
}
