"use client";

import { useState } from "react";
import {
  Activity,
  AlertTriangle,
  Calendar,
  Clock,
  CloudSun,
  Flame,
  Globe2,
  Heart,
  Info,
  Layers,
  Loader2,
  MapPin,
  Pencil,
  ShieldAlert,
  Sparkles,
  Store,
  UsersRound,
  Utensils,
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
import {
  extractKhmerOnlyName,
  isDrinkCategory,
} from "@/src/lib/catalogCategoryHelper";

const SPICE_SHORT_LABELS: Record<number, string> = {
  0: "មិនហឹរ",
  1: "ហឹរតិច",
  2: "ហឹរមធ្យម",
  3: "ហឹរខ្លាំង",
  4: "ហឹរខ្លាំងណាស់",
  5: "ហឹរបំផុត",
};

export default function MenuItemDetailModal({
  uuid,
  onClose,
  onEdit,
}: {
  uuid: string | null;
  onClose: () => void;
  onEdit?: (item: any) => void;
}) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

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
                : [
                    data?.thumbnail ||
                      data?.imageUrl ||
                      data?.thumbnailMediaUuid,
                  ].filter(Boolean)
  ) as string[];

  const activeImage = images[selectedImageIndex] || images[0];
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
        (data?.name &&
          (f.canonicalName === data.name || f.localName === data.name)),
    )?.uuid;

  const catalogFood = foodUuid
    ? foodsQuery.data?.content?.find((f) => f.uuid === foodUuid)
    : null;
  const categoryName =
    rawFood?.categoryName ||
    rawFood?.category?.name ||
    (rawFood?.category as any)?.localName ||
    catalogFood?.categoryName ||
    catalogFood?.category?.name ||
    (catalogFood?.category as any)?.localName ||
    categoriesQuery.data?.find(
      (c) => c.uuid === (rawFood?.categoryUuid || catalogFood?.categoryUuid),
    )?.name;

  const cuisineName =
    rawFood?.cuisineName ||
    rawFood?.cuisine?.name ||
    (rawFood?.cuisine as any)?.localName ||
    catalogFood?.cuisineName ||
    catalogFood?.cuisine?.name ||
    (catalogFood?.cuisine as any)?.localName ||
    cuisinesQuery.data?.find(
      (c) => c.uuid === (rawFood?.cuisineUuid || catalogFood?.cuisineUuid),
    )?.name;

  const targetStoreUuid = data?.storeUuid || data?.store?.uuid;
  const matchedStore = targetStoreUuid
    ? storesQuery.data?.find(
        (s) => String(s.uuid || s.id) === String(targetStoreUuid),
      )
    : null;

  const displayStoreName =
    data?.store?.storeName ||
    (data?.store as any)?.name ||
    (data?.store as any)?.localName ||
    matchedStore?.storeName ||
    matchedStore?.name ||
    matchedStore?.localName ||
    "—";

  // A menu item carries its own copy of the attributes it was seeded with
  // from its food, so a store's version of a dish can differ. Read the
  // item's values first and only fall back to the canonical food for a
  // record created before the item owned them.
  const baseFood = catalogFood || rawFood;
  const food = baseFood || data
    ? {
        ...(baseFood ?? {}),
        categoryName,
        cuisineName,
        nutritionData:
          data?.nutritionData ??
          (data as any)?.nutrition ??
          baseFood?.nutritionData ??
          (baseFood as any)?.nutrition,
        mealTypes: data?.mealTypes ?? baseFood?.mealTypes ?? [],
        ageRules:
          data?.ageRules ?? baseFood?.ageRules ?? baseFood?.ageGroups ?? [],
        seasons: data?.seasons ?? baseFood?.seasons ?? [],
        suitableWeather:
          data?.suitableWeather ??
          baseFood?.suitableWeather ??
          baseFood?.weatherConditions ??
          [],
        events: data?.events ?? baseFood?.events ?? [],
        dietaryTypes:
          (data as any)?.foodDietaryTypes ??
          (Array.isArray(data?.dietaryTypes) ? data.dietaryTypes : undefined) ??
          baseFood?.dietaryTypes ??
          [],
        allergens: data?.allergenDeclarations ?? baseFood?.allergens ?? [],
      }
    : null;

  const spice =
    (data as any)?.spiceLevel ?? baseFood?.defaultSpiceLevel ?? 0;

  const prepTime =
    data?.preparationTimeMinutes != null
      ? `${data.preparationTimeMinutes} នាទី`
      : "15 នាទី";

  const calories = food?.nutritionData?.calories ?? 0;
  const priceDisplay =
    data?.price != null
      ? `$${Number(data.price).toFixed(2)}`
      : "";

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-[4px] animate-in fade-in duration-200">
      <div className="relative my-6 max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-[32px] bg-white p-6 shadow-[0_32px_80px_rgba(0,0,0,0.25)] sm:p-8 animate-in zoom-in-95 duration-200">
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
              {/* Left Column: Image Showcase & Store Card */}
              <div className="flex flex-col gap-3.5 lg:col-span-5 h-full">
                {/* Main Large Image */}
                <div className="relative flex-1 min-h-[360px] sm:min-h-[420px] w-full overflow-hidden rounded-3xl border border-gray-100 bg-gray-50 shadow-sm">
                  {activeImage ? (
                    <img
                      src={
                        resolveFoodHubCatalogImageUrl(activeImage) ||
                        activeImage
                      }
                      alt={data?.name || ""}
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
                    className={`grid w-full gap-2.5 shrink-0 ${
                      images.length === 2
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
                        className={`relative aspect-[4/3] w-full cursor-pointer overflow-hidden rounded-2xl border-2 transition ${
                          selectedImageIndex === idx
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

                {/* Store Info Card */}
                <div className="mt-1 flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50/70 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-[#14833E]">
                      <Store size={22} />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-gray-800">
                        {displayStoreName}
                      </p>
                      <p className="text-lg font-normal text-gray-400">
                        {(data.store as any)?.city ||
                          (data.store as any)?.province ||
                          "ហាងអាហារ"}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-lg font-normal text-emerald-700">
                    បើក
                  </span>
                </div>
              </div>

              {/* Right Column: Title, Price, Badges, Description, Stat Cards */}
              <div className="flex flex-col justify-between lg:col-span-7">
                <div className="space-y-4">
                  {/* Title & Price */}
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-3xl font-medium text-gray-800">
                        {data?.name || "ព័ត៌មានម៉ឺនុយ"}
                      </h2>
                      {data?.localName && data.localName !== data?.name && (
                        <p className="mt-1 text-lg font-normal text-gray-400">
                          {data.localName}
                        </p>
                      )}
                    </div>
                    {priceDisplay && (
                      <span className="shrink-0 text-3xl font-medium text-[#14833E]">
                        {priceDisplay}
                      </span>
                    )}
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-lg font-normal ${
                        !isAvailable
                          ? "border-gray-200 bg-gray-100 text-gray-600"
                          : "border-emerald-100 bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${
                          !isAvailable ? "bg-gray-400" : "bg-emerald-500"
                        }`}
                      />
                      {isAvailable ? "មានលក់" : "អស់/បិទ"}
                    </span>

                    {categoryName && (
                      <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3.5 py-1 text-lg font-normal text-emerald-700">
                        {extractKhmerOnlyName(categoryName)}
                      </span>
                    )}

                    {cuisineName && (
                      <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3.5 py-1 text-lg font-normal text-emerald-700">
                        {cuisineName}
                      </span>
                    )}

                    {data.isFeatured && (
                      <span className="rounded-full border border-amber-100 bg-amber-50 px-3.5 py-1 text-lg font-normal text-amber-700">
                        ★ ពិសេស
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
                      មិនមានការពិពណ៌នាអំពីម៉ឺនុយនេះទេ។
                    </p>
                  )}

                  {/* 4 Stat Cards */}
                  <div className="grid grid-cols-2 gap-3 pt-2 sm:grid-cols-4">
                    {/* Stat 1: Prep Time */}
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-gray-50/70 p-3.5 text-center">
                      <Clock size={22} className="text-[#14833E]" />
                      <p className="mt-1 text-lg font-medium text-gray-800">
                        {prepTime}
                      </p>
                      <p className="text-lg font-normal text-gray-400">
                        ពេលរៀបចំ
                      </p>
                    </div>

                    {/* Stat 2: Location/Distance */}
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-gray-50/70 p-3.5 text-center">
                      <MapPin size={22} className="text-[#14833E]" />
                      <p className="mt-1 max-w-full truncate text-lg font-medium text-gray-800">
                        {displayStoreName}
                      </p>
                      <p className="text-lg font-normal text-gray-400">
                        ចម្ងាយ / ហាង
                      </p>
                    </div>

                    {/* Stat 3: Spice Level */}
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
                      {Array.isArray(food?.dietaryTypes) &&
                      food.dietaryTypes.length > 0 ? (
                        (food.dietaryTypes as any[]).map(
                          (dt: any, idx: number) => {
                            const dtName =
                              typeof dt === "string"
                                ? dt
                                : dt?.localName ||
                                  dt?.name ||
                                  dt?.dietaryTypeName ||
                                  dt?.code ||
                                  "—";
                            return (
                              <span
                                key={idx}
                                className="rounded-full border border-emerald-100 bg-emerald-50 px-3.5 py-1 text-lg font-normal text-emerald-700"
                              >
                                {dtName}
                              </span>
                            );
                          },
                        )
                      ) : (
                        <p className="text-lg font-normal text-gray-400">
                          មិនមានទិន្នន័យរបបអាហារ។
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Allergen Declarations if any */}
                  {Array.isArray((data as any).allergenDeclarations) &&
                    (data as any).allergenDeclarations.length > 0 && (
                      <div className="pt-2">
                        <p className="text-lg font-normal text-red-500">
                          សារធាតុអាឡែស៊ី
                        </p>
                        <div className="mt-1.5 flex flex-wrap gap-2">
                          {((data as any).allergenDeclarations as any[]).map(
                            (al: any, idx: number) => {
                              const alName =
                                typeof al === "string"
                                  ? al
                                  : al?.localName ||
                                    al?.name ||
                                    al?.allergenName ||
                                    al?.code ||
                                    "—";
                              return (
                                <span
                                  key={idx}
                                  className="rounded-full border border-red-100 bg-red-50 px-3.5 py-1 text-lg font-normal text-red-700"
                                >
                                  ⚠️ {alName}
                                </span>
                              );
                            },
                          )}
                        </div>
                      </div>
                    )}
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
                  {Array.isArray(food?.mealTypes) &&
                  food.mealTypes.length > 0 ? (
                    (food.mealTypes as any[]).map((m: any, idx: number) => (
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
                  {Array.isArray(food?.ageRules) &&
                  food.ageRules.length > 0 ? (
                    (food.ageRules as any[]).map((a: any, idx: number) => (
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
                  {Array.isArray(food?.seasons) &&
                    (food.seasons as any[]).map((s: any, idx: number) => (
                      <span
                        key={`s-${idx}`}
                        className="rounded-xl bg-white px-2.5 py-1 text-lg font-normal text-gray-700 border border-gray-100"
                      >
                        {s.localName || s.name || s.code}
                      </span>
                    ))}
                  {Array.isArray(food?.suitableWeather) &&
                    (food.suitableWeather as any[]).map((w: any, idx: number) => (
                      <span
                        key={`w-${idx}`}
                        className="rounded-xl bg-white px-2.5 py-1 text-lg font-normal text-gray-700 border border-gray-100"
                      >
                        {w.localName || w.name || w.code}
                      </span>
                    ))}
                  {(!food?.seasons || food.seasons.length === 0) &&
                    (!food?.suitableWeather ||
                      food.suitableWeather.length === 0) && (
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
                  {Array.isArray(food?.events) && food.events.length > 0 ? (
                    (food.events as any[]).map((e: any, idx: number) => (
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