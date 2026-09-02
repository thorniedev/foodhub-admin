"use client";

import { useState } from "react";
import {
  Activity,
  Calendar,
  Clock,
  CloudSun,
  Flame,
  Globe2,
  Heart,
  Layers,
  Loader2,
  MapPin,
  Pencil,
  Sparkles,
  UsersRound,
  Utensils,
  X,
} from "lucide-react";

import {
  useGetManagedFoodQuery,
  useGetManagedFoodCategoriesQuery,
  useGetManagedCuisinesQuery,
} from "@/src/app/store/menuManagementApi";
import { extractKhmerOnlyName } from "@/src/lib/catalogCategoryHelper";
import { resolveFoodHubCatalogImageUrl } from "@/src/lib/resolveFoodHubImageUrl";
import { readFoodRelationsStorage } from "@/src/lib/filterCatalogStorage";

const SPICE_SHORT_LABELS: Record<number, string> = {
  0: "មិនហឹរ",
  1: "ហឹរតិច",
  2: "ហឹរមធ្យម",
  3: "ហឹរខ្លាំង",
  4: "ហឹរខ្លាំងណាស់",
  5: "ហឹរបំផុត",
};

export default function FoodDetailModal({
  uuid,
  onClose,
  onEdit,
}: {
  uuid: string | null;
  onClose: () => void;
  onEdit?: (item: any) => void;
  onEditMenuItem?: (item: any) => void;
}) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const { data: rawData, isLoading, isError } = useGetManagedFoodQuery(
    uuid ?? "",
    { skip: !uuid },
  );

  const categoriesQuery = useGetManagedFoodCategoriesQuery();
  const cuisinesQuery = useGetManagedCuisinesQuery();

  if (!uuid) return null;

  const stored = uuid ? readFoodRelationsStorage(uuid) : null;

  const srvNut = rawData
    ? rawData.nutritionData ?? (rawData as any).nutrition
    : null;
  const storedNut = stored?.nutritionData ?? stored?.nutrition;
  const srvHasNutrition = !!(
    srvNut &&
    ((srvNut as any).calories ||
      (srvNut as any).proteinGrams ||
      (srvNut as any).protein ||
      (srvNut as any).carbohydrateGrams ||
      (srvNut as any).carbs ||
      (srvNut as any).fatGrams ||
      (srvNut as any).fat ||
      (srvNut as any).fiberGrams ||
      (srvNut as any).fiber)
  );
  const mergedNutrition = srvHasNutrition ? srvNut : (storedNut ?? srvNut);

  const categoryName =
    rawData?.categoryName ||
    rawData?.category?.name ||
    (rawData?.category as any)?.localName ||
    categoriesQuery.data?.find(
      (c) =>
        c.uuid === (rawData?.categoryUuid || (rawData?.category as any)?.uuid),
    )?.name;

  const cuisineName =
    rawData?.cuisineName ||
    rawData?.cuisine?.name ||
    (rawData?.cuisine as any)?.localName ||
    cuisinesQuery.data?.find(
      (c) =>
        c.uuid === (rawData?.cuisineUuid || (rawData?.cuisine as any)?.uuid),
    )?.name;

  const data = rawData
    ? {
      ...rawData,
      categoryName,
      cuisineName,
      nutritionData: mergedNutrition,
      mealTypes:
        (stored?.mealTypes !== undefined
          ? stored.mealTypes
          : (rawData as any)?.mealTypes) ?? [],
      seasons:
        (stored?.seasons !== undefined ? stored.seasons : rawData.seasons) ??
        [],
      events:
        (stored?.events !== undefined ? stored.events : rawData.events) ?? [],
      suitableWeather:
        (stored?.suitableWeather !== undefined
          ? stored.suitableWeather
          : (stored?.weatherConditions ?? rawData.suitableWeather)) ?? [],
      ageRules:
        (stored?.ageRules !== undefined
          ? stored.ageRules
          : (stored?.ageGroups ?? rawData.ageRules)) ?? [],
      dietaryTypes:
        (stored?.dietaryTypes !== undefined
          ? stored.dietaryTypes
          : rawData.dietaryTypes) ?? [],
      allergens:
        (stored?.allergens !== undefined
          ? stored.allergens
          : rawData.allergens) ?? [],
      preparationTimes:
        (stored?.preparationTimes !== undefined
          ? stored.preparationTimes
          : (rawData as any)?.preparationTimes) ?? [],
      distances:
        (stored?.distances !== undefined
          ? stored.distances
          : (rawData as any)?.distances) ?? [],
    }
    : (stored as any);

  const images = (
    data?.images?.length
      ? data.images
      : data?.primaryMediaUrls?.length
        ? data.primaryMediaUrls
        : data?.gallery?.length
          ? data.gallery
          : [data?.thumbnail || data?.imageUrl].filter(Boolean)
  ) as string[];

  const activeImage = images[selectedImageIndex] || images[0];
  const spice = data?.defaultSpiceLevel ?? (data as any)?.spiceLevel ?? 0;

  const prepTime =
    (data as any)?.preparationTimeMinutes ||
    (data?.preparationTimes?.[0] as any)?.name ||
    (data?.preparationTimes?.[0] as any)?.localName ||
    "15 នាទី";

  const distanceText =
    (data?.distances?.[0] as any)?.name ||
    (data?.distances?.[0] as any)?.localName ||
    data?.cuisineName ||
    "N/A";

  const calories = data?.nutritionData?.calories ?? 0;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center overflow-y-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden bg-slate-900/40 p-4 backdrop-blur-[4px] animate-in fade-in duration-200">
      <div className="relative my-6 max-h-[92vh] w-full max-w-5xl overflow-y-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden rounded-[32px] bg-white p-6 shadow-[0_32px_80px_rgba(0,0,0,0.25)] sm:p-8 animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-6 top-6 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-gray-200 focus:outline-none"
        >
          <X size={22} />
        </button>

        {isLoading ? (
          <div className="flex min-h-[380px] flex-col items-center justify-center gap-4 py-16">
            <Loader2 size={42} className="animate-spin text-[#14833E]" />
            <p className="text-xl font-normal text-gray-500">
              កំពុងទាញយកព័ត៌មានលម្អិត...
            </p>
          </div>
        ) : isError ? (
          <div className="my-8 rounded-2xl bg-red-50 p-6 text-center text-xl font-normal text-red-600">
            មិនអាចទាញយកព័ត៌មានលម្អិតមុខម្ហូបនេះបានទេ។
          </div>
        ) : data ? (
          <div className="space-y-6">
            {/* Top Grid: Images (Left) + Details (Right) */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-stretch">
              {/* Left Column: Image Showcase */}
              <div className="flex flex-col gap-3.5 lg:col-span-5 h-full">
                {/* Main Large Image - Big and Fills Height */}
                <div className="relative flex-1 min-h-[360px] sm:min-h-[420px] w-full overflow-hidden rounded-3xl border border-gray-100 bg-gray-50 shadow-sm">
                  {activeImage ? (
                    <img
                      src={
                        resolveFoodHubCatalogImageUrl(activeImage) ||
                        activeImage
                      }
                      alt={data?.localName || data?.canonicalName || ""}
                      className="absolute inset-0 h-full w-full object-cover transition duration-300"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-5xl text-gray-300">
                      <Utensils size={64} className="text-gray-300" />
                    </div>
                  )}
                </div>

                {/* Thumbnails Row */}
                {images.length > 1 && (
                  <div
                    className={`grid w-full gap-2.5 shrink-0 ${images.length === 2
                        ? "grid-cols-2"
                        : images.length === 3
                          ? "grid-cols-3"
                          : "grid-cols-4"
                      }`}
                  >
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedImageIndex(idx)}
                        className={`relative aspect-[4/3] w-full cursor-pointer overflow-hidden rounded-2xl border-2 transition ${selectedImageIndex === idx
                            ? "border-[#14833E] ring-2 ring-[#14833E]/20 shadow-xs"
                            : "border-gray-200 hover:border-gray-400"
                          }`}
                      >
                        <img
                          src={resolveFoodHubCatalogImageUrl(img) || img}
                          alt={`Thumbnail ${idx + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Title, Badges, Description, Stat Cards */}
              <div className="flex flex-col justify-between lg:col-span-7">
                <div className="space-y-4">
                  {/* Title & Subtitle */}
                  <div>
                    <h2 className="text-3xl font-medium text-gray-800">
                      {data?.localName ||
                        data?.canonicalName ||
                        "ព័ត៌មានមុខម្ហូប"}
                    </h2>
                    {data?.canonicalName &&
                      data?.localName &&
                      data.canonicalName !== data.localName && (
                        <p className="mt-1 text-lg font-normal text-gray-400">
                          {data.canonicalName}
                        </p>
                      )}
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-lg font-normal ${data.isActive === false
                          ? "border-gray-200 bg-gray-100 text-gray-600"
                          : "border-emerald-100 bg-emerald-50 text-emerald-700"
                        }`}
                    >
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${data.isActive === false
                            ? "bg-gray-400"
                            : "bg-emerald-500"
                          }`}
                      />
                      {data.isActive === false ? "អសកម្ម" : "មានលក់"}
                    </span>

                    {data.categoryName && (
                      <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3.5 py-1 text-lg font-normal text-emerald-700">
                        {extractKhmerOnlyName(data.categoryName)}
                      </span>
                    )}

                    {data.cuisineName && (
                      <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3.5 py-1 text-lg font-normal text-emerald-700">
                        {data.cuisineName}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  {data.description ? (
                    <p className="text-lg font-normal leading-relaxed text-gray-600">
                      {data.description}
                    </p>
                  ) : (
                    <p className="text-lg font-normal text-gray-400">
                      មិនមានការពិពណ៌នាអំពីមុខម្ហូបនេះទេ។
                    </p>
                  )}

                  {/* 4 Stat Cards */}
                  <div className="grid grid-cols-2 gap-3 pt-2 sm:grid-cols-4">
                    {/* Stat 1: Time */}
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-gray-50/70 p-3.5 text-center">
                      <Clock size={22} className="text-[#14833E]" />
                      <p className="mt-1 text-lg font-medium text-gray-800">
                        {prepTime}
                      </p>
                      <p className="text-lg font-normal text-gray-400">
                        ពេលរៀបចំ
                      </p>
                    </div>

                    {/* Stat 2: Distance / Cuisine */}
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-gray-50/70 p-3.5 text-center">
                      <MapPin size={22} className="text-[#14833E]" />
                      <p className="mt-1 max-w-full truncate text-lg font-medium text-gray-800">
                        {distanceText}
                      </p>
                      <p className="text-lg font-normal text-gray-400">
                        ចម្ងាយ
                      </p>
                    </div>

                    {/* Stat 3: Spice */}
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-gray-50/70 p-3.5 text-center">
                      <Flame
                        size={22}
                        className={
                          spice > 0 ? "text-amber-500" : "text-[#14833E]"
                        }
                      />
                      <p className="mt-1 text-lg font-medium text-gray-800">
                        {SPICE_SHORT_LABELS[spice] || `${spice} កម្រិត`}
                      </p>
                      <p className="text-lg font-normal text-gray-400">
                        កម្រិតហឹរ
                      </p>
                    </div>

                    {/* Stat 4: Calories */}
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-gray-50/70 p-3.5 text-center">
                      <Activity size={22} className="text-[#14833E]" />
                      <p className="mt-1 text-lg font-medium text-gray-800">
                        {calories} kcal
                      </p>
                      <p className="text-lg font-normal text-gray-400">
                        កាឡូរី
                      </p>
                    </div>
                  </div>

                  {/* Dietary Types / របបអាហារ */}
                  <div className="pt-2">
                    <p className="text-lg font-normal text-gray-400">
                      របបអាហារ
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-2">
                      {Array.isArray(data.dietaryTypes) &&
                        data.dietaryTypes.length > 0 ? (
                        (data.dietaryTypes as any[]).map(
                          (dt: any, idx: number) => (
                            <span
                              key={idx}
                              className="rounded-full border border-emerald-100 bg-emerald-50 px-3.5 py-1 text-lg font-normal text-emerald-700"
                            >
                              {dt.localName || dt.name || dt.code || "—"}
                            </span>
                          ),
                        )
                      ) : (
                        <p className="text-lg font-normal text-gray-400">
                          មិនមានទិន្នន័យរបបអាហារ។
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Classification Sections */}
            <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2 lg:grid-cols-4">
              {/* Meal Time */}
              <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-4">
                <div className="flex items-center gap-2 text-gray-400">
                  <Clock size={18} className="text-[#14833E]" />
                  <span className="text-lg font-normal">ពេលទទួលទាន</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {Array.isArray(data.mealTypes) &&
                    data.mealTypes.length > 0 ? (
                    (data.mealTypes as any[]).map((m: any, idx: number) => (
                      <span
                        key={idx}
                        className="rounded-xl bg-white px-2.5 py-1 text-lg font-normal text-gray-700 border border-gray-100"
                      >
                        {m.localName || m.name || m.code}
                      </span>
                    ))
                  ) : (
                    <span className="text-lg font-normal text-gray-400">—</span>
                  )}
                </div>
              </div>

              {/* Age Groups */}
              <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-4">
                <div className="flex items-center gap-2 text-gray-400">
                  <UsersRound size={18} className="text-[#14833E]" />
                  <span className="text-lg font-normal">ក្រុមអាយុ</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {Array.isArray(data.ageRules) &&
                    data.ageRules.length > 0 ? (
                    (data.ageRules as any[]).map((a: any, idx: number) => (
                      <span
                        key={idx}
                        className="rounded-xl bg-white px-2.5 py-1 text-lg font-normal text-gray-700 border border-gray-100"
                      >
                        {a.localName || a.name || a.code}
                      </span>
                    ))
                  ) : (
                    <span className="text-lg font-normal text-gray-400">—</span>
                  )}
                </div>
              </div>

              {/* Seasons & Weather */}
              <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-4">
                <div className="flex items-center gap-2 text-gray-400">
                  <CloudSun size={18} className="text-[#14833E]" />
                  <span className="text-lg font-normal">រដូវកាល & អាកាសធាតុ</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {Array.isArray(data.seasons) &&
                    (data.seasons as any[]).map((s: any, idx: number) => (
                      <span
                        key={`s-${idx}`}
                        className="rounded-xl bg-white px-2.5 py-1 text-lg font-normal text-gray-700 border border-gray-100"
                      >
                        {s.localName || s.name || s.code}
                      </span>
                    ))}
                  {Array.isArray(data.suitableWeather) &&
                    (data.suitableWeather as any[]).map((w: any, idx: number) => (
                      <span
                        key={`w-${idx}`}
                        className="rounded-xl bg-white px-2.5 py-1 text-lg font-normal text-gray-700 border border-gray-100"
                      >
                        {w.localName || w.name || w.code}
                      </span>
                    ))}
                  {(!data.seasons || data.seasons.length === 0) &&
                    (!data.suitableWeather || data.suitableWeather.length === 0) && (
                      <span className="text-lg font-normal text-gray-400">គ្រប់រដូវកាល</span>
                    )}
                </div>
              </div>

              {/* Events */}
              <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-4">
                <div className="flex items-center gap-2 text-gray-400">
                  <Sparkles size={18} className="text-[#14833E]" />
                  <span className="text-lg font-normal">ព្រឹត្តិការណ៍</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {Array.isArray(data.events) && data.events.length > 0 ? (
                    (data.events as any[]).map((e: any, idx: number) => (
                      <span
                        key={idx}
                        className="rounded-xl bg-white px-2.5 py-1 text-lg font-normal text-gray-700 border border-gray-100"
                      >
                        {e.localName || e.name || e.code}
                      </span>
                    ))
                  ) : (
                    <span className="text-lg font-normal text-gray-400">—</span>
                  )}
                </div>
              </div>
            </div>

            {/* Footer Action Buttons */}
            <div className="flex items-center justify-between pt-4">
              {data && onEdit ? (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onEdit(data);
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-[#14833E] px-7 py-3 text-lg font-normal text-[#14833E] transition hover:bg-emerald-50"
                >
                  <Pencil size={18} />
                  <span>កែប្រែព័ត៌មាន</span>
                </button>
              ) : (
                <div />
              )}

              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-12 items-center rounded-full bg-[#14833E] px-8 text-lg font-normal text-white shadow-lg shadow-[#14833E]/20 transition hover:bg-[#0f6b32] focus:outline-none"
              >
                បិទ
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
