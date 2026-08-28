"use client";

import {
  CalendarDays,
  Clock,
  Cloud,
  CupSoda,
  Leaf,
  Loader2,
  MapPin,
  Plus,
  Save,
  ShieldAlert,
  Soup,
  Sun,
  Trash2,
  Users,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import ImagePicker from "./ImagePicker";
import CustomSelect from "../ui/CustomSelect";
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
import { useGetManagedFoodQuery } from "@/src/app/store/menuManagementApi";
import {
  readFoodRelationsStorage,
  saveFoodRelationsStorage,
} from "@/src/lib/filterCatalogStorage";

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
  const [existingImages, setExistingImages] = useState<string[]>([]);

  const { data: detailedFood } = useGetManagedFoodQuery(item?.uuid ?? "", {
    skip: !open || !item?.uuid,
  });

  const activeItem = item ? (detailedFood ?? item) : null;

  useEffect(() => {
    if (!open || !item || !activeItem) {
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
      setError(null);
      return;
    }

    const list = activeItem.images?.length
      ? activeItem.images
      : activeItem.gallery?.length
        ? activeItem.gallery
        : activeItem.primaryMediaUrls?.length
          ? activeItem.primaryMediaUrls
          : [activeItem.thumbnail || activeItem.imageUrl].filter(Boolean);
    setExistingImages(list as string[]);

    const matchedCategoryUuid =
      activeItem.categoryUuid ??
      activeItem.category?.uuid ??
      categories.find(
        (c) =>
          (activeItem.category?.code && c.code === activeItem.category.code) ||
          (activeItem.category?.name && c.name === activeItem.category.name) ||
          (activeItem.categoryName && c.name === activeItem.categoryName),
      )?.uuid ??
      "";

    const matchedCuisineUuid =
      activeItem.cuisineUuid ??
      activeItem.cuisine?.uuid ??
      cuisines.find(
        (c) =>
          (activeItem.cuisine?.code && c.code === activeItem.cuisine.code) ||
          (activeItem.cuisine?.name && c.name === activeItem.cuisine.name) ||
          (activeItem.cuisineName && c.name === activeItem.cuisineName),
      )?.uuid ??
      "";

    const stored =
      (activeItem?.uuid ? readFoodRelationsStorage(activeItem.uuid) : null) ??
      (item?.uuid ? readFoodRelationsStorage(item.uuid) : null);

    // Server often returns nutritionData with all 0s/nulls when not persisted.
    // Only trust server nutrition when at least one field has a real non-zero value.
    const serverNut = activeItem.nutritionData ?? (activeItem as any).nutrition;
    const storedNut = stored?.nutritionData ?? stored?.nutrition;
    const serverHasRealData = !!(
      serverNut &&
      (
        (serverNut as any).calories ||
        (serverNut as any).proteinGrams ||
        (serverNut as any).protein ||
        (serverNut as any).carbohydrateGrams ||
        (serverNut as any).carbs ||
        (serverNut as any).fatGrams ||
        (serverNut as any).fat ||
        (serverNut as any).fiberGrams ||
        (serverNut as any).fiber
      )
    );
    const nutrition = serverHasRealData ? serverNut : (storedNut ?? serverNut);

    setValues({
      canonicalName: activeItem.canonicalName ?? "",
      localName: activeItem.localName ?? "",
      description: activeItem.description ?? "",
      categoryUuid: matchedCategoryUuid,
      cuisineUuid: matchedCuisineUuid,
      defaultSpiceLevel: String(
        stored?.defaultSpiceLevel != null
          ? stored.defaultSpiceLevel
          : (stored as any)?.spiceLevel != null
            ? (stored as any).spiceLevel
            : activeItem.defaultSpiceLevel != null
              ? activeItem.defaultSpiceLevel
              : (activeItem as any)?.spiceLevel != null
                ? (activeItem as any).spiceLevel
                : 0,
      ),
      calories:
        nutrition?.calories != null
          ? String(nutrition.calories)
          : (activeItem as any)?.calories != null
            ? String((activeItem as any).calories)
            : "",
      protein:
        nutrition?.proteinGrams != null
          ? String(nutrition.proteinGrams)
          : (nutrition as any)?.protein != null
            ? String((nutrition as any).protein)
            : (activeItem as any)?.proteinGrams != null
              ? String((activeItem as any).proteinGrams)
              : "",
      carbohydrate:
        nutrition?.carbohydrateGrams != null
          ? String(nutrition.carbohydrateGrams)
          : nutrition?.carbsGrams != null
            ? String(nutrition.carbsGrams)
            : (nutrition as any)?.carbs != null
              ? String((nutrition as any).carbs)
              : (activeItem as any)?.carbohydrateGrams != null
                ? String((activeItem as any).carbohydrateGrams)
                : "",
      fat:
        nutrition?.fatGrams != null
          ? String(nutrition.fatGrams)
          : (nutrition as any)?.fat != null
            ? String((nutrition as any).fat)
            : (activeItem as any)?.fatGrams != null
              ? String((activeItem as any).fatGrams)
              : "",
      fiber:
        nutrition?.fiberGrams != null
          ? String(nutrition.fiberGrams)
          : (nutrition as any)?.fiber != null
            ? String((nutrition as any).fiber)
            : (activeItem as any)?.fiberGrams != null
              ? String((activeItem as any).fiberGrams)
              : "",
      isActive: activeItem.isActive !== false,
    });

    // Populate metadata relations if editing - prioritize stored relations saved by the user
    const rawSeasons =
      stored?.seasons !== undefined && Array.isArray(stored.seasons)
        ? stored.seasons
        : Array.isArray(activeItem.seasons) && activeItem.seasons.length > 0
          ? activeItem.seasons
          : Array.isArray((activeItem as any).seasonRelations) && (activeItem as any).seasonRelations.length > 0
            ? (activeItem as any).seasonRelations
            : [];
    setSeasonRows(
      rawSeasons
        .map((s: any) => {
          const sId =
            typeof s === "string"
              ? s
              : s.seasonUuid ||
                s.uuid ||
                s.id ||
                s.season?.uuid ||
                s.season?.id ||
                s.code ||
                s.seasonCode ||
                s.season?.code ||
                "";
          const sName =
            typeof s === "string"
              ? s
              : s.name ||
                s.season?.name ||
                s.localName ||
                s.season?.localName ||
                "";
          const found = seasons.find(
            (opt) =>
              (sId && (opt.uuid === sId || opt.code === sId || (opt as any).id === sId)) ||
              (sName && (opt.name === sName || (opt as any).localName === sName)),
          );
          return {
            seasonUuid: found?.uuid || found?.code || sId || "",
            suitabilityScore:
              s.suitabilityScore != null ? Number(s.suitabilityScore) : 0.95,
            reasonText: s.reasonText ?? "",
          };
        })
        .filter((s) => Boolean(s.seasonUuid)),
    );

    const rawEvents =
      stored?.events !== undefined && Array.isArray(stored.events)
        ? stored.events
        : Array.isArray(activeItem.events) && activeItem.events.length > 0
          ? activeItem.events
          : Array.isArray((activeItem as any).eventRelations) && (activeItem as any).eventRelations.length > 0
            ? (activeItem as any).eventRelations
            : [];
    setEventRows(
      rawEvents
        .map((e: any) => {
          const eId =
            typeof e === "string"
              ? e
              : e.eventUuid ||
                e.uuid ||
                e.id ||
                e.event?.uuid ||
                e.event?.id ||
                e.code ||
                e.eventCode ||
                e.event?.code ||
                "";
          const eName =
            typeof e === "string"
              ? e
              : e.name ||
                e.event?.name ||
                e.localName ||
                e.event?.localName ||
                "";
          const found = events.find(
            (opt) =>
              (eId && (opt.uuid === eId || opt.code === eId || (opt as any).id === eId)) ||
              (eName && (opt.name === eName || (opt as any).localName === eName)),
          );
          return {
            eventUuid: found?.uuid || found?.code || eId || "",
            relevanceScore:
              e.relevanceScore != null ? Number(e.relevanceScore) : 0.9,
            reasonText: e.reasonText ?? "",
          };
        })
        .filter((e) => Boolean(e.eventUuid)),
    );

    const rawWeather =
      stored?.suitableWeather !== undefined && Array.isArray(stored.suitableWeather)
        ? stored.suitableWeather
        : stored?.weatherConditions !== undefined && Array.isArray(stored.weatherConditions)
          ? stored.weatherConditions
          : Array.isArray(activeItem.suitableWeather) && activeItem.suitableWeather.length > 0
            ? activeItem.suitableWeather
            : Array.isArray((activeItem as any).weatherConditions) && (activeItem as any).weatherConditions.length > 0
              ? (activeItem as any).weatherConditions
              : Array.isArray((activeItem as any).weathers) && (activeItem as any).weathers.length > 0
                ? (activeItem as any).weathers
                : Array.isArray((activeItem as any).weather) && (activeItem as any).weather.length > 0
                  ? (activeItem as any).weather
                  : [];
    setWeatherRows(
      rawWeather
        .map((w: any) => {
          const wId =
            typeof w === "string"
              ? w
              : w.weatherConditionUuid ||
                w.weatherUuid ||
                w.conditionUuid ||
                w.uuid ||
                w.id ||
                w.weatherCondition?.uuid ||
                w.weatherCondition?.id ||
                w.code ||
                w.weatherCode ||
                w.weatherCondition?.code ||
                "";
          const wName =
            typeof w === "string"
              ? w
              : w.name ||
                w.weatherCondition?.name ||
                w.localName ||
                w.weatherCondition?.localName ||
                "";
          const found = weatherConditions.find(
            (opt) =>
              (wId && (opt.uuid === wId || opt.code === wId || (opt as any).id === wId)) ||
              (wName && (opt.name === wName || (opt as any).localName === wName)),
          );
          return {
            weatherConditionUuid: found?.uuid || found?.code || wId || "",
            suitabilityScore:
              w.suitabilityScore != null ? Number(w.suitabilityScore) : 0.95,
            reasonText: w.reasonText ?? "",
          };
        })
        .filter((w) => Boolean(w.weatherConditionUuid)),
    );

    const rawMealTypes =
      stored?.mealTypes !== undefined && Array.isArray(stored.mealTypes)
        ? stored.mealTypes
        : Array.isArray(activeItem.mealTypes) && activeItem.mealTypes.length > 0
          ? activeItem.mealTypes
          : Array.isArray((activeItem as any).mealTypeRelations) && (activeItem as any).mealTypeRelations.length > 0
            ? (activeItem as any).mealTypeRelations
            : [];
    setMealTypeRows(
      rawMealTypes
        .map((m: any) => {
          const mId =
            typeof m === "string"
              ? m
              : m.mealTypeUuid ||
                m.uuid ||
                m.id ||
                m.mealType?.uuid ||
                m.mealType?.id ||
                m.code ||
                m.mealTypeCode ||
                m.mealType?.code ||
                "";
          const mName =
            typeof m === "string"
              ? m
              : m.name ||
                m.mealType?.name ||
                m.localName ||
                m.mealType?.localName ||
                "";
          const found = mealTypes.find(
            (opt) =>
              (mId && (opt.uuid === mId || opt.code === mId || (opt as any).id === mId)) ||
              (mName && (opt.name === mName || (opt as any).localName === mName)),
          );
          return {
            mealTypeUuid: found?.uuid || found?.code || mId || "",
            suitabilityScore:
              m.suitabilityScore != null ? Number(m.suitabilityScore) : 1.0,
          };
        })
        .filter((m) => Boolean(m.mealTypeUuid)),
    );

    const rawAgeRules =
      stored?.ageRules !== undefined && Array.isArray(stored.ageRules)
        ? stored.ageRules
        : stored?.ageGroups !== undefined && Array.isArray(stored.ageGroups)
          ? stored.ageGroups
          : Array.isArray(activeItem.ageRules) && activeItem.ageRules.length > 0
            ? activeItem.ageRules
            : Array.isArray((activeItem as any).ageGroups) && (activeItem as any).ageGroups.length > 0
              ? (activeItem as any).ageGroups
              : [];
    setAgeRuleRows(
      rawAgeRules
        .map((a: any) => {
          const aId =
            typeof a === "string"
              ? a
              : a.ageGroupUuid ||
                a.uuid ||
                a.id ||
                a.ageGroup?.uuid ||
                a.ageGroup?.id ||
                a.code ||
                a.ageGroupCode ||
                a.ageGroup?.code ||
                "";
          const aName =
            typeof a === "string"
              ? a
              : a.name ||
                a.ageGroup?.name ||
                a.localName ||
                a.ageGroup?.localName ||
                "";
          const found = ageGroups.find(
            (opt) =>
              (aId && (opt.uuid === aId || opt.code === aId || (opt as any).id === aId)) ||
              (aName && (opt.name === aName || (opt as any).localName === aName)),
          );
          return {
            ageGroupUuid: found?.uuid || found?.code || aId || "",
            ruleResult: a.ruleResult || "ALLOWED",
            reasonText: a.reasonText ?? "Suitable as a normal serving.",
          };
        })
        .filter((a) => Boolean(a.ageGroupUuid)),
    );

    const rawDietary =
      stored?.dietaryTypes !== undefined && Array.isArray(stored.dietaryTypes)
        ? stored.dietaryTypes
        : Array.isArray(activeItem.dietaryTypes) && activeItem.dietaryTypes.length > 0
          ? activeItem.dietaryTypes
          : [];
    setDietaryTypeRows(
      rawDietary
        .map((d: any) => {
          const code = typeof d === "string" ? d : d.code ?? d.dietaryTypeCode ?? d.uuid ?? "";
          const found = dietaryTypes.find(
            (opt) =>
              opt.code === code ||
              opt.uuid === code ||
              (typeof d === "object" && (opt.uuid === d.uuid || opt.uuid === d.dietaryTypeUuid || opt.code === d.code)),
          );
          return {
            code: found?.code || (typeof d === "object" ? d.code || d.dietaryTypeCode : code) || code,
            name: found?.name || (typeof d === "object" ? d.name || d.localName : code) || code,
          };
        })
        .filter((d) => Boolean(d.code)),
    );

    const rawAllergens =
      stored?.allergens !== undefined && Array.isArray(stored.allergens)
        ? stored.allergens
        : Array.isArray(activeItem.allergens) && activeItem.allergens.length > 0
          ? activeItem.allergens
          : Array.isArray((activeItem as any).allergenDeclarations) && (activeItem as any).allergenDeclarations.length > 0
            ? (activeItem as any).allergenDeclarations
            : [];
    setAllergenRows(
      rawAllergens
        .map((a: any) => {
          const aId =
            typeof a === "string"
              ? a
              : a.allergenUuid || a.uuid || a.id || a.code || "";
          const aName =
            typeof a === "string"
              ? a
              : a.name || a.localName || a.allergenName || "";
          const found = allergens.find(
            (opt) =>
              (aId && (opt.uuid === aId || opt.code === aId || (opt as any).id === aId)) ||
              (aName && (opt.name === aName || (opt as any).localName === aName)),
          );
          return {
            allergenUuid: found?.uuid || found?.code || aId || "",
            riskLevel: a.riskLevel || "MEDIUM",
            notes: a.notes ?? "",
          };
        })
        .filter((a) => Boolean(a.allergenUuid)),
    );

    const rawPrepTimes =
      stored?.preparationTimes !== undefined && Array.isArray(stored.preparationTimes)
        ? stored.preparationTimes
        : Array.isArray((activeItem as any)?.preparationTimes)
          ? (activeItem as any).preparationTimes
          : [];
    setPreparationTimeRows(
      rawPrepTimes
        .map((p: any) => ({
          optionUuid: p.optionUuid || p.uuid || p.id || p.code || "",
          notes: p.notes ?? "",
        }))
        .filter((p: any) => Boolean(p.optionUuid)),
    );

    const rawDistances =
      stored?.distances !== undefined && Array.isArray(stored.distances)
        ? stored.distances
        : Array.isArray((activeItem as any)?.distances)
          ? (activeItem as any).distances
          : [];
    setDistanceRows(
      rawDistances
        .map((d: any) => ({
          optionUuid: d.optionUuid || d.uuid || d.id || d.code || "",
          notes: d.notes ?? "",
        }))
        .filter((d: any) => Boolean(d.optionUuid)),
    );

    setImages([]);
    setError(null);
  }, [
    item,
    detailedFood,
    open,
    categories,
    cuisines,
    seasons,
    events,
    weatherConditions,
    mealTypes,
    ageGroups,
    dietaryTypes,
    allergens,
    preparationTimes,
    distances,
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

  const categorySelectOptions = useMemo(
    () => [
      {
        value: "",
        label: catalogType === "DRINK" ? "ជ្រើសប្រភេទភេសជ្ជៈ..." : "ជ្រើសប្រភេទម្ហូប...",
      },
      ...activeCategories.map((category) => ({
        value: category.uuid,
        label: (category as any).localName || extractKhmerOnlyName(category.name) || category.name,
      })),
    ],
    [activeCategories, catalogType],
  );

  const cuisineSelectOptions = useMemo(
    () => [
      { value: "", label: "ជ្រើសម្ហូបតាមប្រទេស..." },
      ...cuisines
        .filter((cuisine) => cuisine.isActive !== false)
        .map((cuisine) => ({
          value: cuisine.uuid,
          label: (cuisine as any).localName || extractKhmerOnlyName(cuisine.name) || cuisine.code,
        })),
    ],
    [cuisines],
  );

  const spiceLevelSelectOptions = useMemo(
    () => [
      { value: "0", label: "0 - មិនហឹរ (Not Spicy)" },
      { value: "1", label: "1 - ហឹរតិច (Mild)" },
      { value: "2", label: "2 - ហឹរមធ្យម (Medium)" },
      { value: "3", label: "3 - ហឹរខ្លាំង (Hot)" },
      { value: "4", label: "4 - ហឹរខ្លាំងណាស់ (Very Hot)" },
      { value: "5", label: "5 - ហឹរបំផុត (Extreme)" },
    ],
    [],
  );

  const dietaryTypeSelectOptions = useMemo(
    () => [
      { value: "", label: "ជ្រើសរបបអាហារ..." },
      ...activeDietaryTypes.map((d) => ({
        value: d.code,
        label:
          (d as any).localName || d.name
            ? `${(d as any).localName || d.name} (${d.code})`
            : d.code,
      })),
    ],
    [activeDietaryTypes],
  );

  const allergenSelectOptions = useMemo(
    () => [
      { value: "", label: "ជ្រើសសារធាតុបង្កអាឡែស៊ី..." },
      ...activeAllergens.map((a) => ({
        value: a.uuid,
        label: (a as any).localName || a.name || a.code,
        description: a.code,
      })),
    ],
    [activeAllergens],
  );

  const allergenRiskSelectOptions = useMemo(
    () => [
      { value: "LOW", label: "LOW (ទាប)" },
      { value: "MEDIUM", label: "MEDIUM (មធ្យម)" },
      { value: "HIGH", label: "HIGH (ខ្ពស់)" },
    ],
    [],
  );

  const mealTypeSelectOptions = useMemo(
    () => [
      { value: "", label: "ជ្រើសពេលទទួលទាន..." },
      ...activeMealTypes.map((m) => ({
        value: m.uuid,
        label: (m as any).localName || m.name || m.code,
      })),
    ],
    [activeMealTypes],
  );

  const ageGroupSelectOptions = useMemo(
    () => [
      { value: "", label: "ជ្រើសក្រុមអាយុ..." },
      ...activeAgeGroups.map((ag) => ({
        value: ag.uuid,
        label: (ag as any).localName || ag.name || ag.code,
      })),
    ],
    [activeAgeGroups],
  );

  const ageRuleResultSelectOptions = useMemo(
    () => [
      { value: "ALLOWED", label: "ALLOWED (អនុញ្ញាត)" },
      { value: "WARNING", label: "WARNING (ប្រុងប្រយ័ត្ន)" },
      { value: "RESTRICTED", label: "RESTRICTED (ហាមឃាត់)" },
    ],
    [],
  );

  const seasonSelectOptions = useMemo(
    () => [
      { value: "", label: "ជ្រើសរដូវកាល..." },
      ...activeSeasons.map((s) => ({
        value: s.uuid,
        label: (s as any).localName || s.name || s.code,
      })),
    ],
    [activeSeasons],
  );

  const eventSelectOptions = useMemo(
    () => [
      { value: "", label: "ជ្រើសព្រឹត្តិការណ៍..." },
      ...activeEvents.map((ev) => ({
        value: ev.uuid,
        label: (ev as any).localName || ev.name || ev.code,
      })),
    ],
    [activeEvents],
  );

  const weatherSelectOptions = useMemo(
    () => [
      { value: "", label: "ជ្រើសអាកាសធាតុ..." },
      ...activeWeatherConditions.map((w) => ({
        value: w.uuid,
        label: (w as any).localName || w.name || w.code,
      })),
    ],
    [activeWeatherConditions],
  );

  const preparationTimeSelectOptions = useMemo(
    () => [
      { value: "", label: "ជ្រើសពេលចម្អិន..." },
      ...activePreparationTimes.map((p) => ({
        value: p.uuid,
        label: (p as any).localName || p.name || p.code,
      })),
    ],
    [activePreparationTimes],
  );

  const distanceSelectOptions = useMemo(
    () => [
      { value: "", label: "ជ្រើសកម្រិតចម្ងាយ..." },
      ...activeDistances.map((d) => ({
        value: d.uuid,
        label: (d as any).localName || d.name || d.code,
      })),
    ],
    [activeDistances],
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
        throw new Error("សូមបញ្ចូលឈ្មោះជាភាសាអង់គ្លេស (English name)");
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

      const matchedCategory = categories.find(
        (c) => c.uuid === values.categoryUuid || c.code === values.categoryUuid,
      );
      const matchedCuisine = cuisines.find(
        (c) => c.uuid === values.cuisineUuid || c.code === values.cuisineUuid,
      );

      const payload: FoodWritePayload = {
        canonicalName: values.canonicalName.trim(),
        localName: values.localName.trim() || null,
        description: values.description.trim() || null,
        categoryUuid: values.categoryUuid,
        categoryCode: matchedCategory?.code || values.categoryUuid,
        cuisineUuid: values.cuisineUuid,
        cuisineCode: matchedCuisine?.code || values.cuisineUuid,
        ...(hasImages ? {} : { primaryMediaUuids: item?.primaryMediaUuids ?? [] }),
        defaultSpiceLevel: Math.min(5, Math.max(0, Math.round(numberOrNull(values.defaultSpiceLevel) ?? 0))),
        nutritionData,
        seasons: seasonRows
          .filter((r) => Boolean(r.seasonUuid))
          .map((r) => {
            const found = seasons.find(
              (s) => s.uuid === r.seasonUuid || s.code === r.seasonUuid,
            );
            return {
              seasonUuid: found?.uuid || r.seasonUuid,
              seasonCode: found?.code || undefined,
              code: found?.code || undefined,
              name: found?.name || undefined,
              localName: (found as any)?.localName || undefined,
              suitabilityScore: r.suitabilityScore ?? 0.95,
              reasonText: r.reasonText?.trim() || null,
            };
          }),
        dietaryTypes: dietaryTypeRows
          .filter((r) => Boolean(r.code))
          .map((r) => ({
            code: r.code,
            name: r.name || r.code,
          })),
        events: eventRows
          .filter((r) => Boolean(r.eventUuid))
          .map((r) => {
            const found = events.find(
              (e) => e.uuid === r.eventUuid || e.code === r.eventUuid,
            );
            return {
              eventUuid: found?.uuid || r.eventUuid,
              eventCode: found?.code || undefined,
              code: found?.code || undefined,
              name: found?.name || undefined,
              localName: (found as any)?.localName || undefined,
              relevanceScore: r.relevanceScore ?? 0.9,
              reasonText: r.reasonText?.trim() || null,
            };
          }),
        suitableWeather: weatherRows
          .filter((r) => Boolean(r.weatherConditionUuid))
          .map((r) => {
            const found = weatherConditions.find(
              (w) =>
                w.uuid === r.weatherConditionUuid ||
                w.code === r.weatherConditionUuid,
            );
            return {
              weatherConditionUuid: found?.uuid || r.weatherConditionUuid,
              weatherConditionCode: found?.code || undefined,
              weatherCode: found?.code || undefined,
              code: found?.code || undefined,
              name: found?.name || undefined,
              localName: (found as any)?.localName || undefined,
              suitabilityScore: r.suitabilityScore ?? 0.95,
              reasonText: r.reasonText?.trim() || null,
            };
          }),
        mealTypes: mealTypeRows
          .filter((r) => Boolean(r.mealTypeUuid))
          .map((r) => {
            const found = mealTypes.find(
              (m) => m.uuid === r.mealTypeUuid || m.code === r.mealTypeUuid,
            );
            return {
              mealTypeUuid: found?.uuid || r.mealTypeUuid,
              mealTypeCode: found?.code || undefined,
              code: found?.code || undefined,
              name: found?.name || undefined,
              localName: (found as any)?.localName || undefined,
              suitabilityScore: r.suitabilityScore ?? 1.0,
            };
          }),
        ageRules: ageRuleRows
          .filter((r) => Boolean(r.ageGroupUuid))
          .map((r) => {
            const found = ageGroups.find(
              (a) => a.uuid === r.ageGroupUuid || a.code === r.ageGroupUuid,
            );
            return {
              ageGroupUuid: found?.uuid || r.ageGroupUuid,
              ageGroupCode: found?.code || undefined,
              code: found?.code || undefined,
              name: found?.name || undefined,
              localName: (found as any)?.localName || undefined,
              ruleResult: r.ruleResult || "ALLOWED",
              reasonText: r.reasonText?.trim() || "Suitable as a normal serving.",
            };
          }),
        allergens: allergenRows
          .filter((r) => Boolean(r.allergenUuid))
          .map((r) => {
            const found = allergens.find(
              (a) => a.uuid === r.allergenUuid || a.code === r.allergenUuid,
            );
            return {
              allergenUuid: found?.uuid || r.allergenUuid,
              allergenCode: found?.code || undefined,
              code: found?.code || undefined,
              name: found?.name || undefined,
              localName: (found as any)?.localName || undefined,
              riskLevel: r.riskLevel || "MEDIUM",
              notes: r.notes?.trim() || null,
            };
          }),
        preparationTimes: preparationTimeRows
          .filter((r) => Boolean(r.optionUuid))
          .map((r) => ({
            optionUuid: r.optionUuid,
            notes: r.notes?.trim() || null,
          })),
        distances: distanceRows
          .filter((r) => Boolean(r.optionUuid))
          .map((r) => ({
            optionUuid: r.optionUuid,
            notes: r.notes?.trim() || null,
          })),
        isActive: values.isActive,
      };

      await onSubmit(payload, images);

      if (item?.uuid) {
        saveFoodRelationsStorage(item.uuid, {
          nutritionData: payload.nutritionData,
          nutrition: payload.nutritionData,
          seasons: payload.seasons,
          events: payload.events,
          suitableWeather: payload.suitableWeather,
          weatherConditions: payload.suitableWeather,
          mealTypes: payload.mealTypes,
          ageRules: payload.ageRules,
          dietaryTypes: payload.dietaryTypes,
          allergens: (payload as any).allergens,
          preparationTimes: payload.preparationTimes,
          distances: payload.distances,
          defaultSpiceLevel: payload.defaultSpiceLevel,
        });
      }
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
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-[#137A3D] border border-emerald-100">
              {catalogType === "DRINK" ? (
                <CupSoda size={24} />
              ) : (
                <Soup size={24} />
              )}
            </div>
            <div>
              <p className="text-3xl font-normal text-[#137A3D]">
                {modalTitle}
              </p>
              <p className="mt-1 text-lg font-normal text-gray-500">
                {modalSubtitle}
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            className="rounded-full p-2.5 text-gray-400 hover:bg-gray-100 transition cursor-pointer"
          >
            <X size={22} />
          </button>
        </div>

        <div className="space-y-6 p-7">
          <div className="grid gap-5 md:grid-cols-2">
            <Field
              label="ឈ្មោះអង់គ្លេស *"
              value={values.canonicalName}
              onChange={(value) =>
                setValues((current) => ({
                  ...current,
                  canonicalName: value,
                }))
              }
            />

            <Field
              label="ឈ្មោះខ្មែរ *"
              value={values.localName}
              onChange={(value) =>
                setValues((current) => ({
                  ...current,
                  localName: value,
                }))
              }
            />

            <div>
              <Label>{catalogType === "DRINK" ? "ប្រភេទភេសជ្ជៈ *" : "ប្រភេទម្ហូប *"}</Label>
              <CustomSelect
                value={values.categoryUuid}
                onChange={(val) =>
                  setValues((current) => ({
                    ...current,
                    categoryUuid: val,
                  }))
                }
                options={categorySelectOptions}
                placeholder={catalogType === "DRINK" ? "ជ្រើសប្រភេទភេសជ្ជៈ..." : "ជ្រើសប្រភេទម្ហូប..."}
                pill
              />
            </div>

            <div>
              <Label>ម្ហូបតាមប្រទេស *</Label>
              <CustomSelect
                value={values.cuisineUuid}
                onChange={(val) =>
                  setValues((current) => ({
                    ...current,
                    cuisineUuid: val,
                  }))
                }
                options={cuisineSelectOptions}
                placeholder="ជ្រើសម្ហូបតាមប្រទេស..."
                pill
              />
            </div>

            {catalogType !== "DRINK" && (
              <div>
                <Label>កម្រិតហឹរ (Spice Level 0-5)</Label>
                <CustomSelect
                  value={values.defaultSpiceLevel}
                  onChange={(val) =>
                    setValues((current) => ({
                      ...current,
                      defaultSpiceLevel: val,
                    }))
                  }
                  options={spiceLevelSelectOptions}
                  placeholder="ជ្រើសកម្រិតហឹរ..."
                  pill
                />
              </div>
            )}

            <div className="flex flex-col justify-end">
              <Label>ស្ថានភាព</Label>
              <button
                type="button"
                onClick={() =>
                  setValues((current) => ({
                    ...current,
                    isActive: !current.isActive,
                  }))
                }
                className={`flex h-12 w-full items-center justify-between rounded-full border px-5 transition cursor-pointer ${
                  values.isActive
                    ? "border-emerald-200 bg-emerald-50/60 text-emerald-800"
                    : "border-gray-200 bg-gray-50 text-gray-500"
                }`}
              >
                <span className="text-lg font-normal">
                  {values.isActive ? "សកម្ម (Active)" : "អសកម្ម (Inactive)"}
                </span>
                <div
                  className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                    values.isActive ? "bg-[#137A3D]" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                      values.isActive ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </div>
              </button>
            </div>

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
                className="w-full rounded-3xl border border-gray-200 bg-white px-5 py-3.5 text-lg font-normal text-gray-700 outline-none transition focus:border-[#137A3D] focus:ring-2 focus:ring-emerald-100 placeholder:text-gray-400 placeholder:font-normal"
                placeholder="បញ្ចូលការពិពណ៌នា..."
              />
            </label>
          </div>

          {/* Nutrition Section */}
          <div className="rounded-3xl border border-gray-100 bg-gray-50/50 p-6">
            <p className="mb-4 text-2xl font-normal text-gray-800">សារធាតុចិញ្ចឹម (Nutrition)</p>

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
          <div className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50/40 to-white p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                  <Leaf size={20} />
                </div>
                <div>
                  <p className="text-2xl font-normal text-gray-800">របបអាហារ <span className="text-lg font-normal text-gray-400">(Dietary Types)</span></p>
                  <p className="mt-0.5 text-lg font-normal text-gray-500">Gluten Free, Vegan, Halal, etc.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDietaryTypeRows((current) => [...current, { code: "", name: "" }])}
                className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-5 py-2.5 text-lg font-normal text-white shadow-sm transition hover:bg-emerald-700 active:scale-95 cursor-pointer"
              >
                <Plus size={18} />
                បន្ថែមរបបអាហារ
              </button>
            </div>

            {dietaryTypeRows.length === 0 ? (
              <div className="mt-4 flex items-center gap-3 rounded-2xl border border-dashed border-emerald-200 bg-white/70 px-5 py-4">
                <Leaf size={18} className="shrink-0 text-emerald-400" />
                <p className="text-lg font-normal text-gray-400">មិនទាន់បានជ្រើសរបបអាហារ</p>
              </div>
            ) : (
              <div className="mt-4 space-y-2.5">
                {dietaryTypeRows.map((row, idx) => (
                  <div key={idx} className="flex flex-wrap items-center gap-2.5 rounded-full border border-gray-100 bg-white p-2 shadow-sm transition hover:border-emerald-100 hover:shadow">
                    <div className="flex-1 min-w-[220px]">
                      <CustomSelect
                        value={row.code}
                        onChange={(val) => {
                          const found = dietaryTypes.find((d) => d.code === val);
                          setDietaryTypeRows((prev) =>
                            prev.map((r, i) =>
                              i === idx ? { ...r, code: val, name: found?.name ?? val } : r,
                            ),
                          );
                        }}
                        options={dietaryTypeSelectOptions}
                        placeholder="ជ្រើសរបបអាហារ..."
                        searchable
                        pill
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setDietaryTypeRows((prev) => prev.filter((_, i) => i !== idx))}
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-gray-400 transition hover:bg-red-50 hover:text-red-500 cursor-pointer"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Allergens Metadata Section */}
          <div className="rounded-3xl border border-rose-100 bg-gradient-to-br from-rose-50/40 to-white p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
                  <ShieldAlert size={20} />
                </div>
                <div>
                  <p className="text-2xl font-normal text-gray-800">សារធាតុបង្កអាឡែស៊ី <span className="text-lg font-normal text-gray-400">(Allergens)</span></p>
                  <p className="mt-0.5 text-lg font-normal text-gray-500">Peanuts, Seafood, Dairy, etc.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAllergenRows((current) => [...current, { allergenUuid: "", riskLevel: "MEDIUM", notes: "" }])}
                className="inline-flex items-center gap-1.5 rounded-full bg-rose-600 px-5 py-2.5 text-lg font-normal text-white shadow-sm transition hover:bg-rose-700 active:scale-95 cursor-pointer"
              >
                <Plus size={18} />
                បន្ថែមអាឡែស៊ី
              </button>
            </div>

            {allergenRows.length === 0 ? (
              <div className="mt-4 flex items-center gap-3 rounded-2xl border border-dashed border-rose-200 bg-white/70 px-5 py-4">
                <ShieldAlert size={18} className="shrink-0 text-rose-400" />
                <p className="text-lg font-normal text-gray-400">មិនទាន់បានជ្រើសសារធាតុបង្កអាឡែស៊ី</p>
              </div>
            ) : (
              <div className="mt-4 space-y-2.5">
                {allergenRows.map((row, idx) => (
                  <div key={idx} className="flex flex-wrap items-center gap-2.5 rounded-full border border-gray-100 bg-white p-2 shadow-sm transition hover:border-rose-100 hover:shadow">
                    <div className="flex-1 min-w-[200px]">
                      <CustomSelect
                        value={row.allergenUuid}
                        onChange={(val) => {
                          setAllergenRows((prev) =>
                            prev.map((r, i) => (i === idx ? { ...r, allergenUuid: val } : r)),
                          );
                        }}
                        options={allergenSelectOptions}
                        placeholder="ជ្រើសសារធាតុបង្កអាឡែស៊ី..."
                        searchable
                        pill
                      />
                    </div>
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
                      className="h-12 flex-1 min-w-[180px] rounded-full border border-gray-200 bg-white px-5 text-lg font-normal text-gray-700 outline-none placeholder:font-normal placeholder:text-gray-400 focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                    />
                    <button
                      type="button"
                      onClick={() => setAllergenRows((prev) => prev.filter((_, i) => i !== idx))}
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-gray-400 transition hover:bg-red-50 hover:text-red-500 cursor-pointer"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Meal Types Metadata Section */}
          <div className="rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50/40 to-white p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                  <UtensilsCrossed size={20} />
                </div>
                <div>
                  <p className="text-2xl font-normal text-gray-800">ពេលទទួលទាន <span className="text-lg font-normal text-gray-400">(Meal Types)</span></p>
                  <p className="mt-0.5 text-lg font-normal text-gray-500">Breakfast, Lunch, Dinner, etc.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMealTypeRows((current) => [...current, { mealTypeUuid: "", suitabilityScore: 1.0 }])}
                className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-5 py-2.5 text-lg font-normal text-white shadow-sm transition hover:bg-blue-700 active:scale-95 cursor-pointer"
              >
                <Plus size={18} />
                បន្ថែមពេលទទួលទាន
              </button>
            </div>

            {mealTypeRows.length === 0 ? (
              <div className="mt-4 flex items-center gap-3 rounded-2xl border border-dashed border-blue-200 bg-white/70 px-5 py-4">
                <UtensilsCrossed size={18} className="shrink-0 text-blue-400" />
                <p className="text-lg font-normal text-gray-400">មិនទាន់បានជ្រើសពេលទទួលទាន</p>
              </div>
            ) : (
              <div className="mt-4 space-y-2.5">
                {mealTypeRows.map((row, idx) => (
                  <div key={idx} className="flex flex-wrap items-center gap-2.5 rounded-full border border-gray-100 bg-white p-2 shadow-sm transition hover:border-blue-100 hover:shadow">
                    <div className="flex-1 min-w-[220px]">
                      <CustomSelect
                        value={row.mealTypeUuid}
                        onChange={(val) => {
                          setMealTypeRows((prev) =>
                            prev.map((r, i) => (i === idx ? { ...r, mealTypeUuid: val } : r)),
                          );
                        }}
                        options={mealTypeSelectOptions}
                        placeholder="ជ្រើសពេលទទួលទាន..."
                        searchable
                        pill
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setMealTypeRows((prev) => prev.filter((_, i) => i !== idx))}
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-gray-400 transition hover:bg-red-50 hover:text-red-500 cursor-pointer"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Age Rules Section */}
          <div className="rounded-3xl border border-violet-100 bg-gradient-to-br from-violet-50/40 to-white p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                  <Users size={20} />
                </div>
                <div>
                  <p className="text-2xl font-normal text-gray-800">ក្រុមអាយុ <span className="text-lg font-normal text-gray-400">(Age Groups)</span></p>
                  <p className="mt-0.5 text-lg font-normal text-gray-500">កំណត់លក្ខខណ្ឌសាកសមសម្រាប់ក្រុមអាយុ</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  setAgeRuleRows((current) => [
                    ...current,
                    { ageGroupUuid: "", ruleResult: "ALLOWED", reasonText: "Suitable as a normal serving." },
                  ])
                }
                className="inline-flex items-center gap-1.5 rounded-full bg-violet-600 px-5 py-2.5 text-lg font-normal text-white shadow-sm transition hover:bg-violet-700 active:scale-95 cursor-pointer"
              >
                <Plus size={18} />
                បន្ថែមក្រុមអាយុ
              </button>
            </div>

            {ageRuleRows.length === 0 ? (
              <div className="mt-4 flex items-center gap-3 rounded-2xl border border-dashed border-violet-200 bg-white/70 px-5 py-4">
                <Users size={18} className="shrink-0 text-violet-400" />
                <p className="text-lg font-normal text-gray-400">មិនទាន់បានជ្រើសក្រុមអាយុ</p>
              </div>
            ) : (
              <div className="mt-4 space-y-2.5">
                {ageRuleRows.map((row, idx) => (
                  <div key={idx} className="flex flex-wrap items-center gap-2.5 rounded-full border border-gray-100 bg-white p-2 shadow-sm transition hover:border-violet-100 hover:shadow">
                    <div className="flex-1 min-w-[200px]">
                      <CustomSelect
                        value={row.ageGroupUuid}
                        onChange={(val) => {
                          setAgeRuleRows((prev) =>
                            prev.map((r, i) => (i === idx ? { ...r, ageGroupUuid: val } : r)),
                          );
                        }}
                        options={ageGroupSelectOptions}
                        placeholder="ជ្រើសក្រុមអាយុ..."
                        searchable
                        pill
                      />
                    </div>
                    <div className="w-48">
                      <CustomSelect
                        value={row.ruleResult || "ALLOWED"}
                        onChange={(val) => {
                          setAgeRuleRows((prev) =>
                            prev.map((r, i) => (i === idx ? { ...r, ruleResult: val } : r)),
                          );
                        }}
                        options={ageRuleResultSelectOptions}
                        placeholder="លទ្ធផល..."
                        pill
                      />
                    </div>
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
                      className="h-12 flex-1 min-w-[180px] rounded-full border border-gray-200 bg-white px-5 text-lg font-normal text-gray-700 outline-none placeholder:font-normal placeholder:text-gray-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                    />
                    <button
                      type="button"
                      onClick={() => setAgeRuleRows((prev) => prev.filter((_, i) => i !== idx))}
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-gray-400 transition hover:bg-red-50 hover:text-red-500 cursor-pointer"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Seasons Metadata Section */}
          <div className="rounded-3xl border border-amber-100 bg-gradient-to-br from-amber-50/40 to-white p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                  <Sun size={20} />
                </div>
                <div>
                  <p className="text-2xl font-normal text-gray-800">រដូវកាល <span className="text-lg font-normal text-gray-400">(Seasons)</span></p>
                  <p className="mt-0.5 text-lg font-normal text-gray-500">កំណត់រដូវកាលដែលសាកសមសម្រាប់មុខម្ហូប/ភេសជ្ជៈ</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSeasonRows((current) => [...current, { seasonUuid: "", suitabilityScore: 1.0, reasonText: "" }])}
                className="inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-5 py-2.5 text-lg font-normal text-white shadow-sm transition hover:bg-amber-600 active:scale-95 cursor-pointer"
              >
                <Plus size={18} />
                បន្ថែមរដូវកាល
              </button>
            </div>

            {seasonRows.length === 0 ? (
              <div className="mt-4 flex items-center gap-3 rounded-2xl border border-dashed border-amber-200 bg-white/70 px-5 py-4">
                <Sun size={18} className="shrink-0 text-amber-400" />
                <p className="text-lg font-normal text-gray-400">មិនទាន់បានជ្រើសរដូវកាល</p>
              </div>
            ) : (
              <div className="mt-4 space-y-2.5">
                {seasonRows.map((row, idx) => (
                  <div key={idx} className="flex flex-wrap items-center gap-2.5 rounded-full border border-gray-100 bg-white p-2 shadow-sm transition hover:border-amber-100 hover:shadow">
                    <div className="flex-1 min-w-[200px]">
                      <CustomSelect
                        value={row.seasonUuid}
                        onChange={(val) => {
                          setSeasonRows((prev) =>
                            prev.map((r, i) => (i === idx ? { ...r, seasonUuid: val } : r)),
                          );
                        }}
                        options={seasonSelectOptions}
                        placeholder="ជ្រើសរដូវកាល..."
                        searchable
                        pill
                      />
                    </div>
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
                      className="h-12 flex-1 min-w-[180px] rounded-full border border-gray-200 bg-white px-5 text-lg font-normal text-gray-700 outline-none placeholder:font-normal placeholder:text-gray-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                    />
                    <button
                      type="button"
                      onClick={() => setSeasonRows((prev) => prev.filter((_, i) => i !== idx))}
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-gray-400 transition hover:bg-red-50 hover:text-red-500 cursor-pointer"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Events Metadata Section */}
          <div className="rounded-3xl border border-pink-100 bg-gradient-to-br from-pink-50/40 to-white p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-pink-100 text-pink-600">
                  <CalendarDays size={20} />
                </div>
                <div>
                  <p className="text-2xl font-normal text-gray-800">ព្រឹត្តិការណ៍ / បុណ្យទាន <span className="text-lg font-normal text-gray-400">(Events)</span></p>
                  <p className="mt-0.5 text-lg font-normal text-gray-500">កំណត់ពិធីបុណ្យ ឬព្រឹត្តិការណ៍ដែលពាក់ព័ន្ធ</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEventRows((current) => [...current, { eventUuid: "", relevanceScore: 0.9, reasonText: "" }])}
                className="inline-flex items-center gap-1.5 rounded-full bg-pink-600 px-5 py-2.5 text-lg font-normal text-white shadow-sm transition hover:bg-pink-700 active:scale-95 cursor-pointer"
              >
                <Plus size={18} />
                បន្ថែមព្រឹត្តិការណ៍
              </button>
            </div>

            {eventRows.length === 0 ? (
              <div className="mt-4 flex items-center gap-3 rounded-2xl border border-dashed border-pink-200 bg-white/70 px-5 py-4">
                <CalendarDays size={18} className="shrink-0 text-pink-400" />
                <p className="text-lg font-normal text-gray-400">មិនទាន់បានជ្រើសព្រឹត្តិការណ៍</p>
              </div>
            ) : (
              <div className="mt-4 space-y-2.5">
                {eventRows.map((row, idx) => (
                  <div key={idx} className="flex flex-wrap items-center gap-2.5 rounded-full border border-gray-100 bg-white p-2 shadow-sm transition hover:border-pink-100 hover:shadow">
                    <div className="flex-1 min-w-[200px]">
                      <CustomSelect
                        value={row.eventUuid}
                        onChange={(val) => {
                          setEventRows((prev) =>
                            prev.map((r, i) => (i === idx ? { ...r, eventUuid: val } : r)),
                          );
                        }}
                        options={eventSelectOptions}
                        placeholder="ជ្រើសព្រឹត្តិការណ៍..."
                        searchable
                        pill
                      />
                    </div>
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
                      className="h-12 flex-1 min-w-[180px] rounded-full border border-gray-200 bg-white px-5 text-lg font-normal text-gray-700 outline-none placeholder:font-normal placeholder:text-gray-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                    />
                    <button
                      type="button"
                      onClick={() => setEventRows((prev) => prev.filter((_, i) => i !== idx))}
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-gray-400 transition hover:bg-red-50 hover:text-red-500 cursor-pointer"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Weather Conditions Metadata Section */}
          <div className="rounded-3xl border border-sky-100 bg-gradient-to-br from-sky-50/40 to-white p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
                  <Cloud size={20} />
                </div>
                <div>
                  <p className="text-2xl font-normal text-gray-800">ស្ថានភាពអាកាសធាតុ <span className="text-lg font-normal text-gray-400">(Weather)</span></p>
                  <p className="mt-0.5 text-lg font-normal text-gray-500">កំណត់អាកាសធាតុដែលសាកសមសម្រាប់មុខម្ហូប/ភេសជ្ជៈ</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setWeatherRows((current) => [...current, { weatherConditionUuid: "", suitabilityScore: 0.8, reasonText: "" }])}
                className="inline-flex items-center gap-1.5 rounded-full bg-sky-600 px-5 py-2.5 text-lg font-normal text-white shadow-sm transition hover:bg-sky-700 active:scale-95 cursor-pointer"
              >
                <Plus size={18} />
                បន្ថែមអាកាសធាតុ
              </button>
            </div>

            {weatherRows.length === 0 ? (
              <div className="mt-4 flex items-center gap-3 rounded-2xl border border-dashed border-sky-200 bg-white/70 px-5 py-4">
                <Cloud size={18} className="shrink-0 text-sky-400" />
                <p className="text-lg font-normal text-gray-400">មិនទាន់បានជ្រើសអាកាសធាតុ</p>
              </div>
            ) : (
              <div className="mt-4 space-y-2.5">
                {weatherRows.map((row, idx) => (
                  <div key={idx} className="flex flex-wrap items-center gap-2.5 rounded-full border border-gray-100 bg-white p-2 shadow-sm transition hover:border-sky-100 hover:shadow">
                    <div className="flex-1 min-w-[200px]">
                      <CustomSelect
                        value={row.weatherConditionUuid}
                        onChange={(val) => {
                          setWeatherRows((prev) =>
                            prev.map((r, i) => (i === idx ? { ...r, weatherConditionUuid: val } : r)),
                          );
                        }}
                        options={weatherSelectOptions}
                        placeholder="ជ្រើសអាកាសធាតុ..."
                        searchable
                        pill
                      />
                    </div>
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
                      className="h-12 flex-1 min-w-[180px] rounded-full border border-gray-200 bg-white px-5 text-lg font-normal text-gray-700 outline-none placeholder:font-normal placeholder:text-gray-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                    />
                    <button
                      type="button"
                      onClick={() => setWeatherRows((prev) => prev.filter((_, i) => i !== idx))}
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-gray-400 transition hover:bg-red-50 hover:text-red-500 cursor-pointer"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Preparation Times Section */}
          <div className="rounded-3xl border border-teal-100 bg-gradient-to-br from-teal-50/40 to-white p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-600">
                  <Clock size={20} />
                </div>
                <div>
                  <p className="text-2xl font-normal text-gray-800">ពេលចម្អិន <span className="text-lg font-normal text-gray-400">(Preparation Times)</span></p>
                  <p className="mt-0.5 text-lg font-normal text-gray-500">កំណត់រយៈពេលរៀបចំ ឬចម្អិនមុខម្ហូប/ភេសជ្ជៈ</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreparationTimeRows((current) => [...current, { optionUuid: "", notes: "" }])}
                className="inline-flex items-center gap-1.5 rounded-full bg-teal-600 px-5 py-2.5 text-lg font-normal text-white shadow-sm transition hover:bg-teal-700 active:scale-95 cursor-pointer"
              >
                <Plus size={18} />
                បន្ថែមពេលចម្អិន
              </button>
            </div>

            {preparationTimeRows.length === 0 ? (
              <div className="mt-4 flex items-center gap-3 rounded-2xl border border-dashed border-teal-200 bg-white/70 px-5 py-4">
                <Clock size={18} className="shrink-0 text-teal-400" />
                <p className="text-lg font-normal text-gray-400">មិនទាន់បានជ្រើសពេលចម្អិន</p>
              </div>
            ) : (
              <div className="mt-4 space-y-2.5">
                {preparationTimeRows.map((row, idx) => (
                  <div key={idx} className="flex flex-wrap items-center gap-2.5 rounded-full border border-gray-100 bg-white p-2 shadow-sm transition hover:border-teal-100 hover:shadow">
                    <div className="flex-1 min-w-[220px]">
                      <CustomSelect
                        value={row.optionUuid}
                        onChange={(val) => {
                          setPreparationTimeRows((prev) =>
                            prev.map((r, i) => (i === idx ? { ...r, optionUuid: val } : r)),
                          );
                        }}
                        options={preparationTimeSelectOptions}
                        placeholder="ជ្រើសពេលចម្អិន..."
                        searchable
                        pill
                      />
                    </div>
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
                      className="h-12 flex-1 min-w-[180px] rounded-full border border-gray-200 bg-white px-5 text-lg font-normal text-gray-700 outline-none placeholder:font-normal placeholder:text-gray-400 focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                    />
                    <button
                      type="button"
                      onClick={() => setPreparationTimeRows((prev) => prev.filter((_, i) => i !== idx))}
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-gray-400 transition hover:bg-red-50 hover:text-red-500 cursor-pointer"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Distances Section */}
          <div className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50/40 to-white p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                  <MapPin size={20} />
                </div>
                <div>
                  <p className="text-2xl font-normal text-gray-800">ចម្ងាយដឹកជញ្ជូន <span className="text-lg font-normal text-gray-400">(Distances)</span></p>
                  <p className="mt-0.5 text-lg font-normal text-gray-500">កំណត់កម្រិតចម្ងាយសមស្របសម្រាប់ការដឹកជញ្ជូន</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDistanceRows((current) => [...current, { optionUuid: "", notes: "" }])}
                className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-5 py-2.5 text-lg font-normal text-white shadow-sm transition hover:bg-indigo-700 active:scale-95 cursor-pointer"
              >
                <Plus size={18} />
                បន្ថែមចម្ងាយ
              </button>
            </div>

            {distanceRows.length === 0 ? (
              <div className="mt-4 flex items-center gap-3 rounded-2xl border border-dashed border-indigo-200 bg-white/70 px-5 py-4">
                <MapPin size={18} className="shrink-0 text-indigo-400" />
                <p className="text-lg font-normal text-gray-400">មិនទាន់បានជ្រើសចម្ងាយ</p>
              </div>
            ) : (
              <div className="mt-4 space-y-2.5">
                {distanceRows.map((row, idx) => (
                  <div key={idx} className="flex flex-wrap items-center gap-2.5 rounded-full border border-gray-100 bg-white p-2 shadow-sm transition hover:border-indigo-100 hover:shadow">
                    <div className="flex-1 min-w-[220px]">
                      <CustomSelect
                        value={row.optionUuid}
                        onChange={(val) => {
                          setDistanceRows((prev) =>
                            prev.map((r, i) => (i === idx ? { ...r, optionUuid: val } : r)),
                          );
                        }}
                        options={distanceSelectOptions}
                        placeholder="ជ្រើសកម្រិតចម្ងាយ..."
                        searchable
                        pill
                      />
                    </div>
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
                      className="h-12 flex-1 min-w-[180px] rounded-full border border-gray-200 bg-white px-5 text-lg font-normal text-gray-700 outline-none placeholder:font-normal placeholder:text-gray-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                    />
                    <button
                      type="button"
                      onClick={() => setDistanceRows((prev) => prev.filter((_, i) => i !== idx))}
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-gray-400 transition hover:bg-red-50 hover:text-red-500 cursor-pointer"
                    >
                      <Trash2 size={18} />
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
            <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-lg font-normal text-red-600">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-4 border-t border-gray-100 pt-6">
            <button
              type="button"
              disabled={saving}
              onClick={onClose}
              className="rounded-full border border-gray-200 px-8 py-3.5 text-xl font-normal text-gray-600 hover:bg-gray-50 transition cursor-pointer"
            >
              បោះបង់
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={() => void submit()}
              className="inline-flex items-center gap-2.5 rounded-full bg-[#137A3D] px-8 py-3.5 text-xl font-normal text-white shadow-md hover:bg-emerald-800 disabled:opacity-60 transition active:scale-95 cursor-pointer"
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
  "h-12 w-full rounded-full border border-gray-200 bg-white px-5 text-lg font-normal text-gray-700 outline-none transition focus:border-[#137A3D] focus:ring-2 focus:ring-emerald-100 placeholder:text-gray-400 placeholder:font-normal";

function Label({
  children,
  required = false,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  if (typeof children === "string") {
    const hasAsterisk = children.includes("*");
    const cleanText = children.replace(/\s*\*/g, "").trim();

    return (
      <span className="mb-2 flex items-center gap-1 text-lg font-normal text-gray-700">
        <span>{cleanText}</span>
        {(hasAsterisk || required) && (
          <span className="text-red-500 font-normal ml-0.5">*</span>
        )}
      </span>
    );
  }

  return (
    <span className="mb-2 flex items-center gap-1 text-lg font-normal text-gray-700">
      <span>{children}</span>
      {required && (
        <span className="text-red-500 font-normal ml-0.5">*</span>
      )}
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
    <div>
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
    </div>
  );
}
