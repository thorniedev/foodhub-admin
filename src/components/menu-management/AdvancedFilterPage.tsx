"use client";

import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Check,
  Clock,
  CloudSun,
  DollarSign,
  Flame,
  Globe2,
  Heart,
  Loader2,
  PartyPopper,
  RefreshCw,
  Search,
  ShieldAlert,
  Sliders,
  Sparkles,
  Users,
  Utensils,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useGetDiscoveryFilterOptionsQuery } from "@/src/app/store/discoveryApi";
import type { AdvancedMenuItemSearchRequest } from "@/src/types/discovery";

const STORAGE_KEY = "foodhub_advanced_filters";

export default function AdvancedFilterPage() {
  const router = useRouter();
  const { data: filterOptions, isLoading } = useGetDiscoveryFilterOptionsQuery();

  const [form, setForm] = useState<AdvancedMenuItemSearchRequest>({});

  // Load saved filters on mount
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        setForm(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  const toggleArrayItem = <K extends keyof AdvancedMenuItemSearchRequest>(
    key: K,
    value: string | number,
  ) => {
    setForm((prev) => {
      const current = (prev[key] as Array<string | number> | undefined) ?? [];
      const exists = current.includes(value as never);
      const updated = exists
        ? current.filter((item) => item !== value)
        : [...current, value];
      return {
        ...prev,
        [key]: updated.length > 0 ? updated : undefined,
      };
    });
  };

  const activeFilterCount = (() => {
    let count = 0;
    if (form.query?.trim()) count++;
    if (form.categoryUuids?.length) count += form.categoryUuids.length;
    if (form.cuisineUuids?.length) count += form.cuisineUuids.length;
    if (form.mealTypeUuids?.length) count += form.mealTypeUuids.length;
    if (form.dietaryTypeUuids?.length) count += form.dietaryTypeUuids.length;
    if (form.excludeAllergenUuids?.length)
      count += form.excludeAllergenUuids.length;
    if (form.seasonUuids?.length) count += form.seasonUuids.length;
    if (form.eventUuids?.length) count += form.eventUuids.length;
    if (form.weatherConditionUuids?.length)
      count += form.weatherConditionUuids.length;
    if (form.ageGroupUuids?.length) count += form.ageGroupUuids.length;
    if (form.minimumPrice !== undefined || form.maximumPrice !== undefined)
      count++;
    if (
      form.minimumSpiceLevel !== undefined ||
      form.maximumSpiceLevel !== undefined
    )
      count++;
    if (form.openNow) count++;
    if (form.featuredOnly) count++;
    if (form.hasImage) count++;
    return count;
  })();

  const handleApply = () => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(form));
    } catch {
      // ignore
    }
    router.push("/menu-items?advancedFilter=true");
  };

  const handleReset = () => {
    setForm({});
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[500px] flex-col items-center justify-center gap-3">
        <Loader2 size={40} className="animate-spin text-[#137A3D]" />
        <p className="text-xl font-semibold text-gray-500">
          កំពុងទាញយកជម្រើសតម្រង...
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-24">
      {/* Back Button */}
      <div>
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xl font-bold text-[#137A3D] transition hover:bg-emerald-50 hover:underline"
        >
          <ArrowLeft size={24} />
          ត្រឡប់ក្រោយ
        </button>
      </div>

      {/* =====================================================
          HEADER HERO BANNER
      ====================================================== */}
      <div className="relative overflow-hidden rounded-[32px] bg-[linear-gradient(135deg,#0e6b32,#137A3D,#18944b)] p-6 text-white shadow-lg sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-white shadow-inner backdrop-blur-md">
              <Sliders size={32} />
            </div>
            <div>
              <p className="text-3xl font-black text-white sm:text-4xl">
                តម្រងស្វែងរកកម្រិតខ្ពស់
              </p>
              <p className="mt-1 text-xl font-medium text-emerald-100">
                Advanced Menu Item Discovery & Filtering
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {activeFilterCount > 0 && (
              <span className="rounded-full bg-orange-500 px-4 py-1.5 text-lg font-bold text-white shadow-sm">
                បានជ្រើស {activeFilterCount}
              </span>
            )}
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-2 rounded-full bg-white/20 px-5 py-2 text-lg font-bold text-white backdrop-blur-md transition hover:bg-white/30"
            >
              <RefreshCw size={20} />
              កំណត់ឡើងវិញ
            </button>
          </div>
        </div>
      </div>

      {/* =====================================================
          SECTION 1: SORT & SEARCH KEYWORD
      ====================================================== */}
      <div className="rounded-[28px] border border-gray-100/90 bg-white p-6 shadow-sm sm:p-8">
        <div className="grid gap-6 sm:grid-cols-2">
          {/* Sort Option */}
          <div>
            <p className="mb-2 text-xl font-bold text-gray-900">
              តម្រៀបតាម (Sort Option)
            </p>
            <select
              value={form.sort ?? "FOODHUB_RATING_DESC"}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, sort: e.target.value }))
              }
              className="w-full rounded-2xl border border-gray-200 bg-gray-50/70 px-5 py-3.5 text-lg font-medium text-gray-800 outline-none transition focus:border-[#137A3D] focus:bg-white focus:ring-2 focus:ring-emerald-100"
            >
              {(
                filterOptions?.sortOptions ?? [
                  "FOODHUB_RATING_DESC",
                  "PRICE_ASC",
                  "PRICE_DESC",
                  "DISTANCE_ASC",
                  "NEWEST",
                ]
              ).map((opt) => (
                <option key={opt} value={opt} className="text-lg">
                  {opt === "FOODHUB_RATING_DESC"
                    ? "⭐ ការវាយតម្លៃខ្ពស់បំផុត (Highest Rating)"
                    : opt === "PRICE_ASC"
                      ? "💵 តម្លៃទាប → ខ្ពស់ (Price: Low to High)"
                      : opt === "PRICE_DESC"
                        ? "💰 តម្លៃខ្ពស់ → ទាប (Price: High to Low)"
                        : opt === "NEWEST"
                          ? "✨ ថ្មីបំផុត (Newest)"
                          : opt}
                </option>
              ))}
            </select>
          </div>

          {/* Search Keyword */}
          <div>
            <p className="mb-2 text-xl font-bold text-gray-900">
              ពាក្យគន្លឹះស្វែងរក (Search Keyword)
            </p>
            <div className="relative">
              <Search
                size={22}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="ឈ្មោះម្ហូប ឬ ការពិពណ៌នា..."
                value={form.query ?? ""}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    query: e.target.value || undefined,
                  }))
                }
                className="w-full rounded-2xl border border-gray-200 bg-white py-3.5 pl-12 pr-4 text-lg font-medium text-gray-800 outline-none transition focus:border-[#137A3D] focus:ring-2 focus:ring-emerald-100"
              />
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          SECTION 2: CATEGORIES & CUISINES
      ====================================================== */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Categories */}
        <div className="rounded-[28px] border border-gray-100/90 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-2.5">
            <Utensils size={24} className="text-[#137A3D]" />
            <p className="text-2xl font-black text-gray-900">
              ប្រភេទម្ហូបអាហារ (Categories)
            </p>
          </div>

          <div className="mt-4 flex flex-wrap gap-2.5">
            {filterOptions?.categories && filterOptions.categories.length > 0 ? (
              filterOptions.categories.map((cat) => {
                const isSelected = form.categoryUuids?.includes(cat.uuid);
                return (
                  <button
                    key={cat.uuid}
                    type="button"
                    onClick={() => toggleArrayItem("categoryUuids", cat.uuid)}
                    className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-lg font-bold transition shadow-xs ${
                      isSelected
                        ? "bg-[#137A3D] text-white shadow-sm"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {isSelected && <Check size={18} />}
                    {cat.name}
                  </button>
                );
              })
            ) : (
              <p className="text-lg text-gray-400">គ្មានទិន្នន័យ Category</p>
            )}
          </div>
        </div>

        {/* Cuisines */}
        <div className="rounded-[28px] border border-gray-100/90 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-2.5">
            <Globe2 size={24} className="text-[#137A3D]" />
            <p className="text-2xl font-black text-gray-900">
              តំបន់ម្ហូប (Cuisines)
            </p>
          </div>

          <div className="mt-4 flex flex-wrap gap-2.5">
            {filterOptions?.cuisines && filterOptions.cuisines.length > 0 ? (
              filterOptions.cuisines.map((c) => {
                const isSelected = form.cuisineUuids?.includes(c.uuid);
                return (
                  <button
                    key={c.uuid}
                    type="button"
                    onClick={() => toggleArrayItem("cuisineUuids", c.uuid)}
                    className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-lg font-bold transition shadow-xs ${
                      isSelected
                        ? "bg-[#137A3D] text-white shadow-sm"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {isSelected && <Check size={18} />}
                    {c.name}
                  </button>
                );
              })
            ) : (
              <p className="text-lg text-gray-400">គ្មានទិន្នន័យ Cuisine</p>
            )}
          </div>
        </div>
      </div>

      {/* =====================================================
          SECTION 3: PRICE RANGE & SPICE LEVEL
      ====================================================== */}
      <div className="rounded-[28px] border border-gray-100/90 bg-white p-6 shadow-sm sm:p-8">
        <div className="grid gap-8 md:grid-cols-2">
          {/* Price Range */}
          <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign size={24} className="text-emerald-700" />
                <p className="text-xl font-bold text-gray-900">
                  កម្រិតតម្លៃ (Price Range)
                </p>
              </div>
              <span className="rounded-full bg-emerald-100 px-3.5 py-1 text-lg font-black text-emerald-800">
                ${form.minimumPrice ?? filterOptions?.priceRanges?.min ?? 0} - $
                {form.maximumPrice ?? filterOptions?.priceRanges?.max ?? 100}
              </span>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <input
                type="number"
                placeholder="Min ($)"
                min={0}
                value={form.minimumPrice ?? ""}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    minimumPrice: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  }))
                }
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-lg font-semibold outline-none focus:border-[#137A3D]"
              />
              <span className="text-xl font-bold text-gray-400">-</span>
              <input
                type="number"
                placeholder="Max ($)"
                min={0}
                value={form.maximumPrice ?? ""}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    maximumPrice: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  }))
                }
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-lg font-semibold outline-none focus:border-[#137A3D]"
              />
            </div>
          </div>

          {/* Spice Level */}
          <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame size={24} className="text-red-500" />
                <p className="text-xl font-bold text-gray-900">
                  កម្រិតហឹរ (Spice Level 0-5)
                </p>
              </div>
              <span className="rounded-full bg-red-100 px-3.5 py-1 text-lg font-black text-red-700">
                Level {form.minimumSpiceLevel ?? 0} -{" "}
                {form.maximumSpiceLevel ?? 5}
              </span>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <input
                type="number"
                placeholder="Min (0)"
                min={0}
                max={5}
                value={form.minimumSpiceLevel ?? ""}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    minimumSpiceLevel: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  }))
                }
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-lg font-semibold outline-none focus:border-red-500"
              />
              <span className="text-xl font-bold text-gray-400">-</span>
              <input
                type="number"
                placeholder="Max (5)"
                min={0}
                max={5}
                value={form.maximumSpiceLevel ?? ""}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    maximumSpiceLevel: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  }))
                }
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-lg font-semibold outline-none focus:border-red-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          SECTION 4: DIETARY & ALLERGENS
      ====================================================== */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Dietary Preferences */}
        <div className="rounded-[28px] border border-gray-100/90 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-2.5">
            <Heart size={24} className="text-[#137A3D]" />
            <p className="text-2xl font-black text-gray-900">
              របបអាហារ (Dietary Preferences)
            </p>
          </div>

          <div className="mt-4 flex flex-wrap gap-2.5">
            {filterOptions?.dietaryTypes &&
            filterOptions.dietaryTypes.length > 0 ? (
              filterOptions.dietaryTypes.map((dt) => {
                const isSelected = form.dietaryTypeUuids?.includes(dt.uuid);
                return (
                  <button
                    key={dt.uuid}
                    type="button"
                    onClick={() => toggleArrayItem("dietaryTypeUuids", dt.uuid)}
                    className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-lg font-bold transition shadow-xs ${
                      isSelected
                        ? "bg-[#137A3D] text-white shadow-sm"
                        : "bg-emerald-50 text-emerald-900 hover:bg-emerald-100"
                    }`}
                  >
                    {isSelected && <Check size={18} />}
                    {dt.name}
                  </button>
                );
              })
            ) : (
              <p className="text-lg text-gray-400">គ្មានទិន្នន័យ Dietary Type</p>
            )}
          </div>
        </div>

        {/* Excluded Allergens */}
        <div className="rounded-[28px] border border-gray-100/90 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-2.5">
            <ShieldAlert size={24} className="text-amber-600" />
            <p className="text-2xl font-black text-gray-900">
              ជៀសវាងសារធាតុប្រតិកម្ម (Exclude Allergens)
            </p>
          </div>

          <div className="mt-4 flex flex-wrap gap-2.5">
            {filterOptions?.allergens && filterOptions.allergens.length > 0 ? (
              filterOptions.allergens.map((alg) => {
                const isSelected = form.excludeAllergenUuids?.includes(alg.uuid);
                return (
                  <button
                    key={alg.uuid}
                    type="button"
                    onClick={() =>
                      toggleArrayItem("excludeAllergenUuids", alg.uuid)
                    }
                    className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-lg font-bold transition shadow-xs ${
                      isSelected
                        ? "bg-amber-600 text-white shadow-sm"
                        : "bg-amber-50 text-amber-900 hover:bg-amber-100"
                    }`}
                  >
                    {isSelected && <Check size={18} />}
                    🚫 {alg.name}
                  </button>
                );
              })
            ) : (
              <p className="text-lg text-gray-400">គ្មានទិន្នន័យ Allergen</p>
            )}
          </div>
        </div>
      </div>

      {/* =====================================================
          SECTION 5: SEASONS, EVENTS, WEATHER, AGE GROUPS
      ====================================================== */}
      <div className="rounded-[28px] border border-gray-100/90 bg-white p-6 shadow-sm sm:p-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Seasons */}
          {filterOptions?.seasons && filterOptions.seasons.length > 0 && (
            <div>
              <p className="mb-3 flex items-center gap-2 text-xl font-bold text-gray-900">
                <Calendar size={20} className="text-blue-600" />
                រដូវកាល (Seasons)
              </p>
              <div className="flex flex-wrap gap-2">
                {filterOptions.seasons.map((s) => {
                  const isSelected = form.seasonUuids?.includes(s.uuid);
                  return (
                    <button
                      key={s.uuid}
                      type="button"
                      onClick={() => toggleArrayItem("seasonUuids", s.uuid)}
                      className={`rounded-xl px-4 py-2 text-lg font-bold transition ${
                        isSelected
                          ? "bg-blue-600 text-white shadow-sm"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {s.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Events */}
          {filterOptions?.events && filterOptions.events.length > 0 && (
            <div>
              <p className="mb-3 flex items-center gap-2 text-xl font-bold text-gray-900">
                <PartyPopper size={20} className="text-purple-600" />
                កម្មវិធី/បុណ្យ (Events)
              </p>
              <div className="flex flex-wrap gap-2">
                {filterOptions.events.map((ev) => {
                  const isSelected = form.eventUuids?.includes(ev.uuid);
                  return (
                    <button
                      key={ev.uuid}
                      type="button"
                      onClick={() => toggleArrayItem("eventUuids", ev.uuid)}
                      className={`rounded-xl px-4 py-2 text-lg font-bold transition ${
                        isSelected
                          ? "bg-purple-600 text-white shadow-sm"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {ev.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Weather Conditions */}
          {filterOptions?.suitableWeather &&
            filterOptions.suitableWeather.length > 0 && (
              <div>
                <p className="mb-3 flex items-center gap-2 text-xl font-bold text-gray-900">
                  <CloudSun size={20} className="text-amber-500" />
                  អាកាសធាតុ (Weather)
                </p>
                <div className="flex flex-wrap gap-2">
                  {filterOptions.suitableWeather.map((w) => {
                    const isSelected = form.weatherConditionUuids?.includes(
                      w.uuid,
                    );
                    return (
                      <button
                        key={w.uuid}
                        type="button"
                        onClick={() =>
                          toggleArrayItem("weatherConditionUuids", w.uuid)
                        }
                        className={`rounded-xl px-4 py-2 text-lg font-bold transition ${
                          isSelected
                            ? "bg-amber-600 text-white shadow-sm"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {w.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

          {/* Age Groups */}
          {filterOptions?.ageGroups && filterOptions.ageGroups.length > 0 && (
            <div>
              <p className="mb-3 flex items-center gap-2 text-xl font-bold text-gray-900">
                <Users size={20} className="text-teal-600" />
                ក្រុមអាយុ (Age Groups)
              </p>
              <div className="flex flex-wrap gap-2">
                {filterOptions.ageGroups.map((ag) => {
                  const isSelected = form.ageGroupUuids?.includes(ag.uuid);
                  return (
                    <button
                      key={ag.uuid}
                      type="button"
                      onClick={() => toggleArrayItem("ageGroupUuids", ag.uuid)}
                      className={`rounded-xl px-4 py-2 text-lg font-bold transition ${
                        isSelected
                          ? "bg-teal-600 text-white shadow-sm"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {ag.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* =====================================================
          SECTION 6: ADDITIONAL FLAGS
      ====================================================== */}
      <div className="rounded-[28px] border border-gray-100/90 bg-white p-6 shadow-sm sm:p-8">
        <p className="mb-4 text-2xl font-black text-gray-900">
          លក្ខខណ្ឌបន្ថែម (Additional Options)
        </p>

        <div className="flex flex-wrap gap-4">
          <label className="inline-flex cursor-pointer items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50/70 px-5 py-3.5 text-lg font-bold text-gray-800 transition hover:bg-emerald-50/60">
            <input
              type="checkbox"
              checked={Boolean(form.openNow)}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  openNow: e.target.checked || undefined,
                }))
              }
              className="h-5 w-5 rounded-lg text-[#137A3D] focus:ring-[#137A3D]"
            />
            <Clock size={20} className="text-emerald-700" />
            ហាងកំពុងបើកដំណើរការ (Open Now)
          </label>

          <label className="inline-flex cursor-pointer items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50/70 px-5 py-3.5 text-lg font-bold text-gray-800 transition hover:bg-emerald-50/60">
            <input
              type="checkbox"
              checked={Boolean(form.featuredOnly)}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  featuredOnly: e.target.checked || undefined,
                }))
              }
              className="h-5 w-5 rounded-lg text-[#137A3D] focus:ring-[#137A3D]"
            />
            <Sparkles size={20} className="text-amber-500" />
            មុខម្ហូបពេញនិយម (Featured Only)
          </label>

          <label className="inline-flex cursor-pointer items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50/70 px-5 py-3.5 text-lg font-bold text-gray-800 transition hover:bg-emerald-50/60">
            <input
              type="checkbox"
              checked={Boolean(form.hasImage)}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  hasImage: e.target.checked || undefined,
                }))
              }
              className="h-5 w-5 rounded-lg text-[#137A3D] focus:ring-[#137A3D]"
            />
            <Check size={20} className="text-[#137A3D]" />
            មានរូបភាព (Has Image)
          </label>
        </div>
      </div>

      {/* =====================================================
          ACTION FOOTER BAR
      ====================================================== */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[28px] border border-gray-100/90 bg-white p-6 shadow-md">
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-7 py-3 text-lg font-bold text-gray-700 transition hover:bg-gray-50"
        >
          <RefreshCw size={20} />
          កំណត់ឡើងវិញ (Reset All)
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-full border border-gray-200 px-6 py-3 text-lg font-bold text-gray-600 transition hover:bg-gray-50"
          >
            បោះបង់ (Cancel)
          </button>

          <button
            type="button"
            onClick={handleApply}
            className="inline-flex items-center gap-2.5 rounded-full bg-[#137A3D] px-8 py-3.5 text-xl font-black text-white shadow-md transition hover:bg-[#0e6b32]"
          >
            <Check size={24} />
            អនុវត្តតម្រង (Apply Filters)
            {activeFilterCount > 0 && (
              <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-base font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
