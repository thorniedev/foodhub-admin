"use client";

import { useEffect, useId, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarDays, MapPin, RotateCcw, Search, SlidersHorizontal } from "lucide-react";

import CustomSelect, {
  type CustomSelectOption,
} from "@/src/components/ui/CustomSelect";
import { cn } from "@/src/lib/utils";
import {
  DASHBOARD_MAX_RADIUS_KM,
  DEFAULT_DASHBOARD_FILTERS,
  dashboardFilterFormSchema,
  filtersToFormValues,
  formValuesToFilters,
  resolveDateRange,
  todayInDashboardZone,
  type DashboardFilterFormValues,
} from "@/src/lib/dashboardFilters";
import type {
  DashboardDatePreset,
  DashboardFilters,
} from "@/src/types/adminDashboard";

const PRESETS: { value: DashboardDatePreset; label: string }[] = [
  { value: "7d", label: "៧ ថ្ងៃ" },
  { value: "30d", label: "៣០ ថ្ងៃ" },
  { value: "90d", label: "៩០ ថ្ងៃ" },
  { value: "custom", label: "ជ្រើសឯង" },
];

export interface DashboardFilterBarProps {
  filters: DashboardFilters;
  onApply: (filters: DashboardFilters) => void;
  onReset: () => void;
  categoryOptions: CustomSelectOption[];
  cityOptions?: string[];
  provinceOptions?: string[];
  isFetching?: boolean;
  /** Rendered on the right of the action row (the export menu). */
  actions?: React.ReactNode;
}

export default function DashboardFilterBar({
  filters,
  onApply,
  onReset,
  categoryOptions,
  cityOptions = [],
  provinceOptions = [],
  isFetching = false,
  actions,
}: DashboardFilterBarProps) {
  const today = todayInDashboardZone();
  const cityListId = useId();
  const provinceListId = useId();

  const defaultValues = useMemo(
    () => filtersToFormValues(filters, today),
    [filters, today],
  );

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<DashboardFilterFormValues>({
    resolver: zodResolver(dashboardFilterFormSchema),
    defaultValues,
    mode: "onSubmit",
  });

  // Keep the draft in sync when filters change from outside (URL, reset).
  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const preset = watch("preset");
  const isCustom = preset === "custom";

  const submit = handleSubmit((values) => {
    onApply(formValuesToFilters(values));
  });

  const selectPreset = (next: DashboardDatePreset) => {
    setValue("preset", next, { shouldDirty: true });

    if (next === "custom") {
      // Seed the custom inputs with the range currently on screen.
      const range = resolveDateRange(filters, today);
      setValue("from", range.from);
      setValue("to", range.to);
      return;
    }

    // A preset click is an intentional action, so it applies straight away.
    void submit();
  };

  const selectedCategory = watch("categoryCode") ?? "";

  const categorySelectOptions = useMemo<CustomSelectOption[]>(
    () => [{ value: "", label: "ប្រភេទទាំងអស់" }, ...categoryOptions],
    [categoryOptions],
  );

  return (
    <form
      onSubmit={submit}
      aria-label="តម្រងទិន្នន័យវិភាគ"
      className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-2 text-base font-semibold text-gray-700">
          <SlidersHorizontal size={18} aria-hidden="true" className="text-primary-700" />
          តម្រង
        </span>

        <div
          role="group"
          aria-label="ចន្លោះកាលបរិច្ឆេទ"
          className="ml-auto flex flex-wrap items-center gap-1 rounded-full bg-gray-100 p-1"
        >
          {PRESETS.map((option) => {
            const active = preset === option.value;

            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={active}
                onClick={() => selectPreset(option.value)}
                className={cn(
                  "min-h-9 rounded-full px-4 text-base font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
                  active
                    ? "bg-white text-primary-800 shadow-sm"
                    : "text-gray-600 hover:text-gray-900",
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {isCustom && (
          <>
            <Field label="ពីថ្ងៃ" error={errors.from?.message} icon={<CalendarDays size={16} />}>
              <input
                type="date"
                max={today}
                {...register("from")}
                className={inputClassName(Boolean(errors.from))}
              />
            </Field>

            <Field label="ដល់ថ្ងៃ" error={errors.to?.message} icon={<CalendarDays size={16} />}>
              <input
                type="date"
                max={today}
                {...register("to")}
                className={inputClassName(Boolean(errors.to))}
              />
            </Field>
          </>
        )}

        <Field label="ក្រុង" error={errors.city?.message}>
          <input
            type="text"
            list={cityListId}
            placeholder="ឧ. Phnom Penh"
            autoComplete="off"
            {...register("city")}
            className={inputClassName(Boolean(errors.city))}
          />
          <datalist id={cityListId}>
            {cityOptions.map((city) => (
              <option key={city} value={city} />
            ))}
          </datalist>
        </Field>

        <Field label="ខេត្ត" error={errors.province?.message}>
          <input
            type="text"
            list={provinceListId}
            placeholder="ឧ. Kandal"
            autoComplete="off"
            {...register("province")}
            className={inputClassName(Boolean(errors.province))}
          />
          <datalist id={provinceListId}>
            {provinceOptions.map((province) => (
              <option key={province} value={province} />
            ))}
          </datalist>
        </Field>

        <Field label="ប្រភេទម្ហូប" error={errors.categoryCode?.message}>
          <Controller
            control={control}
            name="categoryCode"
            render={({ field }) => (
              <CustomSelect
                value={selectedCategory}
                onChange={field.onChange}
                options={categorySelectOptions}
                placeholder="ប្រភេទទាំងអស់"
                className="[&>button]:h-11 [&>button]:rounded-xl"
              />
            )}
          />
        </Field>

        <Field
          label="រយៈទទឹង (latitude)"
          error={errors.latitude?.message}
          icon={<MapPin size={16} />}
        >
          <input
            type="number"
            step="any"
            inputMode="decimal"
            placeholder="11.5564"
            {...register("latitude")}
            className={inputClassName(Boolean(errors.latitude))}
          />
        </Field>

        <Field
          label="រយៈបណ្ដោយ (longitude)"
          error={errors.longitude?.message}
          icon={<MapPin size={16} />}
        >
          <input
            type="number"
            step="any"
            inputMode="decimal"
            placeholder="104.9282"
            {...register("longitude")}
            className={inputClassName(Boolean(errors.longitude))}
          />
        </Field>

        <Field
          label={`កាំ (គ.ម, អតិបរមា ${DASHBOARD_MAX_RADIUS_KM})`}
          error={errors.radiusKm?.message}
        >
          <input
            type="number"
            step="any"
            min={0}
            max={DASHBOARD_MAX_RADIUS_KM}
            inputMode="decimal"
            placeholder="5"
            {...register("radiusKm")}
            className={inputClassName(Boolean(errors.radiusKm))}
          />
        </Field>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-end gap-2 border-t border-gray-100 pt-4">
        <button
          type="button"
          onClick={() => {
            reset(filtersToFormValues(DEFAULT_DASHBOARD_FILTERS, today));
            onReset();
          }}
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-gray-200 px-4 text-base font-semibold text-gray-700 transition hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
        >
          <RotateCcw size={18} aria-hidden="true" />
          កំណត់ឡើងវិញ
        </button>

        <button
          type="submit"
          disabled={isFetching}
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary-700 px-5 text-base font-bold text-white transition hover:bg-primary-800 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Search size={18} aria-hidden="true" />
          អនុវត្តតម្រង
        </button>

        {actions}
      </div>
    </form>
  );
}

function inputClassName(hasError: boolean): string {
  return cn(
    "h-11 w-full rounded-xl border bg-white px-3 text-base text-gray-900 transition outline-none placeholder:text-gray-400",
    hasError
      ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
      : "border-gray-200 hover:border-gray-300 focus:border-primary-600 focus:ring-2 focus:ring-primary-100",
  );
}

function Field({
  label,
  error,
  icon,
  children,
}: {
  label: string;
  error?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="flex items-center gap-1.5 text-base font-medium text-gray-600">
        {icon && <span aria-hidden="true" className="text-gray-400">{icon}</span>}
        {label}
      </span>

      {children}

      {error && (
        <span role="alert" className="text-sm font-medium text-red-600">
          {error}
        </span>
      )}
    </label>
  );
}
