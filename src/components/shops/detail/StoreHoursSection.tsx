import { CalendarClock, Clock3, Loader2 } from "lucide-react";
import type { StoreHour } from "@/src/types/shop";
import { formatDayOfWeek, formatStoreHour } from "@/src/lib/shopFormat";
import { Section } from "./StoreOverviewSection";

export default function StoreHoursSection({
  hours,
  loading = false,
}: {
  hours: StoreHour[];
  loading?: boolean;
}) {
  return (
    <Section
      title={`Opening hours (${hours.length})`}
      icon={<Clock3 size={24} />}
    >
      {loading ? (
        <div className="flex min-h-40 items-center justify-center rounded-2xl border border-gray-100 bg-gray-50/50">
          <div className="text-center">
            <Loader2 size={32} className="mx-auto animate-spin text-primary-800" />
            <p className="mt-3 text-lg font-medium text-gray-500">
              Loading opening hours...
            </p>
          </div>
        </div>
      ) : hours.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 px-5 py-10 text-center">
          <Clock3 size={36} className="mx-auto text-gray-300" />
          <p className="mt-3 text-lg font-bold text-gray-700">
            No opening hours available
          </p>
          <p className="mt-1 text-lg text-gray-500">
            Store schedule has not been configured yet.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {hours.map((hour, index) => {
            const isSpecial = hour.scheduleType === "SPECIAL_DATE";
            const title = isSpecial
              ? (hour.businessDate ?? "Special date")
              : formatDayOfWeek(hour.dayOfWeek);

            return (
              <div
                key={`${hour.scheduleType}-${index}`}
                className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-gray-50/70 px-4 py-4 transition hover:border-gray-200 hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                      isSpecial
                        ? "bg-secondary-50 text-secondary-600"
                        : "bg-emerald-50 text-emerald-700"
                    }`}
                  >
                    <CalendarClock size={22} />
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xl font-bold text-gray-900">
                        {title}
                      </p>

                      {isSpecial && (
                        <span className="rounded-full bg-secondary-50 px-3 py-1 text-lg font-semibold text-secondary-600">
                          Special
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-lg text-gray-500">
                      {hour.scheduleType}
                      {" · "}
                      Interval {hour.intervalOrder}
                      {hour.reason ? ` · ${hour.reason}` : ""}
                    </p>
                  </div>
                </div>

                <div
                  className={`inline-flex min-h-11 shrink-0 items-center justify-center rounded-full border px-4 text-lg font-bold ${
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
