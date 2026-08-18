"use client";

import {
  Clock,
  DollarSign,
  Heart,
  Info,
  Loader2,
  ShieldAlert,
  Sparkles,
  Store,
  Utensils,
  X,
} from "lucide-react";
import { useState } from "react";

import { useGetPublishedMenuItemDetailQuery } from "@/src/app/store/menuManagementApi";
import { resolveFoodHubCatalogImageUrl } from "@/src/lib/resolveFoodHubImageUrl";

export default function MenuItemDetailModal({
  uuid,
  onClose,
}: {
  uuid: string | null;
  onClose: () => void;
}) {
  const [showRawJson, setShowRawJson] = useState(false);

  const { data, isLoading, isError } = useGetPublishedMenuItemDetailQuery(
    uuid ?? "",
    {
      skip: !uuid,
    },
  );

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
                ព័ត៌មានលម្អិត Menu Item
              </h2>
              <p className="mt-0.5 text-xs text-gray-400">
                Public Rich Detail API (<code>/api/v1/catalog/menu-items/{`{uuid}`}/detail</code>)
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
              កំពុងទាញយកព័ត៌មានលម្អិត...
            </p>
          </div>
        ) : isError ? (
          <div className="my-6 rounded-2xl bg-red-50 p-4 text-center text-sm font-semibold text-red-600">
            មិនអាចទាញយក Detail របស់ Menu Item នេះបានទេ។
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
                    alt={data.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-4xl text-gray-300">
                    🍜
                  </div>
                )}
              </div>

              {/* Title & Badges */}
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                      {data.availabilityStatus || "AVAILABLE"}
                    </span>
                    {data.isFeatured && (
                      <span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-bold text-orange-600">
                        FEATURED
                      </span>
                    )}
                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                      {data.ingredientDataStatus || "COMPLETE"}
                    </span>
                  </div>

                  <h3 className="mt-2 text-2xl font-black text-gray-900">
                    {data.name}
                  </h3>

                  {data.description && (
                    <p className="mt-1 text-sm leading-relaxed text-gray-500">
                      {data.description}
                    </p>
                  )}
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-1.5 font-black text-[#137A3D]">
                    <DollarSign size={18} />
                    <span className="text-xl">
                      {Number(data.price ?? 0).toFixed(2)} {data.currencyCode || "USD"}
                    </span>
                  </div>

                  {data.preparationTimeMinutes != null && (
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <Clock size={16} className="text-gray-400" />
                      <span>{data.preparationTimeMinutes} នាទី</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Store & Food Reference */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-4">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                  <Store size={15} />
                  <span>Store (ហាងបម្រើ)</span>
                </div>
                <p className="mt-1 text-sm font-bold text-gray-800">
                  {data.store?.storeName || data.store?.name || data.store?.localName || data.storeUuid || "—"}
                </p>
                {data.store?.city && (
                  <p className="text-xs text-gray-400">ទីតាំង: {data.store.city}</p>
                )}
              </div>

              <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-4">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                  <Utensils size={15} />
                  <span>Food Catalog (មុខម្ហូបមេ)</span>
                </div>
                <p className="mt-1 text-sm font-bold text-gray-800">
                  {data.food?.localName || data.food?.canonicalName || data.foodUuid || "—"}
                </p>
                {data.food?.categoryName && (
                  <p className="text-xs text-gray-400">ប្រភេទ: {data.food.categoryName}</p>
                )}
              </div>
            </div>

            {/* Recipe Ingredients */}
            {data.ingredients && data.ingredients.length > 0 && (
              <div className="rounded-2xl border border-gray-100 p-4">
                <div className="flex items-center gap-2 text-sm font-black text-gray-800">
                  <Sparkles size={16} className="text-[#137A3D]" />
                  <span>គ្រឿងផ្សំ (Recipe Ingredients) ({data.ingredients.length})</span>
                </div>

                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {data.ingredients.map((ig, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2 text-xs"
                    >
                      <span className="font-bold text-gray-800">
                        {ig.name || ig.code || ig.ingredientUuid}
                        {ig.isOptional && (
                          <span className="ml-1 text-[10px] text-gray-400">(Optional)</span>
                        )}
                      </span>
                      <span className="font-semibold text-gray-500">
                        {ig.quantity != null ? `${ig.quantity} ` : ""}
                        {ig.unit || ""}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Dietary Types & Allergens */}
            <div className="grid gap-3 sm:grid-cols-2">
              {/* Dietary Types */}
              <div className="rounded-2xl border border-gray-100 p-4">
                <div className="flex items-center gap-2 text-sm font-black text-gray-800">
                  <Heart size={16} className="text-emerald-600" />
                  <span>របបអាហារ (Dietary Types)</span>
                </div>
                <div className="mt-2.5 space-y-1.5">
                  {Array.isArray(data.dietaryTypes) && data.dietaryTypes.length > 0 ? (
                    data.dietaryTypes.map((dt: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between rounded-xl bg-emerald-50/60 px-3 py-1.5 text-xs text-emerald-900"
                      >
                        <span className="font-bold">{dt.name || dt.code || dt.dietaryTypeUuid}</span>
                        <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold">
                          {dt.verificationStatus || "UNVERIFIED"}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-400">គ្មានទិន្នន័យ Dietary Type</p>
                  )}
                </div>
              </div>

              {/* Allergen Declarations */}
              <div className="rounded-2xl border border-gray-100 p-4">
                <div className="flex items-center gap-2 text-sm font-black text-gray-800">
                  <ShieldAlert size={16} className="text-amber-600" />
                  <span>អាឡែហ្ស៊ី (Allergen Declarations)</span>
                </div>
                <div className="mt-2.5 space-y-1.5">
                  {Array.isArray(data.allergenDeclarations) && data.allergenDeclarations.length > 0 ? (
                    data.allergenDeclarations.map((al: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between rounded-xl bg-amber-50/60 px-3 py-1.5 text-xs text-amber-900"
                      >
                        <span className="font-bold">{al.name || al.code || al.allergenUuid}</span>
                        <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold">
                          {al.declarationType || "MAY_CONTAIN"} • {al.riskLevel || "MEDIUM"}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-400">គ្មានការប្រកាស Allergen</p>
                  )}
                </div>
              </div>
            </div>

            {/* Gallery images if more than 1 */}
            {images.length > 1 && (
              <div className="rounded-2xl border border-gray-100 p-4">
                <p className="text-xs font-bold text-gray-400">រូបភាពបន្ថែម (Gallery)</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {images.map((img, idx) => (
                    <img
                      key={idx}
                      src={resolveFoodHubCatalogImageUrl(img) || img}
                      alt={`Gallery ${idx + 1}`}
                      className="h-16 w-16 rounded-xl object-cover"
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
                className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-gray-600"
              >
                <Info size={14} />
                {showRawJson ? "លាក់ JSON Raw Data" : "បង្ហាញ JSON Raw Data (Public API Response)"}
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
        <div className="mt-6 flex justify-end border-t border-gray-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-gray-200 px-5 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50"
          >
            បិទ
          </button>
        </div>
      </div>
    </div>
  );
}
