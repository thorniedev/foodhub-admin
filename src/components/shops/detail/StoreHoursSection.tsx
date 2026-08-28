"use client";

import { CalendarClock, Clock3, Loader2, Pencil } from "lucide-react";
import type { StoreHour } from "@/src/types/shop";
import { formatDayOfWeek, formatStoreHour } from "@/src/lib/shopFormat";
import { Section } from "./StoreOverviewSection";

export default function StoreHoursSection({
  hours,
  loading = false,
  onEditHours,
}: {
  hours: StoreHour[];
  loading?: boolean;
  onEditHours?: () => void;
}) {
  const jsDay = new Date().getDay();
  const todayDayName =
    jsDay === 0
      ? "SUNDAY"
      : jsDay === 1
        ? "MONDAY"
        : jsDay === 2
          ? "TUESDAY"
          : jsDay === 3
            ? "WEDNESDAY"
            : jsDay === 4
              ? "THURSDAY"
              : jsDay === 5
                ? "FRIDAY"
                : "SATURDAY";

  return (
    <Section
      title={`ម៉ោងដំណើរការ (${hours.length})`}
      icon={<Clock3 size={22} />}
    >
      {loading ? (
        <div className="flex min-h-36 items-center justify-center rounded-2xl border border-gray-100 bg-gray-50/50">
          <div className="text-center">
            <Loader2 size={28} className="mx-auto animate-spin text-primary-800" />
            <p className="mt-2 text-base font-medium text-gray-500">
              កំពុងទាញយកម៉ោងដំណើរការ...
            </p>
          </div>
        </div>
      ) : hours.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 p-8 text-center">
          <Clock3 size={32} className="mx-auto text-gray-300" />
          <p className="mt-2 text-lg font-medium text-gray-400">
            មិនទាន់មានទិន្នន័យម៉ោងដំណើរការឡើយ
          </p>
          {onEditHours && (
            <button
              type="button"
              onClick={onEditHours}
              className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary-800 px-5 py-2 text-lg font-bold text-white shadow-xs transition hover:bg-primary-900"
            >
              <Pencil size={16} />
              កំណត់ម៉ោងដំណើរការ
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2.5">
          {hours.map((hour, index) => {
            const isSpecial = hour.scheduleType === "SPECIAL_DATE";
            const isToday =
              !isSpecial &&
              String(hour.dayOfWeek).toUpperCase() === todayDayName;

            const title = isSpecial
              ? (hour.businessDate ?? "ថ្ងៃពិសេស")
              : formatDayOfWeek(hour.dayOfWeek);

            return (
              <div
                key={`${hour.scheduleType}-${index}`}
                className={`flex flex-col gap-3 rounded-2xl border px-4 py-3.5 transition sm:flex-row sm:items-center sm:justify-between ${
                  isToday
                    ? "border-emerald-200 bg-emerald-50/40"
                    : "border-gray-100 bg-gray-50/60 hover:border-gray-200 hover:bg-gray-50"
                }`}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      isSpecial
                        ? "bg-secondary-50 text-secondary-600"
                        : isToday
                          ? "bg-[#137A3D] text-white"
                          : "bg-primary-50 text-primary-800"
                    }`}
                  >
                    <CalendarClock size={20} />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-semibold text-gray-800">
                        {title}
                      </p>

                      {isToday && (
                        <span className="rounded-full bg-[#137A3D] px-2.5 py-0.5 text-sm font-bold text-white">
                          ថ្ងៃនេះ
                        </span>
                      )}
                    </div>

                    <p className="mt-0.5 text-base text-gray-500">
                      {hour.scheduleType}
                      {hour.reason ? ` · ${hour.reason}` : ""}
                    </p>
                  </div>
                </div>

                <div
                  className={`inline-flex min-h-9 shrink-0 items-center justify-center rounded-full border px-4 text-lg font-semibold ${
                    hour.isClosed
                      ? "border-red-100 bg-red-50 text-red-600"
                      : "border-emerald-100 bg-white text-emerald-800"
                  }`}
                >
                  {formatStoreHour(hour)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Section>
  );
}
