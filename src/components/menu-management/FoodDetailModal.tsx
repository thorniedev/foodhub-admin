"use client";

import {
  Activity,
  Calendar,
  Clock,
  CloudSun,
  Eye,
  Flame,
  Globe2,
  Heart,
  Info,
  Layers,
  Loader2,
  Pencil,
  Sparkles,
  UsersRound,
  Utensils,
  X,
} from "lucide-react";
import { useState } from "react";

import { useGetManagedFoodQuery } from "@/src/app/store/menuManagementApi";
import { extractKhmerOnlyName } from "@/src/lib/catalogCategoryHelper";
import { resolveFoodHubCatalogImageUrl } from "@/src/lib/resolveFoodHubImageUrl";

const SPICE_LABELS: Record<number, string> = {
  0: "0 - មិនហឹរ (No Spicy)",
  1: "1 - ហឹរតិច (Mild)",
  2: "2 - ហឹរមធ្យម (Medium)",
  3: "3 - ហឹរខ្លាំង (Hot)",
  4: "4 - ហឹរខ្លាំងណាស់ (Extra Hot)",
  5: "5 - ហឹរបំផុត (Extreme)",
};

export default function FoodDetailModal({
  uuid,
  onClose,
  onEdit,
}: {
  uuid: string | null;
  onClose: () => void;
  onEdit?: (item: any) => void;
}) {
  const [showRawJson, setShowRawJson] = useState(false);

  const { data, isLoading, isError } = useGetManagedFoodQuery(uuid ?? "", {
    skip: !uuid,
  });

  if (!uuid) return null;

  const images = (
    data?.images?.length
      ? data.images
      : data?.primaryMediaUrls?.length
      ? data.primaryMediaUrls
      : data?.gallery?.length
      ? data.gallery
      : [data?.thumbnail || data?.imageUrl].filter(Boolean)
  ) as string[];

  const spice = data?.defaultSpiceLevel ?? (data as any)?.spiceLevel ?? 0;

  return (
    <div className="fixed inset-0 z-[150] overflow-y-auto bg-black/50 p-4 backdrop-blur-sm">
      <div className="mx-auto my-6 w-full max-w-3xl rounded-[30px] bg-white p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#137A3D]/10 text-[#137A3D]">
              <Utensils size={22} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900">
                ព័ត៌មានលម្អិតមុខម្ហូប (Food Catalog)
              </h2>
              <p className="mt-0.5 text-xs text-gray-400">
                Food Catalog Detail (<code>/api/v1/catalog/foods/{`{uuid}`}</code>)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100 transition"
          >
            <X size={20} />
          </button>
        </div>

        {isLoading ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3">
            <Loader2 size={32} className="animate-spin text-[#137A3D]" />
            <p className="text-xs font-semibold text-gray-400">
              កំពុងទាញយកព័ត៌មានលម្អិតមុខម្ហូប...
            </p>
          </div>
        ) : isError ? (
          <div className="my-6 rounded-2xl bg-red-50 p-4 text-center text-sm font-semibold text-red-600">
            មិនអាចទាញយកព័ត៌មានលម្អិតមុខម្ហូបនេះបានទេ។
          </div>
        ) : data ? (
          <div className="mt-5 space-y-6">
            {/* Top Card / Hero */}
            <div className="flex flex-col gap-5 sm:flex-row">
              {/* Image Preview */}
              <div className="h-44 w-full shrink-0 overflow-hidden rounded-2xl bg-gray-100 sm:w-44">
                {images[0] ? (
                  <img
                    src={resolveFoodHubCatalogImageUrl(images[0]) || images[0]}
                    alt={data.localName || data.canonicalName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-4xl text-gray-300">
                    🍽️
                  </div>
                )}
              </div>

              {/* Title & Badges */}
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                        data.isActive === false
                          ? "bg-gray-100 text-gray-500"
                          : "bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      {data.isActive === false ? "អសកម្ម" : "សកម្ម"}
                    </span>
                    {data.categoryName && (
                      <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                        {extractKhmerOnlyName(data.categoryName)}
                      </span>
                    )}
                    {data.cuisineName && (
                      <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
                        {data.cuisineName}
                      </span>
                    )}
                  </div>

                  <h3 className="mt-2 text-2xl font-black text-gray-900">
                    {data.localName || data.canonicalName}
                  </h3>

                  {data.canonicalName && data.localName && (
                    <p className="mt-0.5 text-sm font-semibold text-gray-400">
                      {data.canonicalName}
                    </p>
                  )}

                  {data.description && (
                    <p className="mt-2 text-sm leading-relaxed text-gray-600">
                      {data.description}
                    </p>
                  )}
                </div>

                {/* Spice Level Bar */}
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex items-center gap-1 text-sm font-bold text-gray-700">
                    <Flame
                      size={17}
                      className={spice > 0 ? "text-orange-500" : "text-gray-300"}
                    />
                    <span>កម្រិតហឹរ:</span>
                  </div>
                  <span className="text-xs font-semibold text-orange-600">
                    {SPICE_LABELS[spice] || `${spice} / 5`}
                  </span>
                </div>
              </div>
            </div>

            {/* Category & Cuisine Grid */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-4">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                  <Layers size={15} />
                  <span>ប្រភេទមុខម្ហូប (Category)</span>
                </div>
                <p className="mt-1 text-sm font-bold text-gray-800">
                  {data.categoryName ? extractKhmerOnlyName(data.categoryName) : "—"}
                </p>
                {data.categoryUuid && (
                  <p className="mt-0.5 text-[11px] text-gray-400 truncate">
                    UUID: {data.categoryUuid}
                  </p>
                )}
              </div>

              <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-4">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                  <Globe2 size={15} />
                  <span>ម្ហូបតាមប្រទេស (Cuisine)</span>
                </div>
                <p className="mt-1 text-sm font-bold text-gray-800">
                  {data.cuisineName || "—"}
                </p>
                {data.cuisineUuid && (
                  <p className="mt-0.5 text-[11px] text-gray-400 truncate">
                    UUID: {data.cuisineUuid}
                  </p>
                )}
              </div>
            </div>

            {/* Nutrition Data */}
            {data.nutritionData && (
              <div className="rounded-2xl border border-gray-100 p-4">
                <div className="flex items-center gap-2 text-sm font-black text-gray-800">
                  <Activity size={16} className="text-[#137A3D]" />
                  <span>សារធាតុចិញ្ចឹម (Nutrition)</span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
                  <div className="rounded-xl bg-emerald-50/70 p-2.5 text-center">
                    <p className="text-[11px] font-bold text-gray-500">កាឡូរី</p>
                    <p className="mt-0.5 text-base font-black text-emerald-800">
                      {data.nutritionData.calories ?? 0} kcal
                    </p>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-2.5 text-center">
                    <p className="text-[11px] font-bold text-gray-500">ជាតិខ្លាញ់ (Fat)</p>
                    <p className="mt-0.5 text-base font-black text-gray-800">
                      {data.nutritionData.fatGrams ?? 0} g
                    </p>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-2.5 text-center">
                    <p className="text-[11px] font-bold text-gray-500">ជាតិសរសៃ (Fiber)</p>
                    <p className="mt-0.5 text-base font-black text-gray-800">
                      {data.nutritionData.fiberGrams ?? 0} g
                    </p>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-2.5 text-center">
                    <p className="text-[11px] font-bold text-gray-500">ប្រូតេអ៊ីន (Protein)</p>
                    <p className="mt-0.5 text-base font-black text-gray-800">
                      {data.nutritionData.proteinGrams ?? 0} g
                    </p>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-2.5 text-center">
                    <p className="text-[11px] font-bold text-gray-500">កាបូអ៊ីដ្រាត (Carbs)</p>
                    <p className="mt-0.5 text-base font-black text-gray-800">
                      {data.nutritionData.carbohydrateGrams ?? 0} g
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Filter Tags: Meal Types, Age Groups, Dietary Types */}
            <div className="grid gap-3 sm:grid-cols-2">
              {/* Meal Types */}
              <div className="rounded-2xl border border-gray-100 p-4">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                  <Clock size={15} className="text-[#137A3D]" />
                  <span>ពេលទទួលទាន (Meal Types)</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {Array.isArray(data.mealTypes) && data.mealTypes.length > 0 ? (
                    data.mealTypes.map((m: any, idx: number) => (
                      <span
                        key={idx}
                        className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800"
                      >
                        {m.name || m.code}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-gray-400">គ្រប់ពេល</span>
                  )}
                </div>
              </div>

              {/* Age Groups */}
              <div className="rounded-2xl border border-gray-100 p-4">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                  <UsersRound size={15} className="text-blue-600" />
                  <span>ក្រុមអាយុ (Age Groups)</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {Array.isArray(data.ageRules) && data.ageRules.length > 0 ? (
                    data.ageRules.map((a: any, idx: number) => (
                      <span
                        key={idx}
                        className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-800"
                      >
                        {a.name || a.code}
                      </span>
                    ))
                  ) : Array.isArray((data as any).ageGroups) && (data as any).ageGroups.length > 0 ? (
                    (data as any).ageGroups.map((a: any, idx: number) => (
                      <span
                        key={idx}
                        className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-800"
                      >
                        {a.name || a.code}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-gray-400">គ្រប់វ័យ</span>
                  )}
                </div>
              </div>

              {/* Dietary Types */}
              <div className="rounded-2xl border border-gray-100 p-4">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                  <Heart size={15} className="text-rose-500" />
                  <span>របបអាហារ (Dietary Types)</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {Array.isArray(data.dietaryTypes) && data.dietaryTypes.length > 0 ? (
                    data.dietaryTypes.map((d: any, idx: number) => (
                      <span
                        key={idx}
                        className="rounded-lg bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-800"
                      >
                        {d.name || d.code}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-gray-400">គ្មាន</span>
                  )}
                </div>
              </div>

              {/* Seasons / Weather */}
              <div className="rounded-2xl border border-gray-100 p-4">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                  <CloudSun size={15} className="text-amber-500" />
                  <span>រដូវកាល & អាកាសធាតុ</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {Array.isArray(data.seasons) &&
                    data.seasons.map((s: any, idx: number) => (
                      <span
                        key={`s-${idx}`}
                        className="rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800"
                      >
                        {s.localName || s.name || s.code}
                      </span>
                    ))}
                  {Array.isArray(data.suitableWeather) &&
                    data.suitableWeather.map((w: any, idx: number) => (
                      <span
                        key={`w-${idx}`}
                        className="rounded-lg bg-sky-50 px-2.5 py-1 text-xs font-bold text-sky-800"
                      >
                        {w.localName || w.name || w.code}
                      </span>
                    ))}
                  {(!data.seasons || data.seasons.length === 0) &&
                    (!data.suitableWeather || data.suitableWeather.length === 0) && (
                      <span className="text-xs text-gray-400">គ្រប់រដូវកាល</span>
                    )}
                </div>
              </div>
            </div>

            {/* Gallery Images if multiple */}
            {images.length > 1 && (
              <div className="rounded-2xl border border-gray-100 p-4">
                <p className="text-xs font-bold text-gray-400">រូបភាពទាំងអស់ ({images.length})</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {images.map((img, idx) => (
                    <img
                      key={idx}
                      src={resolveFoodHubCatalogImageUrl(img) || img}
                      alt={`Food ${idx + 1}`}
                      className="h-16 w-16 rounded-xl object-cover border border-gray-100"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Raw JSON Accordion */}
            <div className="border-t border-gray-100 pt-3">
              <button
                type="button"
                onClick={() => setShowRawJson((prev) => !prev)}
                className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-gray-600 transition"
              >
                <Info size={14} />
                {showRawJson ? "លាក់ JSON Raw Data" : "បង្ហាញ JSON Raw Data"}
              </button>

              {showRawJson && (
                <pre className="mt-3 max-h-60 overflow-auto rounded-2xl bg-gray-950 p-4 text-[11px] leading-relaxed text-gray-100">
                  {JSON.stringify(data, null, 2)}
                </pre>
              )}
            </div>
          </div>
        ) : null}

        {/* Footer */}
        <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
          <div>
            {data && onEdit && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(data);
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2 text-sm font-bold text-[#137A3D] hover:bg-emerald-100 transition"
              >
                <Pencil size={16} />
                កែប្រែ
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-gray-200 px-5 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50 transition"
          >
            បិទ
          </button>
        </div>
      </div>
    </div>
  );
}
