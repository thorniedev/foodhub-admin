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
    <section className="relative overflow-hidden rounded-[30px] bg-[#14833E] px-6 py-7 text-white shadow-sm sm:px-8 sm:py-8">
      <div className="pointer-events-none absolute -right-12 -top-16 h-52 w-52 rounded-full bg-white/5" />
      <div className="pointer-events-none absolute -bottom-24 right-20 h-64 w-64 rounded-full bg-white/5" />

      <div className="relative flex flex-col gap-7 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15">
              <Store size={25} />
            </div>

            <div>
              <p className="text-5xl font-bold text-accent-400">គ្រប់គ្រងហាង</p>
              <p className="mt-6 max-w-2xl text-xl text-white/85">
                គ្រប់គ្រង បង្កើតថ្មី កែប្រែស្ថានភាព ម៉ោងបើក និងបិទ  ទីតាំងហាង  {" "}
                <br className=" md:block max-md:hidden" />និងផែនទី Google នៃបណ្ដាហាងក្នុង ម្ហូបអារហារ។
              </p>
            </div>
          </div>

          <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
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
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-lg font-bold text-[#136C34] shadow-sm transition hover:bg-emerald-50 sm:w-fit"
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
    <div className="rounded-3xl bg-white/20 px-5 py-4">
      <div className="flex items-center gap-2 text-xl text-white/80">
        {icon}
        <span>{label}</span>
      </div>
      <p className="mt-1  text-2xl font-bold">{value}</p>
    </div>
  );
}
