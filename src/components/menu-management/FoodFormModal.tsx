"use client";

import { Loader2, Plus, Save, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import ImagePicker from "./ImagePicker";
import { isDrinkCategory, isFoodCategory } from "@/src/lib/catalogCategoryHelper";

import type {
  CuisineOption,
  EventOption,
  FoodAgeRuleRelation,
  FoodCategoryOption,
  FoodDietaryTypeRelation,
  FoodEventRelation,
  FoodMealTypeRelation,
  FoodRecord,
  FoodSeasonRelation,
  FoodWeatherRelation,
  FoodWritePayload,
  NutritionData,
  SeasonOption,
  WeatherConditionOption,
} from "@/src/types/menu-management";
import type { MealType } from "@/src/types/mealType";
import type { AgeGroup } from "@/src/types/ageGroup";
import type { DietaryType } from "@/src/types/dietaryType";

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
  fiber: string;
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
  fiber: "",
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
  mealTypes = [],
  ageGroups = [],
  dietaryTypes = [],
  saving,
  catalogType = "ALL",
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
  mealTypes?: MealType[];
  ageGroups?: AgeGroup[];
  dietaryTypes?: DietaryType[];
  saving: boolean;
  catalogType?: "FOOD" | "DRINK" | "ALL";
  onClose: () => void;
  onSubmit: (
    payload: FoodWritePayload,
    images: File[],
  ) => Promise<void>;
}) {
  const [values, setValues] = useState<FormState>(EMPTY);
  const [images, setImages] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Metadata relations state (all filters in ចម្រោះទិន្នន័យ)
  const [seasonRows, setSeasonRows] = useState<FoodSeasonRelation[]>([]);
  const [eventRows, setEventRows] = useState<FoodEventRelation[]>([]);
  const [weatherRows, setWeatherRows] = useState<FoodWeatherRelation[]>([]);
  const [mealTypeRows, setMealTypeRows] = useState<FoodMealTypeRelation[]>([]);
  const [ageRuleRows, setAgeRuleRows] = useState<FoodAgeRuleRelation[]>([]);
  const [dietaryTypeRows, setDietaryTypeRows] = useState<FoodDietaryTypeRelation[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  useEffect(() => {
    if (!open) return;

    if (!item) {
      setValues(EMPTY);
      setImages([]);
      setExistingImages([]);
      setSeasonRows([]);
      setEventRows([]);
      setWeatherRows([]);
      setMealTypeRows([]);
      setAgeRuleRows([]);
      setDietaryTypeRows([]);
      setError(null);
      return;
    }

    const list = item.images?.length
      ? item.images
      : item.gallery?.length
      ? item.gallery
      : item.primaryMediaUrls?.length
      ? item.primaryMediaUrls
      : [item.thumbnail || item.imageUrl].filter(Boolean);
    setExistingImages(list as string[]);

    const matchedCategoryUuid =
      item.categoryUuid ??
      item.category?.uuid ??
      categories.find(
        (c) =>
          (item.category?.code && c.code === item.category.code) ||
          (item.category?.name && c.name === item.category.name) ||
          (item.categoryName && c.name === item.categoryName),
      )?.uuid ??
      "";

    const matchedCuisineUuid =
      item.cuisineUuid ??
      item.cuisine?.uuid ??
      cuisines.find(
        (c) =>
          (item.cuisine?.code && c.code === item.cuisine.code) ||
          (item.cuisine?.name && c.name === item.cuisine.name) ||
          (item.cuisineName && c.name === item.cuisineName),
      )?.uuid ??
      "";

    setValues({
      canonicalName: item.canonicalName ?? "",
      localName: item.localName ?? "",
      description: item.description ?? "",
      categoryUuid: matchedCategoryUuid,
      cuisineUuid: matchedCuisineUuid,
      defaultSpiceLevel: String(item.defaultSpiceLevel ?? 0),
      calories:
        item.nutritionData?.calories != null
          ? String(item.nutritionData.calories)
          : "",
      protein:
        item.nutritionData?.proteinGrams != null
          ? String(item.nutritionData.proteinGrams)
          : "",
      carbohydrate:
        item.nutritionData?.carbohydrateGrams != null
          ? String(item.nutritionData.carbohydrateGrams)
          : item.nutritionData?.carbsGrams != null
            ? String(item.nutritionData.carbsGrams)
            : "",
      fat:
        item.nutritionData?.fatGrams != null
          ? String(item.nutritionData.fatGrams)
          : "",
      fiber:
        item.nutritionData?.fiberGrams != null
          ? String(item.nutritionData.fiberGrams)
          : "",
      isActive: item.isActive !== false,
    });

    // Populate metadata relations if editing
    const rawSeasons = Array.isArray(item.seasons) ? item.seasons : [];
    setSeasonRows(
      rawSeasons
        .map((s: any) => {
          const found = seasons.find(
            (opt) =>
              opt.uuid === s.seasonUuid ||
              opt.uuid === s.uuid ||
              opt.uuid === s.season?.uuid ||
              (s.code && opt.code === s.code) ||
              (s.name && opt.name === s.name),
          );
          return {
            seasonUuid:
              found?.uuid || s.seasonUuid || s.uuid || s.season?.uuid || "",
            suitabilityScore:
              s.suitabilityScore != null ? Number(s.suitabilityScore) : 0.95,
            reasonText: s.reasonText ?? "",
          };
        })
        .filter((s) => Boolean(s.seasonUuid)),
    );

    const rawEvents = Array.isArray(item.events) ? item.events : [];
    setEventRows(
      rawEvents
        .map((e: any) => {
          const found = events.find(
            (opt) =>
              opt.uuid === e.eventUuid ||
              opt.uuid === e.uuid ||
              opt.uuid === e.event?.uuid ||
              (e.code && opt.code === e.code) ||
              (e.name && opt.name === e.name),
          );
          return {
            eventUuid:
              found?.uuid || e.eventUuid || e.uuid || e.event?.uuid || "",
            relevanceScore:
              e.relevanceScore != null ? Number(e.relevanceScore) : 0.9,
            reasonText: e.reasonText ?? "",
          };
        })
        .filter((e) => Boolean(e.eventUuid)),
    );

    const rawWeather = Array.isArray(item.suitableWeather)
      ? item.suitableWeather
      : [];
    setWeatherRows(
      rawWeather
        .map((w: any) => {
          const found = weatherConditions.find(
            (opt) =>
              opt.uuid === w.weatherConditionUuid ||
              opt.uuid === w.uuid ||
              opt.uuid === w.weatherCondition?.uuid ||
              (w.code && opt.code === w.code) ||
              (w.name && opt.name === w.name),
          );
          return {
            weatherConditionUuid:
              found?.uuid ||
              w.weatherConditionUuid ||
              w.uuid ||
              w.weatherCondition?.uuid ||
              "",
            suitabilityScore:
              w.suitabilityScore != null ? Number(w.suitabilityScore) : 0.95,
            reasonText: w.reasonText ?? "",
          };
        })
        .filter((w) => Boolean(w.weatherConditionUuid)),
    );

    const rawMealTypes = Array.isArray(item.mealTypes) ? item.mealTypes : [];
    setMealTypeRows(
      rawMealTypes
        .map((m: any) => {
          const found = mealTypes.find(
            (opt) =>
              opt.uuid === m.mealTypeUuid ||
              opt.uuid === m.uuid ||
              opt.uuid === m.mealType?.uuid ||
              (m.code && opt.code === m.code) ||
              (m.name && opt.name === m.name),
          );
          return {
            mealTypeUuid:
              found?.uuid || m.mealTypeUuid || m.uuid || m.mealType?.uuid || "",
            suitabilityScore:
              m.suitabilityScore != null ? Number(m.suitabilityScore) : 1.0,
          };
        })
        .filter((m) => Boolean(m.mealTypeUuid)),
    );

    const rawAgeRules = Array.isArray(item.ageRules) ? item.ageRules : [];
    setAgeRuleRows(
      rawAgeRules
        .map((a: any) => {
          const found = ageGroups.find(
            (opt) =>
              opt.uuid === a.ageGroupUuid ||
              opt.uuid === a.uuid ||
              opt.uuid === a.ageGroup?.uuid ||
              (a.code && opt.code === a.code) ||
              (a.name && opt.name === a.name),
          );
          return {
            ageGroupUuid:
              found?.uuid || a.ageGroupUuid || a.uuid || a.ageGroup?.uuid || "",
            ruleResult: a.ruleResult || "ALLOWED",
            reasonText: a.reasonText ?? "Suitable as a normal serving.",
          };
        })
        .filter((a) => Boolean(a.ageGroupUuid)),
    );

    const rawDietary = Array.isArray(item.dietaryTypes)
      ? item.dietaryTypes
      : [];
    setDietaryTypeRows(
      rawDietary
        .map((d: any) => {
          const code = d.code ?? d.dietaryTypeCode ?? "";
          const found = dietaryTypes.find(
            (opt) =>
              opt.code === code ||
              opt.uuid === d.uuid ||
              opt.uuid === d.dietaryTypeUuid,
          );
          return {
            code: found?.code || code,
            name: found?.name || d.name || code,
          };
        })
        .filter((d) => Boolean(d.code)),
    );

    setImages([]);
    setError(null);
  }, [
    item,
    open,
    categories,
    cuisines,
    seasons,
    events,
    weatherConditions,
    mealTypes,
    ageGroups,
    dietaryTypes,
  ]);

  const activeCategories = useMemo(() => {
    const list = categories.filter((category) => category.isActive !== false);

    if (catalogType === "DRINK") {
      const drinks = list.filter((c) => isDrinkCategory(c, categories));
      return drinks.length > 0 ? drinks : list;
    }

    if (catalogType === "FOOD") {
      const foods = list.filter((c) => isFoodCategory(c, categories));
      return foods.length > 0 ? foods : list;
    }

    return list;
  }, [categories, catalogType]);

  const modalTitle = useMemo(() => {
    if (catalogType === "DRINK") {
      return item ? "កែប្រែ Drink Catalog" : "បន្ថែម Drink Catalog";
    }
    if (catalogType === "FOOD") {
      return item ? "កែប្រែ Food Catalog" : "បន្ថែម Food Catalog";
    }
    return item ? "កែប្រែ Food Catalog" : "បន្ថែម Food Catalog";
  }, [item, catalogType]);

  const modalSubtitle = useMemo(() => {
    if (catalogType === "DRINK") {
      return "Drink នេះអាចឱ្យ Store ជ្រើសយកទៅបង្កើត Menu Item។";
    }
    return "Food នេះអាចឱ្យ Store ជ្រើសយកទៅបង្កើត Menu Item។";
  }, [catalogType]);

  const submit = async () => {
    try {
      setError(null);

      if (!values.canonicalName.trim()) {
        throw new Error("Canonical name is required.");
      }

      if (!values.categoryUuid) {
        throw new Error("Category (ប្រភេទម្ហូប) is required.");
      }

      if (!values.cuisineUuid) {
        throw new Error("Cuisine (ម្ហូបតាមប្រទេស) is required.");
      }

      const nutritionData: NutritionData = {
        calories: numberOrNull(values.calories) ?? 0,
        proteinGrams: numberOrNull(values.protein) ?? 0,
        carbohydrateGrams: numberOrNull(values.carbohydrate) ?? 0,
        fatGrams: numberOrNull(values.fat) ?? 0,
        fiberGrams: numberOrNull(values.fiber) ?? 0,
      };

      const hasImages = Array.isArray(images) && images.length > 0;

      const payload: FoodWritePayload = {
        canonicalName: values.canonicalName.trim(),
        localName: values.localName.trim() || null,
        description: values.description.trim() || null,
        categoryUuid: values.categoryUuid,
        cuisineUuid: values.cuisineUuid,
        ...(hasImages ? {} : { primaryMediaUuids: item?.primaryMediaUuids ?? [] }),
        defaultSpiceLevel: numberOrNull(values.defaultSpiceLevel) ?? 0,
        nutritionData,
        seasons: seasonRows
          .filter((r) => Boolean(r.seasonUuid))
          .map((r) => ({
            seasonUuid: r.seasonUuid,
            suitabilityScore: r.suitabilityScore ?? 0.95,
            reasonText: r.reasonText?.trim() || null,
          })),
        dietaryTypes: dietaryTypeRows
          .filter((r) => Boolean(r.code))
          .map((r) => ({
            code: r.code,
            name: r.name || r.code,
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
        mealTypes: mealTypeRows
          .filter((r) => Boolean(r.mealTypeUuid))
          .map((r) => ({
            mealTypeUuid: r.mealTypeUuid,
            suitabilityScore: r.suitabilityScore ?? 1.0,
          })),
        ageRules: ageRuleRows
          .filter((r) => Boolean(r.ageGroupUuid))
          .map((r) => ({
            ageGroupUuid: r.ageGroupUuid,
            ruleResult: r.ruleResult || "ALLOWED",
            reasonText: r.reasonText?.trim() || "Suitable as a normal serving.",
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
              {modalTitle}
            </h2>
            <p className="mt-1 text-sm text-gray-400">
              {modalSubtitle}
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
              <Label>Category (ប្រភេទម្ហូប) *</Label>
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
                  <option key={category.uuid} value={category.uuid}>
                    {category.name} ({category.code})
                  </option>
                ))}
              </select>
            </label>

            <label>
              <Label>Cuisine (ម្ហូបតាមប្រទេស) *</Label>
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
                  .filter((cuisine) => cuisine.isActive !== false)
                  .map((cuisine) => (
                    <option key={cuisine.uuid} value={cuisine.uuid}>
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
              <span className="font-bold text-gray-700">Active</span>
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

          {/* Nutrition Section */}
          <div>
            <h3 className="mb-3 text-lg font-black text-gray-900">Nutrition</h3>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {[
                ["calories", "Calories"],
                ["protein", "Protein (g)"],
                ["carbohydrate", "Carbohydrate (g)"],
                ["fat", "Fat (g)"],
                ["fiber", "Fiber (g)"],
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
                        | "fiber"
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

          {/* Dietary Types Metadata Section */}
          <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-gray-900">របបអាហារ (Dietary Types)</h3>
                <p className="text-xs text-gray-400">កំណត់របបអាហារដែលត្រូវគ្នា (Gluten Free, Vegan, Halal, etc.)</p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setDietaryTypeRows((current) => [
                    ...current,
                    { code: "", name: "" },
                  ])
                }
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-bold text-[#137A3D] hover:bg-emerald-100"
              >
                <Plus size={14} />
                បន្ថែមរបបអាហារ
              </button>
            </div>

            {dietaryTypeRows.length === 0 ? (
              <p className="mt-3 text-xs italic text-gray-400">មិនទាន់បានជ្រើសរបបអាហារ</p>
            ) : (
              <div className="mt-3 space-y-2.5">
                {dietaryTypeRows.map((row, idx) => (
                  <div key={idx} className="flex flex-wrap items-center gap-2 rounded-xl bg-white p-2.5 shadow-sm border border-gray-100">
                    <select
                      value={row.code}
                      onChange={(e) => {
                        const val = e.target.value;
                        const found = dietaryTypes.find((d) => d.code === val);
                        setDietaryTypeRows((prev) =>
                          prev.map((r, i) =>
                            i === idx
                              ? { ...r, code: val, name: found?.name ?? val }
                              : r,
                          ),
                        );
                      }}
                      className="h-10 flex-1 min-w-[200px] rounded-xl border border-gray-200 bg-white px-3 text-xs text-gray-800 outline-none focus:border-[#137A3D]"
                    >
                      <option value="">ជ្រើសរបបអាហារ...</option>
                      {dietaryTypes.map((d) => (
                        <option key={d.uuid || d.code} value={d.code}>
                          {d.name} ({d.code})
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => setDietaryTypeRows((prev) => prev.filter((_, i) => i !== idx))}
                      className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Meal Types Metadata Section */}
          <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-gray-900">ពេលទទួលទាន (Meal Types)</h3>
                <p className="text-xs text-gray-400">កំណត់ពេលទទួលទាន (Breakfast, Lunch, Dinner, etc.)</p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setMealTypeRows((current) => [
                    ...current,
                    { mealTypeUuid: "", suitabilityScore: 1.0 },
                  ])
                }
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-bold text-[#137A3D] hover:bg-emerald-100"
              >
                <Plus size={14} />
                បន្ថែមពេលទទួលទាន
              </button>
            </div>

            {mealTypeRows.length === 0 ? (
              <p className="mt-3 text-xs italic text-gray-400">មិនទាន់បានជ្រើសពេលទទួលទាន</p>
            ) : (
              <div className="mt-3 space-y-2.5">
                {mealTypeRows.map((row, idx) => (
                  <div key={idx} className="flex flex-wrap items-center gap-2 rounded-xl bg-white p-2.5 shadow-sm border border-gray-100">
                    <select
                      value={row.mealTypeUuid}
                      onChange={(e) => {
                        const val = e.target.value;
                        setMealTypeRows((prev) =>
                          prev.map((r, i) => (i === idx ? { ...r, mealTypeUuid: val } : r)),
                        );
                      }}
                      className="h-10 flex-1 min-w-[200px] rounded-xl border border-gray-200 bg-white px-3 text-xs text-gray-800 outline-none focus:border-[#137A3D]"
                    >
                      <option value="">ជ្រើសពេលទទួលទាន...</option>
                      {mealTypes.map((m) => (
                        <option key={m.uuid} value={m.uuid}>
                          {m.name} ({m.code})
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      step="0.05"
                      min="0"
                      max="1"
                      placeholder="Suitability Score (0-1)"
                      value={row.suitabilityScore ?? 1.0}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setMealTypeRows((prev) =>
                          prev.map((r, i) => (i === idx ? { ...r, suitabilityScore: val } : r)),
                        );
                      }}
                      className="h-10 w-32 rounded-xl border border-gray-200 bg-white px-3 text-xs text-gray-800 outline-none focus:border-[#137A3D]"
                    />

                    <button
                      type="button"
                      onClick={() => setMealTypeRows((prev) => prev.filter((_, i) => i !== idx))}
                      className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Age Rules Section */}
          <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-gray-900">ក្រុមអាយុ (Age Rules)</h3>
                <p className="text-xs text-gray-400">កំណត់លក្ខខណ្ឌសាកសមសម្រាប់ក្រុមអាយុ</p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setAgeRuleRows((current) => [
                    ...current,
                    {
                      ageGroupUuid: "",
                      ruleResult: "ALLOWED",
                      reasonText: "Suitable as a normal serving.",
                    },
                  ])
                }
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-bold text-[#137A3D] hover:bg-emerald-100"
              >
                <Plus size={14} />
                បន្ថែមក្រុមអាយុ
              </button>
            </div>

            {ageRuleRows.length === 0 ? (
              <p className="mt-3 text-xs italic text-gray-400">មិនទាន់បានជ្រើសក្រុមអាយុ</p>
            ) : (
              <div className="mt-3 space-y-2.5">
                {ageRuleRows.map((row, idx) => (
                  <div key={idx} className="flex flex-wrap items-center gap-2 rounded-xl bg-white p-2.5 shadow-sm border border-gray-100">
                    <select
                      value={row.ageGroupUuid}
                      onChange={(e) => {
                        const val = e.target.value;
                        setAgeRuleRows((prev) =>
                          prev.map((r, i) => (i === idx ? { ...r, ageGroupUuid: val } : r)),
                        );
                      }}
                      className="h-10 flex-1 min-w-[160px] rounded-xl border border-gray-200 bg-white px-3 text-xs text-gray-800 outline-none focus:border-[#137A3D]"
                    >
                      <option value="">ជ្រើសក្រុមអាយុ...</option>
                      {ageGroups.map((ag) => (
                        <option key={ag.uuid} value={ag.uuid}>
                          {ag.name} ({ag.code})
                        </option>
                      ))}
                    </select>

                    <select
                      value={row.ruleResult || "ALLOWED"}
                      onChange={(e) => {
                        const val = e.target.value;
                        setAgeRuleRows((prev) =>
                          prev.map((r, i) => (i === idx ? { ...r, ruleResult: val } : r)),
                        );
                      }}
                      className="h-10 w-32 rounded-xl border border-gray-200 bg-white px-3 text-xs text-gray-800 outline-none focus:border-[#137A3D]"
                    >
                      <option value="ALLOWED">ALLOWED</option>
                      <option value="WARNING">WARNING</option>
                      <option value="RESTRICTED">RESTRICTED</option>
                    </select>

                    <input
                      type="text"
                      placeholder="ហេតុផល (Reason)..."
                      value={row.reasonText ?? ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setAgeRuleRows((prev) =>
                          prev.map((r, i) => (i === idx ? { ...r, reasonText: val } : r)),
                        );
                      }}
                      className="h-10 flex-1 min-w-[180px] rounded-xl border border-gray-200 bg-white px-3 text-xs text-gray-800 outline-none focus:border-[#137A3D]"
                    />

                    <button
                      type="button"
                      onClick={() => setAgeRuleRows((prev) => prev.filter((_, i) => i !== idx))}
                      className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}
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
                    { weatherConditionUuid: "", suitabilityScore: 0.8, reasonText: "" },
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
                      value={row.suitabilityScore ?? 0.8}
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
            existingImages={existingImages}
            onExistingChange={setExistingImages}
            label={
              item
                ? "រូបភាព (ទុកទទេ = រក្សារូបចាស់)"
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
