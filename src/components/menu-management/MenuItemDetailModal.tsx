"use client";

import {
  Clock,
  DollarSign,
  Edit3,
  Heart,
  Image as ImageIcon,
  Info,
  Loader2,
  Sparkles,
  Store,
  Utensils,
  X,
} from "lucide-react";
import { useState } from "react";

import {
  useGetPublishedMenuItemDetailQuery,
  useGetManagedIngredientsQuery,
} from "@/src/app/store/menuManagementApi";
import { resolveFoodHubCatalogImageUrl } from "@/src/lib/resolveFoodHubImageUrl";

type DetailTab = "BASIC" | "INGREDIENTS" | "DIETARY" | "GALLERY";

export default function MenuItemDetailModal({
  uuid,
  onClose,
  onEdit,
}: {
  uuid: string | null;
  onClose: () => void;
  onEdit?: (item: any) => void;
}) {
  const [selectedImageIdx, setSelectedImageIdx] = useState<number>(0);

  const { data, isLoading, isError } = useGetPublishedMenuItemDetailQuery(
    uuid ?? "",
    {
      skip: !uuid,
    },
  );

  const ingredientCatalogQuery = useGetManagedIngredientsQuery();
  const ingredientCatalog = ingredientCatalogQuery.data ?? [];

  if (!uuid) return null;

  // Extract images
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

  const activeImage = images[selectedImageIdx] || images[0];

  const ingredients = (
    data?.ingredients?.length
      ? data.ingredients
      : (data?.food as any)?.ingredients?.length
        ? (data?.food as any).ingredients
        : []
  ) as any[];

  const getIngredientInfo = (ig: any) => {
    if (!ig) return null;
    let name = "";
    let quantity = "";
    let isOptional = false;

    if (typeof ig === "string") {
      const found = ingredientCatalog.find(
        (c) => c.uuid === ig || c.code === ig || c.name === ig,
      );
      name = found?.name || (found as any)?.localName || ig;
    } else if (typeof ig === "object") {
      const targetUuid =
        ig.ingredientUuid || ig.uuid || ig.ingredient?.uuid || ig.id;
      const found = ingredientCatalog.find(
        (c) => c.uuid === targetUuid || (ig.code && c.code === ig.code),
      );

      name =
        ig.name ||
        ig.localName ||
        ig.ingredientName ||
        ig.canonicalName ||
        ig.ingredient?.name ||
        ig.ingredient?.localName ||
        found?.name ||
        (found as any)?.localName ||
        ig.code ||
        (typeof targetUuid === "string" && !targetUuid.includes("-")
          ? targetUuid
          : "") ||
        "គ្រឿងផ្សំ";

      const rawQty = ig.quantity ?? ig.qty ?? ig.amount;
      const rawUnit = ig.unit ?? ig.unitOfMeasure ?? "";
      if (rawQty != null && rawQty !== "") {
        quantity = `${rawQty} ${rawUnit}`.trim();
      } else if (rawUnit) {
        quantity = rawUnit;
      }

      isOptional = Boolean(ig.isOptional);
    }

    return { name, quantity, isOptional };
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <div className="relative mx-auto my-6 w-full max-w-3xl overflow-hidden rounded-[28px] bg-white p-6 sm:p-7 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-[#137A3D]">
              <Utensils size={22} />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-primary-800">
                ព័ត៌មានលម្អិតមុខម្ហូប
              </p>
              <p className="text-xs font-semibold text-secondary-600">
                {data?.store?.storeName || data?.store?.name || "មុខម្ហូបក្នុងបញ្ជី FoodHub"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onEdit && data && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(data);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-xs font-bold text-[#137A3D] transition hover:bg-emerald-100"
              >
                <Edit3 size={14} />
                <span>កែប្រែ</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              aria-label="បិទផ្ទាំង"
              className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3">
            <Loader2 size={32} className="animate-spin text-[#137A3D]" />
            <p className="text-sm font-semibold text-gray-400">
              កំពុងទាញយកព័ត៌មានលម្អិត...
            </p>
          </div>
        ) : isError ? (
          <div className="my-6 rounded-2xl bg-red-50 p-5 text-center text-sm font-semibold text-red-600 border border-red-100">
            មិនអាចទាញយកព័ត៌មានលម្អិតរបស់ Menu Item នេះបានទេ។
          </div>
        ) : data ? (
          <div className="mt-4 space-y-4 max-h-[70vh] overflow-y-auto pr-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {/* 1. Hero Card with Interactive Image Gallery */}
            <div className="flex flex-col gap-5 sm:flex-row rounded-2xl border border-gray-100 bg-gray-50/60 p-4 sm:p-5">
              {/* Image Preview & Thumbnails */}
              <div className="flex flex-col gap-2.5 sm:w-44 shrink-0">
                <div className="relative h-44 w-full overflow-hidden rounded-2xl border border-gray-100 bg-gray-100 shadow-2xs sm:h-44 sm:w-44">
                  {activeImage ? (
                    <img
                      src={activeImage}
                      alt={data.name}
                      className="h-full w-full object-cover transition duration-300"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-emerald-50 text-[#137A3D]">
                      <Utensils size={36} />
                    </div>
                  )}
                </div>

                {/* Multiple Images Selector */}
                {images.length > 1 && (
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedImageIdx(idx)}
                        className={`h-11 w-11 shrink-0 overflow-hidden rounded-xl border-2 transition ${selectedImageIdx === idx
                          ? "border-[#137A3D] ring-2 ring-[#137A3D]/20"
                          : "border-gray-200 opacity-70 hover:opacity-100"
                          }`}
                      >
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

              {/* Title, Pricing & Badges */}
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-[#137A3D] border border-emerald-100">
                      {(() => {
                        const s = (data.availabilityStatus || "AVAILABLE").toUpperCase();
                        switch (s) {
                          case "AVAILABLE":
                            return "មានលក់";
                          case "UNAVAILABLE":
                            return "មិនមានលក់";
                          case "SOLD_OUT":
                            return "អស់ស្តុក";
                          case "HIDDEN":
                            return "លាក់ទុក";
                          default:
                            return data.availabilityStatus || "មានលក់";
                        }
                      })()}
                    </span>

                    {data.isFeatured && (
                      <span className="rounded-lg bg-orange-50 px-2.5 py-1 text-xs font-bold text-orange-600 border border-orange-100">
                        ពិសេស
                      </span>
                    )}

                    {(() => {
                      const st = (data.ingredientDataStatus || "").toUpperCase();
                      let label = "រូបមន្តពេញលេញ";
                      let style = "bg-blue-50 text-blue-700 border-blue-100";
                      if (st === "PARTIAL") {
                        label = "មួយផ្នែក";
                        style = "bg-amber-50 text-amber-700 border-amber-100";
                      } else if (st === "VERIFIED") {
                        label = "បានផ្ទៀងផ្ទាត់";
                        style = "bg-emerald-50 text-emerald-700 border-emerald-100";
                      }
                      return (
                        <span className={`rounded-lg px-2.5 py-1 text-xs font-bold border ${style}`}>
                          {label}
                        </span>
                      );
                    })()}
                  </div>

                  <h3 className="mt-2.5 text-2xl sm:text-3xl font-black text-primary-800 leading-snug">
                    {data.name}
                  </h3>

                  {data.description && (
                    <p className="mt-1.5 text-sm leading-relaxed text-gray-600">
                      {data.description}
                    </p>
                  )}
                </div>

                {/* Price & Prep time */}
                <div className="mt-4 flex flex-wrap items-center gap-4">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-[#137A3D]">
                      ${Number(data.price ?? 0).toFixed(2)}
                    </span>
                    <span className="text-xs font-bold text-secondary-600">
                      {data.currencyCode || "USD"}
                    </span>
                  </div>

                  {data.preparationTimeMinutes != null && (
                    <div className="inline-flex items-center gap-1.5 rounded-lg border border-secondary-100 bg-secondary-50 px-3 py-1 text-xs font-semibold text-secondary-700">
                      <Clock size={14} className="text-secondary-500" />
                      <span>{data.preparationTimeMinutes} នាទី</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 2. Store & Food Catalog (2 Columns) */}
            <div className="grid gap-3.5 sm:grid-cols-2">
              {/* Store */}
              <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4.5 transition hover:bg-gray-50">
                <div className="flex items-center gap-2.5 text-base font-bold text-primary-800">
                  <Store size={18} className="text-[#137A3D]" />
                  <span>ហាង</span>
                </div>
                <p className="mt-2 text-sm font-semibold text-gray-800">
                  {data.store?.storeName || data.store?.name || data.store?.localName || data.storeUuid || "—"}
                </p>
                {data.store?.city && (
                  <p className="mt-1 text-xs text-gray-500">ទីតាំង: {data.store.city}</p>
                )}
              </div>

              {/* Food Catalog */}
              <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4.5 transition hover:bg-gray-50">
                <div className="flex items-center gap-2.5 text-base font-bold text-primary-800">
                  <Utensils size={18} className="text-[#137A3D]" />
                  <span>មុខម្ហូបមេ</span>
                </div>
                <p className="mt-2 text-sm font-semibold text-gray-800">
                  {data.food?.localName || data.food?.canonicalName || data.foodUuid || "—"}
                </p>
                {data.food?.categoryName && (
                  <p className="mt-1 text-xs text-gray-500">
                    ប្រភេទ: {data.food.categoryName}
                    {data.food?.cuisineName ? ` • ${data.food.cuisineName}` : ""}
                  </p>
                )}
              </div>
            </div>

            {/* 3. Recipe Ingredients */}
            <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4.5">
              <div className="flex items-center gap-2.5 text-base font-bold text-primary-800">
                <Sparkles size={18} className="text-[#137A3D]" />
                <span>គ្រឿងផ្សំ</span>
                {ingredients.length > 0 && (
                  <span className="rounded-full bg-secondary-50 px-2.5 py-0.5 text-xs font-bold text-secondary-700 border border-secondary-100">
                    {ingredients.length} មុខ
                  </span>
                )}
              </div>

              {ingredients.length > 0 ? (
                <div className="mt-3.5 grid gap-2.5 sm:grid-cols-2">
                  {ingredients.map((rawIg: any, idx: number) => {
                    const info = getIngredientInfo(rawIg);
                    if (!info?.name) return null;
                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between rounded-xl bg-white px-4 py-2.5 text-sm border border-gray-100 shadow-2xs"
                      >
                        <span className="font-semibold text-gray-800">
                          {info.name}
                          {info.isOptional && (
                            <span className="ml-1.5 text-xs text-gray-400 font-normal">
                              (មិនបង្ខំ)
                            </span>
                          )}
                        </span>
                        {info.quantity && (
                          <span className="font-bold text-secondary-600">
                            {info.quantity}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="mt-2 text-xs font-medium text-gray-400">
                  មិនទាន់មានទិន្នន័យគ្រឿងផ្សំត្រូវបានបញ្ជាក់សម្រាប់មុខម្ហូបនេះទេ។
                </p>
              )}
            </div>

            {/* 4. Dietary Types */}
            <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4.5">
              <div className="flex items-center gap-2.5 text-base font-bold text-primary-800">
                <Heart size={18} className="text-emerald-600" />
                <span>របបអាហារ</span>
              </div>

              <div className="mt-3.5">
                {Array.isArray(data.dietaryTypes) && data.dietaryTypes.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {data.dietaryTypes.map((dt: any, idx: number) => (
                      <div
                        key={idx}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 border border-emerald-100 shadow-2xs"
                      >
                        <span>{dt.name || dt.code || dt.dietaryTypeUuid}</span>
                        {dt.verificationStatus && (
                          <span className="rounded bg-emerald-100/80 px-1.5 py-0.5 text-[10px]">
                            {dt.verificationStatus}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs font-medium text-gray-400">
                    គ្មានទិន្នន័យរបបអាហារសម្រាប់មុខម្ហូបនេះទេ។
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : null}

        {/* Footer */}
        <div className="mt-5 flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-gray-200 bg-white px-6 py-2.5 text-sm font-bold text-gray-700 transition hover:bg-gray-50 hover:border-gray-300"
          >
            បិទ
          </button>

          {onEdit && data && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(data);
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-[#137A3D] px-6 py-2.5 text-sm font-bold text-white shadow-xs transition hover:bg-[#0f6833]"
            >
              <Edit3 size={16} />
              កែប្រែមុខម្ហូប
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
