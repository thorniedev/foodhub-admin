import type { ReactNode } from "react";

import {
  Ban,
  Sparkles,
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
    <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#0f6b32] via-[#14833E] to-[#1aad54] px-7 py-8 text-white shadow-xl shadow-primary-900/20">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 right-24 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-40 w-40 -translate-x-1/2 rounded-full bg-white/5 blur-2xl" />

      <div className="relative flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          {/* Title row */}
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm ring-1 ring-white/20 shadow-lg">
              <Users size={27} />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <p className="text-4xl font-bold tracking-tight text-white drop-shadow-sm sm:text-5xl">
                  គ្រប់គ្រងគណនីអ្នកប្រើប្រាស់
                </p>
              </div>

              <p className="mt-3 max-w-2xl text-lg leading-8 text-white/75">
                គ្រប់គ្រងគណនី ស្ថានភាព ផ្អាកដំណើរការ ស្តារឡើងវិញ និងពិនិត្យប្រវត្តិរូបគណនីអ្នកប្រើប្រាស់ម្នាក់ៗក្នុង ម្ហូបអារហារ។
              </p>
            </div>
          </div>

          {/* Stat cards */}
          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Stat
              icon={<Users size={18} />}
              label="អ្នកប្រើសរុប"
              value={total}
              accent="white"
            />
            <Stat
              icon={<UserRoundCheck size={18} />}
              label="សកម្ម"
              value={activeCount}
              accent="green"
            />
            <Stat
              icon={<UserRoundX size={18} />}
              label="ផ្អាកដំណើរការ"
              value={suspendedCount}
              accent="amber"
            />
          </div>
        </div>

        {/* Create button */}
        <button
          id="create-user-btn"
          type="button"
          onClick={onCreate}
          className="group inline-flex w-full shrink-0 items-center justify-center gap-2.5 rounded-2xl bg-white px-6 py-3.5 text-base font-bold text-primary-800 shadow-lg shadow-black/10 transition-all duration-200 hover:bg-accent-50 hover:scale-[1.02] hover:shadow-xl active:scale-95 sm:w-fit"
        >
          <UserPlus
            size={20}
            className="transition-transform duration-200 group-hover:rotate-6"
          />
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
  accent,
}: {
  icon: ReactNode;
  label: string;
  value: number;
  accent: "white" | "green" | "amber" | "red";
}) {
  const dotColor =
    accent === "green"
      ? "bg-emerald-300"
      : accent === "amber"
        ? "bg-amber-300"
        : accent === "red"
          ? "bg-red-300"
          : "bg-white/50";

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white/10 px-5 py-4 backdrop-blur-sm ring-1 ring-white/15 transition-all duration-200 hover:bg-white/15 hover:ring-white/25">
      {/* Subtle inner glow */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent" />

      <div className="relative flex items-center gap-2 text-sm font-medium text-white/70">
        {icon}
        <span>{label}</span>
        {value > 0 && accent !== "white" && (
          <span className={`ml-auto h-2 w-2 shrink-0 rounded-full ${dotColor} animate-pulse`} />
        )}
      </div>

      <p className="relative mt-2 text-3xl font-bold tracking-tight text-white">
        {value}
      </p>
    </div>
  );
}
