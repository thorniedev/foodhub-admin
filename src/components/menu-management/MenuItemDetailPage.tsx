"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Calendar,
  ChevronRight,
  Clock,
  CloudSun,
  Flame,
  Globe2,
  Heart,
  Layers,
  Loader2,
  MapPin,
  Pencil,
  ShieldAlert,
  Sparkles,
  Star,
  Store,
  UsersRound,
  Utensils,
} from "lucide-react";

import {
  useGetPublishedMenuItemDetailQuery,
  useGetManagedFoodsQuery,
  useGetManagedFoodCategoriesQuery,
  useGetManagedCuisinesQuery,
  useGetManagedStoresQuery,
  useGetManagedIngredientsQuery,
  useUpdateStoreMenuItemMutation,
} from "@/src/app/store/menuManagementApi";
import { useGetDietaryTypesQuery } from "@/src/app/store/dietaryTypeApi";
import { useGetAllergensQuery } from "@/src/app/store/allergenApi";
import { useGetMealTypesQuery } from "@/src/app/store/mealTypeApi";
import { useGetAgeGroupsQuery } from "@/src/app/store/ageGroupApi";
import { useGetManagedSeasonsQuery } from "@/src/app/store/menuManagementApi";
import { useGetWeatherConditionsQuery } from "@/src/app/store/weatherConditionApi";
import { useGetManagedEventsQuery } from "@/src/app/store/menuManagementApi";
import { useGetMedicalConditionsQuery } from "@/src/app/store/medicalConditionApi";
import { resolveFoodHubCatalogImageUrl } from "@/src/lib/resolveFoodHubImageUrl";
import { extractKhmerOnlyName } from "@/src/lib/catalogCategoryHelper";
import {
  readFoodRelationsStorage,
  readMenuItemRelationsStorage,
} from "@/src/lib/filterCatalogStorage";
import PublishMenuItemModal from "./PublishMenuItemModal";
import type { MenuItemWritePayload } from "@/src/types/menu-management";

const SPICE_SHORT_LABELS: Record<number, string> = {
  0: "មិនហឹរ",
  1: "ហឹរតិច",
  2: "ហឹរមធ្យម",
  3: "ហឹរខ្លាំង",
  4: "ហឹរខ្លាំងណាស់",
  5: "ហឹរបំផុត",
};

export default function MenuItemDetailPage({ uuid }: { uuid: string }) {
  const router = useRouter();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const { data, isLoading, isError, refetch } =
    useGetPublishedMenuItemDetailQuery(uuid, { skip: !uuid });

  const categoriesQuery = useGetManagedFoodCategoriesQuery();
  const cuisinesQuery = useGetManagedCuisinesQuery();
  const storesQuery = useGetManagedStoresQuery(undefined, { skip: !uuid });
  const foodsQuery = useGetManagedFoodsQuery({ size: 100 }, { skip: !uuid });
  const ingredientsQuery = useGetManagedIngredientsQuery(undefined, {
    skip: !uuid,
  });
  const dietaryTypesQuery = useGetDietaryTypesQuery({ size: 100 }, { skip: !uuid });
  const allergensQuery = useGetAllergensQuery({ size: 100 }, { skip: !uuid });
  const mealTypesQuery = useGetMealTypesQuery({ size: 100 }, { skip: !uuid });
  const ageGroupsQuery = useGetAgeGroupsQuery({ size: 100 }, { skip: !uuid });
  const seasonsQuery = useGetManagedSeasonsQuery();
  const weatherConditionsQuery = useGetWeatherConditionsQuery({ size: 100 }, { skip: !uuid });
  const eventsQuery = useGetManagedEventsQuery();
  const medicalConditionsQuery = useGetMedicalConditionsQuery({ size: 100 }, { skip: !uuid });

  const [updateMenuItem, { isLoading: updatingMenuItem }] =
    useUpdateStoreMenuItemMutation();

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
  const storedFood = foodUuid ? readFoodRelationsStorage(foodUuid) : null;
  const storedMenuItem = uuid ? readMenuItemRelationsStorage(uuid) : null;

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

  const srvNut =
    catalogFood?.nutritionData ??
    (catalogFood as any)?.nutrition ??
    rawFood?.nutritionData ??
    rawFood?.nutrition;
  const storedNut = storedFood?.nutritionData ?? storedFood?.nutrition;
  const srvHasNutrition = !!(
    srvNut &&
    (Number(srvNut.calories) > 0 ||
      Number(srvNut.proteinGrams ?? srvNut.protein) > 0 ||
      Number(srvNut.carbohydrateGrams ?? srvNut.carbs) > 0 ||
      Number(srvNut.fatGrams ?? srvNut.fat) > 0 ||
      Number(srvNut.fiberGrams ?? srvNut.fiber) > 0)
  );

  const baseFood = catalogFood || rawFood;
  const food = baseFood
    ? {
      ...baseFood,
      categoryName,
      cuisineName,
      nutritionData: srvHasNutrition ? srvNut : (storedNut ?? srvNut),
      mealTypes:
        storedFood?.mealTypes !== undefined
          ? storedFood.mealTypes
          : (baseFood.mealTypes ?? []),
      ageRules:
        storedFood?.ageRules !== undefined
          ? storedFood.ageRules
          : storedFood?.ageGroups !== undefined
            ? storedFood.ageGroups
            : (baseFood.ageRules ?? baseFood.ageGroups ?? []),
      seasons:
        storedFood?.seasons !== undefined
          ? storedFood.seasons
          : (baseFood.seasons ?? []),
      suitableWeather:
        storedFood?.suitableWeather !== undefined
          ? storedFood.suitableWeather
          : storedFood?.weatherConditions !== undefined
            ? storedFood.weatherConditions
            : (baseFood.suitableWeather ?? baseFood.weatherConditions ?? []),
      events:
        storedFood?.events !== undefined
          ? storedFood.events
          : (baseFood.events ?? []),
      dietaryTypes:
        storedMenuItem?.dietaryTypes !== undefined
          ? storedMenuItem.dietaryTypes
          : data?.dietaryTypes !== undefined &&
            Array.isArray(data.dietaryTypes)
            ? data.dietaryTypes
            : storedFood?.dietaryTypes !== undefined
              ? storedFood.dietaryTypes
              : (baseFood.dietaryTypes ?? []),
      allergens:
        storedFood?.allergens !== undefined
          ? storedFood.allergens
          : (baseFood.allergens ?? []),
    }
    : null;

  const spice =
    food?.defaultSpiceLevel ?? (storedFood as any)?.defaultSpiceLevel ?? 0;

  const prepTime =
    data?.preparationTimeMinutes != null
      ? `${data.preparationTimeMinutes} នាទី`
      : "15 នាទី";

  const calories = food?.nutritionData?.calories ?? 0;
  const priceDisplay =
    data?.price != null ? `$${Number(data.price).toFixed(2)}` : "";

  const handleSaveEdit = async (
    storeUuid: string,
    payload: MenuItemWritePayload,
    images: File[],
  ) => {
    if (!data?.uuid && !uuid) return;
    try {
      await updateMenuItem({
        uuid: data?.uuid || uuid,
        storeUuid: storeUuid || targetStoreUuid || undefined,
        payload,
        images: images || [],
      }).unwrap();
      setEditModalOpen(false);
      void refetch();
    } catch {
      // handled by modal
    }
  };

  return (
    <div className="w-full min-w-0 max-w-full space-y-6 pb-16">
      {/* Top Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/menu-items"
          className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-gray-200 bg-white px-6 text-xl font-normal text-gray-700 shadow-sm transition hover:border-primary-600 hover:bg-primary-50 hover:text-primary-800"
        >
          <ArrowLeft size={20} />
          <span>ត្រឡប់ក្រោយ</span>
        </Link>

        {data && (
          <button
            type="button"
            onClick={() => setEditModalOpen(true)}
            className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-[#14833E] px-6 text-xl font-normal text-white shadow-sm transition hover:bg-[#0f6b32]"
          >
            <Pencil size={20} />
            <span>កែប្រែ</span>
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 rounded-3xl border border-gray-100 bg-white py-20 shadow-sm">
          <Loader2 size={44} className="animate-spin text-[#14833E]" />
          <p className="text-xl font-normal text-gray-500">
            កំពុងទាញយកព័ត៌មានលម្អិតម៉ឺនុយ...
          </p>
        </div>
      ) : isError || !data ? (
        <div className="rounded-3xl border border-red-100 bg-red-50 p-8 text-center text-xl font-normal text-red-600 shadow-sm">
          មិនអាចទាញយកព័ត៌មានលម្អិតរបស់ម៉ឺនុយនេះបានទេ។
        </div>
      ) : (
        <div className="space-y-6 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
          {/* 2-Column Showcase */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Left Column: Image Showcase */}
            <div className="flex flex-col gap-4 lg:col-span-5">
              {/* Main Large Image */}
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl border border-gray-100 bg-gray-50 shadow-sm">
                {activeImage ? (
                  <img
                    src={
                      resolveFoodHubCatalogImageUrl(activeImage) || activeImage
                    }
                    alt={data?.name || ""}
                    className="h-full w-full object-cover transition duration-300"
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
                  className={`grid w-full gap-3 ${images.length === 2
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

            {/* Right Column: Title, Price, Badges, Description, Stat Cards, Store Card */}
            <div className="flex flex-col justify-between space-y-4 lg:col-span-7">
              <div className="space-y-4">
                {/* Title & Price */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-medium text-gray-800">
                      {data?.name || "ព័ត៌មានម៉ឺនុយ"}
                    </h1>
                    {data?.localName && data.localName !== data?.name && (
                      <p className="mt-1 text-xl font-normal text-gray-400">
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
                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-1 text-lg font-normal ${!isAvailable
                      ? "border-gray-200 bg-gray-100 text-gray-600"
                      : "border-emerald-100 bg-emerald-50 text-emerald-700"
                      }`}
                  >
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${!isAvailable ? "bg-gray-400" : "bg-emerald-500"
                        }`}
                    />
                    {isAvailable ? "មានលក់" : "អស់/បិទ"}
                  </span>

                  {categoryName && (
                    <span className="rounded-full border border-emerald-100 bg-emerald-50 px-4 py-1 text-lg font-normal text-emerald-700">
                      {extractKhmerOnlyName(categoryName)}
                    </span>
                  )}

                  {cuisineName && (
                    <span className="rounded-full border border-emerald-100 bg-emerald-50 px-4 py-1 text-lg font-normal text-emerald-700">
                      {cuisineName}
                    </span>
                  )}

                  {data.isFeatured && (
                    <span className="rounded-full border border-amber-100 bg-amber-50 px-4 py-1 text-lg font-normal text-amber-700">
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
                  <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-gray-50/70 p-4 text-center">
                    <Clock size={24} className="text-[#14833E]" />
                    <p className="mt-1.5 text-xl font-medium text-gray-800">
                      {prepTime}
                    </p>
                    <p className="text-lg font-normal text-gray-400">
                      ពេលរៀបចំ
                    </p>
                  </div>

                  {/* Stat 2: Distance / Store */}
                  <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-gray-50/70 p-4 text-center">
                    <MapPin size={24} className="text-[#14833E]" />
                    <p className="mt-1.5 max-w-full truncate text-xl font-medium text-gray-800">
                      {displayStoreName}
                    </p>
                    <p className="text-lg font-normal text-gray-400">
                      ចម្ងាយ / ហាង
                    </p>
                  </div>

                  {/* Stat 3: Spice */}
                  <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-gray-50/70 p-4 text-center">
                    <Flame
                      size={24}
                      className={
                        spice > 0 ? "text-amber-500" : "text-[#14833E]"
                      }
                    />
                    <p className="mt-1.5 text-xl font-medium text-gray-800">
                      {SPICE_SHORT_LABELS[spice] || `${spice} កម្រិត`}
                    </p>
                    <p className="text-lg font-normal text-gray-400">
                      កម្រិតហឹរ
                    </p>
                  </div>

                  {/* Stat 4: Calories */}
                  <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-gray-50/70 p-4 text-center">
                    <Activity size={24} className="text-[#14833E]" />
                    <p className="mt-1.5 text-xl font-medium text-gray-800">
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
                              className="rounded-full border border-emerald-100 bg-emerald-50 px-4 py-1 text-lg font-normal text-emerald-700"
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

                {/* Allergen Declarations */}
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
                                className="rounded-full border border-red-100 bg-red-50 px-4 py-1 text-lg font-normal text-red-700"
                              >
                                ⚠️ {alName}
                              </span>
                            );
                          },
                        )}
                      </div>
                    </div>
                  )}

                {/* Store Info Card (Positioned in Right Column) */}
                <div className="pt-2">
                  {targetStoreUuid ? (
                    <Link
                      href={`/shops/${targetStoreUuid}`}
                      className="group flex items-center justify-between rounded-3xl border border-gray-100 bg-gray-50/80 p-4.5 transition hover:border-primary-300 hover:bg-primary-50/50"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-primary-800 transition group-hover:bg-primary-200">
                          <Store size={24} />
                        </div>
                        <div>
                          <p className="text-xl font-medium text-gray-800 transition group-hover:text-primary-900">
                            {displayStoreName}
                          </p>
                          <p className="flex items-center gap-1 text-lg font-normal text-gray-500">
                            <MapPin size={16} className="text-primary-700 shrink-0" />
                            <span>
                              {(data.store as any)?.city ||
                                (data.store as any)?.province ||
                                "ហាងអាហារ"}
                            </span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-lg font-normal text-primary-800">
                        <span>មើលហាង</span>
                        <ChevronRight size={18} />
                      </div>
                    </Link>
                  ) : (
                    <div className="flex items-center gap-3.5 rounded-3xl border border-gray-100 bg-gray-50/80 p-4.5">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-primary-800">
                        <Store size={24} />
                      </div>
                      <div>
                        <p className="text-xl font-medium text-gray-800">
                          {displayStoreName}
                        </p>
                        <p className="text-lg font-normal text-gray-500">
                          ហាងអាហារ
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Classification Sections */}
          <div className="grid grid-cols-1 gap-4 pt-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Meal Time */}
            <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-4">
              <div className="flex items-center gap-2 text-gray-400">
                <Clock size={18} className="text-[#14833E]" />
                <span className="text-lg font-normal">ពេលទទួលទាន</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {Array.isArray(food?.mealTypes) &&
                  food.mealTypes.length > 0 ? (
                  (food.mealTypes as any[]).map((m: any, idx: number) => (
                    <span
                      key={idx}
                      className="rounded-full border border-gray-100 bg-white px-3.5 py-1 text-lg font-normal text-gray-700 shadow-2xs"
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
              <div className="mt-2 flex flex-wrap gap-2">
                {Array.isArray(food?.ageRules) &&
                  food.ageRules.length > 0 ? (
                  (food.ageRules as any[]).map((a: any, idx: number) => (
                    <span
                      key={idx}
                      className="rounded-full border border-gray-100 bg-white px-3.5 py-1 text-lg font-normal text-gray-700 shadow-2xs"
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
              <div className="mt-2 flex flex-wrap gap-2">
                {Array.isArray(food?.seasons) &&
                  (food.seasons as any[]).map((s: any, idx: number) => (
                    <span
                      key={`s-${idx}`}
                      className="rounded-full border border-gray-100 bg-white px-3.5 py-1 text-lg font-normal text-gray-700 shadow-2xs"
                    >
                      {s.localName || s.name || s.code}
                    </span>
                  ))}
                {Array.isArray(food?.suitableWeather) &&
                  (food.suitableWeather as any[]).map((w: any, idx: number) => (
                    <span
                      key={`w-${idx}`}
                      className="rounded-full border border-gray-100 bg-white px-3.5 py-1 text-lg font-normal text-gray-700 shadow-2xs"
                    >
                      {w.localName || w.name || w.code}
                    </span>
                  ))}
                {(!food?.seasons || food.seasons.length === 0) &&
                  (!food?.suitableWeather ||
                    food.suitableWeather.length === 0) && (
                    <span className="text-lg font-normal text-gray-400">
                      គ្រប់រដូវកាល
                    </span>
                  )}
              </div>
            </div>

            {/* Events */}
            <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-4">
              <div className="flex items-center gap-2 text-gray-400">
                <Sparkles size={18} className="text-[#14833E]" />
                <span className="text-lg font-normal">ព្រឹត្តិការណ៍</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {Array.isArray(food?.events) && food.events.length > 0 ? (
                  (food.events as any[]).map((e: any, idx: number) => (
                    <span
                      key={idx}
                      className="rounded-full border border-gray-100 bg-white px-3.5 py-1 text-lg font-normal text-gray-700 shadow-2xs"
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
        </div>
      )}

      {/* Edit Modal */}
      {data && (
        <PublishMenuItemModal
          open={editModalOpen}
          item={data}
          foods={foodsQuery.data?.content ?? []}
          stores={storesQuery.data ?? []}
          ingredients={ingredientsQuery.data ?? []}
          dietaryTypes={
            dietaryTypesQuery.data?.contents ??
            (Array.isArray(dietaryTypesQuery.data)
              ? dietaryTypesQuery.data
              : [])
          }
          allergens={
            allergensQuery.data?.contents ??
            (Array.isArray(allergensQuery.data) ? allergensQuery.data : [])
          }
          mealTypes={
            mealTypesQuery.data?.contents ??
            (Array.isArray(mealTypesQuery.data) ? mealTypesQuery.data : [])
          }
          ageGroups={
            ageGroupsQuery.data?.contents ??
            (Array.isArray(ageGroupsQuery.data) ? ageGroupsQuery.data : [])
          }
          seasons={
            Array.isArray(seasonsQuery.data)
              ? seasonsQuery.data
              : (seasonsQuery.data as any)?.contents ?? []
          }
          weatherConditions={
            weatherConditionsQuery.data?.contents ??
            (Array.isArray(weatherConditionsQuery.data)
              ? weatherConditionsQuery.data
              : [])
          }
          events={
            Array.isArray(eventsQuery.data)
              ? eventsQuery.data
              : (eventsQuery.data as any)?.contents ?? []
          }
          medicalConditions={
            medicalConditionsQuery.data?.contents ??
            (Array.isArray(medicalConditionsQuery.data)
              ? medicalConditionsQuery.data
              : [])
          }
          saving={updatingMenuItem}
          onClose={() => setEditModalOpen(false)}
          onSubmit={handleSaveEdit}
        />
      )}
    </div>
  );
}
