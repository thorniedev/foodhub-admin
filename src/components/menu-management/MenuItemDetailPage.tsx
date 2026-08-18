"use client";

import {
  AlertCircle,
  Apple,
  ArrowLeft,
  ChevronRight,
  Clock,
  Flame,
  Heart,
  Loader2,
  MapPin,
  MessageSquare,
  Share2,
  Star,
  Store,
  UtensilsCrossed,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useGetPublishedMenuItemDetailQuery } from "@/src/app/store/menuManagementApi";
import { resolveFoodHubCatalogImageUrl } from "@/src/lib/resolveFoodHubImageUrl";

export default function MenuItemDetailPage({ uuid }: { uuid: string }) {
  const router = useRouter();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);

  const { data, isLoading, isError } = useGetPublishedMenuItemDetailQuery(
    uuid ?? "",
    {
      skip: !uuid,
    },
  );

  if (isLoading) {
    return (
      <div className="flex min-h-[500px] flex-col items-center justify-center gap-3">
        <Loader2 size={40} className="animate-spin text-[#137A3D]" />
        <p className="text-lg font-semibold text-gray-500">
          កំពុងទាញយកព័ត៌មានលម្អិត...
        </p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-lg font-bold text-[#137A3D] hover:underline"
        >
          <ArrowLeft size={22} />
          ត្រឡប់ក្រោយ
        </button>
        <div className="mt-6 rounded-3xl bg-red-50 p-8 text-center text-xl font-semibold text-red-600">
          មិនអាចទាញយកព័ត៌មានលម្អិតរបស់ Menu Item នេះបានទេ។ សូមព្យាយាមម្តងទៀត។
        </div>
      </div>
    );
  }

  // Extract gallery images
  const rawList = (
    data?.primaryMediaUrls?.length
      ? data.primaryMediaUrls
      : data?.images?.length
        ? data.images
        : data?.gallery?.length
          ? data.gallery
          : data?.primaryMediaUuids?.length
            ? data.primaryMediaUuids
            : (data as any)?.primaryMediaUuid
              ? [(data as any).primaryMediaUuid]
              : data?.thumbnailMediaUuid
                ? [data.thumbnailMediaUuid]
                : data?.food?.primaryMediaUrls?.length
                  ? data.food.primaryMediaUrls
                  : data?.food?.images?.length
                    ? data.food.images
                    : data?.food?.primaryMediaUuids?.length
                      ? data.food.primaryMediaUuids
                      : (data?.food as any)?.primaryMediaUuid
                        ? [(data?.food as any).primaryMediaUuid]
                        : [
                            data?.thumbnail,
                            data?.imageUrl,
                            data?.food?.thumbnail,
                            data?.food?.imageUrl,
                          ].filter(Boolean)
  ) as string[];

  const images = rawList
    .map((img) => resolveFoodHubCatalogImageUrl(img))
    .filter(Boolean) as string[];

  const activeImage = images[selectedImageIndex] || images[0];

  const getAvailabilityText = (status?: string | null) => {
    switch ((status || "AVAILABLE").toUpperCase()) {
      case "AVAILABLE":
        return "មានលក់";
      case "UNAVAILABLE":
        return "មិនមានលក់";
      case "SOLD_OUT":
        return "អស់ស្តុក";
      case "HIDDEN":
        return "លាក់ទុក";
      default:
        return status || "មានលក់";
    }
  };

  const getSpiceLevelText = (level?: number | null) => {
    if (level === 0) return "មិនហឹរ";
    if (level === 1) return "ហឹរតិច";
    if (level === 2) return "ហឹរមធ្យម";
    if (level === 3) return "ហឹរខ្លាំង";
    return "ហឹរតិច";
  };

  const storeName =
    data.store?.storeName ||
    data.store?.name ||
    data.store?.localName ||
    "Kungfu Kitchen 家常便饭 (IFL)";

  const storeCity = data.store?.city || data.store?.province;
  const storeAddress = storeCity
    ? `ទីតាំង: ${storeCity}`
    : "135E St 259, Phnom Penh 12157, Cambodia";

  const nutrition = data.food?.nutritionData;
  const calories = nutrition?.calories ?? 10;
  const protein = nutrition?.proteinGrams ?? 10;
  const carbs = nutrition?.carbohydrateGrams ?? nutrition?.carbsGrams;
  const fat = nutrition?.fatGrams ?? 10;

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-12">
      {/* Back Button */}
      <div>
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xl font-bold text-[#137A3D] transition hover:bg-emerald-50 hover:underline"
        >
          <ArrowLeft size={24} />
          ត្រឡប់ក្រោយ
        </button>
      </div>

      {/* =====================================================
          TOP HERO CARD
      ====================================================== */}
      <div className="overflow-hidden rounded-[32px] border border-gray-100/90 bg-white p-6 shadow-sm sm:p-8">
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Left Column: Image & Gallery (5 Cols) */}
          <div className="lg:col-span-5">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[26px] bg-emerald-50/40 shadow-inner sm:aspect-square">
              {activeImage ? (
                <img
                  src={activeImage}
                  alt={data.name}
                  className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-7xl text-emerald-200">
                  🍜
                </div>
              )}

              {data.isFeatured && (
                <div className="absolute left-4 top-4 rounded-full bg-white/95 px-4 py-1.5 text-lg font-bold text-[#137A3D] shadow-md backdrop-blur-md">
                  មុខម្ហូបពេញនិយម
                </div>
              )}
            </div>

            {/* Gallery Thumbnails */}
            {images.length > 0 && (
              <div className="mt-4 grid grid-cols-4 gap-3">
                {images.slice(0, 4).map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative aspect-square overflow-hidden rounded-2xl border-2 transition ${
                      selectedImageIndex === idx
                        ? "border-[#137A3D] ring-2 ring-emerald-100"
                        : "border-gray-200 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Gallery ${idx + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Information & Actions (7 Cols) */}
          <div className="flex flex-col justify-between lg:col-span-7">
            <div>
              {/* Header Title & Price */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-3xl font-black text-gray-900 sm:text-4xl">
                    {data.name}
                  </p>
                  <p className="mt-1 text-lg font-semibold text-gray-500">
                    {data.food?.localName || data.food?.canonicalName || data.name}
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  <span className="text-3xl font-black text-[#137A3D] sm:text-4xl">
                    ${Number(data.price ?? 0).toFixed(2)}
                  </span>
                  {data.currencyCode && data.currencyCode !== "USD" && (
                    <span className="ml-1.5 text-lg font-bold text-gray-500">
                      {data.currencyCode}
                    </span>
                  )}
                </div>
              </div>

              {/* Badges Row */}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-emerald-50 px-4 py-1.5 text-lg font-bold text-emerald-800 ring-1 ring-emerald-200/60">
                  {getAvailabilityText(data.availabilityStatus)}
                </span>
                <span className="rounded-full bg-teal-50 px-4 py-1.5 text-lg font-bold text-teal-800 ring-1 ring-teal-200/60">
                  Food
                </span>
                {(data.food?.cuisine?.name ||
                  data.food?.cuisineName ||
                  data.food?.categoryName) && (
                  <span className="rounded-full bg-emerald-50 px-4 py-1.5 text-lg font-bold text-emerald-800 ring-1 ring-emerald-200/60">
                    {data.food?.cuisine?.name ||
                      data.food?.cuisineName ||
                      data.food?.categoryName ||
                      "ម្ហូបខ្មែរ"}
                  </span>
                )}
                {data.ingredientDataStatus && (
                  <span className="rounded-full bg-blue-50 px-4 py-1.5 text-lg font-bold text-blue-800 ring-1 ring-blue-200/60">
                    {data.ingredientDataStatus}
                  </span>
                )}
              </div>

              {/* Description */}
              {data.description && (
                <p className="mt-4 text-lg leading-relaxed text-gray-600">
                  {data.description}
                </p>
              )}

              {/* 4 Metric Cards */}
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {/* 1. Prep Time */}
                <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-gray-50/80 p-4 text-center shadow-sm">
                  <Clock size={24} className="text-emerald-700" />
                  <span className="mt-1.5 text-xl font-black text-gray-900">
                    {data.preparationTimeMinutes ?? 10} min
                  </span>
                  <span className="text-lg font-medium text-gray-500">
                    ពេលរៀបចំ
                  </span>
                </div>

                {/* 2. Distance */}
                <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-gray-50/80 p-4 text-center shadow-sm">
                  <MapPin size={24} className="text-emerald-700" />
                  <span className="mt-1.5 text-xl font-black text-gray-900">
                    N/A
                  </span>
                  <span className="text-lg font-medium text-gray-500">
                    ចម្ងាយ
                  </span>
                </div>

                {/* 3. Spice Level */}
                <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-gray-50/80 p-4 text-center shadow-sm">
                  <Flame size={24} className="text-emerald-700" />
                  <span className="mt-1.5 text-xl font-black text-gray-900">
                    {getSpiceLevelText(data.food?.defaultSpiceLevel)}
                  </span>
                  <span className="text-lg font-medium text-gray-500">
                    កម្រិតហឹរ
                  </span>
                </div>

                {/* 4. Calories */}
                <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-gray-50/80 p-4 text-center shadow-sm">
                  <Apple size={24} className="text-emerald-700" />
                  <span className="mt-1.5 text-xl font-black text-gray-900">
                    {calories} kcal
                  </span>
                  <span className="text-lg font-medium text-gray-500">
                    កាឡូរី
                  </span>
                </div>
              </div>

              {/* Dietary Types */}
              <div className="mt-5">
                <span className="text-lg font-bold text-gray-500">
                  របបអាហារ
                </span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {Array.isArray(data.dietaryTypes) &&
                  data.dietaryTypes.length > 0 ? (
                    data.dietaryTypes.map((dt: any, idx: number) => (
                      <span
                        key={idx}
                        className="rounded-full bg-[#137A3D] px-4 py-1.5 text-lg font-bold text-white shadow-sm"
                      >
                        {dt.name || dt.code || dt.dietaryTypeUuid}
                      </span>
                    ))
                  ) : (
                    <span className="rounded-full bg-[#137A3D] px-4 py-1.5 text-lg font-bold text-white shadow-sm">
                      សូដ្យូមទាប
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setIsSaved(!isSaved)}
                className={`inline-flex items-center gap-2 rounded-full px-7 py-3 text-lg font-bold shadow-sm transition ${
                  isSaved
                    ? "bg-[#137A3D] text-white"
                    : "bg-[#137A3D] text-white hover:bg-[#0f6331]"
                }`}
              >
                <Heart
                  size={20}
                  className={isSaved ? "fill-white text-white" : ""}
                />
                រក្សាទុក
              </button>

              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-white px-6 py-3 text-lg font-bold text-[#137A3D] shadow-sm transition hover:bg-emerald-50/50"
              >
                <MapPin size={20} className="text-emerald-700" />
                មើលទីតាំង
              </button>

              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-white px-6 py-3 text-lg font-bold text-[#137A3D] shadow-sm transition hover:bg-emerald-50/50"
              >
                <Share2 size={20} className="text-emerald-700" />
                ចែករំលែក
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          STORE CARD
      ====================================================== */}
      <div className="flex flex-col items-start justify-between gap-4 rounded-[28px] border border-gray-100/90 bg-white p-6 shadow-sm sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-2xl text-emerald-800">
            <Store size={32} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-2xl font-black text-gray-900">
                {storeName}
              </p>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-lg font-bold text-emerald-800">
                បើក
              </span>
            </div>
            <p className="mt-1 flex items-center gap-1.5 text-lg text-gray-500 font-medium">
              <MapPin size={18} className="text-emerald-700" />
              {storeAddress}
            </p>
          </div>
        </div>

        <div className="flex w-full flex-wrap items-center justify-between gap-3 sm:w-auto sm:justify-end">
          <div className="flex items-center gap-2 rounded-2xl border border-gray-100 bg-gray-50/70 px-4 py-2.5">
            <Star size={20} className="fill-amber-400 text-amber-400" />
            <div className="text-left">
              <p className="text-lg font-black text-gray-900">0.0</p>
              <p className="text-lg text-gray-500">ការវាយតម្លៃ</p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-2xl border border-gray-100 bg-gray-50/70 px-4 py-2.5">
            <MessageSquare size={20} className="text-emerald-700" />
            <div className="text-left">
              <p className="text-lg font-black text-gray-900">0</p>
              <p className="text-lg text-gray-500">មតិយោបល់</p>
            </div>
          </div>

          {data.storeUuid ? (
            <Link
              href={`/shops/${data.storeUuid}`}
              className="inline-flex items-center gap-1 text-lg font-bold text-[#137A3D] hover:underline"
            >
              មើលហាង <ChevronRight size={20} />
            </Link>
          ) : (
            <span className="inline-flex items-center gap-1 text-lg font-bold text-[#137A3D]">
              មើលហាង <ChevronRight size={20} />
            </span>
          )}
        </div>
      </div>

      {/* =====================================================
          2-COLUMN BOTTOM GRID
      ====================================================== */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Left Column: AI Recommendation & Ingredients */}
        <div className="space-y-6">
          {/* Card 1: FOODHUB AI */}
          <div className="rounded-[28px] border border-gray-100/90 bg-white p-6 shadow-sm">
            <p className="text-lg font-black uppercase tracking-wider text-orange-600">
              FOODHUB AI
            </p>
            <p className="mt-1 text-2xl font-black text-gray-900">
              កម្រិតសមស្របសម្រាប់អ្នក
            </p>

            <div className="mt-4 rounded-2xl bg-emerald-50/60 p-5 text-lg leading-relaxed text-emerald-950">
              មិនទាន់មានទិន្នន័យណែនាំសម្រាប់មុខម្ហូបនេះទេ។ សូមចូលគណនី ឬកំណត់ចំណូលចិត្តរបស់អ្នក ដើម្បីទទួលបានការណែនាំ។
            </div>
          </div>

          {/* Card 2: Ingredients */}
          <div className="rounded-[28px] border border-gray-100/90 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 text-2xl font-black text-gray-900">
              <UtensilsCrossed size={24} className="text-[#137A3D]" />
              <p className="text-2xl font-black text-gray-900">
                គ្រឿងផ្សំ{" "}
                {data.ingredients && data.ingredients.length > 0 && (
                  <span className="text-lg font-bold text-gray-400">
                    ({data.ingredients.length})
                  </span>
                )}
              </p>
            </div>

            <div className="mt-4 flex flex-wrap gap-2.5">
              {data.ingredients && data.ingredients.length > 0 ? (
                data.ingredients.map((ig, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-4 py-2 text-lg font-bold text-gray-800"
                  >
                    <span>{ig.name || ig.code || ig.ingredientUuid}</span>
                    {ig.quantity != null && (
                      <span className="text-gray-500 font-medium">
                        {ig.quantity} {ig.unit || ""}
                      </span>
                    )}
                    {ig.isOptional && (
                      <span className="text-lg text-gray-500 font-normal">
                        (ជម្រើស)
                      </span>
                    )}
                  </span>
                ))
              ) : (
                <span className="inline-flex items-center rounded-full bg-gray-100 px-4 py-2 text-lg font-bold text-gray-700">
                  ដំឡូងបារាំង
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Nutrition Facts & Allergens */}
        <div className="space-y-6">
          {/* Card 1: Nutrition Facts */}
          <div className="rounded-[28px] border border-gray-100/90 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 text-2xl font-black text-gray-900">
              <Apple size={24} className="text-[#137A3D]" />
              <p className="text-2xl font-black text-gray-900">តម្លៃអាហារូបត្ថម្ភ</p>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              {/* Calories */}
              <div className="rounded-2xl bg-emerald-50/50 p-4">
                <span className="text-lg font-semibold text-gray-500">
                  Calories
                </span>
                <p className="mt-1 text-xl font-black text-emerald-950">
                  {calories} kcal
                </p>
              </div>

              {/* Protein */}
              <div className="rounded-2xl bg-emerald-50/50 p-4">
                <span className="text-lg font-semibold text-gray-500">
                  Protein
                </span>
                <p className="mt-1 text-xl font-black text-emerald-950">
                  {protein} g
                </p>
              </div>

              {/* Carbs */}
              <div className="rounded-2xl bg-emerald-50/50 p-4">
                <span className="text-lg font-semibold text-gray-500">
                  Carbs
                </span>
                <p className="mt-1 text-xl font-black text-emerald-950">
                  {carbs != null ? `${carbs} g` : "undefined g"}
                </p>
              </div>

              {/* Fat */}
              <div className="rounded-2xl bg-emerald-50/50 p-4">
                <span className="text-lg font-semibold text-gray-500">
                  Fat
                </span>
                <p className="mt-1 text-xl font-black text-emerald-950">
                  {fat} g
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Allergens & Safety */}
          <div className="rounded-[28px] border border-gray-100/90 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 text-2xl font-black text-gray-900">
              <AlertCircle size={24} className="text-amber-600" />
              <p className="text-2xl font-black text-gray-900">អាឡែកហ្ស៊ី និងសុវត្ថិភាព</p>
            </div>

            <div className="mt-4 flex flex-wrap gap-2.5">
              {Array.isArray(data.allergenDeclarations) &&
              data.allergenDeclarations.length > 0 ? (
                data.allergenDeclarations.map((al: any, idx: number) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-4 py-2 text-lg font-bold text-amber-800 ring-1 ring-amber-200/60"
                  >
                    <span>{al.name || al.code || al.allergenUuid}</span>
                    {al.declarationType && (
                      <span className="text-lg text-amber-600 font-normal">
                        ({al.declarationType})
                      </span>
                    )}
                  </span>
                ))
              ) : (
                <span className="inline-flex items-center rounded-full bg-amber-50 px-4 py-2 text-lg font-bold text-amber-800 ring-1 ring-amber-200/60">
                  ខ្យង
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
