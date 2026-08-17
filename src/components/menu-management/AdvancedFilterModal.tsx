"use client";

import { useEffect, useState } from "react";
import {
  X,
  RotateCcw,
  Check,
  Sliders,
  DollarSign,
  Flame,
  ShieldAlert,
} from "lucide-react";

import { useGetDiscoveryFilterOptionsQuery } from "@/src/app/store/discoveryApi";
import type { AdvancedMenuItemSearchRequest } from "@/src/types/discovery";

interface AdvancedFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: AdvancedMenuItemSearchRequest) => void;
  onReset: () => void;
  currentFilters: AdvancedMenuItemSearchRequest;
  activeFilterCount: number;
}

export default function AdvancedFilterModal({
  isOpen,
  onClose,
  onApply,
  onReset,
  currentFilters,
  activeFilterCount,
}: AdvancedFilterModalProps) {
  const { data: filterOptions, isLoading } =
    useGetDiscoveryFilterOptionsQuery();

  const [form, setForm] =
    useState<AdvancedMenuItemSearchRequest>(currentFilters);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setForm(currentFilters);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [currentFilters, isOpen]);

  if (!isOpen) return null;

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

  const handleApply = () => {
    onApply(form);
    onClose();
  };

  const handleReset = () => {
    setForm({});
    onReset();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-3xl bg-white shadow-2xl overflow-hidden">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 bg-emerald-800 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-700 text-white shadow-inner">
              <Sliders size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold">តម្រងស្វែងរកកម្រិតខ្ពស់</h2>
              <p className="text-xs text-emerald-100">
                Advanced Menu Item Discovery & Filtering
              </p>
            </div>
            {activeFilterCount > 0 && (
              <span className="ml-2 rounded-full bg-orange-500 px-2.5 py-0.5 text-xs font-extrabold text-white">
                {activeFilterCount} Active
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
          >
            <X size={20} />
          </button>
        </div>

        {/* BODY (SCROLLABLE) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-gray-700">
          {isLoading ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 text-emerald-700">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
              <p className="font-semibold">កំពុងទាញយកជម្រើសតម្រង...</p>
            </div>
          ) : (
            <>
              {/* SORT & SEARCH KEYWORD */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block font-semibold text-gray-800">
                    តម្រៀបតាម (Sort Option)
                  </label>
                  <select
                    value={form.sort ?? "FOODHUB_RATING_DESC"}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, sort: e.target.value }))
                    }
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2.5 outline-none focus:border-emerald-600 focus:bg-white"
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
                      <option key={opt} value={opt}>
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

                <div>
                  <label className="mb-1.5 block font-semibold text-gray-800">
                    ពាក្យគន្លឹះស្វែងរក (Search Keyword)
                  </label>
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
                    className="w-full rounded-2xl border border-gray-200 px-4 py-2.5 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                  />
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* CATEGORIES */}
              {filterOptions?.categories && filterOptions.categories.length > 0 && (
                <div>
                  <label className="mb-2 block font-bold text-gray-900">
                    ប្រភេទម្ហូបអាហារ (Categories)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {filterOptions.categories.map((cat) => {
                      const isSelected = form.categoryUuids?.includes(cat.uuid);
                      return (
                        <button
                          key={cat.uuid}
                          type="button"
                          onClick={() =>
                            toggleArrayItem("categoryUuids", cat.uuid)
                          }
                          className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition ${
                            isSelected
                              ? "bg-emerald-700 text-white shadow-sm"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {isSelected && <Check size={14} />}
                          {cat.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* CUISINES */}
              {filterOptions?.cuisines && filterOptions.cuisines.length > 0 && (
                <div>
                  <label className="mb-2 block font-bold text-gray-900">
                    តំបន់ម្ហូប (Cuisines)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {filterOptions.cuisines.map((c) => {
                      const isSelected = form.cuisineUuids?.includes(c.uuid);
                      return (
                        <button
                          key={c.uuid}
                          type="button"
                          onClick={() =>
                            toggleArrayItem("cuisineUuids", c.uuid)
                          }
                          className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition ${
                            isSelected
                              ? "bg-emerald-700 text-white shadow-sm"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {isSelected && <Check size={14} />}
                          {c.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* PRICE RANGE & SPICE LEVEL */}
              <div className="grid gap-6 rounded-2xl bg-gray-50 p-4 sm:grid-cols-2">
                {/* Price Range */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="font-bold text-gray-900 flex items-center gap-1.5">
                      <DollarSign size={16} className="text-emerald-600" />
                      កម្រិតតម្លៃ (Price Range)
                    </label>
                    <span className="text-xs font-semibold text-emerald-800">
                      ${form.minimumPrice ?? filterOptions?.priceRanges?.min ?? 0} - ${form.maximumPrice ?? filterOptions?.priceRanges?.max ?? 100}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      placeholder="Min"
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
                      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-emerald-600"
                    />
                    <span className="text-gray-400">-</span>
                    <input
                      type="number"
                      placeholder="Max"
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
                      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

                {/* Spice Level */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="font-bold text-gray-900 flex items-center gap-1.5">
                      <Flame size={16} className="text-red-500" />
                      កម្រិតហិរ (Spice Level 0-5)
                    </label>
                    <span className="text-xs font-semibold text-red-600">
                      Level {form.minimumSpiceLevel ?? 0} - {form.maximumSpiceLevel ?? 5}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
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
                      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-red-500"
                    />
                    <span className="text-gray-400">-</span>
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
                      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-red-500"
                    />
                  </div>
                </div>
              </div>

              {/* DIETARY TYPES */}
              {filterOptions?.dietaryTypes && filterOptions.dietaryTypes.length > 0 && (
                <div>
                  <label className="mb-2 block font-bold text-gray-900">
                    របបអាហារ (Dietary Preferences)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {filterOptions.dietaryTypes.map((dt) => {
                      const isSelected = form.dietaryTypeUuids?.includes(dt.uuid);
                      return (
                        <button
                          key={dt.uuid}
                          type="button"
                          onClick={() =>
                            toggleArrayItem("dietaryTypeUuids", dt.uuid)
                          }
                          className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition ${
                            isSelected
                              ? "bg-emerald-600 text-white shadow-sm"
                              : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                          }`}
                        >
                          {isSelected && <Check size={14} />}
                          {dt.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* EXCLUDED ALLERGENS */}
              {filterOptions?.allergens && filterOptions.allergens.length > 0 && (
                <div>
                  <label className="mb-2 block font-bold text-gray-900 flex items-center gap-1.5">
                    <ShieldAlert size={16} className="text-orange-500" />
                    ជៀសវាងសារធាតុប្រតិកម្ម (Exclude Allergens)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {filterOptions.allergens.map((alg) => {
                      const isSelected = form.excludeAllergenUuids?.includes(alg.uuid);
                      return (
                        <button
                          key={alg.uuid}
                          type="button"
                          onClick={() =>
                            toggleArrayItem("excludeAllergenUuids", alg.uuid)
                          }
                          className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition ${
                            isSelected
                              ? "bg-orange-600 text-white shadow-sm"
                              : "bg-orange-50 text-orange-800 hover:bg-orange-100"
                          }`}
                        >
                          {isSelected && <Check size={14} />}
                          🚫 {alg.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SEASONS, EVENTS, WEATHER, AGE GROUPS */}
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Seasons */}
                {filterOptions?.seasons && filterOptions.seasons.length > 0 && (
                  <div>
                    <label className="mb-1.5 block font-semibold text-gray-800">
                      រដូវកាល (Seasons)
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {filterOptions.seasons.map((s) => {
                        const isSelected = form.seasonUuids?.includes(s.uuid);
                        return (
                          <button
                            key={s.uuid}
                            type="button"
                            onClick={() =>
                              toggleArrayItem("seasonUuids", s.uuid)
                            }
                            className={`rounded-lg px-2.5 py-1 text-xs font-medium ${
                              isSelected
                                ? "bg-blue-600 text-white"
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
                    <label className="mb-1.5 block font-semibold text-gray-800">
                      កម្មវិធី/ពិធីបុណ្យ (Events)
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {filterOptions.events.map((ev) => {
                        const isSelected = form.eventUuids?.includes(ev.uuid);
                        return (
                          <button
                            key={ev.uuid}
                            type="button"
                            onClick={() => toggleArrayItem("eventUuids", ev.uuid)}
                            className={`rounded-lg px-2.5 py-1 text-xs font-medium ${
                              isSelected
                                ? "bg-purple-600 text-white"
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
              </div>

              {/* STORE PRICE LEVEL & RATINGS */}
              <div className="grid gap-4 sm:grid-cols-3">
                {/* Store Price Level */}
                <div>
                  <label className="mb-1.5 block font-semibold text-gray-800">
                    កម្រិតតម្លៃហាង (Store Price Level)
                  </label>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4].map((level) => {
                      const isSelected = form.storePriceLevels?.includes(level);
                      return (
                        <button
                          key={level}
                          type="button"
                          onClick={() =>
                            toggleArrayItem("storePriceLevels", level)
                          }
                          className={`flex-1 rounded-xl py-1.5 text-xs font-bold transition ${
                            isSelected
                              ? "bg-emerald-700 text-white shadow-sm"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {"$".repeat(level)}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Minimum Rating */}
                <div>
                  <label className="mb-1.5 block font-semibold text-gray-800">
                    ការវាយតម្លៃហាងអប្បបរមា
                  </label>
                  <select
                    value={form.minimumStoreRating ?? ""}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        minimumStoreRating: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      }))
                    }
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-emerald-600"
                  >
                    <option value="">ទាំងអស់ (All Ratings)</option>
                    <option value="4.5">⭐ 4.5+ Stars</option>
                    <option value="4.0">⭐ 4.0+ Stars</option>
                    <option value="3.5">⭐ 3.5+ Stars</option>
                  </select>
                </div>

                {/* Max Prep Time */}
                <div>
                  <label className="mb-1.5 block font-semibold text-gray-800">
                    រយៈពេលរៀបចំអតិបរមា (នាទី)
                  </label>
                  <input
                    type="number"
                    placeholder="ឧ. 30 នាទី"
                    value={form.maxPreparationTimeMinutes ?? ""}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        maxPreparationTimeMinutes: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      }))
                    }
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              {/* BOOLEAN TOGGLE SWITCHES */}
              <div className="flex flex-wrap items-center gap-6 rounded-2xl bg-gray-50 p-4">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={Boolean(form.openNow)}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        openNow: e.target.checked ? true : undefined,
                      }))
                    }
                    className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="font-semibold text-gray-800">
                    🟢 បើកដំណើរការឥឡូវនេះ (Open Now)
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={Boolean(form.featuredOnly)}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        featuredOnly: e.target.checked ? true : undefined,
                      }))
                    }
                    className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="font-semibold text-gray-800">
                    ⭐ ម្ហូបពិសេស (Featured Only)
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={Boolean(form.hasImage)}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        hasImage: e.target.checked ? true : undefined,
                      }))
                    }
                    className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="font-semibold text-gray-800">
                    🖼️ មានរូបភាព (Has Image)
                  </span>
                </label>
              </div>
            </>
          )}
        </div>

        {/* FOOTER ACTIONS */}
        <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-6 py-4">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-xs font-bold text-gray-700 transition hover:bg-gray-100"
          >
            <RotateCcw size={14} />
            កំណត់ឡើងវិញ (Reset All)
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-5 py-2 text-xs font-bold text-gray-600 transition hover:bg-gray-200"
            >
              បោះបង់ (Cancel)
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="flex items-center gap-2 rounded-xl bg-emerald-700 px-6 py-2 text-xs font-bold text-white shadow-md transition hover:bg-emerald-800"
            >
              <Check size={16} />
              អនុវត្តតម្រង (Apply Filters)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
