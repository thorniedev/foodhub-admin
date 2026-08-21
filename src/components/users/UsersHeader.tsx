import type { ReactNode } from "react";
import { Plus, UserCheck, UserRoundX, Users } from "lucide-react";

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
              <p className="text-5xl font-bold text-accent-400">គ្រប់គ្រងអ្នកប្រើប្រាស់</p>
              <p className="mt-6 max-w-2xl text-xl text-white/85">
                គ្រប់គ្រង គណនី ស្ថានភាព ផ្អាកដំណើរការ ស្តារឡើងវិញ{" "}
                <br className="md:block max-md:hidden" />និងពិនិត្យប្រវត្តិរូបគណនីអ្នកប្រើប្រាស់ម្នាក់ៗក្នុង ម្ហូបអារហារ។
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
              icon={<UserCheck size={20} />}
              label="សកម្ម"
              value={activeCount}
            />
            <Stat
              icon={<UserRoundX size={20} />}
              label="ផ្អាកដំណើរការ"
              value={suspendedCount}
            />
          </div>
        </div>

        <button
          id="create-user-btn"
          type="button"
          onClick={onCreate}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-lg font-bold text-[#136C34] shadow-sm transition hover:bg-emerald-50 sm:w-fit"
        >
          <Plus size={20} />
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