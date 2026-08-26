"use client";

import {
  Activity,
  AlertTriangle,
  Calendar,
  Clock,
  CloudSun,
  DollarSign,
  Flame,
  Globe2,
  Heart,
  Info,
  Layers,
  Loader2,
  Pencil,
  ShieldAlert,
  Sparkles,
  Store,
  Tag,
  Utensils,
  UsersRound,
  X,
} from "lucide-react";

import {
  useGetPublishedMenuItemDetailQuery,
  useGetManagedFoodsQuery,
  useGetManagedFoodCategoriesQuery,
  useGetManagedCuisinesQuery,
} from "@/src/app/store/menuManagementApi";
import { resolveFoodHubCatalogImageUrl } from "@/src/lib/resolveFoodHubImageUrl";
import { extractKhmerOnlyName } from "@/src/lib/catalogCategoryHelper";
import { readFoodRelationsStorage, readMenuItemRelationsStorage } from "@/src/lib/filterCatalogStorage";

// ─── helpers ────────────────────────────────────────────────────────────────

const SPICE_LABELS: Record<number, string> = {
  0: "0 - មិនហឹរ (No Spicy)",
  1: "1 - ហឹរតិច (Mild)",
  2: "2 - ហឹរមធ្យម (Medium)",
  3: "3 - ហឹរខ្លាំង (Hot)",
  4: "4 - ហឹរខ្លាំងណាស់ (Extra Hot)",
  5: "5 - ហឹរបំផុត (Extreme)",
};

function fmtDate(val: string | null | undefined) {
  if (!val) return "—";
  try {
    return new Date(val).toLocaleString("km-KH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return val;
  }
}

// ─── sub-components ──────────────────────────────────────────────────────────

function SectionCard({
  icon,
  title,
  color = "gray",
  children,
}: {
  icon: React.ReactNode;
  title: string;
  color?: "gray" | "emerald" | "blue" | "rose" | "amber" | "violet" | "sky" | "orange" | "red";
  children: React.ReactNode;
}) {
  const border: Record<string, string> = {
    gray: "border-gray-100",
    emerald: "border-emerald-100",
    blue: "border-blue-100",
    rose: "border-rose-100",
    amber: "border-amber-100",
    violet: "border-violet-100",
    sky: "border-sky-100",
    orange: "border-orange-100",
    red: "border-red-100",
  };
  const accent: Record<string, string> = {
    gray: "bg-gray-300",
    emerald: "bg-emerald-500",
    blue: "bg-blue-400",
    rose: "bg-rose-400",
    amber: "bg-amber-400",
    violet: "bg-violet-400",
    sky: "bg-sky-400",
    orange: "bg-orange-400",
    red: "bg-red-400",
  };
  const iconColor: Record<string, string> = {
    gray: "text-gray-500",
    emerald: "text-emerald-600",
    blue: "text-blue-600",
    rose: "text-rose-600",
    amber: "text-amber-600",
    violet: "text-violet-600",
    sky: "text-sky-600",
    orange: "text-orange-600",
    red: "text-red-600",
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl border ${border[color]} bg-white shadow-sm`}>
      <div className={`absolute left-0 top-0 h-full w-1 ${accent[color]}`} />
      <div className="px-4 pb-4 pt-3.5 pl-5">
        <div className={`flex items-center gap-2 text-sm font-semibold ${iconColor[color]} mb-2.5`}>
          {icon}
          <span>{title}</span>
        </div>
        {children}
      </div>
    </div>
  );
}

function TagPill({ label, className }: { label: string; className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-xl px-3 py-1 text-xs font-bold ${className}`}>
      {label}
    </span>
  );
}

function EmptyState({ label }: { label: string }) {
  return <p className="text-xs text-gray-400 italic">{label}</p>;
}

// ─── main component ──────────────────────────────────────────────────────────

export default function MenuItemDetailModal({
  uuid,
  onClose,
  onEdit,
}: {
  uuid: string | null;
  onClose: () => void;
  onEdit?: (item: any) => void;
}) {
  const { data, isLoading, isError } = useGetPublishedMenuItemDetailQuery(
    uuid ?? "",
    { skip: !uuid },
  );

  const categoriesQuery = useGetManagedFoodCategoriesQuery();
  const cuisinesQuery = useGetManagedCuisinesQuery();
  const foodsQuery = useGetManagedFoodsQuery({ size: 100 }, { skip: !uuid });

  if (!uuid) return null;

  const images = (
    data?.primaryMediaUrls?.length
      ? data.primaryMediaUrls
      : data?.primaryMediaUuids?.length
      ? data.primaryMediaUuids
      : data?.primaryMediaUuid
      ? [data.primaryMediaUuid]
      : data?.images?.length
      ? data.images
      : data?.gallery?.length
      ? data.gallery
      : data?.galleryMediaUuids?.length
      ? data.galleryMediaUuids
      : [data?.thumbnail || data?.imageUrl || data?.thumbnailMediaUuid].filter(Boolean)
  ) as string[];

  const isAvailable = data?.availabilityStatus !== "UNAVAILABLE";
  const rawFood = data?.food as any;
  const foodUuid =
    data?.foodUuid ||
    rawFood?.uuid ||
    rawFood?.id ||
    foodsQuery.data?.content?.find(
      (f) =>
        (rawFood?.canonicalName && f.canonicalName === rawFood.canonicalName) ||
        (rawFood?.localName && f.localName === rawFood.localName) ||
        (data?.name && (f.canonicalName === data.name || f.localName === data.name)),
    )?.uuid;

  const catalogFood = foodUuid ? foodsQuery.data?.content?.find((f) => f.uuid === foodUuid) : null;
  const storedFood = foodUuid ? readFoodRelationsStorage(foodUuid) : null;
  const storedMenuItem = uuid ? readMenuItemRelationsStorage(uuid) : null;

  const categoryName =
    rawFood?.categoryName ||
    rawFood?.category?.name ||
    (rawFood?.category as any)?.localName ||
    catalogFood?.categoryName ||
    catalogFood?.category?.name ||
    (catalogFood?.category as any)?.localName ||
    categoriesQuery.data?.find((c) => c.uuid === (rawFood?.categoryUuid || catalogFood?.categoryUuid))?.name;

  const cuisineName =
    rawFood?.cuisineName ||
    rawFood?.cuisine?.name ||
    (rawFood?.cuisine as any)?.localName ||
    catalogFood?.cuisineName ||
    catalogFood?.cuisine?.name ||
    (catalogFood?.cuisine as any)?.localName ||
    cuisinesQuery.data?.find((c) => c.uuid === (rawFood?.cuisineUuid || catalogFood?.cuisineUuid))?.name;

  const srvNut = catalogFood?.nutritionData ?? (catalogFood as any)?.nutrition ?? rawFood?.nutritionData ?? rawFood?.nutrition;
  const storedNut = storedFood?.nutritionData ?? storedFood?.nutrition;
  const srvHasNutrition = !!(
    srvNut &&
    (
      Number(srvNut.calories) > 0 ||
      Number(srvNut.proteinGrams ?? srvNut.protein) > 0 ||
      Number(srvNut.carbohydrateGrams ?? srvNut.carbs) > 0 ||
      Number(srvNut.fatGrams ?? srvNut.fat) > 0 ||
      Number(srvNut.fiberGrams ?? srvNut.fiber) > 0
    )
  );

  const baseFood = catalogFood || rawFood;
  const food = baseFood
    ? {
        ...baseFood,
        categoryName,
        cuisineName,
        nutritionData: srvHasNutrition ? srvNut : (storedNut ?? srvNut),
        mealTypes: (storedFood?.mealTypes !== undefined ? storedFood.mealTypes : (baseFood.mealTypes ?? [])),
        ageRules: (storedFood?.ageRules !== undefined ? storedFood.ageRules : (storedFood?.ageGroups !== undefined ? storedFood.ageGroups : (baseFood.ageRules ?? baseFood.ageGroups ?? []))),
        seasons: (storedFood?.seasons !== undefined ? storedFood.seasons : (baseFood.seasons ?? [])),
        suitableWeather: (storedFood?.suitableWeather !== undefined ? storedFood.suitableWeather : (storedFood?.weatherConditions !== undefined ? storedFood.weatherConditions : (baseFood.suitableWeather ?? baseFood.weatherConditions ?? []))),
        events: (storedFood?.events !== undefined ? storedFood.events : (baseFood.events ?? [])),
        dietaryTypes: (storedMenuItem?.dietaryTypes !== undefined ? storedMenuItem.dietaryTypes : (data?.dietaryTypes !== undefined && Array.isArray(data.dietaryTypes) ? data.dietaryTypes : (storedFood?.dietaryTypes !== undefined ? storedFood.dietaryTypes : (baseFood.dietaryTypes ?? [])))),
        allergens: (storedFood?.allergens !== undefined ? storedFood.allergens : (baseFood.allergens ?? [])),
      }
    : null;
  const spice = food?.defaultSpiceLevel ?? (storedFood as any)?.defaultSpiceLevel ?? 0;

  return (
    <div className="fixed inset-0 z-[150] flex items-start justify-center bg-black/60 p-4 backdrop-blur-[3px] animate-in fade-in duration-150 overflow-y-auto">
      <div className="my-6 flex w-full max-w-3xl flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl animate-in zoom-in-95 duration-150">

        {/* ─── HERO HEADER ──────────────────────────────────────────── */}
        <div className="relative shrink-0 bg-gradient-to-br from-[#14833E] via-[#1a9e4d] to-[#0f6b32] px-6 py-5 text-white">
          <div className="absolute right-4 top-4 flex items-center gap-2">
            {data && onEdit && (
              <button
                type="button"
                onClick={() => { onClose(); onEdit(data); }}
                className="inline-flex h-8 items-center gap-1.5 rounded-full bg-white/20 px-3.5 text-xs font-semibold text-white transition hover:bg-white/30"
              >
                <Pencil size={13} />
                <span>កែប្រែ</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex items-center gap-4 pr-24">
            {/* Thumbnail */}
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-white/20 shadow-md border border-white/20">
              {images[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={resolveFoodHubCatalogImageUrl(images[0]) || images[0]}
                  alt={data?.name || ""}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-3xl">🍜</div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-xl font-black text-white leading-tight">
                {data?.name || "ព័ត៌មានម៉ឺនុយ"}
              </p>
              {data?.localName && data.localName !== data?.name && (
                <p className="mt-0.5 text-sm text-white/70">{data.localName}</p>
              )}
              {data?.description && (
                <p className="mt-1 line-clamp-2 text-sm text-white/80">{data.description}</p>
              )}

              {/* Badges */}
              {data && (
                <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                  {/* Price */}
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-bold text-white border border-white/20">
                    <DollarSign size={11} />
                    {Number(data.price ?? 0).toFixed(2)} {data.currencyCode || "USD"}
                  </span>

                  {/* Availability */}
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold border ${
                    isAvailable
                      ? "bg-emerald-500/30 border-emerald-300/40 text-white"
                      : "bg-red-500/30 border-red-300/40 text-white"
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${isAvailable ? "bg-emerald-300" : "bg-red-300"}`} />
                    {isAvailable ? "មានលក់" : "អស់/បិទ"}
                  </span>

                  {/* Featured */}
                  {data.isFeatured && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/30 border border-amber-300/40 px-2.5 py-0.5 text-xs font-bold text-white">
                      ★ ពិសេស
                    </span>
                  )}

                  {/* Prep time */}
                  {data.preparationTimeMinutes != null && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/10 border border-white/15 px-2.5 py-0.5 text-xs text-white">
                      <Clock size={11} />
                      {data.preparationTimeMinutes} នាទី
                    </span>
                  )}

                  {/* Source */}
                  {data.source && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/10 border border-white/15 px-2.5 py-0.5 text-xs text-white/80">
                      <Tag size={10} />
                      {data.source}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ─── BODY ─────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto bg-gray-50/60 p-5 space-y-3.5">
          {isLoading ? (
            <div className="flex py-16 flex-col items-center justify-center gap-3">
              <Loader2 size={36} className="animate-spin text-[#14833E]" />
              <p className="text-sm font-medium text-gray-500">កំពុងទាញយកព័ត៌មាន...</p>
            </div>
          ) : isError ? (
            <div className="my-4 rounded-2xl bg-red-50 p-5 text-center text-sm font-semibold text-red-600">
              មិនអាចទាញយក Detail របស់ Menu Item នេះបានទេ។
            </div>
          ) : data ? (
            <>
              {/* ── Row 1: Store + Food Reference ─── */}
              <div className="grid gap-3 sm:grid-cols-2">
                <SectionCard icon={<Store size={15} />} title="ហាង" color="emerald">
                  <p className="text-base font-bold text-gray-900 leading-snug">
                    {data.store?.storeName || (data.store as any)?.name || (data.store as any)?.localName || "—"}
                  </p>
                  {(data.store as any)?.city && (
                    <p className="mt-0.5 text-xs text-gray-500">📍 {(data.store as any).city}</p>
                  )}
                  {(data.store as any)?.province && (
                    <p className="text-xs text-gray-400">{(data.store as any).province}</p>
                  )}
                </SectionCard>

                <SectionCard icon={<Utensils size={15} />} title="មុខម្ហូបមេ (Food)" color="blue">
                  <p className="text-base font-bold text-gray-900 leading-snug">
                    {food?.localName || food?.canonicalName || "—"}
                  </p>
                  {food?.canonicalName && food?.localName && food.canonicalName !== food.localName && (
                    <p className="text-xs text-gray-500 mt-0.5">{food.canonicalName}</p>
                  )}
                  {food?.categoryName && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      ប្រភេទ: {extractKhmerOnlyName(food.categoryName)}
                    </p>
                  )}
                  {food?.cuisineName && (
                    <p className="text-xs text-gray-400">ម្ហូប: {food.cuisineName}</p>
                  )}
                </SectionCard>
              </div>

              {/* ── Row 2: Category + Cuisine from food ─── */}
              <div className="grid gap-3 sm:grid-cols-2">
                <SectionCard icon={<Layers size={15} />} title="ប្រភេទមុខម្ហូប" color="violet">
                  <p className="text-base font-bold text-gray-900">
                    {food?.categoryName ? extractKhmerOnlyName(food.categoryName) : "—"}
                  </p>
                </SectionCard>

                <SectionCard icon={<Globe2 size={15} />} title="ម្ហូបតាមប្រទេស (Cuisine)" color="amber">
                  <p className="text-base font-bold text-gray-900">
                    {food?.cuisineName || "—"}
                  </p>
                </SectionCard>
              </div>

              {/* ── Spice Level ─── */}
              {food && (
                <SectionCard icon={<Flame size={15} />} title="កម្រិតហឹរ" color="orange">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {[0, 1, 2, 3, 4, 5].map((lvl) => (
                        <span
                          key={lvl}
                          className={`h-4 w-4 rounded-full border ${lvl <= spice ? "bg-orange-400 border-orange-300" : "bg-gray-100 border-gray-200"}`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-bold text-orange-700">
                      {SPICE_LABELS[spice] || `${spice} / 5`}
                    </span>
                  </div>
                </SectionCard>
              )}

              {/* ── Nutrition ─── */}
              {food?.nutritionData && (
                <SectionCard icon={<Activity size={15} />} title="សារធាតុចិញ្ចឹម (Nutrition)" color="emerald">
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                    {[
                      { label: "កាឡូរី", value: food.nutritionData.calories, unit: "kcal", bg: "bg-emerald-50 text-emerald-800" },
                      { label: "ខ្លាញ់", value: food.nutritionData.fatGrams, unit: "g", bg: "bg-orange-50 text-orange-800" },
                      { label: "សរសៃ", value: food.nutritionData.fiberGrams, unit: "g", bg: "bg-violet-50 text-violet-800" },
                      { label: "ប្រូតេអ៊ីន", value: food.nutritionData.proteinGrams, unit: "g", bg: "bg-blue-50 text-blue-800" },
                      { label: "កាបូអ៊ីដ្រាត", value: food.nutritionData.carbohydrateGrams ?? food.nutritionData.carbsGrams, unit: "g", bg: "bg-amber-50 text-amber-800" },
                    ].map((n) => (
                      <div key={n.label} className={`rounded-xl ${n.bg} p-2.5 text-center`}>
                        <p className="text-[11px] font-semibold text-gray-500">{n.label}</p>
                        <p className="mt-0.5 text-sm font-black">
                          {n.value ?? 0} <span className="text-[10px] font-medium">{n.unit}</span>
                        </p>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              )}

              {/* ── Meal Types + Age Rules ─── */}
              <div className="grid gap-3 sm:grid-cols-2">
                {/* Meal Types from food */}
                <SectionCard icon={<Clock size={15} />} title="ពេលទទួលទាន (Meal Types)" color="emerald">
                  <div className="flex flex-wrap gap-1.5">
                    {Array.isArray(food?.mealTypes) && food.mealTypes.length > 0 ? (
                      food.mealTypes.map((m: any, idx: number) => (
                        <TagPill
                          key={idx}
                          label={m.name || m.localName || m.code || m.mealTypeName || "—"}
                          className="bg-emerald-100 text-emerald-800"
                        />
                      ))
                    ) : (
                      <EmptyState label="គ្រប់ពេល" />
                    )}
                  </div>
                </SectionCard>

                {/* Age Rules from food */}
                <SectionCard icon={<UsersRound size={15} />} title="ក្រុមអាយុ (Age Groups)" color="blue">
                  <div className="flex flex-wrap gap-1.5">
                    {Array.isArray(food?.ageRules) && food.ageRules.length > 0 ? (
                      food.ageRules.map((a: any, idx: number) => (
                        <TagPill
                          key={idx}
                          label={a.name || a.localName || a.code || a.ageGroupName || "—"}
                          className={`${
                            a.ruleResult === "RESTRICTED"
                              ? "bg-red-100 text-red-800"
                              : a.ruleResult === "CAUTION"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        />
                      ))
                    ) : (
                      <EmptyState label="គ្រប់វ័យ" />
                    )}
                  </div>
                </SectionCard>
              </div>

              {/* ── Seasons + Weather ─── */}
              <div className="grid gap-3 sm:grid-cols-2">
                {/* Seasons from food */}
                <SectionCard icon={<Calendar size={15} />} title="រដូវកាល (Seasons)" color="amber">
                  <div className="flex flex-wrap gap-1.5">
                    {Array.isArray(food?.seasons) && food.seasons.length > 0 ? (
                      food.seasons.map((s: any, idx: number) => (
                        <TagPill
                          key={idx}
                          label={s.localName || s.name || s.code || "—"}
                          className="bg-amber-100 text-amber-800"
                        />
                      ))
                    ) : (
                      <EmptyState label="គ្រប់រដូវ" />
                    )}
                  </div>
                </SectionCard>

                {/* Weather from food */}
                <SectionCard icon={<CloudSun size={15} />} title="អាកាសធាតុ (Weather)" color="sky">
                  <div className="flex flex-wrap gap-1.5">
                    {Array.isArray(food?.suitableWeather) && food.suitableWeather.length > 0 ? (
                      food.suitableWeather.map((w: any, idx: number) => (
                        <TagPill
                          key={idx}
                          label={w.localName || w.name || w.code || "—"}
                          className="bg-sky-100 text-sky-800"
                        />
                      ))
                    ) : (
                      <EmptyState label="គ្រប់អាកាសធាតុ" />
                    )}
                  </div>
                </SectionCard>
              </div>

              {/* ── Events from food ─── */}
              {Array.isArray(food?.events) && food.events.length > 0 && (
                <SectionCard icon={<Sparkles size={15} />} title="ព្រឹត្តិការណ៍ (Events)" color="violet">
                  <div className="flex flex-wrap gap-1.5">
                    {food.events.map((e: any, idx: number) => (
                      <TagPill
                        key={idx}
                        label={e.localName || e.name || e.code || "—"}
                        className="bg-violet-100 text-violet-800"
                      />
                    ))}
                  </div>
                </SectionCard>
              )}

              {/* ── Dietary Types (MenuItem-level or Food fallback) ─── */}
              <SectionCard icon={<Heart size={15} />} title="របបអាហារ (Dietary Types)" color="rose">
                {Array.isArray(data.dietaryTypes) && data.dietaryTypes.length > 0 ? (
                  <div className="space-y-1.5">
                    {(data.dietaryTypes as any[]).map((dt: any, idx: number) => {
                      const dtName =
                        typeof dt === "string"
                          ? dt
                          : dt?.localName || dt?.name || dt?.dietaryTypeName || dt?.code || "—";
                      const vStatus = typeof dt === "object" ? dt?.verificationStatus : undefined;
                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between rounded-xl bg-rose-50 px-3 py-2 border border-rose-100"
                        >
                          <span className="text-sm font-semibold text-rose-900">{dtName}</span>
                          <span className={`rounded-lg px-2 py-0.5 text-[11px] font-bold border ${
                            vStatus === "VERIFIED"
                              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                              : "bg-gray-50 border-gray-200 text-gray-500"
                          }`}>
                            {vStatus === "VERIFIED" ? "✓ បានផ្ទៀងផ្ទាត់" : "មិនទាន់ផ្ទៀងផ្ទាត់"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : Array.isArray(food?.dietaryTypes) && food.dietaryTypes.length > 0 ? (
                  <div className="space-y-1.5">
                    {(food.dietaryTypes as any[]).map((dt: any, idx: number) => {
                      const dtName =
                        typeof dt === "string"
                          ? dt
                          : dt?.localName || dt?.name || dt?.dietaryTypeName || dt?.code || "—";
                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between rounded-xl bg-rose-50 px-3 py-2 border border-rose-100"
                        >
                          <span className="text-sm font-semibold text-rose-900">{dtName}</span>
                          <span className="rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 px-2 py-0.5 text-[11px] font-bold">
                            មុខម្ហូបមេ
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <EmptyState label="គ្មានរបបអាហារ" />
                )}
              </SectionCard>

              {/* ── Allergen Declarations ─── */}
              {((Array.isArray((data as any).allergenDeclarations) && (data as any).allergenDeclarations.length > 0) ||
                (Array.isArray(food?.allergens) && food.allergens.length > 0)) && (
                <SectionCard icon={<ShieldAlert size={15} />} title="សារធាតុអាឡែស៊ី (Allergens)" color="red">
                  <div className="space-y-1.5">
                    {Array.isArray((data as any).allergenDeclarations) &&
                      (data as any).allergenDeclarations.length > 0 &&
                      ((data as any).allergenDeclarations as any[]).map((al: any, idx: number) => {
                        const alName =
                          typeof al === "string"
                            ? al
                            : al?.localName || al?.name || al?.allergenName || al?.code || "—";
                        const dtype = al?.declarationType;
                        const risk = al?.riskLevel;
                        return (
                          <div
                            key={`mi-${idx}`}
                            className="flex items-center justify-between rounded-xl bg-red-50 px-3 py-2 border border-red-100"
                          >
                            <div className="flex items-center gap-2">
                              <AlertTriangle size={13} className="text-red-500 shrink-0" />
                              <span className="text-sm font-semibold text-red-900">{alName}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {dtype && (
                                <span className={`rounded-lg px-2 py-0.5 text-[11px] font-bold ${
                                  dtype === "CONTAINS"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-amber-100 text-amber-700"
                                }`}>
                                  {dtype === "CONTAINS" ? "មាន" : "ប្រហែល"}
                                </span>
                              )}
                              {risk && (
                                <span className={`rounded-lg px-2 py-0.5 text-[11px] font-bold ${
                                  risk === "HIGH"
                                    ? "bg-red-200 text-red-800"
                                    : risk === "MEDIUM"
                                    ? "bg-amber-100 text-amber-700"
                                    : "bg-gray-100 text-gray-600"
                                }`}>
                                  {risk === "HIGH" ? "ហានិភ័យខ្ពស់" : risk === "MEDIUM" ? "មធ្យម" : "ទាប"}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}

                    {(!Array.isArray((data as any).allergenDeclarations) ||
                      (data as any).allergenDeclarations.length === 0) &&
                      Array.isArray(food?.allergens) &&
                      food.allergens.map((al: any, idx: number) => {
                        const alName =
                          typeof al === "string"
                            ? al
                            : al?.localName || al?.name || al?.allergenName || al?.code || "—";
                        const risk = al?.riskLevel;
                        return (
                          <div
                            key={`f-${idx}`}
                            className="flex items-center justify-between rounded-xl bg-red-50 px-3 py-2 border border-red-100"
                          >
                            <div className="flex items-center gap-2">
                              <AlertTriangle size={13} className="text-red-500 shrink-0" />
                              <span className="text-sm font-semibold text-red-900">{alName}</span>
                            </div>
                            {risk && (
                              <span className={`rounded-lg px-2 py-0.5 text-[11px] font-bold ${
                                risk === "HIGH"
                                  ? "bg-red-200 text-red-800"
                                  : risk === "MEDIUM"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-gray-100 text-gray-600"
                              }`}>
                                {risk === "HIGH" ? "ហានិភ័យខ្ពស់" : risk === "MEDIUM" ? "មធ្យម" : "ទាប"}
                              </span>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </SectionCard>
              )}

              {/* ── Ingredients ─── */}
              {Array.isArray(data.ingredients) && data.ingredients.length > 0 && (
                <SectionCard icon={<Sparkles size={15} />} title={`គ្រឿងផ្សំ (${data.ingredients.length})`} color="violet">
                  <div className="grid gap-1.5 sm:grid-cols-2">
                    {(data.ingredients as any[]).map((ig: any, idx: number) => {
                      const igName =
                        typeof ig === "string"
                          ? ig
                          : ig?.localName || ig?.name || ig?.ingredientLocalName || ig?.ingredientName ||
                            ig?.ingredient?.localName || ig?.ingredient?.name || ig?.code || "—";
                      const qty = typeof ig === "object" && ig ? ig.quantity ?? ig.amount : null;
                      const unit = typeof ig === "object" && ig ? ig.unit || ig.measurementUnit || "" : "";
                      const igQty = qty != null || unit ? `${qty != null ? qty : ""} ${unit}`.trim() : "";
                      const isOptional = typeof ig === "object" && Boolean(ig?.isOptional);

                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between rounded-xl bg-violet-50 px-3 py-2 border border-violet-100"
                        >
                          <span className="text-sm font-semibold text-violet-900">
                            {igName}
                            {isOptional && (
                              <span className="ml-1 text-[11px] text-gray-400 font-normal">(ជម្រើស)</span>
                            )}
                          </span>
                          {igQty && <span className="text-xs font-medium text-violet-600">{igQty}</span>}
                        </div>
                      );
                    })}
                  </div>
                </SectionCard>
              )}

              {/* ── Ingredient Data Status ─── */}
              {data.ingredientDataStatus && (
                <SectionCard icon={<Info size={15} />} title="ស្ថានភាពទិន្នន័យគ្រឿងផ្សំ" color="gray">
                  <span className={`rounded-xl px-3 py-1 text-xs font-bold ${
                    data.ingredientDataStatus === "VERIFIED"
                      ? "bg-emerald-100 text-emerald-800"
                      : data.ingredientDataStatus === "COMPLETE"
                      ? "bg-blue-100 text-blue-800"
                      : data.ingredientDataStatus === "PARTIAL"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-gray-100 text-gray-600"
                  }`}>
                    {data.ingredientDataStatus}
                  </span>
                </SectionCard>
              )}

              {/* ── Created / Updated timestamps ─── */}
              <div className="grid gap-3 sm:grid-cols-2">
                <SectionCard icon={<Calendar size={15} />} title="ថ្ងៃបង្កើត" color="gray">
                  <p className="text-sm font-bold text-gray-800">{fmtDate(data.createdAt)}</p>
                </SectionCard>
                <SectionCard icon={<Calendar size={15} />} title="ថ្ងៃកែប្រែចុងក្រោយ" color="gray">
                  <p className="text-sm font-bold text-gray-800">{fmtDate(data.updatedAt)}</p>
                </SectionCard>
              </div>

              {/* ── Gallery images ─── */}
              {images.length > 0 && (
                <SectionCard icon={<Info size={15} />} title={`រូបភាព (${images.length})`} color="gray">
                  <div className="flex flex-wrap gap-2.5">
                    {images.map((img, idx) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={idx}
                        src={resolveFoodHubCatalogImageUrl(img) || img}
                        alt={`Gallery ${idx + 1}`}
                        className="h-16 w-16 rounded-2xl border border-gray-200 object-cover shadow-sm"
                      />
                    ))}
                  </div>
                </SectionCard>
              )}
            </>
          ) : null}
        </div>

        {/* ─── FOOTER ───────────────────────────────────────────────── */}
        <div className="shrink-0 flex items-center justify-end gap-2.5 border-t border-gray-100 bg-white px-6 py-3.5">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 items-center rounded-xl border border-gray-200 bg-white px-5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
          >
            បិទ
          </button>
          {data && onEdit && (
            <button
              type="button"
              onClick={() => { onClose(); onEdit(data); }}
              className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-[#14833E] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0f6b32] active:scale-95"
            >
              <Pencil size={15} />
              <span>កែប្រែព័ត៌មាន</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
