"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Clock3, Loader2, Plus, Save, Trash2, X } from "lucide-react";

import {
  useGetStoreHoursQuery,
  useReplaceStoreHoursMutation,
} from "@/src/app/store/shop/shopApi";
import type { StoreHour } from "@/src/types/shop";
import { getShopApiErrorMessage } from "@/src/lib/shopApiError";
import StoreSelect from "./StoreSelect";

const weekly = (): StoreHour => ({
  scheduleType: "WEEKLY",
  dayOfWeek: 1,
  businessDate: null,
  openingTime: "08:00:00",
  closingTime: "17:00:00",
  intervalOrder: 1,
  isClosed: false,
  reason: null,
});

const special = (): StoreHour => ({
  scheduleType: "SPECIAL_DATE",
  dayOfWeek: null,
  businessDate: "",
  openingTime: "10:00:00",
  closingTime: "15:00:00",
  intervalOrder: 1,
  isClosed: false,
  reason: "",
});

const dayOptions = [
  { value: "1", label: "Monday" },
  { value: "2", label: "Tuesday" },
  { value: "3", label: "Wednesday" },
  { value: "4", label: "Thursday" },
  { value: "5", label: "Friday" },
  { value: "6", label: "Saturday" },
  { value: "7", label: "Sunday" },
];

export default function StoreHoursModal({
  storeUuid,
  open,
  onClose,
  onChanged,
}: {
  storeUuid: string;
  open: boolean;
  onClose: () => void;
  onChanged?: () => void | Promise<void>;
}) {
  const {
    data,
    error: loadError,
    isLoading,
    refetch,
  } = useGetStoreHoursQuery(storeUuid, { skip: !open });

  const [replace, { isLoading: saving }] = useReplaceStoreHoursMutation();
  const [hours, setHours] = useState<StoreHour[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && data) {
      setHours(data.map((item) => ({ ...item })));
      setError(null);
    }
  }, [open, data]);

  if (!open) return null;

  const patch = (index: number, value: Partial<StoreHour>) => {
    setHours((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...value } : item,
      ),
    );
  };

  const save = async () => {
    for (const [index, hour] of hours.entries()) {
      if (
        hour.scheduleType === "WEEKLY" &&
        (!hour.dayOfWeek || hour.dayOfWeek < 1 || hour.dayOfWeek > 7)
      ) {
        setError(`Row ${index + 1}: dayOfWeek 1..7`);
        return;
      }

      if (hour.scheduleType === "SPECIAL_DATE" && !hour.businessDate) {
        setError(`Row ${index + 1}: businessDate required`);
        return;
      }

      if (!hour.isClosed && (!hour.openingTime || !hour.closingTime)) {
        setError(`Row ${index + 1}: opening/closing required`);
        return;
      }
    }

    try {
      setError(null);

      await replace({
        storeUuid,
        body: {
          hours: hours.map((hour) => ({
            ...hour,
            openingTime: hour.isClosed ? null : hour.openingTime,
            closingTime: hour.isClosed ? null : hour.closingTime,
            dayOfWeek: hour.scheduleType === "WEEKLY" ? hour.dayOfWeek : null,
            businessDate:
              hour.scheduleType === "SPECIAL_DATE" ? hour.businessDate : null,
          })),
        },
      }).unwrap();

      await refetch();
      await onChanged?.();
      onClose();
    } catch (requestError) {
      setError(getShopApiErrorMessage(requestError));
    }
  };

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/50 p-4 backdrop-blur-[2px]">
      <div className="max-h-[94vh] w-full max-w-7xl overflow-y-auto rounded-[30px] bg-white shadow-2xl">
        <div className="sticky top-0 z-30 flex items-start justify-between border-b border-gray-100 bg-white px-6 py-5">
          <div>
            <p className="flex items-center gap-3 text-4xl font-bold text-[#136C34]">
              <Clock3 size={28} />
              ម៉ោងបើកបិទ Store
            </p>
            <p className="mt-1 text-base text-gray-500">
              កែប្រែ Weekly schedule និង Special date schedule។
            </p>
          </div>

          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setHours((current) => [...current, weekly()])}
              className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2.5 text-lg font-semibold text-[#137A3D] transition hover:bg-emerald-100"
            >
              <Plus size={18} />
              Weekly
            </button>

            <button
              type="button"
              onClick={() => setHours((current) => [...current, special()])}
              className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-4 py-2.5 text-lg font-semibold text-[#F97316] transition hover:bg-orange-100"
            >
              <Plus size={18} />
              Special date
            </button>
          </div>

          {isLoading ? (
            <div className="p-16 text-center">
              <Loader2 size={32} className="mx-auto animate-spin text-[#137A3D]" />
            </div>
          ) : loadError ? (
            <div className="mt-5 rounded-2xl bg-red-50 p-4 text-base text-red-600">
              {getShopApiErrorMessage(loadError)}
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              {hours.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-200 p-12 text-center text-lg text-gray-400">
                  មិនទាន់មានម៉ោងបើកបិទ
                </div>
              ) : (
                hours.map((hour, index) => (
                  <div
                    key={`${hour.scheduleType}-${index}`}
                    className="rounded-2xl border border-gray-100 bg-gray-50 p-4"
                  >
                    <div className="grid gap-4 xl:grid-cols-4">
                      <label>
                        <span className="mb-2 block text-lg font-semibold text-[#F97316]">
                          Schedule type
                        </span>
                        <StoreSelect
                          value={hour.scheduleType}
                          onChange={(value) =>
                            patch(
                              index,
                              value === "WEEKLY"
                                ? {
                                    scheduleType: "WEEKLY",
                                    dayOfWeek: 1,
                                    businessDate: null,
                                  }
                                : {
                                    scheduleType: "SPECIAL_DATE",
                                    dayOfWeek: null,
                                    businessDate: "",
                                  },
                            )
                          }
                          options={[
                            { value: "WEEKLY", label: "WEEKLY" },
                            { value: "SPECIAL_DATE", label: "SPECIAL_DATE" },
                          ]}
                        />
                      </label>

                      {hour.scheduleType === "WEEKLY" ? (
                        <label>
                          <span className="mb-2 block text-lg font-semibold text-[#F97316]">
                            Day
                          </span>
                          <StoreSelect
                            value={String(hour.dayOfWeek ?? 1)}
                            onChange={(value) =>
                              patch(index, { dayOfWeek: Number(value) })
                            }
                            options={dayOptions}
                          />
                        </label>
                      ) : (
                        <FieldLabel label="Business date">
                          <input
                            type="date"
                            value={hour.businessDate ?? ""}
                            onChange={(event) =>
                              patch(index, { businessDate: event.target.value })
                            }
                            className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-base outline-none focus:border-[#136C34]"
                          />
                        </FieldLabel>
                      )}

                      <FieldLabel label="Opening time">
                        <input
                          type="time"
                          step="1"
                          disabled={hour.isClosed}
                          value={hour.openingTime?.slice(0, 8) ?? ""}
                          onChange={(event) =>
                            patch(index, {
                              openingTime:
                                event.target.value.length === 5
                                  ? `${event.target.value}:00`
                                  : event.target.value,
                            })
                          }
                          className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-base outline-none focus:border-[#136C34] disabled:opacity-40"
                        />
                      </FieldLabel>

                      <FieldLabel label="Closing time">
                        <input
                          type="time"
                          step="1"
                          disabled={hour.isClosed}
                          value={hour.closingTime?.slice(0, 8) ?? ""}
                          onChange={(event) =>
                            patch(index, {
                              closingTime:
                                event.target.value.length === 5
                                  ? `${event.target.value}:00`
                                  : event.target.value,
                            })
                          }
                          className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-base outline-none focus:border-[#136C34] disabled:opacity-40"
                        />
                      </FieldLabel>
                    </div>

                    <div className="mt-4 grid gap-4 md:grid-cols-[160px_180px_1fr_48px]">
                      <FieldLabel label="Interval order">
                        <input
                          type="number"
                          min="1"
                          value={hour.intervalOrder}
                          onChange={(event) =>
                            patch(index, {
                              intervalOrder: Number(event.target.value) || 1,
                            })
                          }
                          className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-base outline-none focus:border-[#136C34]"
                        />
                      </FieldLabel>

                      <label>
                        <span className="mb-2 block text-lg font-semibold text-[#F97316]">
                          Closed
                        </span>
                        <div className="flex h-12 items-center gap-3 rounded-xl border border-gray-200 bg-white px-4">
                          <input
                            type="checkbox"
                            checked={hour.isClosed}
                            onChange={(event) =>
                              patch(index, { isClosed: event.target.checked })
                            }
                            className="h-5 w-5 accent-[#F97316]"
                          />
                          <span className="text-base text-gray-600">
                            បិទថ្ងៃនេះ
                          </span>
                        </div>
                      </label>

                      <FieldLabel label="Reason">
                        <input
                          value={hour.reason ?? ""}
                          onChange={(event) =>
                            patch(index, { reason: event.target.value || null })
                          }
                          placeholder="Reason"
                          className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-base outline-none focus:border-[#136C34]"
                        />
                      </FieldLabel>

                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() =>
                            setHours((current) =>
                              current.filter((_, itemIndex) => itemIndex !== index),
                            )
                          }
                          className="flex h-12 w-12 items-center justify-center rounded-xl text-red-500 transition hover:bg-red-50"
                          aria-label="Remove hour"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {error && (
            <div className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-base text-red-600">
              {error}
            </div>
          )}

          <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-5">
            <button
              type="button"
              disabled={saving}
              onClick={onClose}
              className="rounded-xl border border-gray-200 px-5 py-2.5 text-lg text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
            >
              បោះបង់
            </button>

            <button
              type="button"
              disabled={saving || isLoading || Boolean(loadError)}
              onClick={() => void save()}
              className="inline-flex items-center gap-2 rounded-xl bg-[#136C34] px-5 py-2.5 text-lg text-white transition hover:bg-[#0f592b] disabled:opacity-50"
            >
              {saving ? (
                <Loader2 size={17} className="animate-spin" />
              ) : (
                <Save size={17} />
              )}
              រក្សាទុកម៉ោង
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FieldLabel({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label>
      <span className="mb-2 block text-lg font-semibold text-[#F97316]">{label}</span>
      {children}
    </label>
  );
}
