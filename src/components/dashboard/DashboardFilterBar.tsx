"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Compass,
  Filter,
  MapPin,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Utensils,
  X,
} from "lucide-react";

import CustomSelect, {
  type CustomSelectOption,
} from "@/src/components/ui/CustomSelect";
import { cn } from "@/src/lib/utils";
import {
  CAMBODIA_PROVINCES,
  POPULAR_GEO_HUBS,
} from "@/src/lib/cambodia-provinces";
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

const PRESETS: { value: DashboardDatePreset; label: string; shortLabel: string }[] = [
  { value: "7d", label: "៧ ថ្ងៃ", shortLabel: "7 ថ្ងៃ" },
  { value: "30d", label: "៣០ ថ្ងៃ", shortLabel: "30 ថ្ងៃ" },
  { value: "90d", label: "៩០ ថ្ងៃ", shortLabel: "90 ថ្ងៃ" },
  { value: "custom", label: "ជ្រើសកាលបរិច្ឆេទ", shortLabel: "ផ្ទាល់ខ្លួន" },
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
  const [showAdvancedGeo, setShowAdvancedGeo] = useState(
    filters.latitude !== undefined && filters.longitude !== undefined,
  );

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
    if (defaultValues.latitude !== "" && defaultValues.longitude !== "") {
      setShowAdvancedGeo(true);
    }
  }, [defaultValues, reset]);

  const preset = watch("preset");
  const isCustom = preset === "custom";
  const selectedProvince = watch("province") ?? "";
  const selectedCity = watch("city") ?? "";
  const selectedCategory = watch("categoryCode") ?? "";
  const latitude = watch("latitude") ?? "";
  const longitude = watch("longitude") ?? "";
  const radiusKm = watch("radiusKm") ?? "";

  const submit = handleSubmit((values) => {
    onApply(formValuesToFilters(values));
  });

  const selectPreset = (next: DashboardDatePreset) => {
    setValue("preset", next, { shouldDirty: true });

    if (next === "custom") {
      const range = resolveDateRange(filters, today);
      setValue("from", range.from);
      setValue("to", range.to);
      return;
    }

    void submit();
  };

  // Build Province Options with Cambodia Provinces + dynamic values
  const provinceSelectOptions = useMemo<CustomSelectOption[]>(() => {
    const defaultOption: CustomSelectOption = {
      value: "",
      label: "រាជធានី / ខេត្តទាំងអស់ (All Provinces)",
    };

    const predefined: CustomSelectOption[] = CAMBODIA_PROVINCES.map((p) => ({
      value: p.nameEn,
      label: `${p.nameKh} (${p.nameEn})`,
    }));

    // Merge any unique provinces from API
    const existing = new Set(predefined.map((p) => p.value.toLowerCase()));
    const extra: CustomSelectOption[] = provinceOptions
      .filter((p) => p && !existing.has(p.toLowerCase()))
      .map((p) => ({
        value: p,
        label: p,
      }));

    return [defaultOption, ...predefined, ...extra];
  }, [provinceOptions]);

  // Category Options
  const categorySelectOptions = useMemo<CustomSelectOption[]>(
    () => [{ value: "", label: "ប្រភេទទាំងអស់ (All Categories)" }, ...categoryOptions],
    [categoryOptions],
  );

  // Apply Popular Hub preset
  const applyGeoHub = (hub: (typeof POPULAR_GEO_HUBS)[number]) => {
    setValue("latitude", String(hub.lat), { shouldDirty: true });
    setValue("longitude", String(hub.lng), { shouldDirty: true });
    if (!radiusKm) {
      setValue("radiusKm", "5", { shouldDirty: true });
    }
    if (hub.city) {
      setValue("city", hub.city, { shouldDirty: true });
    }
  };

  const clearGeoCoordinates = () => {
    setValue("latitude", "", { shouldDirty: true });
    setValue("longitude", "", { shouldDirty: true });
    setValue("radiusKm", "", { shouldDirty: true });
  };

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedProvince) count++;
    if (selectedCity) count++;
    if (selectedCategory) count++;
    if (latitude && longitude) count++;
    if (preset === "custom") count++;
    return count;
  }, [selectedProvince, selectedCity, selectedCategory, latitude, longitude, preset]);

  return (
    <form
      onSubmit={submit}
      noValidate
      aria-label="តម្រងទិន្នន័យវិភាគ"
      className="rounded-[24px] border border-gray-200/90 bg-white p-5 shadow-xs transition-all dark:border-slate-800 dark:bg-slate-900"
    >
      {/* Top Header: Filter Title & Date Presets */}
      <div className="flex flex-col gap-4 border-b border-gray-100 pb-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 text-primary-800 dark:bg-emerald-950/60 dark:text-emerald-400">
            <SlidersHorizontal size={18} aria-hidden="true" />
          </span>
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span>តម្រងទិន្នន័យ (Filters)</span>
              {activeFiltersCount > 0 && (
                <span className="inline-flex items-center rounded-full bg-primary-100 px-2 py-0.5 text-xs font-bold text-primary-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {activeFiltersCount} សកម្ម
                </span>
              )}
            </h3>
          </div>
        </div>

        {/* Date Range Preset Selector */}
        <div
          role="group"
          aria-label="ចន្លោះកាលបរិច្ឆេទ"
          className="flex flex-wrap items-center gap-1 rounded-full bg-gray-100/90 p-1 dark:bg-slate-800/90"
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
                  "min-h-9 rounded-full px-3.5 text-xs sm:text-sm font-bold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 cursor-pointer",
                  active
                    ? "bg-white text-primary-800 shadow-xs dark:bg-slate-950 dark:text-emerald-400"
                    : "text-gray-600 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white",
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Date Range Inputs (Only revealed when "ជ្រើសកាលបរិច្ឆេទ" is active) */}
      {isCustom && (
        <div className="mt-4 grid grid-cols-1 gap-3 rounded-2xl border border-primary-100 bg-primary-50/40 p-4 sm:grid-cols-2 dark:border-slate-800 dark:bg-slate-950/40 animate-in fade-in duration-200">
          <label className="block space-y-1.5">
              <span className="flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-slate-300">
                <CalendarDays size={14} className="text-primary-700 dark:text-emerald-400" />
              <span>កាលបរិច្ឆេទចាប់ផ្ដើម</span>
            </span>
            <input
              type="date"
              max={today}
              {...register("from")}
              className={inputClassName(Boolean(errors.from))}
            />
            {errors.from?.message && (
              <span className="block text-xs font-semibold text-red-600">{errors.from.message}</span>
            )}
          </label>

          <label className="block space-y-1.5">
              <span className="flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-slate-300">
                <CalendarDays size={14} className="text-primary-700 dark:text-emerald-400" />
              <span>កាលបរិច្ឆេទបញ្ចប់</span>
            </span>
            <input
              type="date"
              max={today}
              {...register("to")}
              className={inputClassName(Boolean(errors.to))}
            />
            {errors.to?.message && (
              <span className="block text-xs font-semibold text-red-600">{errors.to.message}</span>
            )}
          </label>
        </div>
      )}

      {/* Main Standard Filter Row: Province/Region + Food Category */}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Province / Region Dropdown */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-slate-300">
            <MapPin size={15} className="text-primary-700 dark:text-emerald-400" />
            <span>រាជធានី / ខេត្ត</span>
          </label>
          <Controller
            control={control}
            name="province"
            render={({ field }) => (
              <CustomSelect
                value={selectedProvince}
                onChange={(val) => {
                  field.onChange(val);
                }}
                options={provinceSelectOptions}
                placeholder="រាជធានី / ខេត្តទាំងអស់"
                className="[&>button]:h-11 [&>button]:rounded-xl"
              />
            )}
          />
          {errors.province?.message && (
            <p className="text-xs font-semibold text-red-600">{errors.province.message}</p>
          )}
        </div>

        {/* Food Category Dropdown */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-slate-300">
            <Utensils size={15} className="text-primary-700 dark:text-emerald-400" />
            <span>ប្រភេទម្ហូប</span>
          </label>
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
          {errors.categoryCode?.message && (
            <p className="text-xs font-semibold text-red-600">{errors.categoryCode.message}</p>
          )}
        </div>

        {/* City / District Filter (Optional quick search) */}
        <label className="block space-y-1.5">
          <span className="flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-slate-300">
            <Compass size={15} className="text-primary-700 dark:text-emerald-400" />
            <span>ក្រុង / ខណ្ឌ</span>
          </span>
          <input
            type="text"
            placeholder="ឧ. Daun Penh, Toul Kork, BKK"
            autoComplete="off"
            {...register("city")}
            className={inputClassName(Boolean(errors.city))}
          />
          {errors.city?.message && (
            <span className="block text-xs font-semibold text-red-600">{errors.city.message}</span>
          )}
        </label>
      </div>

      {/* Advanced Geo-Radius Accordion Toggle */}
      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setShowAdvancedGeo((prev) => !prev)}
          className="flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-primary-800 dark:text-slate-400 dark:hover:text-emerald-400 transition cursor-pointer"
        >
          <Compass size={14} className="text-primary-700 dark:text-emerald-400" />
          <span>
            {showAdvancedGeo ? "លាក់តម្រងកាំភូមិសាស្ត្រ" : "បង្ហាញតម្រងកាំភូមិសាស្ត្រកម្រិតខ្ពស់ (Geo Radius)"}
          </span>
          {showAdvancedGeo ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {latitude && longitude && (
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              📍 ទីតាំងជាក់លាក់
            </span>
          )}
        </button>

        {/* Collapsible Advanced Geo-Radius Section */}
        {showAdvancedGeo && (
          <div className="mt-3 rounded-2xl border border-gray-100 bg-gray-50/80 p-4 dark:border-slate-800 dark:bg-slate-950/60 animate-in fade-in duration-150 space-y-3.5">
            {/* Quick Popular Hubs Presets */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-700 dark:text-slate-300">
                  ទីតាំងពេញនិយម
                </span>
                {latitude && longitude && (
                  <button
                    type="button"
                    onClick={clearGeoCoordinates}
                    className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
                  >
                    សម្អាតកូអរដោនេ
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_GEO_HUBS.map((hub) => {
                  const isSelected =
                    latitude === String(hub.lat) && longitude === String(hub.lng);

                  return (
                    <button
                      key={hub.nameEn}
                      type="button"
                      onClick={() => applyGeoHub(hub)}
                      className={cn(
                        "rounded-xl px-2.5 py-1.5 text-xs font-semibold transition cursor-pointer shadow-2xs",
                        isSelected
                          ? "bg-primary-800 text-white font-bold dark:bg-emerald-600"
                          : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300",
                      )}
                    >
                      📍 {hub.nameKh}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Coordinates & Radius Slider */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 pt-2 border-t border-gray-200/60 dark:border-slate-800">
              <label className="block space-y-1">
                <span className="block text-[11px] font-bold text-gray-600 dark:text-slate-400">
                  រយៈទទឹង
                </span>
                <input
                  type="number"
                  step="any"
                  inputMode="decimal"
                  placeholder="11.5564"
                  {...register("latitude")}
                  className={inputClassName(Boolean(errors.latitude))}
                />
                {errors.latitude?.message && (
                  <span className="block text-[11px] font-semibold text-red-600">
                    {errors.latitude.message}
                  </span>
                )}
              </label>

              <label className="block space-y-1">
                <span className="block text-[11px] font-bold text-gray-600 dark:text-slate-400">
                  រយៈបណ្ដោយ
                </span>
                <input
                  type="number"
                  step="any"
                  inputMode="decimal"
                  placeholder="104.9282"
                  {...register("longitude")}
                  className={inputClassName(Boolean(errors.longitude))}
                />
                {errors.longitude?.message && (
                  <span className="block text-[11px] font-semibold text-red-600">
                    {errors.longitude.message}
                  </span>
                )}
              </label>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-gray-600 dark:text-slate-400">
                  <span>កាំស្វែងរក</span>
                  <span className="font-bold text-primary-800 dark:text-emerald-400">
                    {radiusKm ? `${radiusKm} km` : "5 km"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={1}
                    max={DASHBOARD_MAX_RADIUS_KM}
                    step={1}
                    value={radiusKm ? Number(radiusKm) : 5}
                    onChange={(e) => setValue("radiusKm", e.target.value, { shouldDirty: true })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-800 dark:bg-slate-700"
                  />
                  <input
                    type="number"
                    min={1}
                    max={DASHBOARD_MAX_RADIUS_KM}
                    placeholder="5"
                    aria-label="កាំស្វែងរក (គ.ម)"
                    {...register("radiusKm")}
                    className="w-16 h-9 rounded-xl border border-gray-200 text-center text-xs font-bold text-gray-800 dark:bg-slate-900 dark:border-slate-800 dark:text-white"
                  />
                </div>
                {errors.radiusKm?.message && (
                  <p className="text-[11px] font-semibold text-red-600">
                    {errors.radiusKm.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons Toolbar & Active Badges */}
      <div className="mt-4 flex flex-col gap-3 pt-4 border-t border-gray-100 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
        {/* Active Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5 min-w-0">
          {selectedProvince && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2.5 py-1 text-xs font-bold text-primary-800 dark:bg-emerald-950/60 dark:text-emerald-300">
              📍 {selectedProvince}
              <button
                type="button"
                onClick={() => setValue("province", "", { shouldDirty: true })}
                className="hover:text-red-500 cursor-pointer"
              >
                <X size={12} />
              </button>
            </span>
          )}

          {selectedCategory && (
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary-50 px-2.5 py-1 text-xs font-bold text-secondary-800 dark:bg-secondary-950/60 dark:text-secondary-300">
              🍲 {selectedCategory}
              <button
                type="button"
                onClick={() => setValue("categoryCode", "", { shouldDirty: true })}
                className="hover:text-red-500 cursor-pointer"
              >
                <X size={12} />
              </button>
            </span>
          )}

          {selectedCity && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
              🧭 {selectedCity}
              <button
                type="button"
                onClick={() => setValue("city", "", { shouldDirty: true })}
                className="hover:text-red-500 cursor-pointer"
              >
                <X size={12} />
              </button>
            </span>
          )}

          {latitude && longitude && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
              🎯 {radiusKm || 5} km ជុំវិញទីតាំង
              <button
                type="button"
                onClick={clearGeoCoordinates}
                className="hover:text-red-500 cursor-pointer"
              >
                <X size={12} />
              </button>
            </span>
          )}
        </div>

        {/* Actions: Reset, Apply, Export */}
        <div className="flex flex-wrap items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              reset(filtersToFormValues(DEFAULT_DASHBOARD_FILTERS, today));
              setShowAdvancedGeo(false);
              onReset();
            }}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-gray-200 bg-white px-4 text-xs sm:text-sm font-bold text-gray-700 transition hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 cursor-pointer"
          >
            <RotateCcw size={16} aria-hidden="true" />
            <span>កំណត់ឡើងវិញ</span>
          </button>

          <button
            type="submit"
            disabled={isFetching}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary-800 px-5 text-xs sm:text-sm font-bold text-white shadow-xs transition hover:bg-primary-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-200 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-emerald-600 dark:hover:bg-emerald-700 cursor-pointer"
          >
            <Search size={16} aria-hidden="true" />
            <span>អនុវត្តតម្រង</span>
          </button>

          {actions}
        </div>
      </div>
    </form>
  );
}

function inputClassName(hasError: boolean): string {
  return cn(
    "h-11 w-full rounded-xl border bg-white px-3 text-xs sm:text-sm text-gray-900 transition outline-none placeholder:text-gray-400 dark:border-slate-800 dark:bg-slate-950 dark:text-white",
    hasError
      ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
      : "border-gray-200 hover:border-gray-300 focus:border-primary-600 focus:ring-2 focus:ring-primary-100 dark:focus:border-emerald-500",
  );
}
