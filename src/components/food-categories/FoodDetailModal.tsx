"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  Calendar,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Code2,
  Copy,
  Flame,
  Globe2,
  Heart,
  ImageIcon,
  Info,
  Layers,
  Leaf,
  Loader2,
  Pencil,
  Sparkles,
  Sun,
  Tag,
  Users,
  Utensils,
  Wheat,
  X,
  Zap,
} from "lucide-react";

import { useGetManagedFoodQuery } from "@/src/app/store/menuManagementApi";
import { resolveFoodHubCatalogImageUrl } from "@/src/lib/resolveFoodHubImageUrl";
import { formatAdminDate } from "@/src/types/safetyResource";
import type { FoodRecord } from "@/src/types/menu-management";

interface FoodDetailModalProps {
  food: FoodRecord | null;
  onClose: () => void;
  onEdit?: (food: FoodRecord) => void;
}

function spiceLevelLabel(level: number | null | undefined): {
  label: string;
  count: number;
  color: string;
} {
  const l = level ?? 0;
  if (l <= 0) return { label: "មិនហឹរ (0)", count: 0, color: "text-gray-500 bg-gray-100" };
  if (l === 1) return { label: "ហឹរតិច (1)", count: 1, color: "text-amber-700 bg-amber-50 ring-amber-200" };
  if (l === 2) return { label: "ហឹរមធ្យម (2)", count: 2, color: "text-orange-700 bg-orange-50 ring-orange-200" };
  return { label: `ហឹរខ្លាំង (${l})`, count: Math.min(l, 5), color: "text-red-700 bg-red-50 ring-red-200" };
}

export default function FoodDetailModal({
  food,
  onClose,
  onEdit,
}: FoodDetailModalProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showRawJson, setShowRawJson] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const uuid = food?.uuid ?? "";

  const { data: fullFood, isLoading } = useGetManagedFoodQuery(uuid, {
    skip: !uuid,
  });

  const displayItem = fullFood || food;

  useEffect(() => {
    setSelectedImageIndex(0);
    setShowRawJson(false);
  }, [food]);

  if (!food) return null;

  // Extract all available images
  const rawImages: string[] = [
    ...(displayItem?.images || []),
    ...(displayItem?.gallery || []),
    ...(displayItem?.primaryMediaUrls || []),
    ...(displayItem?.primaryMediaUuids || []),
    displayItem?.thumbnail,
    displayItem?.imageUrl,
    (displayItem as any)?.primaryMediaUuid,
  ]
    .filter(Boolean)
    .map((img) => resolveFoodHubCatalogImageUrl(img) || img);

  const uniqueImages = Array.from(new Set(rawImages));
  const activeImage = uniqueImages[selectedImageIndex] || uniqueImages[0] || null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const isActive = displayItem?.isActive !== false;
  const spice = spiceLevelLabel(displayItem?.defaultSpiceLevel);
  const nutrition = displayItem?.nutritionData;

  // Metadata relations arrays
  const dietaryTypes = Array.isArray(displayItem?.dietaryTypes)
    ? displayItem.dietaryTypes
    : [];
  const mealTypes = Array.isArray(displayItem?.mealTypes)
    ? displayItem.mealTypes
    : [];
  const ageRules = Array.isArray(displayItem?.ageRules)
    ? displayItem.ageRules
    : [];
  const seasons = Array.isArray(displayItem?.seasons)
    ? displayItem.seasons
    : [];
  const events = Array.isArray(displayItem?.events)
    ? displayItem.events
    : [];
  const weather = Array.isArray(displayItem?.suitableWeather)
    ? displayItem.suitableWeather
    : [];

  return (
    <div
      className="fixed inset-0 z-[160] flex items-center justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-[3px] animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative my-8 max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-[32px] border border-gray-100 bg-white p-6 shadow-2xl sm:p-8 [scrollbar-width:thin]">
        {/* =================================================
            HEADER
        ================================================== */}
        <div className="flex items-start justify-between border-b border-gray-100 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-primary-50 text-primary-800">
              <Utensils size={26} />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-2xl font-black text-gray-900 sm:text-3xl">
                  {displayItem?.localName || displayItem?.canonicalName || displayItem?.name || "ព័ត៌មានលម្អិតមុខម្ហូប"}
                </h2>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold ring-1 ring-inset ${
                    isActive
                      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                      : "bg-gray-100 text-gray-500 ring-gray-200"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      isActive ? "bg-emerald-600" : "bg-gray-400"
                    }`}
                  />
                  {isActive ? "សកម្ម" : "អសកម្ម"}
                </span>
              </div>

              {displayItem?.canonicalName && (
                <p className="mt-1 flex flex-wrap items-center gap-2 text-base font-medium text-gray-600">
                  <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-bold text-gray-600">
                    ឈ្មោះជាភាសាអង់គ្លេស:
                  </span>
                  <span className="font-semibold text-gray-800">
                    {displayItem.canonicalName}
                  </span>
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="បិទ"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
          >
            <X size={22} />
          </button>
        </div>

        {/* Loading banner */}
        {isLoading && (
          <div className="my-4 flex items-center justify-center gap-2 rounded-2xl bg-primary-50/50 py-3 text-sm font-medium text-primary-800">
            <Loader2 size={18} className="animate-spin" />
            <span>កំពុងទាញយកព័ត៌មានលម្អិតពេញលេញ...</span>
          </div>
        )}

        <div className="mt-6 space-y-6">
          {/* =================================================
              HERO CARD (IMAGE & KEY INFO)
          ================================================== */}
          <div className="flex flex-col gap-6 rounded-3xl border border-gray-100 bg-gray-50/50 p-5 sm:flex-row">
            {/* Image Preview & Gallery */}
            <div className="flex flex-col gap-3 sm:w-64 shrink-0">
              <div className="relative h-56 w-full overflow-hidden rounded-2xl border border-gray-200/80 bg-white sm:h-52">
                {activeImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={activeImage}
                    alt={displayItem?.localName || "Food Image"}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = "none";
                      const fb = e.currentTarget.parentElement?.querySelector(".img-fallback");
                      if (fb) fb.classList.remove("hidden");
                    }}
                  />
                ) : null}
                <div
                  className={`img-fallback flex h-full w-full flex-col items-center justify-center gap-2 text-gray-300 ${
                    activeImage ? "hidden" : ""
                  }`}
                >
                  <ImageIcon size={40} />
                  <span className="text-xs font-semibold text-gray-400">គ្មានរូបភាព</span>
                </div>
              </div>

              {/* Thumbnails if > 1 */}
              {uniqueImages.length > 1 && (
                <div className="flex flex-wrap gap-2">
                  {uniqueImages.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`h-12 w-12 overflow-hidden rounded-xl border-2 transition ${
                        selectedImageIndex === idx
                          ? "border-primary-600 ring-2 ring-primary-100"
                          : "border-gray-200 opacity-60 hover:opacity-100"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img}
                        alt={`Thumbnail ${idx + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Core Classification Badges & Details */}
            <div className="flex flex-1 flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Category Badge */}
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700">
                    <Layers size={16} />
                    <span>{displayItem?.category?.name || displayItem?.categoryName || "ប្រភេទមិនទាន់កំណត់"}</span>
                  </span>

                  {/* Cuisine Badge */}
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-purple-50 px-3 py-1.5 text-sm font-semibold text-purple-700">
                    <Globe2 size={16} />
                    <span>{displayItem?.cuisine?.name || displayItem?.cuisineName || "ម្ហូបទូទៅ"}</span>
                  </span>

                  {/* Spice Level Badge */}
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-semibold ring-1 ring-inset ${spice.color}`}
                  >
                    <Flame size={16} />
                    <span>កម្រិតហឹរ: {spice.label}</span>
                  </span>
                </div>

                {/* Description */}
                {displayItem?.description ? (
                  <div className="rounded-2xl border border-gray-200/80 bg-white p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                      ការពិពណ៌នា
                    </p>
                    <p className="mt-1.5 text-base leading-relaxed text-gray-700">
                      {displayItem.description}
                    </p>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-gray-200 p-4 text-center text-sm italic text-gray-400">
                    មិនមានការពិពណ៌នាបន្ថែមសម្រាប់មុខម្ហូបនេះទេ។
                  </div>
                )}
              </div>

              {/* Canonical Info footer */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <span className="font-mono text-xs text-gray-400">
                  Code: <strong className="text-gray-700">{displayItem?.category?.code || displayItem?.canonicalName}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* =================================================
              NUTRITION BREAKDOWN
          ================================================== */}
          <div className="rounded-3xl border border-gray-100 p-5">
            <div className="flex items-center gap-2.5 text-lg font-bold text-gray-900">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                <Flame size={18} />
              </div>
              <h3>ព័ត៌មានអាហារូបត្ថម្ភ (Nutrition Facts)</h3>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
              {/* Calories */}
              <div className="flex flex-col items-center justify-center rounded-2xl border border-orange-100 bg-orange-50/40 p-4 text-center">
                <span className="text-xs font-bold text-orange-800">កាឡូរី (Calories)</span>
                <p className="mt-1.5 text-2xl font-black text-orange-950">
                  {nutrition?.calories != null ? nutrition.calories : 0}
                </p>
                <span className="text-xs font-semibold text-orange-600">kcal</span>
              </div>

              {/* Protein */}
              <div className="flex flex-col items-center justify-center rounded-2xl border border-blue-100 bg-blue-50/40 p-4 text-center">
                <span className="text-xs font-bold text-blue-800">ប្រូតេអ៊ីន (Protein)</span>
                <p className="mt-1.5 text-2xl font-black text-blue-950">
                  {nutrition?.proteinGrams != null
                    ? nutrition.proteinGrams
                    : (nutrition as any)?.protein != null
                      ? (nutrition as any).protein
                      : 0}
                </p>
                <span className="text-xs font-semibold text-blue-600">grams (g)</span>
              </div>

              {/* Carbohydrates */}
              <div className="flex flex-col items-center justify-center rounded-2xl border border-amber-100 bg-amber-50/40 p-4 text-center">
                <span className="text-xs font-bold text-amber-800">កាបូអ៊ីដ្រាត (Carbs)</span>
                <p className="mt-1.5 text-2xl font-black text-amber-950">
                  {nutrition?.carbohydrateGrams != null
                    ? nutrition.carbohydrateGrams
                    : (nutrition as any)?.carbsGrams != null
                      ? (nutrition as any).carbsGrams
                      : (nutrition as any)?.carbohydrate != null
                        ? (nutrition as any).carbohydrate
                        : 0}
                </p>
                <span className="text-xs font-semibold text-amber-600">grams (g)</span>
              </div>

              {/* Fat */}
              <div className="flex flex-col items-center justify-center rounded-2xl border border-red-100 bg-red-50/40 p-4 text-center">
                <span className="text-xs font-bold text-red-800">ជាតិខ្លាញ់ (Fat)</span>
                <p className="mt-1.5 text-2xl font-black text-red-950">
                  {nutrition?.fatGrams != null
                    ? nutrition.fatGrams
                    : (nutrition as any)?.fat != null
                      ? (nutrition as any).fat
                      : 0}
                </p>
                <span className="text-xs font-semibold text-red-600">grams (g)</span>
              </div>

              {/* Fiber */}
              <div className="flex flex-col items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4 text-center col-span-2 sm:col-span-1">
                <span className="text-xs font-bold text-emerald-800">ជាតិសរសៃ (Fiber)</span>
                <p className="mt-1.5 text-2xl font-black text-emerald-950">
                  {nutrition?.fiberGrams != null
                    ? nutrition.fiberGrams
                    : (nutrition as any)?.fiber != null
                      ? (nutrition as any).fiber
                      : 0}
                </p>
                <span className="text-xs font-semibold text-emerald-600">grams (g)</span>
              </div>
            </div>
          </div>

          {/* =================================================
              PREFERENCES & RELATIONS (DIET, MEAL, AGE, WEATHER, etc.)
          ================================================== */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Dietary Types */}
            <div className="rounded-2xl border border-gray-100 bg-white p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-gray-800">
                <Heart size={16} className="text-emerald-600" />
                <span>របបអាហារ (Dietary Types)</span>
                <span className="ml-auto rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700">
                  {dietaryTypes.length}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {dietaryTypes.length > 0 ? (
                  dietaryTypes.map((dt: any, idx: number) => (
                    <span
                      key={idx}
                      className="inline-flex items-center rounded-xl bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800"
                    >
                      {dt.name || dt.code || dt.dietaryTypeCode || `Type ${idx + 1}`}
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 italic">មិនមានកំណត់របបអាហារ</p>
                )}
              </div>
            </div>

            {/* Meal Types */}
            <div className="rounded-2xl border border-gray-100 bg-white p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-gray-800">
                <Clock size={16} className="text-blue-600" />
                <span>ពេលទទួលទាន (Meal Types)</span>
                <span className="ml-auto rounded-full bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-700">
                  {mealTypes.length}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {mealTypes.length > 0 ? (
                  mealTypes.map((mt: any, idx: number) => (
                    <span
                      key={idx}
                      className="inline-flex items-center rounded-xl bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-800"
                    >
                      {mt.name || mt.code || (mt.mealType && mt.mealType.name) || `Meal ${idx + 1}`}
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 italic">មិនមានកំណត់ពេលទទួលទាន</p>
                )}
              </div>
            </div>

            {/* Age Rules */}
            <div className="rounded-2xl border border-gray-100 bg-white p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-gray-800">
                <Users size={16} className="text-indigo-600" />
                <span>ក្រុមអាយុ (Age Rules)</span>
                <span className="ml-auto rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-bold text-indigo-700">
                  {ageRules.length}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {ageRules.length > 0 ? (
                  ageRules.map((ar: any, idx: number) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 rounded-xl bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-800"
                    >
                      <span>{ar.name || ar.code || (ar.ageGroup && ar.ageGroup.name) || `Group ${idx + 1}`}</span>
                      {ar.ruleResult && (
                        <span className="rounded bg-indigo-100 px-1 py-0.2 text-[10px] font-bold text-indigo-900">
                          {ar.ruleResult}
                        </span>
                      )}
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 italic">មិនមានកំណត់ក្រុមអាយុ</p>
                )}
              </div>
            </div>

            {/* Seasons */}
            <div className="rounded-2xl border border-gray-100 bg-white p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-gray-800">
                <Leaf size={16} className="text-teal-600" />
                <span>រដូវកាល (Seasons)</span>
                <span className="ml-auto rounded-full bg-teal-50 px-2 py-0.5 text-xs font-bold text-teal-700">
                  {seasons.length}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {seasons.length > 0 ? (
                  seasons.map((s: any, idx: number) => (
                    <span
                      key={idx}
                      className="inline-flex items-center rounded-xl bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-800"
                    >
                      {s.name || s.code || (s.season && s.season.name) || `Season ${idx + 1}`}
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 italic">មិនមានកំណត់រដូវកាល</p>
                )}
              </div>
            </div>

            {/* Events */}
            <div className="rounded-2xl border border-gray-100 bg-white p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-gray-800">
                <Sparkles size={16} className="text-pink-600" />
                <span>ព្រឹត្តិការណ៍ / បុណ្យទាន (Events)</span>
                <span className="ml-auto rounded-full bg-pink-50 px-2 py-0.5 text-xs font-bold text-pink-700">
                  {events.length}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {events.length > 0 ? (
                  events.map((e: any, idx: number) => (
                    <span
                      key={idx}
                      className="inline-flex items-center rounded-xl bg-pink-50 px-3 py-1 text-xs font-semibold text-pink-800"
                    >
                      {e.name || e.code || (e.event && e.event.name) || `Event ${idx + 1}`}
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 italic">មិនមានកំណត់ព្រឹត្តិការណ៍</p>
                )}
              </div>
            </div>

            {/* Weather */}
            <div className="rounded-2xl border border-gray-100 bg-white p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-gray-800">
                <Sun size={16} className="text-amber-600" />
                <span>ស្ថានភាពអាកាសធាតុ (Weather)</span>
                <span className="ml-auto rounded-full bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-700">
                  {weather.length}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {weather.length > 0 ? (
                  weather.map((w: any, idx: number) => (
                    <span
                      key={idx}
                      className="inline-flex items-center rounded-xl bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800"
                    >
                      {w.name || w.code || (w.weatherCondition && w.weatherCondition.name) || `Weather ${idx + 1}`}
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 italic">មិនមានកំណត់អាកាសធាតុ</p>
                )}
              </div>
            </div>
          </div>

          {/* =================================================
              SYSTEM INFO (UUID & DATES)
          ================================================== */}
          <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <p className="text-xs font-semibold text-gray-400">UUID</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="max-w-[200px] truncate font-mono text-xs font-bold text-gray-700">
                    {displayItem?.uuid}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(displayItem?.uuid || "", "uuid")}
                    title="ចម្លង UUID"
                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-gray-500 shadow-xs hover:bg-gray-100"
                  >
                    {copiedKey === "uuid" ? (
                      <Check size={14} className="text-emerald-600" />
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-400">កាលបរិច្ឆេទបង្កើត</p>
                <p className="mt-1 text-xs font-bold text-gray-700">
                  {displayItem?.createdAt ? formatAdminDate(displayItem.createdAt) : "—"}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-400">កែប្រែចុងក្រោយ</p>
                <p className="mt-1 text-xs font-bold text-gray-700">
                  {displayItem?.updatedAt ? formatAdminDate(displayItem.updatedAt) : "—"}
                </p>
              </div>
            </div>
          </div>

          {/* =================================================
              RAW JSON ACCORDION
          ================================================== */}
          <div className="rounded-2xl border border-gray-100">
            <button
              type="button"
              onClick={() => setShowRawJson(!showRawJson)}
              className="flex w-full items-center justify-between p-4 text-left text-sm font-bold text-gray-600 hover:text-gray-900 transition"
            >
              <div className="flex items-center gap-2">
                <Code2 size={16} />
                <span>Raw JSON Response</span>
              </div>
              {showRawJson ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>

            {showRawJson && (
              <div className="border-t border-gray-100 bg-gray-900 p-4 rounded-b-2xl">
                <div className="flex items-center justify-end pb-2">
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(
                        JSON.stringify(displayItem, null, 2),
                        "rawJson",
                      )
                    }
                    className="inline-flex items-center gap-1.5 rounded-lg bg-gray-800 px-3 py-1 text-xs font-medium text-gray-300 hover:bg-gray-700"
                  >
                    {copiedKey === "rawJson" ? (
                      <>
                        <Check size={14} className="text-emerald-400" />
                        <span className="text-emerald-400">បានចម្លង</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        <span>ចម្លង JSON</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="max-h-64 overflow-auto text-xs font-mono text-emerald-400 [scrollbar-width:thin]">
                  {JSON.stringify(displayItem, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* =================================================
            MODAL FOOTER
        ================================================== */}
        <div className="mt-8 flex flex-col-reverse items-center justify-between gap-3 border-t border-gray-100 pt-5 sm:flex-row">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-[48px] w-full items-center justify-center rounded-full border border-gray-200 bg-white px-6 text-base font-semibold text-gray-600 transition hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-100 sm:w-auto"
          >
            បិទ
          </button>

          {onEdit && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(displayItem || food);
              }}
              className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full bg-primary-800 px-7 text-base font-semibold text-white transition hover:bg-primary-900 focus:outline-none focus:ring-4 focus:ring-primary-200 sm:w-auto"
            >
              <Pencil size={18} />
              <span>កែប្រែមុខម្ហូប</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
