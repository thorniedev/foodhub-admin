"use client";

import {
  Activity,
  Clock,
  CloudSun,
  Flame,
  Globe2,
  Heart,
  Layers,
  Loader2,
  Pencil,
  UsersRound,
  X,
} from "lucide-react";

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
    <div className="fixed inset-0 z-[150] overflow-y-auto bg-black/60 p-4 backdrop-blur-[4px] animate-in fade-in duration-200">
      <div className="mx-auto my-6 w-full max-w-4xl overflow-hidden rounded-[32px] bg-white shadow-[0_32px_80px_rgba(0,0,0,0.25)] animate-in zoom-in-95 duration-200">
        {/* ─── HERO BANNER ─── */}
        <div className="relative bg-gradient-to-br from-[#14833E] via-[#1a9e4d] to-[#0f6b32] px-7 pb-8 pt-7">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-4">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-white/20 shadow-lg shadow-black/10">
              {images[0] ? (
                <img
                  src={resolveFoodHubCatalogImageUrl(images[0]) || images[0]}
                  alt={data?.localName || data?.canonicalName || ""}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-4xl">
                  🍽️
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1 pr-10">
              <p className="truncate text-3xl font-black text-white">
                {data?.localName || data?.canonicalName || "ព័ត៌មានមុខម្ហូប"}
              </p>
              {data?.canonicalName && data?.localName && (
                <p className="mt-0.5 text-lg text-white/70">{data.canonicalName}</p>
              )}
              <p className="mt-1 text-lg text-white/60">ព័ត៌មានលម្អិតពេញលេញអំពីមុខម្ហូប</p>
            </div>
          </div>

          {/* Badges row */}
          {data && (
            <div className="mt-5 flex flex-wrap items-center gap-2.5">
              <span className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-lg font-bold ${data.isActive === false
                  ? "border-white/20 bg-black/20 text-white/70"
                  : "border-white/30 bg-white/20 text-white"
                }`}>
                <span className={`h-2.5 w-2.5 rounded-full ${data.isActive === false ? "bg-gray-400" : "bg-emerald-300"}`} />
                {data.isActive === false ? "អសកម្ម" : "សកម្ម"}
              </span>
              {data.categoryName && (
                <span className="rounded-full bg-white/15 px-4 py-1.5 text-lg font-bold text-white border border-white/20">
                  {extractKhmerOnlyName(data.categoryName)}
                </span>
              )}
              {data.cuisineName && (
                <span className="rounded-full bg-white/15 px-4 py-1.5 text-lg font-bold text-white border border-white/20">
                  {data.cuisineName}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="p-7">
          {isLoading ? (
            <div className="flex min-h-64 flex-col items-center justify-center gap-4">
              <Loader2 size={40} className="animate-spin text-[#137A3D]" />
              <p className="text-lg font-semibold text-gray-500">
                កំពុងទាញយកព័ត៌មានលម្អិតមុខម្ហូប...
              </p>
            </div>
          ) : isError ? (
            <div className="my-6 rounded-2xl bg-red-50 p-5 text-center text-lg font-semibold text-red-600">
              មិនអាចទាញយកព័ត៌មានលម្អិតមុខម្ហូបនេះបានទេ។
            </div>
          ) : data ? (
            <div className="mt-4 space-y-5">
              {/* Description + Spice */}
              {(data.description || spice !== undefined) && (
                <div className="space-y-3">
                  {data.description && (
                    <p className="text-lg leading-relaxed text-gray-600">{data.description}</p>
                  )}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-lg font-bold text-gray-700">
                      <Flame size={20} className={spice > 0 ? "text-orange-500" : "text-gray-300"} />
                      <span>កម្រិតហឹរ:</span>
                    </div>
                    <span className="text-lg font-bold text-orange-600">
                      {SPICE_LABELS[spice] || `${spice} / 5`}
                    </span>
                  </div>
                </div>
              )}

              {/* Category & Cuisine Grid */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 p-4 transition hover:border-blue-200/60 hover:bg-blue-50/30">
                  <div className="absolute left-0 top-0 h-full w-1 rounded-l-2xl bg-blue-200 transition group-hover:bg-blue-400" />
                  <div className="flex items-center gap-2 pl-2 text-lg font-semibold text-gray-400">
                    <Layers size={18} />
                    <span>ប្រភេទមុខម្ហូប</span>
                  </div>
                  <p className="mt-2 pl-2 text-xl font-bold text-gray-900">
                    {data.categoryName ? extractKhmerOnlyName(data.categoryName) : "—"}
                  </p>
                </div>

                <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 p-4 transition hover:border-amber-200/60 hover:bg-amber-50/30">
                  <div className="absolute left-0 top-0 h-full w-1 rounded-l-2xl bg-amber-200 transition group-hover:bg-amber-400" />
                  <div className="flex items-center gap-2 pl-2 text-lg font-semibold text-gray-400">
                    <Globe2 size={18} />
                    <span>ម្ហូបតាមប្រទេស</span>
                  </div>
                  <p className="mt-2 pl-2 text-xl font-bold text-gray-900">
                    {data.cuisineName || "—"}
                  </p>
                </div>
              </div>

              {/* Nutrition Data */}
              {data.nutritionData && (
                <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 p-4 transition hover:border-[#14833E]/30 hover:bg-emerald-50/30">
                  <div className="absolute left-0 top-0 h-full w-1 rounded-l-2xl bg-[#14833E]/30 transition group-hover:bg-[#14833E]" />
                  <div className="flex items-center gap-2.5 pl-2 text-lg font-semibold text-gray-400">
                    <Activity size={18} className="text-[#14833E]" />
                    <span>សារធាតុចិញ្ចឹម (Nutrition)</span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
                    <div className="rounded-2xl bg-emerald-50 p-3.5 text-center">
                      <p className="text-lg font-bold text-gray-500">កាឡូរី</p>
                      <p className="mt-1 text-2xl font-black text-emerald-800">{data.nutritionData.calories ?? 0} kcal</p>
                    </div>
                    <div className="rounded-2xl bg-orange-50/60 p-3.5 text-center">
                      <p className="text-lg font-bold text-gray-500">ខ្លាញ់</p>
                      <p className="mt-1 text-2xl font-black text-orange-800">{data.nutritionData.fatGrams ?? 0} g</p>
                    </div>
                    <div className="rounded-2xl bg-violet-50/60 p-3.5 text-center">
                      <p className="text-lg font-bold text-gray-500">សរសៃ</p>
                      <p className="mt-1 text-2xl font-black text-violet-800">{data.nutritionData.fiberGrams ?? 0} g</p>
                    </div>
                    <div className="rounded-2xl bg-blue-50/60 p-3.5 text-center">
                      <p className="text-lg font-bold text-gray-500">ប្រូតេអ៊ីន</p>
                      <p className="mt-1 text-2xl font-black text-blue-800">{data.nutritionData.proteinGrams ?? 0} g</p>
                    </div>
                    <div className="rounded-2xl bg-amber-50/60 p-3.5 text-center">
                      <p className="text-lg font-bold text-gray-500">កាបូអ៊ីដ្រាត</p>
                      <p className="mt-1 text-2xl font-black text-amber-800">{data.nutritionData.carbohydrateGrams ?? 0} g</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Filter Tags: Meal Types, Age Groups, Dietary Types, Seasons */}
              <div className="grid gap-3 sm:grid-cols-2">
                {/* Meal Types */}
                <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 p-4 transition hover:border-emerald-200/60 hover:bg-emerald-50/30">
                  <div className="absolute left-0 top-0 h-full w-1 rounded-l-2xl bg-[#14833E]/30 transition group-hover:bg-[#14833E]" />
                  <div className="flex items-center gap-2 pl-2 text-lg font-semibold text-gray-400">
                    <Clock size={16} />
                    <span>ពេលទទួលទាន</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {Array.isArray(data.mealTypes) && data.mealTypes.length > 0 ? (
                      data.mealTypes.map((m: any, idx: number) => (
                        <span key={idx} className="rounded-xl bg-emerald-100 px-3.5 py-1.5 text-lg font-bold text-emerald-800">
                          {m.name || m.code}
                        </span>
                      ))
                    ) : (
                      <span className="text-lg text-gray-400">គ្រប់ពេល</span>
                    )}
                  </div>
                </div>

                {/* Age Groups */}
                <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 p-4 transition hover:border-blue-200/60 hover:bg-blue-50/30">
                  <div className="absolute left-0 top-0 h-full w-1 rounded-l-2xl bg-blue-200 transition group-hover:bg-blue-400" />
                  <div className="flex items-center gap-2 pl-2 text-lg font-semibold text-gray-400">
                    <UsersRound size={16} />
                    <span>ក្រុមអាយុ</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {Array.isArray(data.ageRules) && data.ageRules.length > 0 ? (
                      data.ageRules.map((a: any, idx: number) => (
                        <span key={idx} className="rounded-xl bg-blue-100 px-3.5 py-1.5 text-lg font-bold text-blue-800">{a.name || a.code}</span>
                      ))
                    ) : Array.isArray((data as any).ageGroups) && (data as any).ageGroups.length > 0 ? (
                      (data as any).ageGroups.map((a: any, idx: number) => (
                        <span key={idx} className="rounded-xl bg-blue-100 px-3.5 py-1.5 text-lg font-bold text-blue-800">{a.name || a.code}</span>
                      ))
                    ) : (
                      <span className="text-lg text-gray-400">គ្រប់វ័យ</span>
                    )}
                  </div>
                </div>

                {/* Dietary Types */}
                <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 p-4 transition hover:border-rose-200/60 hover:bg-rose-50/30">
                  <div className="absolute left-0 top-0 h-full w-1 rounded-l-2xl bg-rose-200 transition group-hover:bg-rose-400" />
                  <div className="flex items-center gap-2 pl-2 text-lg font-semibold text-gray-400">
                    <Heart size={16} />
                    <span>របបអាហារ</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {Array.isArray(data.dietaryTypes) && data.dietaryTypes.length > 0 ? (
                      data.dietaryTypes.map((d: any, idx: number) => (
                        <span key={idx} className="rounded-xl bg-rose-100 px-3.5 py-1.5 text-lg font-bold text-rose-800">{d.name || d.code}</span>
                      ))
                    ) : (
                      <span className="text-lg text-gray-400">គ្មាន</span>
                    )}
                  </div>
                </div>

                {/* Seasons / Weather */}
                <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 p-4 transition hover:border-amber-200/60 hover:bg-amber-50/30">
                  <div className="absolute left-0 top-0 h-full w-1 rounded-l-2xl bg-amber-200 transition group-hover:bg-amber-400" />
                  <div className="flex items-center gap-2 pl-2 text-lg font-semibold text-gray-400">
                    <CloudSun size={16} />
                    <span>រដូវកាល & អាកាសធាតុ</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {Array.isArray(data.seasons) && data.seasons.map((s: any, idx: number) => (
                      <span key={`s-${idx}`} className="rounded-xl bg-amber-100 px-3.5 py-1.5 text-lg font-bold text-amber-800">{s.localName || s.name || s.code}</span>
                    ))}
                    {Array.isArray(data.suitableWeather) && data.suitableWeather.map((w: any, idx: number) => (
                      <span key={`w-${idx}`} className="rounded-xl bg-sky-100 px-3.5 py-1.5 text-lg font-bold text-sky-800">{w.localName || w.name || w.code}</span>
                    ))}
                    {(!data.seasons || data.seasons.length === 0) && (!data.suitableWeather || data.suitableWeather.length === 0) && (
                      <span className="text-lg text-gray-400">គ្រប់រដូវកាល</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Gallery Images if multiple */}
              {images.length > 1 && (
                <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 p-4 transition hover:border-gray-200">
                  <div className="absolute left-0 top-0 h-full w-1 rounded-l-2xl bg-gray-200 transition group-hover:bg-gray-400" />
                  <p className="pl-2 text-lg font-semibold text-gray-400">រូបភាពទាំងអស់ ({images.length})</p>
                  <div className="mt-3 flex flex-wrap gap-3">
                    {images.map((img, idx) => (
                      <img
                        key={idx}
                        src={resolveFoodHubCatalogImageUrl(img) || img}
                        alt={`Food ${idx + 1}`}
                        className="h-20 w-20 rounded-2xl object-cover border border-gray-200 shadow-sm"
                      />
                    ))}
                  </div>
                </div>
              )}

            </div>
          ) : null}

          {/* Footer */}
          <div className="mt-6 flex items-center justify-between">
            <div>
              {data && onEdit && (
                <button
                  type="button"
                  onClick={() => { onClose(); onEdit(data); }}
                  className="inline-flex items-center gap-2 rounded-full border border-[#14833E] px-6 py-3 text-lg font-bold text-[#14833E] transition hover:bg-emerald-50"
                >
                  <Pencil size={18} />
                  កែប្រែ
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-12 items-center rounded-full bg-[#14833E] px-8 text-lg font-bold text-white shadow-lg shadow-[#14833E]/25 transition hover:bg-[#0f6b32] focus:outline-none focus:ring-4 focus:ring-[#14833E]/30"
            >
              បិទ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
