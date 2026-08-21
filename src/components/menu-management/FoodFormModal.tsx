"use client";

import {
  Check,
  Coffee,
  Loader2,
  Save,
  Trash2,
  Utensils,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import ImagePicker from "./ImagePicker";

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

type MainCategoryType = "FOOD" | "DRINK";

interface SubCategoryConfig {
  key: string;
  label: string;
  keywords: string[];
}

const FOOD_SUBCATEGORIES: SubCategoryConfig[] = [
  { key: "khmerFood", label: "ម្ហូបខ្មែរ", keywords: ["khmer", "ខ្មែរ", "traditional"] },
  { key: "rice", label: "ម្ហូបបាយ", keywords: ["rice", "បាយ"] },
  { key: "noodles", label: "មី និងគុយទាវ", keywords: ["noodle", "kuyteav", "គុយទាវ", "មី", "នំបញ្ចុក"] },
  { key: "soup", label: "សម្ល និងស៊ុប", keywords: ["soup", "សម្ល", "ស៊ុប", "ស្ងោរ"] },
  { key: "grilled", label: "ម្ហូបអាំង", keywords: ["grill", "អាំង", "bbq"] },
  { key: "fried", label: "ម្ហូបចៀន", keywords: ["fry", "fried", "ចៀន", "បំពង"] },
  { key: "stirFried", label: "ម្ហូបឆា", keywords: ["stir", "stir-fry", "ឆា"] },
  { key: "seafood", label: "គ្រឿងសមុទ្រ", keywords: ["seafood", "សមុទ្រ", "បង្គា", "ក្តាម", "មឹក", "ត្រី"] },
  { key: "meat", label: "ម្ហូបសាច់", keywords: ["meat", "សាច់", "គោ", "ជ្រូក", "មាន់"] },
  { key: "vegetarian", label: "ម្ហូបបួស", keywords: ["vegetarian", "vegan", "បួស"] },
  { key: "fastFood", label: "អាហាររហ័ស", keywords: ["fast food", "fast", "burger", "pizza", "អាហាររហ័ស"] },
  { key: "snack", label: "អាហារសម្រន់", keywords: ["snack", "street bites", "សម្រន់", "គ្រឿងក្លែម", "street"] },
  { key: "dessert", label: "បង្អែម", keywords: ["dessert", "sweet", "បង្អែម"] },
  { key: "bakery", label: "នំ និងផលិតផលដុត", keywords: ["bakery", "pastry", "bread", "cake", "នំ", "ដុត"] },
  { key: "breakfast", label: "អាហារពេលព្រឹក", keywords: ["breakfast", "ពេលព្រឹក"] },
  { key: "salad", label: "សាឡាត់", keywords: ["salad", "សាឡាត់"] },
];

const DRINK_SUBCATEGORIES: SubCategoryConfig[] = [
  { key: "water", label: "ទឹក", keywords: ["water", "ទឹក", "បរិសុទ្ធ"] },
  { key: "cannedDrink", label: "ភេសជ្ជៈកំប៉ុង", keywords: ["canned", "can", "soda", "កំប៉ុង", "សូដា"] },
  { key: "freshJuice", label: "ទឹកផ្លែឈើស្រស់", keywords: ["juice", "fresh juice", "cane", "ផ្លែឈើ", "ទឹកអំពៅ"] },
  { key: "smoothie", label: "ស្មូតធី", keywords: ["smoothie", "shake", "ស្មូតធី"] },
  { key: "coffee", label: "កាហ្វេ", keywords: ["coffee", "កាហ្វេ"] },
  { key: "tea", label: "តែ", keywords: ["tea", "តែ"] },
  { key: "milk", label: "ទឹកដោះគោ", keywords: ["milk", "ទឹកដោះគោ"] },
  { key: "milkTea", label: "តែទឹកដោះគោ", keywords: ["milk tea", "boba", "bubble tea", "តែទឹកដោះគោ"] },
  { key: "chocolateDrink", label: "ភេសជ្ជៈសូកូឡា", keywords: ["chocolate", "cocoa", "សូកូឡា"] },
  { key: "energyDrink", label: "ភេសជ្ជៈប៉ូវកម្លាំង", keywords: ["energy", "energy drink", "ប៉ូវកម្លាំង"] },
  { key: "herbalDrink", label: "ភេសជ្ជៈរុក្ខជាតិ", keywords: ["herbal", "herbal drink", "រុក្ខជាតិ"] },
  { key: "traditionalKhmerDrink", label: "ភេសជ្ជៈប្រពៃណីខ្មែរ", keywords: ["traditional khmer drink", "ប្រពៃណី", "ខ្មែរ"] },
];

/* =========================================================
   STATIC FILTER CATEGORIES (5 PAGES DATA)
========================================================= */

export const STATIC_TASTES = [
  { code: "SWEET", label: "ផ្អែម", english: "Sweet" },
  { code: "SALTY", label: "ប្រៃ", english: "Salty" },
  { code: "SOUR", label: "ជូរ", english: "Sour" },
  { code: "SPICY", label: "ហឹរ", english: "Spicy" },
  { code: "BITTER", label: "ល្វីង", english: "Bitter" },
  { code: "UMAMI", label: "អ៊ូម៉ាមី", english: "Umami" },
  { code: "ASTRINGENT", label: "ចត់", english: "Astringent" },
];

export const STATIC_TEXTURES = [
  { code: "CRISPY", label: "ស្រួយ", english: "Crispy" },
  { code: "SOFT", label: "ទន់", english: "Soft" },
  { code: "CHEWY", label: "ស្វិត", english: "Chewy" },
  { code: "CREAMY", label: "ខាប់ទន់", english: "Creamy" },
  { code: "CRUNCHY", label: "ស្រួយរឹង", english: "Crunchy" },
  { code: "LIQUID", label: "រាវ", english: "Smooth / Liquid" },
];

export const STATIC_HEALTH_GOALS = [
  { code: "HIGH_PROTEIN", label: "ប្រូតេអ៊ីនខ្ពស់", english: "High Protein" },
  { code: "LOW_SUGAR", label: "ស្ករទាប", english: "Low Sugar" },
  { code: "LOW_SODIUM", label: "សូដ្យូមទាប", english: "Low Sodium" },
  { code: "LOW_CALORIE", label: "កាឡូរីទាប", english: "Low Calorie" },
  { code: "WEIGHT_LOSS", label: "សម្រកទម្ងន់", english: "Weight Loss" },
  { code: "MUSCLE_GAIN", label: "បង្កើនសាច់ដុំ", english: "Muscle Gain" },
  { code: "ENERGY_BOOST", label: "បង្កើនថាមពល", english: "Energy Boost" },
  { code: "DIGESTION_HEALTH", label: "សុខភាពប្រព័ន្ធរំលាយអាហារ", english: "Digestive Health" },
];

export const STATIC_FOOD_STYLES = [
  { code: "TRADITIONAL", label: "ម្ហូបប្រពៃណី", english: "Traditional" },
  { code: "STREET_FOOD", label: "អាហារតាមផ្លូវ", english: "Street Food" },
  { code: "HEALTHY", label: "អាហារសុខភាព", english: "Healthy" },
  { code: "FAST_FOOD", label: "អាហាររហ័ស", english: "Fast Food" },
  { code: "HOMEMADE", label: "ម្ហូបធ្វើនៅផ្ទះ", english: "Homemade" },
  { code: "FUSION", label: "អាហារបែបទំនើប / Fusion", english: "Modern / Fusion" },
];

export const STATIC_DISTANCES = [
  { code: "DISTANCE_1KM", label: "ក្រោម 1 km", english: "Within 1 km" },
  { code: "DISTANCE_2KM", label: "ក្រោម 2 km", english: "Within 2 km" },
  { code: "DISTANCE_3KM", label: "ក្រោម 3 km", english: "Within 3 km" },
  { code: "DISTANCE_5KM", label: "ក្រោម 5 km", english: "Within 5 km" },
  { code: "DISTANCE_10KM", label: "ក្រោម 10 km", english: "Within 10 km" },
];

export const STATIC_COOKING_METHODS = [
  { code: "FRIED", label: "ចៀន", english: "Fried" },
  { code: "DEEP_FRIED", label: "បំពង", english: "Deep Fried" },
  { code: "GRILLED", label: "អាំង", english: "Grilled / BBQ" },
  { code: "STIR_FRIED", label: "ឆា", english: "Stir-fried" },
  { code: "STEAMED", label: "ចំហុយ", english: "Steamed" },
  { code: "BOILED", label: "ស្ងោរ", english: "Boiled / Soup" },
  { code: "BAKED", label: "ដុត", english: "Baked" },
  { code: "ROASTED", label: "ខ្វៃ", english: "Roasted" },
  { code: "STEWED", label: "ខ / រម្ងាស់", english: "Stewed / Braised" },
  { code: "RAW", label: "ឆៅ / ញាំ", english: "Raw / Fresh" },
  { code: "SMOKED", label: "ឆ្អើរ", english: "Smoked" },
];

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

function resolveCategoryUuid(
  subcat: SubCategoryConfig,
  mainType: MainCategoryType,
  categories: FoodCategoryOption[],
): string {
  if (!categories || categories.length === 0) {
    return "";
  }

  // 1. Exact match on category name
  const exact = categories.find(
    (c) => c.name?.trim().toLowerCase() === subcat.label.trim().toLowerCase(),
  );
  if (exact) return exact.uuid;

  // 2. Keyword match against name or code
  const kwMatch = categories.find((c) => {
    const n = (c.name || "").toLowerCase();
    const cd = (c.code || "").toLowerCase();
    return subcat.keywords.some(
      (kw) => n.includes(kw.toLowerCase()) || cd.includes(kw.toLowerCase()),
    );
  });
  if (kwMatch) return kwMatch.uuid;

  // 3. Fallback to main group root in categories list
  if (mainType === "DRINK") {
    const drinkRoot = categories.find(
      (c) =>
        c.code?.toLowerCase() === "drink" ||
        c.code?.toLowerCase() === "beverage" ||
        c.name?.includes("ភេសជ្ជៈ") ||
        c.name?.toLowerCase().includes("drink"),
    );
    if (drinkRoot) return drinkRoot.uuid;
  } else {
    const foodRoot = categories.find(
      (c) =>
        c.code?.toLowerCase() === "food" ||
        c.name?.includes("ម្ហូបអាហារ") ||
        c.name?.includes("អាហារ") ||
        c.name?.toLowerCase().includes("food"),
    );
    if (foodRoot) return foodRoot.uuid;
  }

  // 4. Default to first category
  return categories[0]?.uuid ?? "";
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
  onClose: () => void;
  onSubmit: (payload: FoodWritePayload, images: File[]) => Promise<void>;
}) {
  const [values, setValues] = useState<FormState>(EMPTY);
  const [mainCategory, setMainCategory] = useState<MainCategoryType>("FOOD");
  const [selectedSubCategoryKey, setSelectedSubCategoryKey] = useState<string | null>(null);

  const [images, setImages] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Metadata relations state (all filters in ចម្រោះទិន្នន័យ)
  const [seasonRows, setSeasonRows] = useState<FoodSeasonRelation[]>([]);
  const [eventRows, setEventRows] = useState<FoodEventRelation[]>([]);
  const [weatherRows, setWeatherRows] = useState<FoodWeatherRelation[]>([]);
  const [mealTypeRows, setMealTypeRows] = useState<FoodMealTypeRelation[]>([]);
  const [ageRuleRows, setAgeRuleRows] = useState<FoodAgeRuleRelation[]>([]);
  const [dietaryTypeRows, setDietaryTypeRows] = useState<
    FoodDietaryTypeRelation[]
  >([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  // Static filter states (Tastes, Textures, Health Goals, Food Styles, Distances, Cooking Methods)
  const [selectedTastes, setSelectedTastes] = useState<string[]>([]);
  const [selectedTextures, setSelectedTextures] = useState<string[]>([]);
  const [selectedHealthGoals, setSelectedHealthGoals] = useState<string[]>([]);
  const [selectedFoodStyles, setSelectedFoodStyles] = useState<string[]>([]);
  const [selectedCookingMethods, setSelectedCookingMethods] = useState<string[]>(
    [],
  );
  const [selectedDistance, setSelectedDistance] = useState<string>("");

  const activeCategories = useMemo(() => {
    return categories.filter((category) => category.isActive !== false);
  }, [categories]);

  const activeCuisines = useMemo(() => {
    return cuisines.filter((cuisine) => cuisine.isActive !== false);
  }, [cuisines]);

  useEffect(() => {
    if (!open) return;

    if (!item) {
      setValues(EMPTY);
      setMainCategory("FOOD");
      setSelectedSubCategoryKey(null);
      setImages([]);
      setExistingImages([]);
      setSeasonRows([]);
      setEventRows([]);
      setWeatherRows([]);
      setMealTypeRows([]);
      setAgeRuleRows([]);
      setDietaryTypeRows([]);
      setSelectedTastes([]);
      setSelectedTextures([]);
      setSelectedHealthGoals([]);
      setSelectedFoodStyles([]);
      setSelectedCookingMethods([]);
      setSelectedDistance("");
      setError(null);
      return;
    }

    const list = item.images?.length
      ? item.images
      : item.gallery?.length
        ? item.gallery
        : item.primaryMediaUrls?.length
          ? item.primaryMediaUrls
          : item.primaryMediaUuids?.length
            ? item.primaryMediaUuids
            : [(item as any).primaryMediaUuid || item.thumbnail || item.imageUrl].filter(Boolean);
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

    // Determine main category and subcategory key
    let initialMainCategory: MainCategoryType = "FOOD";
    let initialSubCategoryKey: string | null = null;

    if (matchedCategoryUuid) {
      const cat = categories.find((c) => c.uuid === matchedCategoryUuid);
      const catName = (cat?.name || item.categoryName || item.category?.name || "").toLowerCase();
      const catCode = (cat?.code || item.category?.code || "").toLowerCase();

      const isDrink =
        catCode.includes("drink") ||
        catCode.includes("beverage") ||
        catName.includes("ភេសជ្ជៈ") ||
        catName.includes("drink") ||
        catName.includes("ទឹក") ||
        catName.includes("កាហ្វេ") ||
        catName.includes("តែ");

      if (isDrink) {
        initialMainCategory = "DRINK";
        const foundDrink = DRINK_SUBCATEGORIES.find(
          (s) =>
            catName === s.label.toLowerCase() ||
            s.keywords.some((kw) => catName.includes(kw.toLowerCase()) || catCode.includes(kw.toLowerCase())),
        );
        initialSubCategoryKey = foundDrink?.key ?? null;
      } else {
        initialMainCategory = "FOOD";
        const foundFood = FOOD_SUBCATEGORIES.find(
          (s) =>
            catName === s.label.toLowerCase() ||
            s.keywords.some((kw) => catName.includes(kw.toLowerCase()) || catCode.includes(kw.toLowerCase())),
        );
        initialSubCategoryKey = foundFood?.key ?? null;
      }
    }

    setMainCategory(initialMainCategory);
    setSelectedSubCategoryKey(initialSubCategoryKey);

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

    setSelectedTastes(
      Array.isArray(item.tastes)
        ? (item.tastes as string[])
        : Array.isArray((item as any).tastePreferences)
          ? ((item as any).tastePreferences as string[])
          : [],
    );

    setSelectedTextures(
      Array.isArray(item.textures)
        ? (item.textures as string[])
        : Array.isArray((item as any).texturePreferences)
          ? ((item as any).texturePreferences as string[])
          : [],
    );

    setSelectedHealthGoals(
      Array.isArray(item.healthGoals)
        ? (item.healthGoals as string[])
        : Array.isArray((item as any).healthGoalPreferences)
          ? ((item as any).healthGoalPreferences as string[])
          : [],
    );

    setSelectedFoodStyles(
      Array.isArray(item.foodStyles)
        ? (item.foodStyles as string[])
        : Array.isArray((item as any).foodStylePreferences)
          ? ((item as any).foodStylePreferences as string[])
          : [],
    );

    setSelectedCookingMethods(
      Array.isArray(item.cookingMethods)
        ? (item.cookingMethods as string[])
        : Array.isArray((item as any).cookingMethodPreferences)
          ? ((item as any).cookingMethodPreferences as string[])
          : [],
    );

    setSelectedDistance(
      item.distance ||
        (item as any).distancePreference ||
        (item as any).deliveryDistance ||
        "",
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

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !saving) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, saving, onClose]);

  const handleSubCategoryClick = (
    subcat: SubCategoryConfig,
    mainType: MainCategoryType,
  ) => {
    if (selectedSubCategoryKey === subcat.key) {
      // Toggle off / deselect
      setSelectedSubCategoryKey(null);
      setValues((current) => ({
        ...current,
        categoryUuid: "",
      }));
    } else {
      // Select single subcategory
      setSelectedSubCategoryKey(subcat.key);
      const resolvedUuid = resolveCategoryUuid(
        subcat,
        mainType,
        activeCategories,
      );
      setValues((current) => ({
        ...current,
        categoryUuid: resolvedUuid,
      }));
    }
  };

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
        ...(hasImages
          ? {}
          : { primaryMediaUuids: item?.primaryMediaUuids ?? [] }),
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
        tastes: selectedTastes,
        textures: selectedTextures,
        healthGoals: selectedHealthGoals,
        foodStyles: selectedFoodStyles,
        cookingMethods: selectedCookingMethods,
        distance: selectedDistance || null,
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

  const toggleDietaryType = (code: string) => {
    setDietaryTypeRows((current) => {
      const exists = current.some((row) => row.code === code);

      if (exists) {
        return current.filter((row) => row.code !== code);
      }

      const option = dietaryTypes.find((row) => row.code === code);

      return [
        ...current,
        {
          code,
          name: option?.name ?? code,
        },
      ];
    });
  };

  const toggleMealType = (uuid: string) => {
    setMealTypeRows((current) => {
      const exists = current.some((row) => row.mealTypeUuid === uuid);

      if (exists) {
        return current.filter((row) => row.mealTypeUuid !== uuid);
      }

      return [
        ...current,
        {
          mealTypeUuid: uuid,
          suitabilityScore: 1.0,
        },
      ];
    });
  };

  const toggleAgeGroup = (uuid: string) => {
    setAgeRuleRows((current) => {
      const exists = current.some((row) => row.ageGroupUuid === uuid);

      if (exists) {
        return current.filter((row) => row.ageGroupUuid !== uuid);
      }

      return [
        ...current,
        {
          ageGroupUuid: uuid,
          ruleResult: "ALLOWED",
          reasonText: "Suitable as a normal serving.",
        },
      ];
    });
  };

  const toggleSeason = (uuid: string) => {
    setSeasonRows((current) => {
      const exists = current.some((row) => row.seasonUuid === uuid);

      if (exists) {
        return current.filter((row) => row.seasonUuid !== uuid);
      }

      return [
        ...current,
        {
          seasonUuid: uuid,
          suitabilityScore: 1.0,
          reasonText: "",
        },
      ];
    });
  };

  const toggleEvent = (uuid: string) => {
    setEventRows((current) => {
      const exists = current.some((row) => row.eventUuid === uuid);

      if (exists) {
        return current.filter((row) => row.eventUuid !== uuid);
      }

      return [
        ...current,
        {
          eventUuid: uuid,
          relevanceScore: 0.9,
          reasonText: "",
        },
      ];
    });
  };

  const toggleWeather = (uuid: string) => {
    setWeatherRows((current) => {
      const exists = current.some((row) => row.weatherConditionUuid === uuid);

      if (exists) {
        return current.filter((row) => row.weatherConditionUuid !== uuid);
      }

      return [
        ...current,
        {
          weatherConditionUuid: uuid,
          suitabilityScore: 0.8,
          reasonText: "",
        },
      ];
    });
  };

  const selectedDietaryCodes = dietaryTypeRows.map((row) => row.code);
  const selectedMealTypeUuids = mealTypeRows.map((row) => row.mealTypeUuid);
  const selectedAgeGroupUuids = ageRuleRows.map((row) => row.ageGroupUuid);
  const selectedSeasonUuids = seasonRows.map((row) => row.seasonUuid);
  const selectedEventUuids = eventRows.map((row) => row.eventUuid);
  const selectedWeatherUuids = weatherRows.map(
    (row) => row.weatherConditionUuid,
  );

  const activeDietaryTypes = useMemo(() => {
    return dietaryTypes.filter(
      (item) => item.active !== false || selectedDietaryCodes.includes(item.code),
    );
  }, [dietaryTypes, selectedDietaryCodes]);

  const activeMealTypes = useMemo(() => {
    return mealTypes.filter(
      (item) =>
        item.isActive !== false || selectedMealTypeUuids.includes(item.uuid),
    );
  }, [mealTypes, selectedMealTypeUuids]);

  const activeAgeGroups = useMemo(() => {
    return ageGroups.filter(
      (item) =>
        item.isActive !== false || selectedAgeGroupUuids.includes(item.uuid),
    );
  }, [ageGroups, selectedAgeGroupUuids]);

  const activeSeasons = useMemo(() => {
    return seasons.filter(
      (item) =>
        item.isActive !== false || selectedSeasonUuids.includes(item.uuid),
    );
  }, [seasons, selectedSeasonUuids]);

  const activeEvents = useMemo(() => {
    return events.filter(
      (item) =>
        item.isActive !== false || selectedEventUuids.includes(item.uuid),
    );
  }, [events, selectedEventUuids]);

  const activeWeatherConditions = useMemo(() => {
    return weatherConditions.filter(
      (item) =>
        item.isActive !== false || selectedWeatherUuids.includes(item.uuid),
    );
  }, [weatherConditions, selectedWeatherUuids]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center bg-black/45 p-4 backdrop-blur-[3px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="food-form-title"
    >
      <div className="max-h-[94vh] w-full max-w-6xl overflow-y-auto rounded-3xl border border-gray-100 bg-white shadow-2xl [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {/* =================================================
            STICKY HEADER
        ================================================== */}
        <div className="sticky top-0 z-50 flex items-center justify-between gap-4 border-b border-gray-100 bg-white/95 px-6 py-5 backdrop-blur-md sm:px-8">
          <div className="min-w-0">
            <p
              id="food-form-title"
              className="text-3xl font-semibold text-primary-800"
            >
              {item ? "កែប្រែមីនុយ" : "បន្ថែមមីនុយ"}
            </p>

            <p className="mt-2 text-lg leading-7 text-gray-500">
              កំណត់ព័ត៌មានម្ហូប និងជ្រើសលក្ខណៈសមស្របដោយចុចលើជម្រើស។
            </p>
          </div>

          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            aria-label="បិទ"
            title="បិទ"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={22} />
          </button>
        </div>

        <div className="space-y-6 p-6 pb-0 sm:p-8 sm:pb-0">
          {/* =================================================
              BASIC INFORMATION
          ================================================== */}
          <FormSection
            title="ព័ត៌មានលម្អិត"
            description="បញ្ចូលព័ត៌មានសំខាន់ៗរបស់ម្ហូប និងជ្រើស Category និង Cuisine។"
          >
            <div className="grid gap-5 md:grid-cols-2">
              <Field
                label="Canonical name"
                value={values.canonicalName}
                placeholder="ឧ. Beef Lok Lak"
                required
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
                placeholder="ឧ. ឡុកឡាក់សាច់គោ"
                onChange={(value) =>
                  setValues((current) => ({
                    ...current,
                    localName: value,
                  }))
                }
              />

              {/* =================================================
                  CATEGORY (MAIN CATEGORY + SUB-CATEGORY)
              ================================================== */}
              <div className="md:col-span-2">
                <OptionFieldLabel
                  label="Category (ប្រភេទម្ហូប)"
                  required
                  description="ជ្រើសរើសប្រភេទធំ (អាហារ ឬ ភេសជ្ជៈ) រួចជ្រើសរើសប្រភេទរងតែមួយ។"
                />

                {/* 2 Main Parent Categories */}
                <div className="mb-3 grid grid-cols-2 gap-3 sm:gap-4">
                  <button
                    type="button"
                    onClick={() => setMainCategory("FOOD")}
                    className={`flex min-h-[54px] items-center justify-center gap-2.5 rounded-2xl border px-4 py-3 text-lg font-bold transition-all duration-200 focus:outline-none focus:ring-4 ${
                      mainCategory === "FOOD"
                        ? "border-primary-800 bg-primary-800 text-white shadow-md focus:ring-primary-100"
                        : "border-gray-200 bg-gray-50/80 text-gray-700 hover:border-gray-300 hover:bg-gray-100 focus:ring-gray-100"
                    }`}
                  >
                    <Utensils
                      size={20}
                      className={
                        mainCategory === "FOOD"
                          ? "text-white"
                          : "text-primary-700"
                      }
                    />
                    <span>អាហារ (Food)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMainCategory("DRINK")}
                    className={`flex min-h-[54px] items-center justify-center gap-2.5 rounded-2xl border px-4 py-3 text-lg font-bold transition-all duration-200 focus:outline-none focus:ring-4 ${
                      mainCategory === "DRINK"
                        ? "border-primary-800 bg-primary-800 text-white shadow-md focus:ring-primary-100"
                        : "border-gray-200 bg-gray-50/80 text-gray-700 hover:border-gray-300 hover:bg-gray-100 focus:ring-gray-100"
                    }`}
                  >
                    <Coffee
                      size={20}
                      className={
                        mainCategory === "DRINK"
                          ? "text-white"
                          : "text-primary-700"
                      }
                    />
                    <span>ភេសជ្ជៈ (Drink)</span>
                  </button>
                </div>

                {/* Sub-categories Pill Selection */}
                <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-base font-semibold text-primary-800">
                      {mainCategory === "FOOD"
                        ? "ប្រភេទរងនៃអាហារ"
                        : "ប្រភេទរងនៃភេសជ្ជៈ"}
                    </p>
                    <span className="text-sm font-medium text-gray-400">
                      ជ្រើសតែមួយ
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2.5">
                    {(mainCategory === "FOOD"
                      ? FOOD_SUBCATEGORIES
                      : DRINK_SUBCATEGORIES
                    ).map((subcat) => {
                      const isSelected = selectedSubCategoryKey === subcat.key;

                      return (
                        <button
                          key={subcat.key}
                          type="button"
                          aria-pressed={isSelected}
                          onClick={() =>
                            handleSubCategoryClick(subcat, mainCategory)
                          }
                          className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border px-4 text-base font-semibold transition-all duration-200 focus:outline-none focus:ring-4 ${
                            isSelected
                              ? "border-primary-800 bg-primary-800 text-white shadow-sm focus:ring-primary-100"
                              : "border-gray-200 bg-white text-gray-700 hover:border-secondary-300 hover:bg-secondary-50 hover:text-secondary-700 focus:ring-secondary-100"
                          }`}
                        >
                          {isSelected && (
                            <Check size={18} strokeWidth={2.5} />
                          )}
                          {subcat.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* =================================================
                  CUISINE
              ================================================== */}
              <div className="md:col-span-2">
                <OptionFieldLabel
                  label="Cuisine (ម្ហូបតាមប្រទេស)"
                  required
                  description="ជ្រើស Cuisine មួយដែលតំណាងឱ្យម្ហូបនេះ។"
                />

                <OptionPills
                  options={activeCuisines.map((cuisine) => ({
                    value: cuisine.uuid,
                    label: cuisine.name,
                  }))}
                  selectedValues={
                    values.cuisineUuid ? [values.cuisineUuid] : []
                  }
                  onToggle={(value) =>
                    setValues((current) => ({
                      ...current,
                      cuisineUuid: current.cuisineUuid === value ? "" : value,
                    }))
                  }
                  emptyText="មិនមាន Cuisine សម្រាប់ជ្រើសរើស។"
                />
              </div>

              <Field
                label="Spice level"
                type="number"
                value={values.defaultSpiceLevel}
                placeholder="0"
                onChange={(value) =>
                  setValues((current) => ({
                    ...current,
                    defaultSpiceLevel: value,
                  }))
                }
              />

              <StatusToggle
                checked={values.isActive}
                onChange={(checked) =>
                  setValues((current) => ({
                    ...current,
                    isActive: checked,
                  }))
                }
              />

              <label className="md:col-span-2">
                <Label>Description</Label>
                <textarea
                  rows={4}
                  value={values.description}
                  placeholder="សរសេរការពិពណ៌នាអំពីម្ហូប..."
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  className={`${inputClass} h-auto resize-none py-3.5 leading-8`}
                />
              </label>
            </div>
          </FormSection>

          {/* =================================================
              NUTRITION
          ================================================== */}
          <FormSection
            title="Nutrition"
            description="កំណត់តម្លៃអាហារូបត្ថម្ភសម្រាប់ម្ហូបនេះ។"
          >
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
                  placeholder="0"
                  onChange={(value) =>
                    setValues((current) => ({
                      ...current,
                      [key]: value,
                    }))
                  }
                />
              ))}
            </div>
          </FormSection>

          {/* =================================================
              DIETARY TYPES
          ================================================== */}
          <PreferenceSection
            title="របបអាហារ"
            description="ជ្រើសរបបអាហារដែលត្រូវគ្នា។ អ្នកអាចជ្រើសច្រើន។"
            selectedCount={dietaryTypeRows.length}
          >
            <OptionPills
              options={activeDietaryTypes.map((dietaryType) => ({
                value: dietaryType.code,
                label: `${dietaryType.name} `,
              }))}
              selectedValues={selectedDietaryCodes}
              onToggle={toggleDietaryType}
              emptyText="មិនមានជម្រើសរបបអាហារ។"
            />
          </PreferenceSection>

          {/* =================================================
              MEAL TYPES
          ================================================== */}
          <PreferenceSection
            title="ពេលទទួលទាន"
            description="ជ្រើសពេលទទួលទានដែលសមស្រប ហើយកំណត់ពិន្ទុសាកសម។"
            selectedCount={mealTypeRows.length}
          >
            <OptionPills
              options={activeMealTypes.map((mealType) => ({
                value: mealType.uuid,
                label: `${mealType.name} `,
              }))}
              selectedValues={selectedMealTypeUuids}
              onToggle={toggleMealType}
              emptyText="មិនមានជម្រើសពេលទទួលទាន។"
            />

            {mealTypeRows.length > 0 && (
              <div className="mt-5 space-y-4">
                {mealTypeRows.map((row) => {
                  const option = mealTypes.find(
                    (mealType) => mealType.uuid === row.mealTypeUuid,
                  );

                  if (!option) return null;

                  return (
                    <SelectedOptionCard
                      key={row.mealTypeUuid}
                      title={option.name}
                      onRemove={() => toggleMealType(row.mealTypeUuid)}
                    >
                      <ScoreField
                        label="ពិន្ទុសាកសម"
                        value={row.suitabilityScore ?? 1}
                        onChange={(value) =>
                          setMealTypeRows((current) =>
                            current.map((currentRow) =>
                              currentRow.mealTypeUuid === row.mealTypeUuid
                                ? {
                                    ...currentRow,
                                    suitabilityScore: value,
                                  }
                                : currentRow,
                            ),
                          )
                        }
                      />
                    </SelectedOptionCard>
                  );
                })}
              </div>
            )}
          </PreferenceSection>

          {/* =================================================
              AGE RULES
          ================================================== */}
          <PreferenceSection
            title="ក្រុមអាយុ"
            description="ជ្រើសក្រុមអាយុ ហើយកំណត់ថា Allowed, Warning ឬ Restricted។"
            selectedCount={ageRuleRows.length}
          >
            <OptionPills
              options={activeAgeGroups.map((ageGroup) => ({
                value: ageGroup.uuid,
                label: `${ageGroup.name} `,
              }))}
              selectedValues={selectedAgeGroupUuids}
              onToggle={toggleAgeGroup}
              emptyText="មិនមានជម្រើសក្រុមអាយុ។"
            />

            {ageRuleRows.length > 0 && (
              <div className="mt-5 space-y-4">
                {ageRuleRows.map((row) => {
                  const option = ageGroups.find(
                    (ageGroup) => ageGroup.uuid === row.ageGroupUuid,
                  );

                  if (!option) return null;

                  return (
                    <SelectedOptionCard
                      key={row.ageGroupUuid}
                      title={option.name}
                      onRemove={() => toggleAgeGroup(row.ageGroupUuid)}
                    >
                      <div className="grid gap-5 lg:grid-cols-[1fr_1.4fr]">
                        <div>
                          <Label>លទ្ធផល Rule</Label>

                          <div className="flex flex-wrap gap-3">
                            {["ALLOWED", "WARNING", "RESTRICTED"].map(
                              (ruleResult) => {
                                const selected =
                                  (row.ruleResult || "ALLOWED") === ruleResult;

                                return (
                                  <button
                                    key={ruleResult}
                                    type="button"
                                    aria-pressed={selected}
                                    onClick={() =>
                                      setAgeRuleRows((current) =>
                                        current.map((currentRow) =>
                                          currentRow.ageGroupUuid ===
                                          row.ageGroupUuid
                                            ? {
                                                ...currentRow,
                                                ruleResult,
                                              }
                                            : currentRow,
                                        ),
                                      )
                                    }
                                    className={`inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full border px-5 text-lg font-semibold transition ${
                                      selected
                                        ? "border-primary-800 bg-primary-800 text-white shadow-sm"
                                        : "border-gray-200 bg-white text-gray-700 hover:border-secondary-300 hover:bg-secondary-50 hover:text-secondary-700"
                                    }`}
                                  >
                                    {selected && <Check size={20} />}
                                    {ruleResult}
                                  </button>
                                );
                              },
                            )}
                          </div>
                        </div>

                        <ReasonField
                          label="ហេតុផល"
                          value={row.reasonText ?? ""}
                          placeholder="ឧ. Suitable as a normal serving."
                          onChange={(value) =>
                            setAgeRuleRows((current) =>
                              current.map((currentRow) =>
                                currentRow.ageGroupUuid === row.ageGroupUuid
                                  ? {
                                      ...currentRow,
                                      reasonText: value,
                                    }
                                  : currentRow,
                              ),
                            )
                          }
                        />
                      </div>
                    </SelectedOptionCard>
                  );
                })}
              </div>
            )}
          </PreferenceSection>

          {/* =================================================
              SEASONS
          ================================================== */}
          <PreferenceSection
            title="រដូវកាល"
            description="ជ្រើសរដូវកាលដែលសាកសមសម្រាប់ម្ហូបនេះ។"
            selectedCount={seasonRows.length}
          >
            <OptionPills
              options={activeSeasons.map((season) => ({
                value: season.uuid,
                label: season.name,
              }))}
              selectedValues={selectedSeasonUuids}
              onToggle={toggleSeason}
              emptyText="មិនមានជម្រើសរដូវកាល។"
            />

            {seasonRows.length > 0 && (
              <div className="mt-5 space-y-4">
                {seasonRows.map((row) => {
                  const option = seasons.find(
                    (season) => season.uuid === row.seasonUuid,
                  );

                  if (!option) return null;

                  return (
                    <SelectedOptionCard
                      key={row.seasonUuid}
                      title={option.name}
                      onRemove={() => toggleSeason(row.seasonUuid)}
                    >
                      <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
                        <ScoreField
                          label="ពិន្ទុសាកសម"
                          value={row.suitabilityScore ?? 1}
                          onChange={(value) =>
                            setSeasonRows((current) =>
                              current.map((currentRow) =>
                                currentRow.seasonUuid === row.seasonUuid
                                  ? {
                                      ...currentRow,
                                      suitabilityScore: value,
                                    }
                                  : currentRow,
                              ),
                            )
                          }
                        />

                        <ReasonField
                          label="ហេតុផល"
                          value={row.reasonText ?? ""}
                          onChange={(value) =>
                            setSeasonRows((current) =>
                              current.map((currentRow) =>
                                currentRow.seasonUuid === row.seasonUuid
                                  ? {
                                      ...currentRow,
                                      reasonText: value,
                                    }
                                  : currentRow,
                              ),
                            )
                          }
                        />
                      </div>
                    </SelectedOptionCard>
                  );
                })}
              </div>
            )}
          </PreferenceSection>

          {/* =================================================
              EVENTS
          ================================================== */}
          <PreferenceSection
            title="ព្រឹត្តិការណ៍ / បុណ្យទាន"
            description="ជ្រើសពិធីបុណ្យ ឬព្រឹត្តិការណ៍ដែលពាក់ព័ន្ធនឹងម្ហូបនេះ។"
            selectedCount={eventRows.length}
          >
            <OptionPills
              options={activeEvents.map((eventOption) => ({
                value: eventOption.uuid,
                label: eventOption.name,
              }))}
              selectedValues={selectedEventUuids}
              onToggle={toggleEvent}
              emptyText="មិនមានជម្រើសព្រឹត្តិការណ៍។"
            />

            {eventRows.length > 0 && (
              <div className="mt-5 space-y-4">
                {eventRows.map((row) => {
                  const option = events.find(
                    (eventOption) => eventOption.uuid === row.eventUuid,
                  );

                  if (!option) return null;

                  return (
                    <SelectedOptionCard
                      key={row.eventUuid}
                      title={option.name}
                      onRemove={() => toggleEvent(row.eventUuid)}
                    >
                      <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
                        <ScoreField
                          label="Relevance score"
                          value={row.relevanceScore ?? 0.9}
                          onChange={(value) =>
                            setEventRows((current) =>
                              current.map((currentRow) =>
                                currentRow.eventUuid === row.eventUuid
                                  ? {
                                      ...currentRow,
                                      relevanceScore: value,
                                    }
                                  : currentRow,
                              ),
                            )
                          }
                        />

                        <ReasonField
                          label="ហេតុផល"
                          value={row.reasonText ?? ""}
                          onChange={(value) =>
                            setEventRows((current) =>
                              current.map((currentRow) =>
                                currentRow.eventUuid === row.eventUuid
                                  ? {
                                      ...currentRow,
                                      reasonText: value,
                                    }
                                  : currentRow,
                              ),
                            )
                          }
                        />
                      </div>
                    </SelectedOptionCard>
                  );
                })}
              </div>
            )}
          </PreferenceSection>

          {/* =================================================
              WEATHER
          ================================================== */}
          <PreferenceSection
            title="ស្ថានភាពអាកាសធាតុ"
            description="ជ្រើសអាកាសធាតុដែលសាកសមសម្រាប់ម្ហូបនេះ។"
            selectedCount={weatherRows.length}
          >
            <OptionPills
              options={activeWeatherConditions.map((weather) => ({
                value: weather.uuid,
                label: weather.name,
              }))}
              selectedValues={selectedWeatherUuids}
              onToggle={toggleWeather}
              emptyText="មិនមានជម្រើសអាកាសធាតុ។"
            />

            {weatherRows.length > 0 && (
              <div className="mt-5 space-y-4">
                {weatherRows.map((row) => {
                  const option = weatherConditions.find(
                    (weather) => weather.uuid === row.weatherConditionUuid,
                  );

                  if (!option) return null;

                  return (
                    <SelectedOptionCard
                      key={row.weatherConditionUuid}
                      title={option.name}
                      onRemove={() => toggleWeather(row.weatherConditionUuid)}
                    >
                      <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
                        <ScoreField
                          label="ពិន្ទុសាកសម"
                          value={row.suitabilityScore ?? 0.8}
                          onChange={(value) =>
                            setWeatherRows((current) =>
                              current.map((currentRow) =>
                                currentRow.weatherConditionUuid ===
                                row.weatherConditionUuid
                                  ? {
                                      ...currentRow,
                                      suitabilityScore: value,
                                    }
                                  : currentRow,
                              ),
                            )
                          }
                        />

                        <ReasonField
                          label="ហេតុផល"
                          value={row.reasonText ?? ""}
                          onChange={(value) =>
                            setWeatherRows((current) =>
                              current.map((currentRow) =>
                                currentRow.weatherConditionUuid ===
                                row.weatherConditionUuid
                                  ? {
                                      ...currentRow,
                                      reasonText: value,
                                    }
                                  : currentRow,
                              ),
                            )
                          }
                        />
                      </div>
                    </SelectedOptionCard>
                  );
                })}
              </div>
            )}
          </PreferenceSection>

          {/* =================================================
              COOKING METHODS (វិធីចម្អិន)
          ================================================== */}
          <PreferenceSection
            title="វិធីចម្អិន"
            description="ជ្រើសរើសវិធីចម្អិនសម្រាប់មុខម្ហូប/ភេសជ្ជៈនេះ (អាចជ្រើសលើសពីមួយ)។"
            selectedCount={selectedCookingMethods.length}
          >
            <OptionPills
              options={STATIC_COOKING_METHODS.map((method) => ({
                value: method.code,
                label: method.label,
              }))}
              selectedValues={selectedCookingMethods}
              onToggle={(value) =>
                setSelectedCookingMethods((prev) =>
                  prev.includes(value)
                    ? prev.filter((v) => v !== value)
                    : [...prev, value],
                )
              }
              emptyText="មិនមានជម្រើសវិធីចម្អិន។"
            />
          </PreferenceSection>

          {/* =================================================
              TASTES (រសជាតិ)
          ================================================== */}
          <PreferenceSection
            title="រសជាតិ"
            description="ជ្រើសរើសរសជាតិនៃមុខម្ហូប/ភេសជ្ជៈនេះ។"
            selectedCount={selectedTastes.length}
          >
            <OptionPills
              options={STATIC_TASTES.map((taste) => ({
                value: taste.code,
                label: taste.label,
              }))}
              selectedValues={selectedTastes}
              onToggle={(value) =>
                setSelectedTastes((prev) =>
                  prev.includes(value)
                    ? prev.filter((v) => v !== value)
                    : [...prev, value],
                )
              }
              emptyText="មិនមានជម្រើសរសជាតិ។"
            />
          </PreferenceSection>

          {/* =================================================
              TEXTURES (វាយនភាព)
          ================================================== */}
          <PreferenceSection
            title="វាយនភាព"
            description="ជ្រើសរើសលក្ខណៈវាយនភាពនៃមុខម្ហូប/ភេសជ្ជៈ។"
            selectedCount={selectedTextures.length}
          >
            <OptionPills
              options={STATIC_TEXTURES.map((texture) => ({
                value: texture.code,
                label: texture.label,
              }))}
              selectedValues={selectedTextures}
              onToggle={(value) =>
                setSelectedTextures((prev) =>
                  prev.includes(value)
                    ? prev.filter((v) => v !== value)
                    : [...prev, value],
                )
              }
              emptyText="មិនមានជម្រើសវាយនភាព។"
            />
          </PreferenceSection>

          {/* =================================================
              HEALTH GOALS (គោលដៅសុខភាព)
          ================================================== */}
          <PreferenceSection
            title="គោលដៅសុខភាព"
            description="ជ្រើសរើសគោលដៅសុខភាពដែលសាកសមសម្រាប់ម្ហូប/ភេសជ្ជៈនេះ។"
            selectedCount={selectedHealthGoals.length}
          >
            <OptionPills
              options={STATIC_HEALTH_GOALS.map((goal) => ({
                value: goal.code,
                label: goal.label,
              }))}
              selectedValues={selectedHealthGoals}
              onToggle={(value) =>
                setSelectedHealthGoals((prev) =>
                  prev.includes(value)
                    ? prev.filter((v) => v !== value)
                    : [...prev, value],
                )
              }
              emptyText="មិនមានជម្រើសគោលដៅសុខភាព។"
            />
          </PreferenceSection>

          {/* =================================================
              FOOD STYLES (លក្ខណៈម្ហូប)
          ================================================== */}
          <PreferenceSection
            title="លក្ខណៈម្ហូប"
            description="ជ្រើសរើសលក្ខណៈ ឬទម្រង់ម្ហូប/ភេសជ្ជៈ។"
            selectedCount={selectedFoodStyles.length}
          >
            <OptionPills
              options={STATIC_FOOD_STYLES.map((style) => ({
                value: style.code,
                label: style.label,
              }))}
              selectedValues={selectedFoodStyles}
              onToggle={(value) =>
                setSelectedFoodStyles((prev) =>
                  prev.includes(value)
                    ? prev.filter((v) => v !== value)
                    : [...prev, value],
                )
              }
              emptyText="មិនមានជម្រើសលក្ខណៈម្ហូប។"
            />
          </PreferenceSection>

          {/* =================================================
              DISTANCES (ចម្ងាយ)
          ================================================== */}
          <PreferenceSection
            title="ចម្ងាយ"
            description="ជ្រើសរើសកម្រិតចម្ងាយសមស្រប។"
            selectedCount={selectedDistance ? 1 : 0}
          >
            <OptionPills
              options={STATIC_DISTANCES.map((dist) => ({
                value: dist.code,
                label: dist.label,
              }))}
              selectedValues={selectedDistance ? [selectedDistance] : []}
              onToggle={(value) =>
                setSelectedDistance((prev) => (prev === value ? "" : value))
              }
              emptyText="មិនមានជម្រើសចម្ងាយ។"
            />
          </PreferenceSection>

          {/* =================================================
              IMAGES
          ================================================== */}
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

          {/* =================================================
              ERROR
          ================================================== */}
          {error && (
            <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-lg leading-7 text-red-600">
              {error}
            </div>
          )}

          {/* =================================================
              STICKY ACTIONS
          ================================================== */}
          <div className="sticky bottom-0 z-40 -mx-6 flex flex-col-reverse gap-3 border-t border-gray-100 bg-white/95 px-6 py-4 backdrop-blur-md sm:-mx-8 sm:flex-row sm:items-center sm:justify-end sm:px-8">
            <button
              type="button"
              disabled={saving}
              onClick={onClose}
              className="inline-flex min-h-[52px] w-full items-center justify-center rounded-full border border-gray-200 bg-white px-7 text-lg font-medium text-gray-600 transition hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800 focus:outline-none focus:ring-4 focus:ring-gray-100 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              បោះបង់
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={() => void submit()}
              className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full bg-primary-800 px-7 text-lg font-semibold text-white transition hover:bg-primary-900 focus:outline-none focus:ring-4 focus:ring-primary-200 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {saving ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Save size={20} />
              )}

              {saving ? "កំពុងរក្សាទុក..." : "រក្សាទុក"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   REUSABLE UI
========================================================= */

type ChoiceOption = {
  value: string;
  label: string;
};

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6">
      <div className="mb-6">
        <p className="text-3xl font-semibold text-primary-800">{title}</p>
        <p className="mt-2 text-lg leading-7 text-gray-500">{description}</p>
      </div>

      {children}
    </section>
  );
}

function PreferenceSection({
  title,
  description,
  selectedCount,
  children,
}: {
  title: string;
  description: string;
  selectedCount: number;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-3xl font-semibold text-primary-800">{title}</p>
          <p className="mt-2 text-lg leading-7 text-gray-500">{description}</p>
        </div>

        <div className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-full bg-secondary-50 px-4 text-lg font-semibold text-secondary-700">
          បានជ្រើស {selectedCount}
        </div>
      </div>

      {children}
    </section>
  );
}

function OptionFieldLabel({
  label,
  description,
  required = false,
}: {
  label: string;
  description?: string;
  required?: boolean;
}) {
  return (
    <div className="mb-3">
      <p className="text-lg font-medium text-primary-800">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </p>

      {description && (
        <p className="mt-1 text-lg leading-7 text-gray-500">{description}</p>
      )}
    </div>
  );
}

function OptionPills({
  options,
  selectedValues,
  onToggle,
  emptyText,
}: {
  options: ChoiceOption[];
  selectedValues: string[];
  onToggle: (value: string) => void;
  emptyText: string;
}) {
  if (options.length === 0) {
    return (
      <p className="rounded-2xl bg-gray-50 px-4 py-4 text-lg text-gray-500">
        {emptyText}
      </p>
    );
  }

  return (
    <div className="max-h-64 overflow-y-auto rounded-2xl border border-gray-100 bg-gray-50/60 p-4 [scrollbar-width:thin]">
      <div className="flex flex-wrap gap-3">
        {options.map((option) => {
          const selected = selectedValues.includes(option.value);

          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={selected}
              onClick={() => onToggle(option.value)}
              className={`inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full border px-5 text-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-4 ${
                selected
                  ? "border-primary-800 bg-primary-800 text-white shadow-sm focus:ring-primary-100"
                  : "border-gray-200 bg-white text-gray-700 hover:border-secondary-300 hover:bg-secondary-50 hover:text-secondary-700 focus:ring-secondary-100"
              }`}
            >
              {selected && <Check size={20} strokeWidth={2.5} />}
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SelectedOptionCard({
  title,
  onRemove,
  children,
}: {
  title: string;
  onRemove: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-primary-100 bg-primary-50/30 p-5">
      <div className="mb-5 flex items-start justify-between gap-4 border-b border-primary-100 pb-4">
        <div className="min-w-0">
          <p className="text-xl font-semibold text-primary-800">{title}</p>
        </div>

        <button
          type="button"
          onClick={onRemove}
          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full px-4 text-lg font-semibold text-red-500 transition hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-4 focus:ring-red-100"
        >
          <Trash2 size={20} />
          លុប
        </button>
      </div>

      {children}
    </div>
  );
}

function ScoreField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <Label>{label} (0–1)</Label>

      <input
        type="number"
        min="0"
        max="1"
        step="0.05"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className={inputClass}
      />
    </label>
  );
}

function ReasonField({
  label,
  value,
  onChange,
  placeholder = "ហេតុផល (Reason)...",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <Label>{label}</Label>

      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={inputClass}
      />
    </label>
  );
}

function StatusToggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex min-h-[52px] items-center justify-between gap-5 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
      <div className="min-w-0">
        <p className="text-lg font-medium text-primary-800">ស្ថានភាព</p>
        <p className="mt-1 text-lg leading-7 text-gray-500">
          បើក ដើម្បីឱ្យម្ហូបនេះអាចប្រើបានក្នុងប្រព័ន្ធ។
        </p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-8 w-14 shrink-0 rounded-full transition focus:outline-none focus:ring-4 focus:ring-primary-100 ${
          checked ? "bg-primary-700" : "bg-gray-300"
        }`}
      >
        <span
          className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-sm transition-all ${
            checked ? "left-7" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}

const inputClass =
  "h-[52px] w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-lg text-gray-800 outline-none transition placeholder:text-gray-400 hover:border-gray-300 focus:border-primary-600 focus:bg-white focus:ring-4 focus:ring-primary-100";

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-2 block text-lg font-medium text-primary-800">
      {children}
    </span>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-lg font-medium text-primary-800">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>

      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={inputClass}
      />
    </label>
  );
}
