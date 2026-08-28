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
  useGetManagedStoresQuery,
} from "@/src/app/store/menuManagementApi";
import { resolveFoodHubCatalogImageUrl } from "@/src/lib/resolveFoodHubImageUrl";
import { extractKhmerOnlyName, isDrinkCategory } from "@/src/lib/catalogCategoryHelper";
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
  variant = "default",
  children,
}: {
  icon: React.ReactNode;
  title: string;
  variant?: "default" | "alert" | "info";
  children: React.ReactNode;
}) {
  const isAlert = variant === "alert";

  return (
    <section
      className={`rounded-2xl border bg-white p-5 shadow-2xs transition-all ${
        isAlert
          ? "border-red-100 hover:border-red-200"
          : "border-gray-100 hover:border-gray-200"
      }`}
    >
      <div className="mb-4 flex items-center gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            isAlert
              ? "bg-red-50 text-red-600"
              : "bg-emerald-50 text-[#14833E]"
          }`}
        >
          {icon}
        </div>
        <h3 className="text-xl font-normal leading-7 text-gray-900">{title}</h3>
      </div>
      {children}
    </section>
  );
}

function TagPill({
  label,
  className = "bg-emerald-50/70 text-[#14833E] border-emerald-200/60",
}: {
  label: string;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex min-h-10 items-center rounded-full border px-3.5 py-1.5 text-lg font-normal leading-7 ${className}`}
    >
      {label}
    </span>
  );
}

function EmptyState({ label }: { label: string }) {
  return <p className="text-lg italic leading-7 text-gray-400">{label}</p>;
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
  const storesQuery = useGetManagedStoresQuery(undefined, { skip: !uuid });
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

  const targetStoreUuid = data?.storeUuid || data?.store?.uuid;
  const matchedStore = targetStoreUuid
    ? storesQuery.data?.find((s) => String(s.uuid || s.id) === String(targetStoreUuid))
    : null;

  const displayStoreName =
    data?.store?.storeName ||
    (data?.store as any)?.name ||
    (data?.store as any)?.localName ||
    matchedStore?.storeName ||
    matchedStore?.name ||
    matchedStore?.localName ||
    "—";

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

  const isDrink = Boolean(
    food &&
    isDrinkCategory(
      {
        uuid: food.categoryUuid || (food.category as any)?.uuid,
        code: food.categoryCode || (food.category as any)?.code,
        name: food.categoryName || (food.category as any)?.name || categoryName,
        parentCategoryUuid: food.parentCategoryUuid || (food.category as any)?.parentCategoryUuid,
      },
      categoriesQuery.data || [],
    ),
  );

  const hasNutritionValues = Boolean(
    food?.nutritionData &&
    (
      Number(food.nutritionData.calories) > 0 ||
      Number(food.nutritionData.fatGrams) > 0 ||
      Number(food.nutritionData.fiberGrams) > 0 ||
      Number(food.nutritionData.proteinGrams) > 0 ||
      Number(food.nutritionData.carbohydrateGrams ?? (food.nutritionData as any).carbsGrams) > 0
    )
  );

  return (
    <div className="fixed inset-0 z-[150] flex items-start justify-center overflow-y-auto bg-slate-950/55 px-4 py-6 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="my-4 flex w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-[0_28px_90px_rgba(15,23,42,0.24)] animate-in zoom-in-95 duration-150">

        {/* ─── HERO HEADER ──────────────────────────────────────────── */}
        <div className="relative shrink-0 overflow-hidden bg-gradient-to-r from-[#14833E] to-[#0F6D35] px-7 py-6 text-white">
          <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-white/[0.06]" />
          <div className="pointer-events-none absolute -bottom-24 right-40 h-44 w-44 rounded-full bg-white/[0.04]" />
          <div className="absolute right-5 top-5 z-10 flex items-center gap-2">
            {data && onEdit && (
              <button
                type="button"
                onClick={() => { onClose(); onEdit(data); }}
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 text-lg font-semibold text-white transition hover:bg-white/20"
              >
                <Pencil size={20} />
                <span>កែប្រែ</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white transition hover:bg-white/20"
            >
              <X size={20} />
            </button>
          </div>

          <div className="relative z-[1] flex items-center gap-5 pr-32">
            {/* Thumbnail */}
            <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-white/20 bg-white/15 shadow-lg">
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
              <p className="truncate text-3xl font-black leading-tight text-amber-300">
                {data?.name || "ព័ត៌មានម៉ឺនុយ"}
              </p>
              {data?.localName && data.localName !== data?.name && (
                <p className="mt-1 text-lg font-medium leading-7 text-white/75">{data.localName}</p>
              )}
              {data?.description && (
                <p className="mt-1.5 line-clamp-2 max-w-3xl text-lg leading-7 text-white/75">{data.description}</p>
              )}

              {/* Badges */}
              {data && (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {/* Price */}
                  <span className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/25 bg-white/20 px-3.5 py-2 text-lg font-bold text-white shadow-xs backdrop-blur-sm">
                    <DollarSign size={20} />
                    {Number(data.price ?? 0).toFixed(2)} {data.currencyCode || "USD"}
                  </span>

                  {/* Availability */}
                  <span className={`inline-flex min-h-10 items-center gap-2 rounded-xl border px-3.5 py-2 text-lg font-bold backdrop-blur-sm ${
                    isAvailable
                      ? "bg-emerald-500/30 border-emerald-300/40 text-white"
                      : "bg-red-500/30 border-red-300/40 text-white"
                  }`}>
                    <span className={`h-2 w-2 rounded-full ${isAvailable ? "bg-emerald-300" : "bg-red-300"}`} />
                    {isAvailable ? "មានលក់" : "អស់/បិទ"}
                  </span>

                  {/* Featured */}
                  {data.isFeatured && (
                    <span className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/20 bg-white/15 px-3.5 py-2 text-lg font-bold text-white backdrop-blur-sm">
                      ★ ពិសេស
                    </span>
                  )}

                  {/* Prep time */}
                  {data.preparationTimeMinutes != null && (
                    <span className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3.5 py-2 text-lg font-semibold text-white backdrop-blur-sm">
                      <Clock size={20} />
                      {data.preparationTimeMinutes} នាទី
                    </span>
                  )}

                  {/* Source */}
                  {data.source && (
                    <span className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3.5 py-2 text-lg font-semibold text-white/90 backdrop-blur-sm">
                      <Tag size={20} />
                      {data.source}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ─── BODY ─────────────────────────────────────────────────── */}
        <div className="flex-1 space-y-4 overflow-y-auto bg-[#F8FAF9] p-6">
          {isLoading ? (
            <div className="flex py-16 flex-col items-center justify-center gap-3">
              <Loader2 size={36} className="animate-spin text-[#14833E]" />
              <p className="text-lg font-medium text-gray-500">កំពុងទាញយកព័ត៌មាន...</p>
            </div>
          ) : isError ? (
            <div className="my-4 rounded-2xl bg-red-50 p-5 text-center text-lg font-semibold text-red-600">
              មិនអាចទាញយក Detail របស់ Menu Item នេះបានទេ។
            </div>
          ) : data ? (
            <>
              {/* ── Row 1: Store + Food Reference ─── */}
              <div className="grid gap-4 sm:grid-cols-2">
                <SectionCard icon={<Store size={20} />} title="ហាង">
                  <p className="text-xl font-bold leading-8 text-gray-900">
                    {displayStoreName}
                  </p>
                  {(data.store as any)?.city && (
                    <p className="mt-0.5 text-lg text-gray-600">📍 {(data.store as any).city}</p>
                  )}
                  {(data.store as any)?.province && (
                    <p className="text-lg text-gray-500">{(data.store as any).province}</p>
                  )}
                </SectionCard>

                <SectionCard icon={<Utensils size={20} />} title="មុខម្ហូបមេ (Food)">
                  <p className="text-xl font-bold leading-8 text-gray-900">
                    {food?.localName || food?.canonicalName || "—"}
                  </p>
                  {food?.canonicalName && food?.localName && food.canonicalName !== food.localName && (
                    <p className="text-lg text-gray-600 mt-0.5">{food.canonicalName}</p>
                  )}
                  {food?.categoryName && (
                    <p className="text-lg text-gray-500 mt-0.5">
                      ប្រភេទ: {extractKhmerOnlyName(food.categoryName)}
                    </p>
                  )}
                  {food?.cuisineName && (
                    <p className="text-lg text-gray-500">ម្ហូប: {food.cuisineName}</p>
                  )}
                </SectionCard>
              </div>

              {/* ── Row 2: Category + Cuisine from food ─── */}
              <div className="grid gap-4 sm:grid-cols-2">
                <SectionCard icon={<Layers size={20} />} title="ប្រភេទមុខម្ហូប">
                  <p className="text-xl font-bold leading-8 text-gray-900">
                    {food?.categoryName ? extractKhmerOnlyName(food.categoryName) : "—"}
                  </p>
                </SectionCard>

                <SectionCard icon={<Globe2 size={20} />} title="ម្ហូបតាមប្រទេស (Cuisine)">
                  <p className="text-xl font-bold leading-8 text-gray-900">
                    {food?.cuisineName || "—"}
                  </p>
                </SectionCard>
              </div>

              {/* ── Spice Level (Hide for Drinks or 0 Spice) ─── */}
              {food && !isDrink && spice > 0 && (
                <SectionCard icon={<Flame size={20} />} title="កម្រិតហឹរ">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="flex flex-1 gap-2">
                      {[1, 2, 3, 4, 5].map((lvl) => (
                        <span
                          key={lvl}
                          className={`h-3.5 flex-1 rounded-full ${lvl <= spice ? "bg-amber-500" : "bg-gray-200"}`}
                        />
                      ))}
                    </div>
                    <span className="text-lg font-bold leading-7 text-gray-800">
                      {SPICE_LABELS[spice] || `${spice} / 5`}
                    </span>
                  </div>
                </SectionCard>
              )}

              {/* ── Nutrition (Only show if actual nutrition values > 0 exist) ─── */}
              {hasNutritionValues && food?.nutritionData && (
                <SectionCard icon={<Activity size={20} />} title="សារធាតុចិញ្ចឹម (Nutrition)">
                  <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-5">
                    {[
                      { label: "កាឡូរី", value: food.nutritionData.calories, unit: "kcal" },
                      { label: "ខ្លាញ់", value: food.nutritionData.fatGrams, unit: "g" },
                      { label: "សរសៃ", value: food.nutritionData.fiberGrams, unit: "g" },
                      { label: "ប្រូតេអ៊ីន", value: food.nutritionData.proteinGrams, unit: "g" },
                      { label: "កាបូអ៊ីដ្រាត", value: food.nutritionData.carbohydrateGrams ?? food.nutritionData.carbsGrams, unit: "g" },
                    ].map((n) => (
                      <div key={n.label} className="rounded-2xl border border-gray-100 bg-gray-50/70 p-3.5 text-center">
                        <p className="text-base font-semibold leading-6 text-gray-500">{n.label}</p>
                        <p className="mt-1 text-xl font-bold leading-7 text-gray-900">
                          {n.value ?? 0} <span className="text-base font-medium text-gray-500">{n.unit}</span>
                        </p>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              )}

              {/* ── Meal Types + Age Rules ─── */}
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Meal Types from food */}
                <SectionCard icon={<Clock size={20} />} title="ពេលទទួលទាន (Meal Types)">
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(food?.mealTypes) && food.mealTypes.length > 0 ? (
                      food.mealTypes.map((m: any, idx: number) => (
                        <TagPill
                          key={idx}
                          label={m.name || m.localName || m.code || m.mealTypeName || "—"}
                        />
                      ))
                    ) : (
                      <EmptyState label="គ្រប់ពេល" />
                    )}
                  </div>
                </SectionCard>

                {/* Age Rules from food */}
                <SectionCard icon={<UsersRound size={20} />} title="ក្រុមអាយុ (Age Groups)">
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(food?.ageRules) && food.ageRules.length > 0 ? (
                      food.ageRules.map((a: any, idx: number) => (
                        <TagPill
                          key={idx}
                          label={a.name || a.localName || a.code || a.ageGroupName || "—"}
                          className={`${
                            a.ruleResult === "RESTRICTED"
                              ? "bg-red-50 text-red-700 border-red-200"
                              : a.ruleResult === "CAUTION"
                              ? "bg-amber-50 text-amber-800 border-amber-200"
                              : "bg-emerald-50/70 text-[#14833E] border-emerald-200/60"
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
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Seasons from food */}
                <SectionCard icon={<Calendar size={20} />} title="រដូវកាល (Seasons)">
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(food?.seasons) && food.seasons.length > 0 ? (
                      food.seasons.map((s: any, idx: number) => (
                        <TagPill
                          key={idx}
                          label={s.localName || s.name || s.code || "—"}
                        />
                      ))
                    ) : (
                      <EmptyState label="គ្រប់រដូវ" />
                    )}
                  </div>
                </SectionCard>

                {/* Weather from food */}
                <SectionCard icon={<CloudSun size={20} />} title="អាកាសធាតុ (Weather)">
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(food?.suitableWeather) && food.suitableWeather.length > 0 ? (
                      food.suitableWeather.map((w: any, idx: number) => (
                        <TagPill
                          key={idx}
                          label={w.localName || w.name || w.code || "—"}
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
                <SectionCard icon={<Sparkles size={20} />} title="ព្រឹត្តិការណ៍ (Events)">
                  <div className="flex flex-wrap gap-2">
                    {food.events.map((e: any, idx: number) => (
                      <TagPill
                        key={idx}
                        label={e.localName || e.name || e.code || "—"}
                      />
                    ))}
                  </div>
                </SectionCard>
              )}

              {/* ── Dietary Types (MenuItem-level or Food fallback) ─── */}
              <SectionCard icon={<Heart size={20} />} title="របបអាហារ (Dietary Types)">
                {Array.isArray(data.dietaryTypes) && data.dietaryTypes.length > 0 ? (
                  <div className="space-y-2.5">
                    {(data.dietaryTypes as any[]).map((dt: any, idx: number) => {
                      const dtName =
                        typeof dt === "string"
                          ? dt
                          : dt?.localName || dt?.name || dt?.dietaryTypeName || dt?.code || "—";
                      const vStatus = typeof dt === "object" ? dt?.verificationStatus : undefined;
                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/70 px-4 py-3"
                        >
                          <span className="text-lg font-semibold text-gray-800">{dtName}</span>
                          <span className={`rounded-lg px-3 py-1 text-base font-bold border ${
                            vStatus === "VERIFIED"
                              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                              : "bg-gray-100 border-gray-200 text-gray-600"
                          }`}>
                            {vStatus === "VERIFIED" ? "✓ បានផ្ទៀងផ្ទាត់" : "មិនទាន់ផ្ទៀងផ្ទាត់"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : Array.isArray(food?.dietaryTypes) && food.dietaryTypes.length > 0 ? (
                  <div className="space-y-2.5">
                    {(food.dietaryTypes as any[]).map((dt: any, idx: number) => {
                      const dtName =
                        typeof dt === "string"
                          ? dt
                          : dt?.localName || dt?.name || dt?.dietaryTypeName || dt?.code || "—";
                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/70 px-4 py-3"
                        >
                          <span className="text-lg font-semibold text-gray-800">{dtName}</span>
                          <span className="rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-1 text-base font-bold">
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
                <SectionCard icon={<ShieldAlert size={20} />} title="សារធាតុអាឡែស៊ី (Allergens)" variant="alert">
                  <div className="space-y-2.5">
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
                            className="flex items-center justify-between rounded-xl border border-red-100 bg-red-50/60 px-4 py-3"
                          >
                            <div className="flex items-center gap-2">
                              <AlertTriangle size={20} className="text-red-500 shrink-0" />
                              <span className="text-lg font-semibold text-red-900">{alName}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {dtype && (
                                <span className={`rounded-lg px-2.5 py-0.5 text-base font-bold ${
                                  dtype === "CONTAINS"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-amber-100 text-amber-700"
                                }`}>
                                  {dtype === "CONTAINS" ? "មាន" : "ប្រហែល"}
                                </span>
                              )}
                              {risk && (
                                <span className={`rounded-lg px-2.5 py-0.5 text-base font-bold ${
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
                            className="flex items-center justify-between rounded-xl border border-red-100 bg-red-50/60 px-4 py-3"
                          >
                            <div className="flex items-center gap-2">
                              <AlertTriangle size={20} className="text-red-500 shrink-0" />
                              <span className="text-lg font-semibold text-red-900">{alName}</span>
                            </div>
                            {risk && (
                              <span className={`rounded-lg px-2.5 py-0.5 text-base font-bold ${
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
                <SectionCard icon={<Sparkles size={20} />} title={`គ្រឿងផ្សំ (${data.ingredients.length})`}>
                  <div className="grid gap-2 sm:grid-cols-2">
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
                          className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/70 px-4 py-3"
                        >
                          <span className="text-lg font-semibold text-gray-800">
                            {igName}
                            {isOptional && (
                              <span className="ml-1 text-base text-gray-400 font-normal">(ជម្រើស)</span>
                            )}
                          </span>
                          {igQty && <span className="text-lg font-medium text-emerald-700">{igQty}</span>}
                        </div>
                      );
                    })}
                  </div>
                </SectionCard>
              )}

              {/* ── Ingredient Data Status ─── */}
              {data.ingredientDataStatus && (
                <SectionCard icon={<Info size={20} />} title="ស្ថានភាពទិន្នន័យគ្រឿងផ្សំ">
                  <span className={`rounded-xl px-3.5 py-1.5 text-lg font-bold border ${
                    data.ingredientDataStatus === "VERIFIED"
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                      : data.ingredientDataStatus === "COMPLETE"
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                      : data.ingredientDataStatus === "PARTIAL"
                      ? "bg-amber-50 text-amber-800 border-amber-200"
                      : "bg-gray-100 text-gray-600 border-gray-200"
                  }`}>
                    {data.ingredientDataStatus}
                  </span>
                </SectionCard>
              )}

              {/* ── Created / Updated timestamps ─── */}
              <div className="grid gap-4 sm:grid-cols-2">
                <SectionCard icon={<Calendar size={20} />} title="ថ្ងៃបង្កើត">
                  <p className="text-lg font-bold text-gray-800">{fmtDate(data.createdAt)}</p>
                </SectionCard>
                <SectionCard icon={<Calendar size={20} />} title="ថ្ងៃកែប្រែចុងក្រោយ">
                  <p className="text-lg font-bold text-gray-800">{fmtDate(data.updatedAt)}</p>
                </SectionCard>
              </div>

              {/* ── Gallery images ─── */}
              {images.length > 0 && (
                <SectionCard icon={<Info size={20} />} title={`រូបភាព (${images.length})`}>
                  <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 md:grid-cols-6">
                    {images.map((img, idx) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={idx}
                        src={resolveFoodHubCatalogImageUrl(img) || img}
                        alt={`Gallery ${idx + 1}`}
                        className="aspect-square w-full rounded-xl border border-gray-200 object-cover shadow-2xs transition duration-200 hover:scale-[1.03]"
                      />
                    ))}
                  </div>
                </SectionCard>
              )}
            </>
          ) : null}
        </div>

        {/* ─── FOOTER ───────────────────────────────────────────────── */}
        <div className="sticky bottom-0 z-10 flex shrink-0 items-center justify-end gap-3 border-t border-gray-100 bg-white/95 px-7 py-4 backdrop-blur">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-12 items-center rounded-full border border-gray-200 bg-white px-6 text-lg font-normal text-gray-700 transition hover:bg-gray-50"
          >
            បិទ
          </button>
          {data && onEdit && (
            <button
              type="button"
              onClick={() => { onClose(); onEdit(data); }}
              className="inline-flex h-12 items-center gap-2 rounded-full bg-[#14833E] px-7 text-lg font-normal text-white shadow-xs transition hover:bg-[#106C34] active:scale-[0.98]"
            >
              <Pencil size={20} />
              <span>កែប្រែព័ត៌មាន</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}