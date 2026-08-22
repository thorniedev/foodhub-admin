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
  } = useGetStoreHoursQuery(storeUuid, {
    skip: !open,
  });

  const [replace, { isLoading: saving }] = useReplaceStoreHoursMutation();

  const [hours, setHours] = useState<StoreHour[]>([]);

  const [error, setError] = useState<string | null>(null);

  /*
   * Load existing schedule data.
   */
  useEffect(() => {
    if (open && data) {
      setHours(
        data.map((item) => ({
          ...item,
        })),
      );

      setError(null);
    }
  }, [open, data]);

  /*
   * Prevent page behind the popup
   * from scrolling.
   */
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) return null;

  const patch = (index: number, value: Partial<StoreHour>) => {
    setHours((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              ...value,
            }
          : item,
      ),
    );
  };

  const removeHour = (index: number) => {
    setHours((current) =>
      current.filter((_, itemIndex) => itemIndex !== index),
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
    <div
      className="
        fixed inset-0 z-[130]
        flex items-center justify-center
        bg-black/40
        p-4
        backdrop-blur-[3px]
      "
    >
      {/* Modal */}
      <div
        className="
          max-h-[94vh]
          w-full
          max-w-7xl
          overflow-y-auto
          rounded-3xl
          border border-gray-100
          bg-white
          shadow-2xl

          [scrollbar-width:none]
          [-ms-overflow-style:none]
          [&::-webkit-scrollbar]:hidden
        "
      >
        {/* Header */}
        <div
          className="
            sticky top-0 z-30
            flex items-center
            justify-between
            border-b border-gray-100
            bg-white/95
            px-6 py-5
            backdrop-blur-md
            sm:px-8
          "
        >
          <div
            className="
              flex min-w-0
              items-center
              gap-4
            "
          >
            <div
              className="
                flex h-12 w-12
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-primary-50
                text-primary-800
              "
            >
              <Clock3 size={24} />
            </div>

            <div className="min-w-0">
              <p
                className="
                  text-2xl
                  font-bold
                  text-primary-800
                "
              >
                ម៉ោងបើកបិទ Store
              </p>

              <p
                className="
                  mt-1
                  text-lg
                  leading-7
                  text-gray-500
                "
              >
                កែប្រែ Weekly schedule និង Special date schedule។
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            aria-label="Close"
            className="
              flex h-11 w-11
              shrink-0
              items-center
              justify-center
              rounded-full
              text-gray-400
              transition
              hover:bg-gray-100
              hover:text-gray-700
              focus:outline-none
              focus:ring-4
              focus:ring-gray-100
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            <X size={22} />
          </button>
        </div>

        {/* Content */}
        <div
          className="
            space-y-6
            p-6
            sm:p-8
          "
        >
          {/* Schedule actions */}
          <section
            className="
              rounded-2xl
              border border-gray-100
              bg-white
              p-5
              sm:p-6
            "
          >
            <div
              className="
                flex flex-col gap-4
                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >
              <div>
                <p
                  className="
                    text-2xl
                    font-bold
                    text-primary-800
                  "
                >
                  កាលវិភាគបើកបិទ
                </p>

                <p
                  className="
                    mt-1
                    text-lg
                    leading-7
                    text-gray-500
                  "
                >
                  បន្ថែមម៉ោងប្រចាំសប្ដាហ៍ ឬថ្ងៃពិសេស។
                </p>
              </div>

              <div
                className="
                  flex flex-wrap
                  items-center
                  gap-3
                "
              >
                <button
                  type="button"
                  onClick={() => setHours((current) => [...current, weekly()])}
                  className="
                    inline-flex
                    min-h-12
                    items-center
                    justify-center
                    gap-2
                    rounded-full
                    border
                    border-primary-200
                    bg-primary-50
                    px-5
                    text-lg
                    font-medium
                    text-primary-800
                    transition
                    hover:bg-primary-100
                    focus:outline-none
                    focus:ring-4
                    focus:ring-primary-100
                  "
                >
                  <Plus size={20} />
                  Weekly
                </button>

                <button
                  type="button"
                  onClick={() => setHours((current) => [...current, special()])}
                  className="
                    inline-flex
                    min-h-12
                    items-center
                    justify-center
                    gap-2
                    rounded-full
                    border
                    border-secondary-200
                    bg-secondary-50
                    px-5
                    text-lg
                    font-medium
                    text-secondary-700
                    transition
                    hover:bg-secondary-100
                    focus:outline-none
                    focus:ring-4
                    focus:ring-secondary-100
                  "
                >
                  <Plus size={20} />
                  Special date
                </button>
              </div>
            </div>
          </section>

          {/* Schedule list */}
          <section
            className="
              rounded-2xl
              border border-gray-100
              bg-white
              p-5
              sm:p-6
            "
          >
            <p
              className="
                text-2xl
                font-bold
                text-primary-800
              "
            >
              ម៉ោងបើកបិទបច្ចុប្បន្ន
            </p>

            {isLoading ? (
              <div
                className="
                  flex min-h-56
                  items-center
                  justify-center
                "
              >
                <div className="text-center">
                  <Loader2
                    size={34}
                    className="
                      mx-auto
                      animate-spin
                      text-primary-800
                    "
                  />

                  <p
                    className="
                      mt-3
                      text-lg
                      font-medium
                      text-gray-500
                    "
                  >
                    កំពុងទាញទិន្នន័យ...
                  </p>
                </div>
              </div>
            ) : loadError ? (
              <div
                className="
                  mt-5
                  rounded-2xl
                  border border-red-100
                  bg-red-50
                  px-5 py-4
                  text-lg
                  leading-7
                  text-red-600
                "
              >
                {getShopApiErrorMessage(loadError)}
              </div>
            ) : (
              <div className="mt-5 space-y-4">
                {hours.length === 0 ? (
                  <div
                    className="
                      rounded-2xl
                      border border-dashed
                      border-gray-200
                      bg-gray-50/50
                      p-12
                      text-center
                    "
                  >
                    <Clock3
                      size={34}
                      className="
                        mx-auto
                        text-gray-300
                      "
                    />

                    <p
                      className="
                        mt-3
                        text-lg
                        font-medium
                        text-gray-400
                      "
                    >
                      មិនទាន់មានម៉ោងបើកបិទ
                    </p>
                  </div>
                ) : (
                  hours.map((hour, index) => (
                    <ScheduleCard
                      key={`${hour.scheduleType}-${index}`}
                      hour={hour}
                      index={index}
                      patch={patch}
                      onRemove={() => removeHour(index)}
                    />
                  ))
                )}
              </div>
            )}
          </section>

          {/* Error */}
          {error && (
            <div
              className="
                rounded-2xl
                border border-red-100
                bg-red-50
                px-5 py-4
                text-lg
                leading-7
                text-red-600
              "
            >
              {error}
            </div>
          )}

          {/* Actions */}
          <div
            className="
              flex
              flex-col-reverse
              gap-3
              border-t
              border-gray-100
              pt-6
              sm:flex-row
              sm:items-center
              sm:justify-end
            "
          >
            <button
              type="button"
              disabled={saving}
              onClick={onClose}
              className="
                inline-flex
                min-h-12
                items-center
                justify-center
                rounded-full
                border
                border-gray-200
                bg-white
                px-7
                text-lg
                font-medium
                text-gray-600
                transition
                hover:border-primary-200
                hover:bg-primary-50
                hover:text-primary-800
                focus:outline-none
                focus:ring-4
                focus:ring-primary-100
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              បោះបង់
            </button>

            <button
              type="button"
              disabled={saving || isLoading || Boolean(loadError)}
              onClick={() => void save()}
              className="
                inline-flex
                min-h-12
                items-center
                justify-center
                gap-2
                rounded-full
                bg-primary-800
                px-7
                text-lg
                font-medium
                text-white
                transition
                hover:bg-primary-900
                focus:outline-none
                focus:ring-4
                focus:ring-primary-200
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {saving ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Save size={20} />
              )}
              រក្សាទុកម៉ោង
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScheduleCard({
  hour,
  index,
  patch,
  onRemove,
}: {
  hour: StoreHour;
  index: number;
  patch: (index: number, value: Partial<StoreHour>) => void;
  onRemove: () => void;
}) {
  const isSpecial = hour.scheduleType === "SPECIAL_DATE";

  return (
    <div
      className="
        rounded-2xl
        border border-gray-100
        bg-gray-50/60
        p-5
      "
    >
      {/* Card header */}
      <div
        className="
          mb-5
          flex items-center
          justify-between
          gap-4
        "
      >
        <div className="min-w-0">
          <p
            className="
              text-lg
              font-semibold
              text-primary-800
            "
          >
            កាលវិភាគ #{index + 1}
          </p>

          <p
            className={`
              mt-1
              text-base
              font-medium
              ${isSpecial ? "text-secondary-600" : "text-gray-500"}
            `}
          >
            {isSpecial ? "Special date" : "Weekly"}
          </p>
        </div>

        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove hour"
          className="
            flex h-11 w-11
            shrink-0
            items-center
            justify-center
            rounded-full
            text-red-500
            transition
            hover:bg-red-50
            hover:text-red-600
            focus:outline-none
            focus:ring-4
            focus:ring-red-100
          "
        >
          <Trash2 size={20} />
        </button>
      </div>

      {/* Main fields */}
      <div
        className="
          grid gap-5
          xl:grid-cols-4
        "
      >
        <label className="block">
          <FieldText>Schedule type</FieldText>

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
              {
                value: "WEEKLY",
                label: "WEEKLY",
              },
              {
                value: "SPECIAL_DATE",
                label: "SPECIAL_DATE",
              },
            ]}
          />
        </label>

        {hour.scheduleType === "WEEKLY" ? (
          <label className="block">
            <FieldText>Day</FieldText>

            <StoreSelect
              value={String(hour.dayOfWeek ?? 1)}
              onChange={(value) =>
                patch(index, {
                  dayOfWeek: Number(value),
                })
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
                patch(index, {
                  businessDate: event.target.value,
                })
              }
              className={inputClassName}
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
            className={`${inputClassName} disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 disabled:opacity-60`}
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
            className={`${inputClassName} disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 disabled:opacity-60`}
          />
        </FieldLabel>
      </div>

      {/* Secondary fields */}
      <div
        className="
          mt-5
          grid gap-5
          md:grid-cols-2
          xl:grid-cols-[180px_220px_1fr]
        "
      >
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
            className={inputClassName}
          />
        </FieldLabel>

        <label className="block">
          <FieldText>Closed</FieldText>

          <div
            className="
              flex h-[52px]
              items-center
              gap-3
              rounded-xl
              border
              border-gray-200
              bg-white
              px-4
            "
          >
            <input
              type="checkbox"
              checked={hour.isClosed}
              onChange={(event) =>
                patch(index, {
                  isClosed: event.target.checked,
                })
              }
              className="
                h-5 w-5
                accent-primary-800
              "
            />

            <span
              className="
                text-lg
                text-gray-700
              "
            >
              បិទថ្ងៃនេះ
            </span>
          </div>
        </label>

        <FieldLabel label="Reason">
          <input
            value={hour.reason ?? ""}
            onChange={(event) =>
              patch(index, {
                reason: event.target.value || null,
              })
            }
            placeholder="Reason"
            className={inputClassName}
          />
        </FieldLabel>
      </div>
    </div>
  );
}

function FieldText({ children }: { children: ReactNode }) {
  return (
    <span
      className="
        mb-2
        block
        text-lg
        font-medium
        text-primary-800
      "
    >
      {children}
    </span>
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
    <label className="block">
      <FieldText>{label}</FieldText>

      {children}
    </label>
  );
}

const inputClassName = `
  h-[52px]
  w-full
  rounded-xl
  border
  border-gray-200
  bg-white
  px-4
  text-lg
  text-gray-800
  outline-none
  transition
  placeholder:text-gray-400
  hover:border-gray-300
  focus:border-primary-600
  focus:ring-4
  focus:ring-primary-100
`;
