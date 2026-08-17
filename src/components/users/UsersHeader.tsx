import type { ReactNode } from "react";

import {
  UserPlus,
  Users,
  UserRoundCheck,
  UserRoundX,
} from "lucide-react";

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
    <section className="relative overflow-hidden rounded-[30px] bg-[#14833E] px-6 py-7 text-white shadow-sm sm:px-8 sm:py-8">
      <div className="pointer-events-none absolute -right-12 -top-16 h-52 w-52 rounded-full bg-white/5" />
      <div className="pointer-events-none absolute -bottom-24 right-20 h-64 w-64 rounded-full bg-white/5" />

      <div className="relative flex flex-col gap-7 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15">
              <Users size={25} />
            </div>

            <div>
              <p className="text-5xl font-bold text-accent-400">
                គ្រប់គ្រងអ្នកប្រើប្រាស់
              </p>

              <p className="mt-6 max-w-2xl text-xl text-white/85">
                គ្រប់គ្រងគណនីអ្នកប្រើប្រាស់ ស្ថានភាពគណនី និងពិនិត្យ <br className="md:block max-md:hidden" /> Profile
                របស់អ្នកប្រើនីមួយៗក្នុង FoodHub។
              </p>
            </div>
          </div>

          <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Stat
              icon={<Users size={20} />}
              label="អ្នកប្រើសរុប"
              value={total}
            />

            <Stat
              icon={<UserRoundCheck size={20} />}
              label="សកម្ម ក្នុងទំព័រ"
              value={activeCount}
            />

            <Stat
              icon={<UserRoundX size={20} />}
              label="Suspended ក្នុងទំព័រ"
              value={suspendedCount}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={onCreate}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-lg font-bold text-primary-800 shadow-sm transition hover:bg-primary-50 sm:w-fit"
        >
          <UserPlus size={20} />
          បង្កើតអ្នកប្រើថ្មី
        </button>
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

      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}
