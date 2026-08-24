"use client";

import {
  Clock,
  Globe,
  Loader2,
  MapPin,
  Plus,
  Save,
  ShieldAlert,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import ImagePicker from "./ImagePicker";
import {
  extractKhmerOnlyName,
  isDrinkSubCategory,
  isFoodSubCategory,
  isSubCategory,
} from "@/src/lib/catalogCategoryHelper";

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
import type { Allergen } from "@/src/types/allergen";
import type { FilterCatalogOption } from "@/src/types/filterCatalog";

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
  allergens = [],
  preparationTimes = [],
  distances = [],
  regions = [],
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
  allergens?: Allergen[];
  preparationTimes?: FilterCatalogOption[];
  distances?: FilterCatalogOption[];
  regions?: FilterCatalogOption[];
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
  const [allergenRows, setAllergenRows] = useState<Array<{ allergenUuid: string; riskLevel?: string; notes?: string }>>([]);
  const [preparationTimeRows, setPreparationTimeRows] = useState<Array<{ optionUuid: string; notes?: string }>>([]);
  const [distanceRows, setDistanceRows] = useState<Array<{ optionUuid: string; notes?: string }>>([]);
  const [regionRows, setRegionRows] = useState<Array<{ optionUuid: string; notes?: string }>>([]);
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
      setAllergenRows([]);
      setPreparationTimeRows([]);
      setDistanceRows([]);
      setRegionRows([]);
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
    if (catalogType === "DRINK") {
      return categories.filter(
        (c) =>
          (c.isActive !== false || c.uuid === values.categoryUuid) &&
          isDrinkSubCategory(c, categories),
      );
    }

    if (catalogType === "FOOD") {
      return categories.filter(
        (c) =>
          (c.isActive !== false || c.uuid === values.categoryUuid) &&
          isFoodSubCategory(c, categories),
      );
    }

    return categories.filter(
      (c) =>
        (c.isActive !== false || c.uuid === values.categoryUuid) &&
        isSubCategory(c, categories),
    );
  }, [categories, catalogType, values.categoryUuid]);

  const activeDietaryTypes = useMemo(
    () => dietaryTypes.filter((d) => d.active !== false),
    [dietaryTypes],
  );

  const activeAllergens = useMemo(
    () => (allergens ?? []).filter((a) => a.active !== false),
    [allergens],
  );

  const activeMealTypes = useMemo(
    () => mealTypes.filter((m) => m.isActive !== false),
    [mealTypes],
  );

  const activeAgeGroups = useMemo(
    () => ageGroups.filter((a) => a.isActive !== false),
    [ageGroups],
  );

  const activeSeasons = useMemo(
    () => seasons.filter((s) => s.isActive !== false),
    [seasons],
  );

  const activeEvents = useMemo(
    () => events.filter((e) => e.isActive !== false),
    [events],
  );

  const activeWeatherConditions = useMemo(
    () => weatherConditions.filter((w) => w.isActive !== false),
    [weatherConditions],
  );

  const activePreparationTimes = useMemo(
    () => (preparationTimes ?? []).filter((p) => p.active !== false),
    [preparationTimes],
  );

  const activeDistances = useMemo(
    () => (distances ?? []).filter((d) => d.active !== false),
    [distances],
  );

  const activeRegions = useMemo(
    () => (regions ?? []).filter((r) => r.active !== false),
    [regions],
  );

  const modalTitle = useMemo(() => {
    if (catalogType === "DRINK") {
      return item ? "កែប្រែព័ត៌មានភេសជ្ជៈ" : "បន្ថែមភេសជ្ជៈថ្មី";
    }
    if (catalogType === "FOOD") {
      return item ? "កែប្រែព័ត៌មានមុខម្ហូប" : "បន្ថែមមុខម្ហូបថ្មី";
    }
    return item ? "កែប្រែព័ត៌មានមុខម្ហូប" : "បន្ថែមមុខម្ហូបថ្មី";
  }, [item, catalogType]);

  const modalSubtitle = useMemo(() => {
    if (catalogType === "DRINK") {
      return "ភេសជ្ជៈនេះអាចឱ្យ Store ជ្រើសយកទៅដាក់លក់ក្នុង Menu Item។";
    }
    return "មុខម្ហូបនេះអាចឱ្យ Store ជ្រើសយកទៅដាក់លក់ក្នុង Menu Item។";
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
        defaultSpiceLevel: Math.min(5, Math.max(0, Math.round(numberOrNull(values.defaultSpiceLevel) ?? 0))),
        nutritionData,
        seasons: seasonRows
          .filter((r) => typeof r.seasonUuid === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(r.seasonUuid.trim()))
          .map((r) => ({
            seasonUuid: r.seasonUuid.trim(),
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
          .filter((r) => typeof r.eventUuid === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(r.eventUuid.trim()))
          .map((r) => ({
            eventUuid: r.eventUuid.trim(),
            relevanceScore: r.relevanceScore ?? 0.9,
            reasonText: r.reasonText?.trim() || null,
          })),
        suitableWeather: weatherRows
          .filter((r) => typeof r.weatherConditionUuid === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(r.weatherConditionUuid.trim()))
          .map((r) => ({
            weatherConditionUuid: r.weatherConditionUuid.trim(),
            suitabilityScore: r.suitabilityScore ?? 0.95,
            reasonText: r.reasonText?.trim() || null,
          })),
        mealTypes: mealTypeRows
          .filter((r) => typeof r.mealTypeUuid === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(r.mealTypeUuid.trim()))
          .map((r) => ({
            mealTypeUuid: r.mealTypeUuid.trim(),
            suitabilityScore: r.suitabilityScore ?? 1.0,
          })),
        ageRules: ageRuleRows
          .filter((r) => typeof r.ageGroupUuid === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(r.ageGroupUuid.trim()))
          .map((r) => ({
            ageGroupUuid: r.ageGroupUuid.trim(),
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
    <div className="fixed inset-0 z-[140] overflow-y-auto bg-black/45 p-4 backdrop-blur-xs">
      <div className="mx-auto my-6 w-full max-w-4xl rounded-[30px] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-7 py-6">
          <div>
            <p className="text-3xl font-black text-gray-900">
              {modalTitle}
            </p>
            <p className="mt-1 text-lg text-gray-500">
              {modalSubtitle}
            </p>
          </div>

          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            className="rounded-full p-2.5 text-gray-400 hover:bg-gray-100 transition"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6 p-7">
          <div className="grid gap-5 md:grid-cols-2">
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
              <Label>{catalogType === "DRINK" ? "ប្រភេទភេសជ្ជៈ *" : "ប្រភេទម្ហូប *"}</Label>
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
                <option value="">
                  {catalogType === "DRINK" ? "ជ្រើសប្រភេទភេសជ្ជៈ" : "ជ្រើសប្រភេទម្ហូប"}
                </option>
                {activeCategories.map((category) => (
                  <option key={category.uuid} value={category.uuid}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <Label>ម្ហូបតាមប្រទេស *</Label>
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
                <option value="">ជ្រើសម្ហូបតាមប្រទេស</option>
                {cuisines
                  .filter((cuisine) => cuisine.isActive !== false)
                  .map((cuisine) => (
                    <option key={cuisine.uuid} value={cuisine.uuid}>
                      {extractKhmerOnlyName(cuisine.name)}
                    </option>
                  ))}
              </select>
            </label>

            <label>
              <Label>កម្រិតហឹរ (Spice Level 0-5)</Label>
              <select
                value={values.defaultSpiceLevel}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    defaultSpiceLevel: event.target.value,
                  }))
                }
                className={inputClass}
              >
                <option value="0">0 - មិនហឹរ (Not Spicy)</option>
                <option value="1">1 - ហឹរតិច (Mild)</option>
                <option value="2">2 - ហឹរមធ្យម (Medium)</option>
                <option value="3">3 - ហឹរខ្លាំង (Hot)</option>
                <option value="4">4 - ហឹរខ្លាំងណាស់ (Very Hot)</option>
                <option value="5">5 - ហឹរបំផុត (Extreme)</option>
              </select>
            </label>

            <label className="flex items-center gap-3 pt-8">
              <input
                type="checkbox"
                checked={values.isActive}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    isActive: event.target.checked,
                  }))
                }
                className="h-6 w-6 accent-[#137A3D]"
              />
              <span className="text-xl font-bold text-gray-700">សកម្ម (Active)</span>
            </label>

            <label className="md:col-span-2">
              <Label>ការពិពណ៌នា</Label>
              <textarea
                rows={3}
                value={values.description}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                className={`${inputClass} h-auto py-3.5`}
              />
            </label>
          </div>

          {/* Nutrition Section */}
          <div className="rounded-3xl border border-gray-100 bg-gray-50/50 p-6">
            <p className="mb-4 text-2xl font-black text-gray-900">សារធាតុចិញ្ចឹម (Nutrition)</p>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {[
                ["calories", "Calories (kcal)"],
                ["protein", "Protein (g)"],
                ["carbohydrate", "Carbs (g)"],
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
          <div className="rounded-3xl border border-gray-100 bg-gray-50/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-black text-gray-900">របបអាហារ (Dietary Types)</p>
                <p className="mt-1 text-lg text-gray-500">កំណត់របបអាហារដែលត្រូវគ្នា (Gluten Free, Vegan, Halal, etc.)</p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setDietaryTypeRows((current) => [
                    ...current,
                    { code: "", name: "" },
                  ])
                }
                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-2.5 text-lg font-bold text-[#137A3D] hover:bg-emerald-100 transition active:scale-95"
              >
                <Plus size={18} />
                បន្ថែមរបបអាហារ
              </button>
            </div>

            {dietaryTypeRows.length === 0 ? (
              <p className="mt-4 text-lg italic text-gray-400">មិនទាន់បានជ្រើសរបបអាហារ</p>
            ) : (
              <div className="mt-4 space-y-3">
                {dietaryTypeRows.map((row, idx) => (
                  <div key={idx} className="flex flex-wrap items-center gap-3 rounded-2xl bg-white p-3 shadow-xs border border-gray-100">
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
                      className="h-12 flex-1 min-w-[220px] rounded-xl border border-gray-200 bg-white px-4 text-lg font-medium text-gray-800 outline-none focus:border-[#137A3D]"
                    >
                      <option value="">ជ្រើសរបបអាហារ...</option>
                      {activeDietaryTypes.map((d) => (
                        <option key={d.uuid || d.code} value={d.code}>
                          {d.name} ({d.code})
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => setDietaryTypeRows((prev) => prev.filter((_, i) => i !== idx))}
                      className="flex h-12 w-12 items-center justify-center rounded-xl text-red-500 hover:bg-red-50 transition"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Allergens Metadata Section */}
          <div className="rounded-3xl border border-gray-100 bg-gray-50/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-black text-gray-900">សារធាតុបង្កអាឡែស៊ី (Allergens)</p>
                <p className="mt-1 text-lg text-gray-500">កំណត់សារធាតុដែលអាចបង្កអាឡែស៊ី (Peanuts, Seafood, Dairy, etc.)</p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setAllergenRows((current) => [
                    ...current,
                    { allergenUuid: "", riskLevel: "MEDIUM", notes: "" },
                  ])
                }
                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-2.5 text-lg font-bold text-[#137A3D] hover:bg-emerald-100 transition active:scale-95"
              >
                <Plus size={18} />
                បន្ថែមអាឡែស៊ី
              </button>
            </div>

            {allergenRows.length === 0 ? (
              <p className="mt-4 text-lg italic text-gray-400">មិនទាន់បានជ្រើសសារធាតុបង្កអាឡែស៊ី</p>
            ) : (
              <div className="mt-4 space-y-3">
                {allergenRows.map((row, idx) => (
                  <div key={idx} className="flex flex-wrap items-center gap-3 rounded-2xl bg-white p-3 shadow-xs border border-gray-100">
                    <select
                      value={row.allergenUuid}
                      onChange={(e) => {
                        const val = e.target.value;
                        setAllergenRows((prev) =>
                          prev.map((r, i) => (i === idx ? { ...r, allergenUuid: val } : r)),
                        );
                      }}
                      className="h-12 flex-1 min-w-[220px] rounded-xl border border-gray-200 bg-white px-4 text-lg font-medium text-gray-800 outline-none focus:border-[#137A3D]"
                    >
                      <option value="">ជ្រើសសារធាតុបង្កអាឡែស៊ី...</option>
                      {activeAllergens.map((a) => (
                        <option key={a.uuid || a.code} value={a.uuid}>
                          {a.name || a.code} ({a.code})
                        </option>
                      ))}
                    </select>

                    <select
                      value={row.riskLevel || "MEDIUM"}
                      onChange={(e) => {
                        const val = e.target.value;
                        setAllergenRows((prev) =>
                          prev.map((r, i) => (i === idx ? { ...r, riskLevel: val } : r)),
                        );
                      }}
                      className="h-12 w-44 rounded-xl border border-gray-200 bg-white px-4 text-lg font-medium text-gray-800 outline-none focus:border-[#137A3D]"
                    >
                      <option value="LOW">LOW (ទាប)</option>
                      <option value="MEDIUM">MEDIUM (មធ្យម)</option>
                      <option value="HIGH">HIGH (ខ្ពស់)</option>
                    </select>

                    <input
                      type="text"
                      placeholder="កំណត់ចំណាំ (Notes)..."
                      value={row.notes ?? ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setAllergenRows((prev) =>
                          prev.map((r, i) => (i === idx ? { ...r, notes: val } : r)),
                        );
                      }}
                      className="h-12 flex-1 min-w-[200px] rounded-xl border border-gray-200 bg-white px-4 text-lg font-medium text-gray-800 outline-none focus:border-[#137A3D]"
                    />

                    <button
                      type="button"
                      onClick={() => setAllergenRows((prev) => prev.filter((_, i) => i !== idx))}
                      className="flex h-12 w-12 items-center justify-center rounded-xl text-red-500 hover:bg-red-50 transition"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Meal Types Metadata Section */}
          <div className="rounded-3xl border border-gray-100 bg-gray-50/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-black text-gray-900">ពេលទទួលទាន (Meal Types)</p>
                <p className="mt-1 text-lg text-gray-500">កំណត់ពេលទទួលទាន (Breakfast, Lunch, Dinner, etc.)</p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setMealTypeRows((current) => [
                    ...current,
                    { mealTypeUuid: "", suitabilityScore: 1.0 },
                  ])
                }
                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-2.5 text-lg font-bold text-[#137A3D] hover:bg-emerald-100 transition active:scale-95"
              >
                <Plus size={18} />
                បន្ថែមពេលទទួលទាន
              </button>
            </div>

            {mealTypeRows.length === 0 ? (
              <p className="mt-4 text-lg italic text-gray-400">មិនទាន់បានជ្រើសពេលទទួលទាន</p>
            ) : (
              <div className="mt-4 space-y-3">
                {mealTypeRows.map((row, idx) => (
                  <div key={idx} className="flex flex-wrap items-center gap-3 rounded-2xl bg-white p-3 shadow-xs border border-gray-100">
                    <select
                      value={row.mealTypeUuid}
                      onChange={(e) => {
                        const val = e.target.value;
                        setMealTypeRows((prev) =>
                          prev.map((r, i) => (i === idx ? { ...r, mealTypeUuid: val } : r)),
                        );
                      }}
                      className="h-12 flex-1 min-w-[220px] rounded-xl border border-gray-200 bg-white px-4 text-lg font-medium text-gray-800 outline-none focus:border-[#137A3D]"
                    >
                      <option value="">ជ្រើសពេលទទួលទាន...</option>
                      {activeMealTypes.map((m) => (
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
                      onKeyDown={(e) => {
                        if (e.key === "-" || e.key === "e") {
                          e.preventDefault();
                        }
                      }}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (val < 0) return;
                        setMealTypeRows((prev) =>
                          prev.map((r, i) => (i === idx ? { ...r, suitabilityScore: val } : r)),
                        );
                      }}
                      className="h-12 w-44 rounded-xl border border-gray-200 bg-white px-4 text-lg font-medium text-gray-800 outline-none focus:border-[#137A3D]"
                    />

                    <button
                      type="button"
                      onClick={() => setMealTypeRows((prev) => prev.filter((_, i) => i !== idx))}
                      className="flex h-12 w-12 items-center justify-center rounded-xl text-red-500 hover:bg-red-50 transition"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Age Rules Section */}
          <div className="rounded-3xl border border-gray-100 bg-gray-50/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-black text-gray-900">ក្រុមអាយុ (Age Groups)</p>
                <p className="mt-1 text-lg text-gray-500">កំណត់លក្ខខណ្ឌសាកសមសម្រាប់ក្រុមអាយុ</p>
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
                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-2.5 text-lg font-bold text-[#137A3D] hover:bg-emerald-100 transition active:scale-95"
              >
                <Plus size={18} />
                បន្ថែមក្រុមអាយុ
              </button>
            </div>

            {ageRuleRows.length === 0 ? (
              <p className="mt-4 text-lg italic text-gray-400">មិនទាន់បានជ្រើសក្រុមអាយុ</p>
            ) : (
              <div className="mt-4 space-y-3">
                {ageRuleRows.map((row, idx) => (
                  <div key={idx} className="flex flex-wrap items-center gap-3 rounded-2xl bg-white p-3 shadow-xs border border-gray-100">
                    <select
                      value={row.ageGroupUuid}
                      onChange={(e) => {
                        const val = e.target.value;
                        setAgeRuleRows((prev) =>
                          prev.map((r, i) => (i === idx ? { ...r, ageGroupUuid: val } : r)),
                        );
                      }}
                      className="h-12 flex-1 min-w-[180px] rounded-xl border border-gray-200 bg-white px-4 text-lg font-medium text-gray-800 outline-none focus:border-[#137A3D]"
                    >
                      <option value="">ជ្រើសក្រុមអាយុ...</option>
                      {activeAgeGroups.map((ag) => (
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
                      className="h-12 w-40 rounded-xl border border-gray-200 bg-white px-4 text-lg font-bold text-gray-800 outline-none focus:border-[#137A3D]"
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
                      className="h-12 flex-1 min-w-[200px] rounded-xl border border-gray-200 bg-white px-4 text-lg font-medium text-gray-800 outline-none focus:border-[#137A3D]"
                    />

                    <button
                      type="button"
                      onClick={() => setAgeRuleRows((prev) => prev.filter((_, i) => i !== idx))}
                      className="flex h-12 w-12 items-center justify-center rounded-xl text-red-500 hover:bg-red-50 transition"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Seasons Metadata Section */}
          <div className="rounded-3xl border border-gray-100 bg-gray-50/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-black text-gray-900">រដូវកាល (Seasons)</p>
                <p className="mt-1 text-lg text-gray-500">កំណត់រដូវកាលដែលសាកសមសម្រាប់មុខម្ហូប/ភេសជ្ជៈនេះ</p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setSeasonRows((current) => [
                    ...current,
                    { seasonUuid: "", suitabilityScore: 1.0, reasonText: "" },
                  ])
                }
                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-2.5 text-lg font-bold text-[#137A3D] hover:bg-emerald-100 transition active:scale-95"
              >
                <Plus size={18} />
                បន្ថែមរដូវកាល
              </button>
            </div>

            {seasonRows.length === 0 ? (
              <p className="mt-4 text-lg italic text-gray-400">មិនទាន់បានជ្រើសរដូវកាល</p>
            ) : (
              <div className="mt-4 space-y-3">
                {seasonRows.map((row, idx) => (
                  <div key={idx} className="flex flex-wrap items-center gap-3 rounded-2xl bg-white p-3 shadow-xs border border-gray-100">
                    <select
                      value={row.seasonUuid}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSeasonRows((prev) =>
                          prev.map((r, i) => (i === idx ? { ...r, seasonUuid: val } : r)),
                        );
                      }}
                      className="h-12 flex-1 min-w-[180px] rounded-xl border border-gray-200 bg-white px-4 text-lg font-medium text-gray-800 outline-none focus:border-[#137A3D]"
                    >
                      <option value="">ជ្រើសរដូវកាល...</option>
                      {activeSeasons.map((s) => (
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
                      onKeyDown={(e) => {
                        if (e.key === "-" || e.key === "e") {
                          e.preventDefault();
                        }
                      }}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (val < 0) return;
                        setSeasonRows((prev) =>
                          prev.map((r, i) => (i === idx ? { ...r, suitabilityScore: val } : r)),
                        );
                      }}
                      className="h-12 w-32 rounded-xl border border-gray-200 bg-white px-4 text-lg font-medium text-gray-800 outline-none focus:border-[#137A3D]"
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
                      className="h-12 flex-1 min-w-[200px] rounded-xl border border-gray-200 bg-white px-4 text-lg font-medium text-gray-800 outline-none focus:border-[#137A3D]"
                    />

                    <button
                      type="button"
                      onClick={() => setSeasonRows((prev) => prev.filter((_, i) => i !== idx))}
                      className="flex h-12 w-12 items-center justify-center rounded-xl text-red-500 hover:bg-red-50 transition"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Events Metadata Section */}
          <div className="rounded-3xl border border-gray-100 bg-gray-50/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-black text-gray-900">ព្រឹត្តិការណ៍ / បុណ្យទាន (Events)</p>
                <p className="mt-1 text-lg text-gray-500">កំណត់ពិធីបុណ្យ ឬព្រឹត្តិការណ៍ដែលពាក់ព័ន្ធ</p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setEventRows((current) => [
                    ...current,
                    { eventUuid: "", relevanceScore: 0.9, reasonText: "" },
                  ])
                }
                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-2.5 text-lg font-bold text-[#137A3D] hover:bg-emerald-100 transition active:scale-95"
              >
                <Plus size={18} />
                បន្ថែមព្រឹត្តិការណ៍
              </button>
            </div>

            {eventRows.length === 0 ? (
              <p className="mt-4 text-lg italic text-gray-400">មិនទាន់បានជ្រើសព្រឹត្តិការណ៍</p>
            ) : (
              <div className="mt-4 space-y-3">
                {eventRows.map((row, idx) => (
                  <div key={idx} className="flex flex-wrap items-center gap-3 rounded-2xl bg-white p-3 shadow-xs border border-gray-100">
                    <select
                      value={row.eventUuid}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEventRows((prev) =>
                          prev.map((r, i) => (i === idx ? { ...r, eventUuid: val } : r)),
                        );
                      }}
                      className="h-12 flex-1 min-w-[180px] rounded-xl border border-gray-200 bg-white px-4 text-lg font-medium text-gray-800 outline-none focus:border-[#137A3D]"
                    >
                      <option value="">ជ្រើសព្រឹត្តិការណ៍...</option>
                      {activeEvents.map((ev) => (
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
                      onKeyDown={(e) => {
                        if (e.key === "-" || e.key === "e") {
                          e.preventDefault();
                        }
                      }}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (val < 0) return;
                        setEventRows((prev) =>
                          prev.map((r, i) => (i === idx ? { ...r, relevanceScore: val } : r)),
                        );
                      }}
                      className="h-12 w-32 rounded-xl border border-gray-200 bg-white px-4 text-lg font-medium text-gray-800 outline-none focus:border-[#137A3D]"
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
                      className="h-12 flex-1 min-w-[200px] rounded-xl border border-gray-200 bg-white px-4 text-lg font-medium text-gray-800 outline-none focus:border-[#137A3D]"
                    />

                    <button
                      type="button"
                      onClick={() => setEventRows((prev) => prev.filter((_, i) => i !== idx))}
                      className="flex h-12 w-12 items-center justify-center rounded-xl text-red-500 hover:bg-red-50 transition"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Weather Conditions Metadata Section */}
          <div className="rounded-3xl border border-gray-100 bg-gray-50/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-black text-gray-900">ស្ថានភាពអាកាសធាតុ (Weather Conditions)</p>
                <p className="mt-1 text-lg text-gray-500">កំណត់អាកាសធាតុដែលសាកសមសម្រាប់មុខម្ហូប/ភេសជ្ជៈនេះ</p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setWeatherRows((current) => [
                    ...current,
                    { weatherConditionUuid: "", suitabilityScore: 0.8, reasonText: "" },
                  ])
                }
                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-2.5 text-lg font-bold text-[#137A3D] hover:bg-emerald-100 transition active:scale-95"
              >
                <Plus size={18} />
                បន្ថែមអាកាសធាតុ
              </button>
            </div>

            {weatherRows.length === 0 ? (
              <p className="mt-4 text-lg italic text-gray-400">មិនទាន់បានជ្រើសអាកាសធាតុ</p>
            ) : (
              <div className="mt-4 space-y-3">
                {weatherRows.map((row, idx) => (
                  <div key={idx} className="flex flex-wrap items-center gap-3 rounded-2xl bg-white p-3 shadow-xs border border-gray-100">
                    <select
                      value={row.weatherConditionUuid}
                      onChange={(e) => {
                        const val = e.target.value;
                        setWeatherRows((prev) =>
                          prev.map((r, i) => (i === idx ? { ...r, weatherConditionUuid: val } : r)),
                        );
                      }}
                      className="h-12 flex-1 min-w-[180px] rounded-xl border border-gray-200 bg-white px-4 text-lg font-medium text-gray-800 outline-none focus:border-[#137A3D]"
                    >
                      <option value="">ជ្រើសអាកាសធាតុ...</option>
                      {activeWeatherConditions.map((w) => (
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
                      onKeyDown={(e) => {
                        if (e.key === "-" || e.key === "e") {
                          e.preventDefault();
                        }
                      }}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (val < 0) return;
                        setWeatherRows((prev) =>
                          prev.map((r, i) => (i === idx ? { ...r, suitabilityScore: val } : r)),
                        );
                      }}
                      className="h-12 w-32 rounded-xl border border-gray-200 bg-white px-4 text-lg font-medium text-gray-800 outline-none focus:border-[#137A3D]"
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
                      className="h-12 flex-1 min-w-[200px] rounded-xl border border-gray-200 bg-white px-4 text-lg font-medium text-gray-800 outline-none focus:border-[#137A3D]"
                    />

                    <button
                      type="button"
                      onClick={() => setWeatherRows((prev) => prev.filter((_, i) => i !== idx))}
                      className="flex h-12 w-12 items-center justify-center rounded-xl text-red-500 hover:bg-red-50 transition"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Preparation Times Section */}
          <div className="rounded-3xl border border-gray-100 bg-gray-50/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-black text-gray-900">ពេលចម្អិន (Preparation Times)</p>
                <p className="mt-1 text-lg text-gray-500">កំណត់រយៈពេលរៀបចំ ឬចម្អិនមុខម្ហូប/ភេសជ្ជៈនេះ</p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setPreparationTimeRows((current) => [
                    ...current,
                    { optionUuid: "", notes: "" },
                  ])
                }
                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-2.5 text-lg font-bold text-[#137A3D] hover:bg-emerald-100 transition active:scale-95"
              >
                <Plus size={18} />
                បន្ថែមពេលចម្អិន
              </button>
            </div>

            {preparationTimeRows.length === 0 ? (
              <p className="mt-4 text-lg italic text-gray-400">មិនទាន់បានជ្រើសពេលចម្អិន</p>
            ) : (
              <div className="mt-4 space-y-3">
                {preparationTimeRows.map((row, idx) => (
                  <div key={idx} className="flex flex-wrap items-center gap-3 rounded-2xl bg-white p-3 shadow-xs border border-gray-100">
                    <select
                      value={row.optionUuid}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPreparationTimeRows((prev) =>
                          prev.map((r, i) => (i === idx ? { ...r, optionUuid: val } : r)),
                        );
                      }}
                      className="h-12 flex-1 min-w-[220px] rounded-xl border border-gray-200 bg-white px-4 text-lg font-medium text-gray-800 outline-none focus:border-[#137A3D]"
                    >
                      <option value="">ជ្រើសពេលចម្អិន...</option>
                      {activePreparationTimes.map((p) => (
                        <option key={p.uuid || p.code} value={p.uuid}>
                          {p.localName || p.name} ({p.name})
                        </option>
                      ))}
                    </select>

                    <input
                      type="text"
                      placeholder="កំណត់ចំណាំ (Notes)..."
                      value={row.notes ?? ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPreparationTimeRows((prev) =>
                          prev.map((r, i) => (i === idx ? { ...r, notes: val } : r)),
                        );
                      }}
                      className="h-12 flex-1 min-w-[200px] rounded-xl border border-gray-200 bg-white px-4 text-lg font-medium text-gray-800 outline-none focus:border-[#137A3D]"
                    />

                    <button
                      type="button"
                      onClick={() => setPreparationTimeRows((prev) => prev.filter((_, i) => i !== idx))}
                      className="flex h-12 w-12 items-center justify-center rounded-xl text-red-500 hover:bg-red-50 transition"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Distances Section */}
          <div className="rounded-3xl border border-gray-100 bg-gray-50/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-black text-gray-900">ចម្ងាយដឹកជញ្ជូន (Distances)</p>
                <p className="mt-1 text-lg text-gray-500">កំណត់កម្រិតចម្ងាយសមស្របសម្រាប់ការដឹកជញ្ជូនមុខម្ហូបនេះ</p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setDistanceRows((current) => [
                    ...current,
                    { optionUuid: "", notes: "" },
                  ])
                }
                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-2.5 text-lg font-bold text-[#137A3D] hover:bg-emerald-100 transition active:scale-95"
              >
                <Plus size={18} />
                បន្ថែមចម្ងាយ
              </button>
            </div>

            {distanceRows.length === 0 ? (
              <p className="mt-4 text-lg italic text-gray-400">មិនទាន់បានជ្រើសចម្ងាយ</p>
            ) : (
              <div className="mt-4 space-y-3">
                {distanceRows.map((row, idx) => (
                  <div key={idx} className="flex flex-wrap items-center gap-3 rounded-2xl bg-white p-3 shadow-xs border border-gray-100">
                    <select
                      value={row.optionUuid}
                      onChange={(e) => {
                        const val = e.target.value;
                        setDistanceRows((prev) =>
                          prev.map((r, i) => (i === idx ? { ...r, optionUuid: val } : r)),
                        );
                      }}
                      className="h-12 flex-1 min-w-[220px] rounded-xl border border-gray-200 bg-white px-4 text-lg font-medium text-gray-800 outline-none focus:border-[#137A3D]"
                    >
                      <option value="">ជ្រើសកម្រិតចម្ងាយ...</option>
                      {activeDistances.map((d) => (
                        <option key={d.uuid || d.code} value={d.uuid}>
                          {d.localName || d.name} ({d.name})
                        </option>
                      ))}
                    </select>

                    <input
                      type="text"
                      placeholder="កំណត់ចំណាំ (Notes)..."
                      value={row.notes ?? ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setDistanceRows((prev) =>
                          prev.map((r, i) => (i === idx ? { ...r, notes: val } : r)),
                        );
                      }}
                      className="h-12 flex-1 min-w-[200px] rounded-xl border border-gray-200 bg-white px-4 text-lg font-medium text-gray-800 outline-none focus:border-[#137A3D]"
                    />

                    <button
                      type="button"
                      onClick={() => setDistanceRows((prev) => prev.filter((_, i) => i !== idx))}
                      className="flex h-12 w-12 items-center justify-center rounded-xl text-red-500 hover:bg-red-50 transition"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Regions Section */}
          <div className="rounded-3xl border border-gray-100 bg-gray-50/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-black text-gray-900">តំបន់ / ប្រភពដើម (Regions)</p>
                <p className="mt-1 text-lg text-gray-500">កំណត់តំបន់ ឬខេត្តដែលជាប្រភពដើម ឬសាកសមនៃមុខម្ហូបនេះ</p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setRegionRows((current) => [
                    ...current,
                    { optionUuid: "", notes: "" },
                  ])
                }
                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-2.5 text-lg font-bold text-[#137A3D] hover:bg-emerald-100 transition active:scale-95"
              >
                <Plus size={18} />
                បន្ថែមតំបន់
              </button>
            </div>

            {regionRows.length === 0 ? (
              <p className="mt-4 text-lg italic text-gray-400">មិនទាន់បានជ្រើសតំបន់</p>
            ) : (
              <div className="mt-4 space-y-3">
                {regionRows.map((row, idx) => (
                  <div key={idx} className="flex flex-wrap items-center gap-3 rounded-2xl bg-white p-3 shadow-xs border border-gray-100">
                    <select
                      value={row.optionUuid}
                      onChange={(e) => {
                        const val = e.target.value;
                        setRegionRows((prev) =>
                          prev.map((r, i) => (i === idx ? { ...r, optionUuid: val } : r)),
                        );
                      }}
                      className="h-12 flex-1 min-w-[220px] rounded-xl border border-gray-200 bg-white px-4 text-lg font-medium text-gray-800 outline-none focus:border-[#137A3D]"
                    >
                      <option value="">ជ្រើសតំបន់ / ខេត្ត...</option>
                      {activeRegions.map((r) => (
                        <option key={r.uuid || r.code} value={r.uuid}>
                          {r.localName || r.name} ({r.name})
                        </option>
                      ))}
                    </select>

                    <input
                      type="text"
                      placeholder="កំណត់ចំណាំ (Notes)..."
                      value={row.notes ?? ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setRegionRows((prev) =>
                          prev.map((r, i) => (i === idx ? { ...r, notes: val } : r)),
                        );
                      }}
                      className="h-12 flex-1 min-w-[200px] rounded-xl border border-gray-200 bg-white px-4 text-lg font-medium text-gray-800 outline-none focus:border-[#137A3D]"
                    />

                    <button
                      type="button"
                      onClick={() => setRegionRows((prev) => prev.filter((_, i) => i !== idx))}
                      className="flex h-12 w-12 items-center justify-center rounded-xl text-red-500 hover:bg-red-50 transition"
                    >
                      <Trash2 size={20} />
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
            <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-lg font-semibold text-red-600">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-4 border-t border-gray-100 pt-6">
            <button
              type="button"
              disabled={saving}
              onClick={onClose}
              className="rounded-2xl border border-gray-200 px-7 py-3.5 text-xl font-bold text-gray-600 hover:bg-gray-50 transition"
            >
              បោះបង់
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={() => void submit()}
              className="inline-flex items-center gap-2.5 rounded-2xl bg-[#137A3D] px-7 py-3.5 text-xl font-bold text-white shadow-md hover:bg-emerald-800 disabled:opacity-60 transition active:scale-95"
            >
              {saving ? (
                <Loader2 size={22} className="animate-spin" />
              ) : (
                <Save size={22} />
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
  "h-14 w-full rounded-2xl border border-gray-200 bg-gray-50/50 px-4 text-lg font-medium text-gray-800 outline-none transition focus:border-[#137A3D] focus:bg-white focus:ring-4 focus:ring-emerald-50";

function Label({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <span className="mb-2.5 block text-xl font-bold text-gray-800">
      {children}
    </span>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  min = 0,
  step,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  min?: number | string;
  step?: number | string;
}) {
  return (
    <label>
      <Label>{label}</Label>
      <input
        type={type}
        min={type === "number" ? min : undefined}
        step={step}
        value={value}
        onKeyDown={(e) => {
          if (type === "number" && (e.key === "-" || e.key === "e")) {
            e.preventDefault();
          }
        }}
        onChange={(event) => {
          const val = event.target.value;
          if (type === "number" && Number(val) < 0) return;
          onChange(val);
        }}
        className={inputClass}
      />
    </label>
  );
}
