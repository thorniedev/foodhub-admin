"use client";

import { Loader2, Plus, Save, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import ImagePicker from "./ImagePicker";

import type {
  CuisineOption,
  EventOption,
  FoodCategoryOption,
  FoodEventRelation,
  FoodRecord,
  FoodSeasonRelation,
  FoodWeatherRelation,
  FoodWritePayload,
  SeasonOption,
  WeatherConditionOption,
} from "@/src/types/menu-management";

type FormState = {
  canonicalName: string;
  localName: string;
  description: string;
  categoryUuid: string;
  cuisineUuid: string;
  defaultSpiceLevel: string;
  calories: string;
  protein: string;
  carbohydrate: string;
  fat: string;
  isActive: boolean;
};

const EMPTY: FormState = {
  canonicalName: "",
  localName: "",
  description: "",
  categoryUuid: "",
  cuisineUuid: "",
  defaultSpiceLevel: "0",
  calories: "",
  protein: "",
  carbohydrate: "",
  fat: "",
  isActive: true,
};

function numberOrNull(value: string): number | null {
  if (!value.trim()) return null;

  const result = Number(value);
  return Number.isFinite(result) ? result : null;
}

export default function FoodFormModal({
  open,
  item,
  categories,
  cuisines,
  seasons = [],
  events = [],
  weatherConditions = [],
  saving,
  onClose,
  onSubmit,
}: {
  open: boolean;
  item: FoodRecord | null;
  categories: FoodCategoryOption[];
  cuisines: CuisineOption[];
  seasons?: SeasonOption[];
  events?: EventOption[];
  weatherConditions?: WeatherConditionOption[];
  saving: boolean;
  onClose: () => void;
  onSubmit: (
    payload: FoodWritePayload,
    images: File[],
  ) => Promise<void>;
}) {
  const [values, setValues] = useState<FormState>(EMPTY);
  const [images, setImages] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Metadata relations state
  const [seasonRows, setSeasonRows] = useState<FoodSeasonRelation[]>([]);
  const [eventRows, setEventRows] = useState<FoodEventRelation[]>([]);
  const [weatherRows, setWeatherRows] = useState<FoodWeatherRelation[]>([]);

  useEffect(() => {
    if (!open) return;

    if (!item) {
      setValues(EMPTY);
      setImages([]);
      setSeasonRows([]);
      setEventRows([]);
      setWeatherRows([]);
      setError(null);
      return;
    }

    setValues({
      canonicalName: item.canonicalName ?? "",
      localName: item.localName ?? "",
      description: item.description ?? "",
      categoryUuid:
        item.categoryUuid ??
        item.category?.uuid ??
        "",
      cuisineUuid:
        item.cuisineUuid ??
        item.cuisine?.uuid ??
        "",
      defaultSpiceLevel: String(
        item.defaultSpiceLevel ?? 0,
      ),
      calories:
        item.nutritionData?.calories != null
          ? String(item.nutritionData.calories)
          : "",
      protein:
        item.nutritionData?.proteinGrams != null
          ? String(item.nutritionData.proteinGrams)
          : "",
      carbohydrate:
        item.nutritionData?.carbsGrams != null
          ? String(item.nutritionData.carbsGrams)
          : "",
      fat:
        item.nutritionData?.fatGrams != null
          ? String(item.nutritionData.fatGrams)
          : "",
      isActive: item.isActive !== false,
    });

    // Populate metadata relations if editing
    const rawSeasons = Array.isArray(item.seasons) ? item.seasons : [];
    setSeasonRows(
      rawSeasons.map((s: any) => ({
        seasonUuid: s.seasonUuid ?? s.uuid ?? s.season?.uuid ?? "",
        suitabilityScore: s.suitabilityScore != null ? Number(s.suitabilityScore) : 1.0,
        reasonText: s.reasonText ?? "",
      })).filter((s) => Boolean(s.seasonUuid)),
    );

    const rawEvents = Array.isArray(item.events) ? item.events : [];
    setEventRows(
      rawEvents.map((e: any) => ({
        eventUuid: e.eventUuid ?? e.uuid ?? e.event?.uuid ?? "",
        relevanceScore: e.relevanceScore != null ? Number(e.relevanceScore) : 0.9,
        reasonText: e.reasonText ?? "",
      })).filter((e) => Boolean(e.eventUuid)),
    );

    const rawWeather = Array.isArray(item.suitableWeather) ? item.suitableWeather : [];
    setWeatherRows(
      rawWeather.map((w: any) => ({
        weatherConditionUuid: w.weatherConditionUuid ?? w.uuid ?? w.weatherCondition?.uuid ?? "",
        suitabilityScore: w.suitabilityScore != null ? Number(w.suitabilityScore) : 0.95,
        reasonText: w.reasonText ?? "",
      })).filter((w) => Boolean(w.weatherConditionUuid)),
    );

    setImages([]);
    setError(null);
  }, [item, open]);

  const activeCategories = useMemo(() => {
    const foodRoot = categories.find(
      (category) =>
        category.code?.trim().toUpperCase() === "FOOD" &&
        !category.parentCategoryUuid,
    );

    if (!foodRoot) {
      return categories.filter(
        (category) =>
          category.isActive !== false &&
          Boolean(category.parentCategoryUuid),
      );
    }

    return categories.filter(
      (category) =>
        category.isActive !== false &&
        category.parentCategoryUuid === foodRoot.uuid,
    );
  }, [categories]);

  const submit = async () => {
    try {
      setError(null);

      if (!values.canonicalName.trim()) {
        throw new Error("Canonical name is required.");
      }

      if (!values.categoryUuid) {
        throw new Error("Category is required.");
      }

      const payload: FoodWritePayload = {
        canonicalName: values.canonicalName.trim(),
        localName: values.localName.trim() || null,
        description: values.description.trim() || null,
        categoryUuid: values.categoryUuid,
        cuisineUuid: values.cuisineUuid || null,
        primaryMediaUuids:
          item?.primaryMediaUuids ?? [],
        defaultSpiceLevel: numberOrNull(
          values.defaultSpiceLevel,
        ),
        nutritionData: {
          calories: numberOrNull(values.calories),
          proteinGrams: numberOrNull(values.protein),
          carbsGrams: numberOrNull(values.carbohydrate),
          fatGrams: numberOrNull(values.fat),
        },
        mealTypes: item?.mealTypes ?? [],
        ageRules: item?.ageRules ?? [],
        dietaryTypes: item?.dietaryTypes ?? [],
        seasons: seasonRows
          .filter((r) => Boolean(r.seasonUuid))
          .map((r) => ({
            seasonUuid: r.seasonUuid,
            suitabilityScore: r.suitabilityScore ?? 1.0,
            reasonText: r.reasonText?.trim() || null,
          })),
        events: eventRows
          .filter((r) => Boolean(r.eventUuid))
          .map((r) => ({
            eventUuid: r.eventUuid,
            relevanceScore: r.relevanceScore ?? 0.9,
            reasonText: r.reasonText?.trim() || null,
          })),
        suitableWeather: weatherRows
          .filter((r) => Boolean(r.weatherConditionUuid))
          .map((r) => ({
            weatherConditionUuid: r.weatherConditionUuid,
            suitabilityScore: r.suitabilityScore ?? 0.95,
            reasonText: r.reasonText?.trim() || null,
          })),
        isActive: values.isActive,
      };

      await onSubmit(payload, images);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Could not save Food.",
      );
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[140] overflow-y-auto bg-black/45 p-4 backdrop-blur-[2px]">
      <div className="mx-auto my-6 w-full max-w-4xl rounded-[30px] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <div>
            <h2 className="text-2xl font-black text-gray-900">
              {item
                ? "កែប្រែ Food Catalog"
                : "បន្ថែម Food Catalog"}
            </h2>
            <p className="mt-1 text-sm text-gray-400">
              Food នេះអាចឱ្យ Store ជ្រើសយកទៅបង្កើត Menu Item។
            </p>
          </div>

          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100"
          >
            <X size={21} />
          </button>
        </div>

        <div className="space-y-6 p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Field
              label="Canonical name *"
              value={values.canonicalName}
              onChange={(value) =>
                setValues((current) => ({
                  ...current,
                  canonicalName: value,
                }))
              }
            />

            <Field
              label="ឈ្មោះខ្មែរ"
              value={values.localName}
              onChange={(value) =>
                setValues((current) => ({
                  ...current,
                  localName: value,
                }))
              }
            />

            <label>
              <Label>Category *</Label>
              <select
                value={values.categoryUuid}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    categoryUuid: event.target.value,
                  }))
                }
                className={inputClass}
              >
                <option value="">ជ្រើស Category</option>
                {activeCategories.map((category) => (
                  <option
                    key={category.uuid}
                    value={category.uuid}
                  >
                    {category.name} ({category.code})
                  </option>
                ))}
              </select>
            </label>

            <label>
              <Label>Cuisine</Label>
              <select
                value={values.cuisineUuid}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    cuisineUuid: event.target.value,
                  }))
                }
                className={inputClass}
              >
                <option value="">ជ្រើស Cuisine</option>
                {cuisines
                  .filter(
                    (cuisine) =>
                      cuisine.isActive !== false,
                  )
                  .map((cuisine) => (
                    <option
                      key={cuisine.uuid}
                      value={cuisine.uuid}
                    >
                      {cuisine.name}
                    </option>
                  ))}
              </select>
            </label>

            <Field
              label="Spice level"
              type="number"
              value={values.defaultSpiceLevel}
              onChange={(value) =>
                setValues((current) => ({
                  ...current,
                  defaultSpiceLevel: value,
                }))
              }
            />

            <label className="flex items-center gap-3 pt-7">
              <input
                type="checkbox"
                checked={values.isActive}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    isActive: event.target.checked,
                  }))
                }
                className="h-5 w-5 accent-[#137A3D]"
              />
              <span className="font-bold text-gray-700">
                Active
              </span>
            </label>

            <label className="md:col-span-2">
              <Label>Description</Label>
              <textarea
                rows={3}
                value={values.description}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                className={`${inputClass} h-auto py-3`}
              />
            </label>
          </div>

          <div>
            <h3 className="mb-3 text-lg font-black text-gray-900">
              Nutrition
            </h3>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["calories", "Calories"],
                ["protein", "Protein (g)"],
                ["carbohydrate", "Carbohydrate (g)"],
                ["fat", "Fat (g)"],
              ].map(([key, label]) => (
                <Field
                  key={key}
                  label={label}
                  type="number"
                  value={
                    values[
                      key as keyof Pick<
                        FormState,
                        | "calories"
                        | "protein"
                        | "carbohydrate"
                        | "fat"
                      >
                    ]
                  }
                  onChange={(value) =>
                    setValues((current) => ({
                      ...current,
                      [key]: value,
                    }))
                  }
                />
              ))}
            </div>
          </div>

          {/* Seasons Metadata Section */}
          <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-gray-900">រដូវកាល (Seasons)</h3>
                <p className="text-xs text-gray-400">កំណត់រដូវកាលដែលសាកសមសម្រាប់ម្ហូបនេះ</p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setSeasonRows((current) => [
                    ...current,
                    { seasonUuid: "", suitabilityScore: 1.0, reasonText: "" },
                  ])
                }
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-bold text-[#137A3D] hover:bg-emerald-100"
              >
                <Plus size={14} />
                បន្ថែមរដូវកាល
              </button>
            </div>

            {seasonRows.length === 0 ? (
              <p className="mt-3 text-xs italic text-gray-400">មិនទាន់បានជ្រើសរដូវកាល</p>
            ) : (
              <div className="mt-3 space-y-2.5">
                {seasonRows.map((row, idx) => (
                  <div key={idx} className="flex flex-wrap items-center gap-2 rounded-xl bg-white p-2.5 shadow-sm border border-gray-100">
                    <select
                      value={row.seasonUuid}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSeasonRows((prev) =>
                          prev.map((r, i) => (i === idx ? { ...r, seasonUuid: val } : r)),
                        );
                      }}
                      className="h-10 flex-1 min-w-[160px] rounded-xl border border-gray-200 bg-white px-3 text-xs text-gray-800 outline-none focus:border-[#137A3D]"
                    >
                      <option value="">ជ្រើសរដូវកាល...</option>
                      {seasons.map((s) => (
                        <option key={s.uuid} value={s.uuid}>
                          {s.name} {s.localName ? `(${s.localName})` : ""}
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      step="0.05"
                      min="0"
                      max="1"
                      placeholder="Score (0-1)"
                      value={row.suitabilityScore ?? 1.0}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setSeasonRows((prev) =>
                          prev.map((r, i) => (i === idx ? { ...r, suitabilityScore: val } : r)),
                        );
                      }}
                      className="h-10 w-24 rounded-xl border border-gray-200 bg-white px-3 text-xs text-gray-800 outline-none focus:border-[#137A3D]"
                    />

                    <input
                      type="text"
                      placeholder="ហេតុផល (Reason)..."
                      value={row.reasonText ?? ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSeasonRows((prev) =>
                          prev.map((r, i) => (i === idx ? { ...r, reasonText: val } : r)),
                        );
                      }}
                      className="h-10 flex-1 min-w-[180px] rounded-xl border border-gray-200 bg-white px-3 text-xs text-gray-800 outline-none focus:border-[#137A3D]"
                    />

                    <button
                      type="button"
                      onClick={() => setSeasonRows((prev) => prev.filter((_, i) => i !== idx))}
                      className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Events Metadata Section */}
          <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-gray-900">ព្រឹត្តិការណ៍ / បុណ្យទាន (Events)</h3>
                <p className="text-xs text-gray-400">កំណត់ពិធីបុណ្យ ឬព្រឹត្តិការណ៍ដែលពាក់ព័ន្ធ</p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setEventRows((current) => [
                    ...current,
                    { eventUuid: "", relevanceScore: 0.9, reasonText: "" },
                  ])
                }
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-bold text-[#137A3D] hover:bg-emerald-100"
              >
                <Plus size={14} />
                បន្ថែមព្រឹត្តិការណ៍
              </button>
            </div>

            {eventRows.length === 0 ? (
              <p className="mt-3 text-xs italic text-gray-400">មិនទាន់បានជ្រើសព្រឹត្តិការណ៍</p>
            ) : (
              <div className="mt-3 space-y-2.5">
                {eventRows.map((row, idx) => (
                  <div key={idx} className="flex flex-wrap items-center gap-2 rounded-xl bg-white p-2.5 shadow-sm border border-gray-100">
                    <select
                      value={row.eventUuid}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEventRows((prev) =>
                          prev.map((r, i) => (i === idx ? { ...r, eventUuid: val } : r)),
                        );
                      }}
                      className="h-10 flex-1 min-w-[160px] rounded-xl border border-gray-200 bg-white px-3 text-xs text-gray-800 outline-none focus:border-[#137A3D]"
                    >
                      <option value="">ជ្រើសព្រឹត្តិការណ៍...</option>
                      {events.map((ev) => (
                        <option key={ev.uuid} value={ev.uuid}>
                          {ev.name} {ev.localName ? `(${ev.localName})` : ""}
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      step="0.05"
                      min="0"
                      max="1"
                      placeholder="Score (0-1)"
                      value={row.relevanceScore ?? 0.9}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setEventRows((prev) =>
                          prev.map((r, i) => (i === idx ? { ...r, relevanceScore: val } : r)),
                        );
                      }}
                      className="h-10 w-24 rounded-xl border border-gray-200 bg-white px-3 text-xs text-gray-800 outline-none focus:border-[#137A3D]"
                    />

                    <input
                      type="text"
                      placeholder="ហេតុផល (Reason)..."
                      value={row.reasonText ?? ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEventRows((prev) =>
                          prev.map((r, i) => (i === idx ? { ...r, reasonText: val } : r)),
                        );
                      }}
                      className="h-10 flex-1 min-w-[180px] rounded-xl border border-gray-200 bg-white px-3 text-xs text-gray-800 outline-none focus:border-[#137A3D]"
                    />

                    <button
                      type="button"
                      onClick={() => setEventRows((prev) => prev.filter((_, i) => i !== idx))}
                      className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Weather Conditions Metadata Section */}
          <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-gray-900">ស្ថានភាពអាកាសធាតុ (Weather Conditions)</h3>
                <p className="text-xs text-gray-400">កំណត់អាកាសធាតុដែលសាកសមសម្រាប់ម្ហូបនេះ</p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setWeatherRows((current) => [
                    ...current,
                    { weatherConditionUuid: "", suitabilityScore: 0.95, reasonText: "" },
                  ])
                }
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-bold text-[#137A3D] hover:bg-emerald-100"
              >
                <Plus size={14} />
                បន្ថែមអាកាសធាតុ
              </button>
            </div>

            {weatherRows.length === 0 ? (
              <p className="mt-3 text-xs italic text-gray-400">មិនទាន់បានជ្រើសអាកាសធាតុ</p>
            ) : (
              <div className="mt-3 space-y-2.5">
                {weatherRows.map((row, idx) => (
                  <div key={idx} className="flex flex-wrap items-center gap-2 rounded-xl bg-white p-2.5 shadow-sm border border-gray-100">
                    <select
                      value={row.weatherConditionUuid}
                      onChange={(e) => {
                        const val = e.target.value;
                        setWeatherRows((prev) =>
                          prev.map((r, i) => (i === idx ? { ...r, weatherConditionUuid: val } : r)),
                        );
                      }}
                      className="h-10 flex-1 min-w-[160px] rounded-xl border border-gray-200 bg-white px-3 text-xs text-gray-800 outline-none focus:border-[#137A3D]"
                    >
                      <option value="">ជ្រើសអាកាសធាតុ...</option>
                      {weatherConditions.map((w) => (
                        <option key={w.uuid} value={w.uuid}>
                          {w.name} {w.localName ? `(${w.localName})` : ""}
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      step="0.05"
                      min="0"
                      max="1"
                      placeholder="Score (0-1)"
                      value={row.suitabilityScore ?? 0.95}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setWeatherRows((prev) =>
                          prev.map((r, i) => (i === idx ? { ...r, suitabilityScore: val } : r)),
                        );
                      }}
                      className="h-10 w-24 rounded-xl border border-gray-200 bg-white px-3 text-xs text-gray-800 outline-none focus:border-[#137A3D]"
                    />

                    <input
                      type="text"
                      placeholder="ហេតុផល (Reason)..."
                      value={row.reasonText ?? ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setWeatherRows((prev) =>
                          prev.map((r, i) => (i === idx ? { ...r, reasonText: val } : r)),
                        );
                      }}
                      className="h-10 flex-1 min-w-[180px] rounded-xl border border-gray-200 bg-white px-3 text-xs text-gray-800 outline-none focus:border-[#137A3D]"
                    />

                    <button
                      type="button"
                      onClick={() => setWeatherRows((prev) => prev.filter((_, i) => i !== idx))}
                      className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <ImagePicker
            value={images}
            onChange={setImages}
            label={
              item
                ? "រូបភាពថ្មី (ទុកទទេ = រក្សារូបចាស់)"
                : "រូបភាព Food (អតិបរមា 4)"
            }
          />

          {error && (
            <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">
            <button
              type="button"
              disabled={saving}
              onClick={onClose}
              className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-bold text-gray-600"
            >
              បោះបង់
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={() => void submit()}
              className="inline-flex items-center gap-2 rounded-xl bg-[#137A3D] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
            >
              {saving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              រក្សាទុក
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const inputClass =
  "h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm text-gray-800 outline-none transition focus:border-[#137A3D] focus:ring-4 focus:ring-emerald-50";

function Label({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <span className="mb-2 block text-sm font-bold text-gray-800">
      {children}
    </span>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label>
      <Label>{label}</Label>
      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className={inputClass}
      />
    </label>
  );
}
