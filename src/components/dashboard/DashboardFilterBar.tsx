"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CalendarDays,
  ChevronDown,
  Compass,
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
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Segmented } from "@/src/components/ui/segmented";
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

const PRESETS: { value: DashboardDatePreset; label: string; shortLabel: string }[] =
  [
    { value: "7d", label: "៧ ថ្ងៃ", shortLabel: "៧ថ" },
    { value: "30d", label: "៣០ ថ្ងៃ", shortLabel: "៣០ថ" },
    { value: "90d", label: "៩០ ថ្ងៃ", shortLabel: "៩០ថ" },
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
      label: "រាជធានី / ខេត្តទាំងអស់",
    };

    const predefined: CustomSelectOption[] = CAMBODIA_PROVINCES.map((p) => ({
      value: p.nameEn,
      label: `${p.nameKh} (${p.nameEn})`,
    }));

    // Merge any unique provinces from API
    const existing = new Set(predefined.map((p) => p.value.toLowerCase()));
    const extra: CustomSelectOption[] = provinceOptions
      .filter((p) => p && !existing.has(p.toLowerCase()))
      .map((p) => ({ value: p, label: p }));

    return [defaultOption, ...predefined, ...extra];
  }, [provinceOptions]);

  const categorySelectOptions = useMemo<CustomSelectOption[]>(
    () => [{ value: "", label: "ប្រភេទទាំងអស់" }, ...categoryOptions],
    [categoryOptions],
  );

  const applyGeoHub = (hub: (typeof POPULAR_GEO_HUBS)[number]) => {
    setValue("latitude", String(hub.lat), { shouldDirty: true });
    setValue("longitude", String(hub.lng), { shouldDirty: true });
    if (!radiusKm) setValue("radiusKm", "5", { shouldDirty: true });
    if (hub.city) setValue("city", hub.city, { shouldDirty: true });
  };

  const clearGeoCoordinates = () => {
    setValue("latitude", "", { shouldDirty: true });
    setValue("longitude", "", { shouldDirty: true });
    setValue("radiusKm", "", { shouldDirty: true });
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedProvince) count++;
    if (selectedCity) count++;
    if (selectedCategory) count++;
    if (latitude && longitude) count++;
    if (preset === "custom") count++;
    return count;
  }, [selectedProvince, selectedCity, selectedCategory, latitude, longitude, preset]);

  const hasChips = Boolean(
    selectedProvince || selectedCategory || selectedCity || (latitude && longitude),
  );

  return (
    <form
      onSubmit={submit}
      noValidate
      aria-label="តម្រងទិន្នន័យវិភាគ"
      className="flex flex-col rounded-xl border bg-card text-card-foreground shadow-card"
    >
      <>
        {/* Row 1 — identity + date range. The four filter controls used to sit
            in their own block under a full-width header, which pushed the KPIs
            below the fold on a laptop; the bar is one toolbar now. */}
        <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal
              size={15}
              aria-hidden="true"
              className="text-muted-foreground"
            />
            <span className="text-xs font-semibold text-foreground">តម្រង</span>
            {activeFiltersCount > 0 && (
              <Badge tone="green" size="sm">
                {activeFiltersCount}
              </Badge>
            )}
          </div>

          <Segmented
            label="ចន្លោះកាលបរិច្ឆេទ"
            options={PRESETS}
            value={preset}
            onChange={selectPreset}
            size="sm"
          />
        </div>

        {/* Row 2 — the filter controls themselves. */}
        <div className="grid grid-cols-1 gap-3 border-t px-4 py-3 sm:grid-cols-2 lg:grid-cols-[repeat(3,minmax(0,1fr))_auto] lg:items-end">
          <div className="min-w-0 space-y-1">
            <label className="flex items-center gap-1.5 text-[0.6875rem] font-medium text-muted-foreground">
              <MapPin size={12} aria-hidden="true" />
              <span>រាជធានី / ខេត្ត</span>
            </label>
            <Controller
              control={control}
              name="province"
              render={({ field }) => (
                <CustomSelect
                  value={selectedProvince}
                  onChange={field.onChange}
                  options={provinceSelectOptions}
                  placeholder="រាជធានី / ខេត្តទាំងអស់"
                  className="[&>button]:h-9 [&>button]:rounded-lg [&>button]:text-xs"
                />
              )}
            />
          </div>

          <div className="min-w-0 space-y-1">
            <label className="flex items-center gap-1.5 text-[0.6875rem] font-medium text-muted-foreground">
              <Utensils size={12} aria-hidden="true" />
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
                  className="[&>button]:h-9 [&>button]:rounded-lg [&>button]:text-xs"
                />
              )}
            />
          </div>

          <label className="block min-w-0 space-y-1">
            <span className="flex items-center gap-1.5 text-[0.6875rem] font-medium text-muted-foreground">
              <Compass size={12} aria-hidden="true" />
              <span>ក្រុង / ខណ្ឌ</span>
            </span>
            <input
              type="text"
              placeholder="ឧ. Daun Penh, Toul Kork"
              autoComplete="off"
              {...register("city")}
              className={inputClassName(Boolean(errors.city))}
            />
            {errors.city?.message && (
              <span className="block text-[0.6875rem] text-destructive">
                {errors.city.message}
              </span>
            )}
          </label>

          <div className="flex items-center gap-2 sm:col-span-2 lg:col-span-1">
            <Button type="submit" disabled={isFetching} className="flex-1 lg:flex-none">
              <Search size={14} aria-hidden="true" />
              <span>អនុវត្ត</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="icon"
              title="កំណត់តម្រងឡើងវិញ"
              aria-label="កំណត់តម្រងឡើងវិញ"
              onClick={() => {
                reset(filtersToFormValues(DEFAULT_DASHBOARD_FILTERS, today));
                setShowAdvancedGeo(false);
                onReset();
              }}
            >
              <RotateCcw size={14} aria-hidden="true" />
            </Button>

            {actions}
          </div>
        </div>

        {/* Custom date range — only rendered for the custom preset. */}
        {isCustom && (
          <div className="grid grid-cols-1 gap-3 border-t bg-muted/40 px-4 py-3 sm:grid-cols-2">
            <label className="block space-y-1">
              <span className="flex items-center gap-1.5 text-[0.6875rem] font-medium text-muted-foreground">
                <CalendarDays size={12} aria-hidden="true" />
                <span>កាលបរិច្ឆេទចាប់ផ្ដើម</span>
              </span>
              <input
                type="date"
                max={today}
                {...register("from")}
                className={inputClassName(Boolean(errors.from))}
              />
              {errors.from?.message && (
                <span className="block text-[0.6875rem] text-destructive">
                  {errors.from.message}
                </span>
              )}
            </label>

            <label className="block space-y-1">
              <span className="flex items-center gap-1.5 text-[0.6875rem] font-medium text-muted-foreground">
                <CalendarDays size={12} aria-hidden="true" />
                <span>កាលបរិច្ឆេទបញ្ចប់</span>
              </span>
              <input
                type="date"
                max={today}
                {...register("to")}
                className={inputClassName(Boolean(errors.to))}
              />
              {errors.to?.message && (
                <span className="block text-[0.6875rem] text-destructive">
                  {errors.to.message}
                </span>
              )}
            </label>
          </div>
        )}

        {/* Row 3 — active chips and the geo disclosure share one line. */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-t px-4 py-2.5">
          <button
            type="button"
            onClick={() => setShowAdvancedGeo((previous) => !previous)}
            aria-expanded={showAdvancedGeo}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-md text-[0.6875rem] font-medium text-muted-foreground transition hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            <Compass size={12} aria-hidden="true" />
            <span>កាំភូមិសាស្ត្រ</span>
            <ChevronDown
              size={12}
              aria-hidden="true"
              className={cn("transition-transform", showAdvancedGeo && "rotate-180")}
            />
          </button>

          {hasChips && (
            <>
              <span aria-hidden="true" className="h-4 w-px bg-border" />

              <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                {selectedProvince && (
                  <FilterChip
                    tone="green"
                    icon={<MapPin size={11} aria-hidden="true" />}
                    label={selectedProvince}
                    onClear={() => setValue("province", "", { shouldDirty: true })}
                  />
                )}

                {selectedCategory && (
                  <FilterChip
                    tone="orange"
                    icon={<Utensils size={11} aria-hidden="true" />}
                    label={selectedCategory}
                    onClear={() =>
                      setValue("categoryCode", "", { shouldDirty: true })
                    }
                  />
                )}

                {selectedCity && (
                  <FilterChip
                    tone="amber"
                    icon={<Compass size={11} aria-hidden="true" />}
                    label={selectedCity}
                    onClear={() => setValue("city", "", { shouldDirty: true })}
                  />
                )}

                {latitude && longitude && (
                  <FilterChip
                    tone="teal"
                    icon={<MapPin size={11} aria-hidden="true" />}
                    label={`${radiusKm || 5} km ជុំវិញទីតាំង`}
                    onClear={clearGeoCoordinates}
                  />
                )}
              </div>
            </>
          )}
        </div>

        {showAdvancedGeo && (
          <div className="space-y-3 border-t bg-muted/40 px-4 py-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[0.6875rem] font-medium text-muted-foreground">
                  ទីតាំងពេញនិយម
                </span>
                {latitude && longitude && (
                  <button
                    type="button"
                    onClick={clearGeoCoordinates}
                    className="cursor-pointer text-[0.6875rem] font-medium text-destructive hover:underline"
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
                    <Button
                      key={hub.nameEn}
                      type="button"
                      size="sm"
                      variant={isSelected ? "default" : "outline"}
                      onClick={() => applyGeoHub(hub)}
                      className="h-7 text-[0.6875rem]"
                    >
                      <MapPin size={11} aria-hidden="true" />
                      {hub.nameKh}
                    </Button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 border-t pt-3 sm:grid-cols-3">
              <label className="block space-y-1">
                <span className="block text-[0.6875rem] font-medium text-muted-foreground">
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
                  <span className="block text-[0.6875rem] text-destructive">
                    {errors.latitude.message}
                  </span>
                )}
              </label>

              <label className="block space-y-1">
                <span className="block text-[0.6875rem] font-medium text-muted-foreground">
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
                  <span className="block text-[0.6875rem] text-destructive">
                    {errors.longitude.message}
                  </span>
                )}
              </label>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-[0.6875rem] font-medium text-muted-foreground">
                  <span>កាំស្វែងរក</span>
                  <span className="font-semibold text-primary tabular-nums">
                    {radiusKm ? `${radiusKm} km` : "5 km"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={1}
                    max={DASHBOARD_MAX_RADIUS_KM}
                    step={1}
                    aria-label="កាំស្វែងរក (គ.ម)"
                    value={radiusKm ? Number(radiusKm) : 5}
                    onChange={(event) =>
                      setValue("radiusKm", event.target.value, { shouldDirty: true })
                    }
                    className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-border accent-primary"
                  />
                  <input
                    type="number"
                    min={1}
                    max={DASHBOARD_MAX_RADIUS_KM}
                    placeholder="5"
                    aria-label="កាំស្វែងរក ជាលេខ (គ.ម)"
                    {...register("radiusKm")}
                    className="h-9 w-14 shrink-0 rounded-lg border bg-background text-center text-xs tabular-nums"
                  />
                </div>
                {errors.radiusKm?.message && (
                  <p className="text-[0.6875rem] text-destructive">
                    {errors.radiusKm.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </>
    </form>
  );
}

function FilterChip({
  tone,
  icon,
  label,
  onClear,
}: {
  tone: "green" | "orange" | "amber" | "teal";
  icon: React.ReactNode;
  label: string;
  onClear: () => void;
}) {
  return (
    <Badge tone={tone} className="max-w-[16rem] gap-1 pr-1">
      {icon}
      <span className="truncate" title={label}>
        {label}
      </span>
      <button
        type="button"
        onClick={onClear}
        aria-label={`ដកតម្រង ${label}`}
        className="cursor-pointer rounded-full p-0.5 transition hover:bg-black/10 dark:hover:bg-white/10"
      >
        <X size={11} aria-hidden="true" />
      </button>
    </Badge>
  );
}

function inputClassName(hasError: boolean): string {
  return cn(
    "h-9 w-full rounded-lg border bg-background px-3 text-xs text-foreground outline-none transition placeholder:text-muted-foreground/70",
    hasError
      ? "border-destructive focus:ring-2 focus:ring-destructive/25"
      : "hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-ring/25",
  );
}
