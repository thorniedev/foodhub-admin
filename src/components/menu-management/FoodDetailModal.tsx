"use client";

import {
  Activity,
  Calendar,
  Clock,
  CloudSun,
  DollarSign,
  ExternalLink,
  Flame,
  Globe2,
  Heart,
  Layers,
  Loader2,
  Pencil,
  Sparkles,
  Store,
  UsersRound,
  X,
} from "lucide-react";

import {
  useGetManagedFoodQuery,
  useGetPublishedMenuItemsQuery,
  useGetManagedFoodCategoriesQuery,
  useGetManagedCuisinesQuery,
} from "@/src/app/store/menuManagementApi";
import { extractKhmerOnlyName } from "@/src/lib/catalogCategoryHelper";
import { resolveFoodHubCatalogImageUrl } from "@/src/lib/resolveFoodHubImageUrl";
import { readFoodRelationsStorage } from "@/src/lib/filterCatalogStorage";

const SPICE_LABELS: Record<number, string> = {
  0: "0 - មិនហឹរ (No Spicy)",
  1: "1 - ហឹរតិច (Mild)",
  2: "2 - ហឹរមធ្យម (Medium)",
  3: "3 - ហឹរខ្លាំង (Hot)",
  4: "4 - ហឹរខ្លាំងណាស់ (Extra Hot)",
  5: "5 - ហឹរបំផុត (Extreme)",
};

// ─── Shared card ─────────────────────────────────────────────────────────────

function InfoCard({
  accentClass,
  label,
  icon,
  children,
}: {
  accentClass: string;
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 p-4 transition hover:shadow-sm">
      <div className={`absolute left-0 top-0 h-full w-1 rounded-l-2xl ${accentClass}`} />
      <div className="flex items-center gap-2 pl-2 text-sm font-semibold text-gray-400 mb-2">
        {icon}
        <span>{label}</span>
      </div>
      <div className="pl-2">{children}</div>
    </div>
  );
}

function TagRow({ items, color }: { items: any[]; color: string }) {
  if (!items.length) return <span className="text-sm text-gray-400">—</span>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((it: any, i: number) => (
        <span key={i} className={`inline-flex rounded-xl px-3 py-1 text-xs font-bold ${color}`}>
          {it.localName || it.name || it.code || "—"}
        </span>
      ))}
    </div>
  );
}

// ─── Main modal ──────────────────────────────────────────────────────────────

export default function FoodDetailModal({
  uuid,
  onClose,
  onEdit,
  onEditMenuItem,
}: {
  uuid: string | null;
  onClose: () => void;
  onEdit?: (item: any) => void;
  onEditMenuItem?: (item: any) => void;
}) {
  const { data: rawData, isLoading, isError } = useGetManagedFoodQuery(uuid ?? "", {
    skip: !uuid,
  });

  const categoriesQuery = useGetManagedFoodCategoriesQuery();
  const cuisinesQuery = useGetManagedCuisinesQuery();

  if (!uuid) return null;

  const stored = uuid ? readFoodRelationsStorage(uuid) : null;

  // If server returned all-null nutrition, prefer stored values.
  const srvNut = rawData ? (rawData.nutritionData ?? (rawData as any).nutrition) : null;
  const storedNut = stored?.nutritionData ?? stored?.nutrition;
  // Only trust server nutrition when at least one field has a real non-zero value.
  const srvHasNutrition = !!(
    srvNut &&
    (
      (srvNut as any).calories ||
      (srvNut as any).proteinGrams ||
      (srvNut as any).protein ||
      (srvNut as any).carbohydrateGrams ||
      (srvNut as any).carbs ||
      (srvNut as any).fatGrams ||
      (srvNut as any).fat ||
      (srvNut as any).fiberGrams ||
      (srvNut as any).fiber
    )
  );
  const mergedNutrition = srvHasNutrition ? srvNut : (storedNut ?? srvNut);

  const categoryName =
    rawData?.categoryName ||
    rawData?.category?.name ||
    (rawData?.category as any)?.localName ||
    categoriesQuery.data?.find((c) => c.uuid === (rawData?.categoryUuid || (rawData?.category as any)?.uuid))?.name;

  const cuisineName =
    rawData?.cuisineName ||
    rawData?.cuisine?.name ||
    (rawData?.cuisine as any)?.localName ||
    cuisinesQuery.data?.find((c) => c.uuid === (rawData?.cuisineUuid || (rawData?.cuisine as any)?.uuid))?.name;

  const data = rawData
    ? {
        ...rawData,
        categoryName,
        cuisineName,
        nutritionData: mergedNutrition,
        mealTypes: (stored?.mealTypes !== undefined ? stored.mealTypes : (rawData as any)?.mealTypes) ?? [],
        seasons: (stored?.seasons !== undefined ? stored.seasons : rawData.seasons) ?? [],
        events: (stored?.events !== undefined ? stored.events : rawData.events) ?? [],
        suitableWeather: (stored?.suitableWeather !== undefined ? stored.suitableWeather : (stored?.weatherConditions ?? rawData.suitableWeather)) ?? [],
        ageRules: (stored?.ageRules !== undefined ? stored.ageRules : (stored?.ageGroups ?? rawData.ageRules)) ?? [],
        dietaryTypes: (stored?.dietaryTypes !== undefined ? stored.dietaryTypes : rawData.dietaryTypes) ?? [],
        allergens: (stored?.allergens !== undefined ? stored.allergens : rawData.allergens) ?? [],
        preparationTimes: (stored?.preparationTimes !== undefined ? stored.preparationTimes : (rawData as any)?.preparationTimes) ?? [],
        distances: (stored?.distances !== undefined ? stored.distances : (rawData as any)?.distances) ?? [],
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
                <div className="flex h-full w-full items-center justify-center text-4xl">🍽️</div>
              )}
            </div>
            <div className="min-w-0 flex-1 pr-10">
              <p className="truncate text-3xl font-black text-white">
                {data?.localName || data?.canonicalName || "ព័ត៌មានមុខម្ហូប"}
              </p>
              {data?.canonicalName && data?.localName && (
                <p className="mt-0.5 text-base text-white/70">{data.canonicalName}</p>
              )}
              <p className="mt-1 text-sm text-white/60">ព័ត៌មានលម្អិតពេញលេញអំពីមុខម្ហូប</p>
            </div>
          </div>

          {/* Badges row */}
          {data && (
            <div className="mt-5 flex flex-wrap items-center gap-2.5">
              <span className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-bold ${
                data.isActive === false
                  ? "border-white/20 bg-black/20 text-white/70"
                  : "border-white/30 bg-white/20 text-white"
              }`}>
                <span className={`h-2 w-2 rounded-full ${data.isActive === false ? "bg-gray-400" : "bg-emerald-300"}`} />
                {data.isActive === false ? "អសកម្ម" : "សកម្ម"}
              </span>
              {data.categoryName && (
                <span className="rounded-full bg-white/15 px-3.5 py-1.5 text-sm font-bold text-white border border-white/20">
                  {extractKhmerOnlyName(data.categoryName)}
                </span>
              )}
              {data.cuisineName && (
                <span className="rounded-full bg-white/15 px-3.5 py-1.5 text-sm font-bold text-white border border-white/20">
                  {data.cuisineName}
                </span>
              )}
            </div>
          )}
        </div>

        {/* ─── BODY ─── */}
        <div className="p-7">
          {isLoading ? (
            <div className="flex min-h-64 flex-col items-center justify-center gap-4">
              <Loader2 size={40} className="animate-spin text-[#137A3D]" />
              <p className="text-base font-semibold text-gray-500">
                កំពុងទាញយកព័ត៌មានលម្អិតមុខម្ហូប...
              </p>
            </div>
          ) : isError ? (
            <div className="my-6 rounded-2xl bg-red-50 p-5 text-center text-base font-semibold text-red-600">
              មិនអាចទាញយកព័ត៌មានលម្អិតមុខម្ហូបនេះបានទេ។
            </div>
          ) : data ? (
            <div className="mt-4 space-y-5">

              {/* Description */}
              {data.description && (
                <p className="text-base leading-relaxed text-gray-600">{data.description}</p>
              )}

              {/* Spice */}
              <div className="flex items-center gap-3">
                <Flame size={18} className={spice > 0 ? "text-orange-500" : "text-gray-300"} />
                <span className="text-sm font-bold text-gray-600">កម្រិតហឹរ:</span>
                <div className="flex gap-1">
                  {[0,1,2,3,4,5].map(lvl => (
                    <span key={lvl} className={`h-3.5 w-3.5 rounded-full border ${
                      lvl <= spice ? "bg-orange-400 border-orange-300" : "bg-gray-100 border-gray-200"
                    }`} />
                  ))}
                </div>
                <span className="text-sm font-bold text-orange-600">
                  {SPICE_LABELS[spice] || `${spice} / 5`}
                </span>
              </div>

              {/* Category & Cuisine */}
              <div className="grid gap-3 sm:grid-cols-2">
                <InfoCard accentClass="bg-blue-300" label="ប្រភេទមុខម្ហូប" icon={<Layers size={15} />}>
                  <p className="text-base font-bold text-gray-900">
                    {data.categoryName ? extractKhmerOnlyName(data.categoryName) : "—"}
                  </p>
                </InfoCard>
                <InfoCard accentClass="bg-amber-300" label="ម្ហូបតាមប្រទេស (Cuisine)" icon={<Globe2 size={15} />}>
                  <p className="text-base font-bold text-gray-900">{data.cuisineName || "—"}</p>
                </InfoCard>
              </div>

              {/* Nutrition */}
              {data.nutritionData && (
                <InfoCard accentClass="bg-emerald-400" label="សារធាតុចិញ្ចឹម (Nutrition)" icon={<Activity size={15} className="text-[#14833E]" />}>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                    {[
                      { label: "កាឡូរី", val: data.nutritionData.calories, unit: "kcal", cls: "bg-emerald-50 text-emerald-800" },
                      { label: "ខ្លាញ់", val: data.nutritionData.fatGrams, unit: "g", cls: "bg-orange-50 text-orange-800" },
                      { label: "សរសៃ", val: data.nutritionData.fiberGrams, unit: "g", cls: "bg-violet-50 text-violet-800" },
                      { label: "ប្រូតេអ៊ីន", val: data.nutritionData.proteinGrams, unit: "g", cls: "bg-blue-50 text-blue-800" },
                      { label: "កាបូអ៊ីដ្រាត", val: data.nutritionData.carbohydrateGrams ?? (data.nutritionData as any).carbsGrams, unit: "g", cls: "bg-amber-50 text-amber-800" },
                    ].map(n => (
                      <div key={n.label} className={`rounded-2xl ${n.cls} p-3 text-center`}>
                        <p className="text-xs font-bold text-gray-500">{n.label}</p>
                        <p className="mt-0.5 text-base font-black">{n.val ?? 0} <span className="text-xs font-medium">{n.unit}</span></p>
                      </div>
                    ))}
                  </div>
                </InfoCard>
              )}

              {/* Filter Tags Grid */}
              <div className="grid gap-3 sm:grid-cols-2">
                {/* Meal Types */}
                <InfoCard accentClass="bg-emerald-400" label="ពេលទទួលទាន" icon={<Clock size={15} />}>
                  <TagRow
                    items={Array.isArray(data.mealTypes) ? data.mealTypes as any[] : []}
                    color="bg-emerald-100 text-emerald-800"
                  />
                </InfoCard>

                {/* Age Groups */}
                <InfoCard accentClass="bg-blue-300" label="ក្រុមអាយុ" icon={<UsersRound size={15} />}>
                  <TagRow
                    items={
                      Array.isArray(data.ageRules) && (data.ageRules as any[]).length > 0
                        ? data.ageRules as any[]
                        : Array.isArray((data as any).ageGroups)
                        ? (data as any).ageGroups
                        : []
                    }
                    color="bg-blue-100 text-blue-800"
                  />
                </InfoCard>

                {/* Dietary Types */}
                <InfoCard accentClass="bg-rose-300" label="របបអាហារ" icon={<Heart size={15} />}>
                  <TagRow
                    items={Array.isArray(data.dietaryTypes) ? data.dietaryTypes as any[] : []}
                    color="bg-rose-100 text-rose-800"
                  />
                </InfoCard>

                {/* Seasons + Weather */}
                <InfoCard accentClass="bg-amber-300" label="រដូវកាល & អាកាសធាតុ" icon={<CloudSun size={15} />}>
                  <div className="flex flex-wrap gap-1.5">
                    {Array.isArray(data.seasons) && (data.seasons as any[]).map((s: any, idx: number) => (
                      <span key={`s-${idx}`} className="rounded-xl bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                        {s.localName || s.name || s.code}
                      </span>
                    ))}
                    {Array.isArray(data.suitableWeather) && (data.suitableWeather as any[]).map((w: any, idx: number) => (
                      <span key={`w-${idx}`} className="rounded-xl bg-sky-100 px-3 py-1 text-xs font-bold text-sky-800">
                        {w.localName || w.name || w.code}
                      </span>
                    ))}
                    {(!data.seasons || (data.seasons as any[]).length === 0) &&
                     (!data.suitableWeather || (data.suitableWeather as any[]).length === 0) && (
                      <span className="text-sm text-gray-400">គ្រប់រដូវកាល</span>
                    )}
                  </div>
                </InfoCard>
              </div>

              {/* Events */}
              {Array.isArray(data.events) && (data.events as any[]).length > 0 && (
                <InfoCard accentClass="bg-violet-300" label="ព្រឹត្តិការណ៍" icon={<Sparkles size={15} />}>
                  <TagRow items={data.events as any[]} color="bg-violet-100 text-violet-800" />
                </InfoCard>
              )}

              {/* Gallery Images */}
              {images.length > 1 && (
                <InfoCard accentClass="bg-gray-300" label={`រូបភាពទាំងអស់ (${images.length})`} icon={<span className="text-base">🖼</span>}>
                  <div className="flex flex-wrap gap-2.5">
                    {images.map((img, idx) => (
                      <img
                        key={idx}
                        src={resolveFoodHubCatalogImageUrl(img) || img}
                        alt={`Food ${idx + 1}`}
                        className="h-20 w-20 rounded-2xl object-cover border border-gray-200 shadow-sm"
                      />
                    ))}
                  </div>
                </InfoCard>
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
                  className="inline-flex items-center gap-2 rounded-full border border-[#14833E] px-6 py-2.5 text-sm font-bold text-[#14833E] transition hover:bg-emerald-50"
                >
                  <Pencil size={16} />
                  កែប្រែ Food
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-11 items-center rounded-full bg-[#14833E] px-8 text-sm font-bold text-white shadow-lg shadow-[#14833E]/25 transition hover:bg-[#0f6b32] focus:outline-none focus:ring-4 focus:ring-[#14833E]/30"
            >
              បិទ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
