import type { ReactNode } from "react";
import Link from "next/link";
import { Building2, MapPinned, Plus, ShieldAlert, ShieldCheck, Store } from "lucide-react";

export default function ShopsHeader({
  total,
  approved,
  pending,
  rejected = 0,
}: {
  total: number;
  approved: number;
  pending: number;
  rejected?: number;
}) {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-[#14833E] px-4 py-5 text-white shadow-sm sm:px-8 sm:py-8">
      <div className="pointer-events-none absolute -right-12 -top-16 h-52 w-52 rounded-full bg-white/5" />
      <div className="pointer-events-none absolute -bottom-24 right-20 h-64 w-64 rounded-full bg-white/5" />

      <div className="relative flex flex-col gap-5 sm:gap-7 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-white/15">
              <Store className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>

            <div className="min-w-0 flex-1">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-accent-400">គ្រប់គ្រងហាង</h1>
              <p className="mt-2 sm:mt-4 max-w-2xl text-lg sm:text-xl text-white/85 leading-relaxed">
                គ្រប់គ្រង បង្កើតថ្មី កែប្រែស្ថានភាព ម៉ោងបើក និងបិទ ទីតាំងហាង{" "}
                <br className="hidden md:block" />និងផែនទី Google នៃបណ្ដាហាងក្នុង ម្ហូបអារហារ។
              </p>
            </div>
          </div>

          <div className="mt-5 sm:mt-7 grid grid-cols-2 gap-2.5 sm:gap-3 sm:grid-cols-4">
            <Stat
              icon={<Store size={20} />}
              label="ហាងសរុប"
              value={total}
            />
            <Stat
              icon={<ShieldCheck size={20} />}
              label="បានអនុម័ត"
              value={approved}
            />
            <Stat
              icon={<MapPinned size={20} />}
              label="រង់ចាំពិនិត្យ"
              value={pending}
            />
            <Stat
              icon={<ShieldAlert size={20} />}
              label="បានបដិសេធ"
              value={rejected}
            />
          </div>
        </div>

        <Link
          href="/shops/create"
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-lg font-normal text-[#136C34] shadow-sm transition hover:bg-emerald-50 sm:w-fit shrink-0"
        >
          <Plus size={20} />
          បង្កើតហាងថ្មី
        </Link>
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
    <div className="rounded-2xl sm:rounded-3xl bg-white/20 px-3.5 py-3 sm:px-5 sm:py-4">
      <div className="flex items-center gap-1.5 sm:gap-2 text-lg sm:text-xl text-white/80">
        <span className="shrink-0">{icon}</span>
        <span className="truncate">{label}</span>
      </div>
      <p className="mt-1 text-2xl font-bold text-white tabular-nums">{value}</p>
    </div>
  );
}

