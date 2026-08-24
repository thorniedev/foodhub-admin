"use client";

import {
  Clock,
  DollarSign,
  Heart,
  Loader2,
  Sparkles,
  Store,
  Utensils,
  X,
} from "lucide-react";

import { useGetPublishedMenuItemDetailQuery } from "@/src/app/store/menuManagementApi";
import { resolveFoodHubCatalogImageUrl } from "@/src/lib/resolveFoodHubImageUrl";

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
                  alt={data?.name || ""}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-4xl">🍜</div>
              )}
            </div>
            <div className="min-w-0 flex-1 pr-10">
              <p className="truncate text-3xl font-black text-white">
                {data?.name || "ព័ត៌មាន Menu Item"}
              </p>
              {data?.description && (
                <p className="mt-0.5 line-clamp-2 text-lg text-white/70">{data.description}</p>
              )}
            </div>
          </div>

          {/* Badges + Price row */}
          {data && (
            <div className="mt-5 flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/20 px-4 py-1.5 text-lg font-bold text-white">
                <DollarSign size={16} />
                {Number(data.price ?? 0).toFixed(2)} {data.currencyCode || "USD"}
              </span>
              {data.availabilityStatus && (
                <span className="rounded-full border border-white/20 bg-white/15 px-4 py-1.5 text-lg font-bold text-white">
                  {data.availabilityStatus}
                </span>
              )}
              {data.isFeatured && (
                <span className="rounded-full border border-orange-300/50 bg-orange-400/30 px-4 py-1.5 text-lg font-bold text-white">
                  FEATURED
                </span>
              )}
              {data.preparationTimeMinutes != null && (
                <span className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-lg font-bold text-white">
                  <Clock size={15} />
                  {data.preparationTimeMinutes} នាទី
                </span>
              )}
            </div>
          )}
        </div>

        {/* ─── BODY ─── */}
        <div className="p-7">
          {isLoading ? (
            <div className="flex min-h-64 flex-col items-center justify-center gap-4">
              <Loader2 size={40} className="animate-spin text-[#14833E]" />
              <p className="text-lg font-semibold text-gray-500">កំពុងទាញយកព័ត៌មានលម្អិត...</p>
            </div>
          ) : isError ? (
            <div className="my-6 rounded-2xl bg-red-50 p-5 text-center text-lg font-semibold text-red-600">
              មិនអាចទាញយក Detail របស់ Menu Item នេះបានទេ។
            </div>
          ) : data ? (
            <div className="space-y-4">
              {/* Store & Food Reference */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 p-4 transition hover:border-[#14833E]/30 hover:bg-emerald-50/30">
                  <div className="absolute left-0 top-0 h-full w-1 rounded-l-2xl bg-[#14833E]/30 transition group-hover:bg-[#14833E]" />
                  <div className="flex items-center gap-2 pl-2 text-lg font-semibold text-gray-400">
                    <Store size={16} />
                    <span>ហាង</span>
                  </div>
                  <p className="mt-2 pl-2 text-xl font-bold text-gray-900">
                    {data.store?.storeName || data.store?.name || data.store?.localName || "—"}
                  </p>
                  {data.store?.city && (
                    <p className="pl-2 text-lg text-gray-400">ទីតាំង: {data.store.city}</p>
                  )}
                </div>

                <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 p-4 transition hover:border-amber-200/60 hover:bg-amber-50/30">
                  <div className="absolute left-0 top-0 h-full w-1 rounded-l-2xl bg-amber-200 transition group-hover:bg-amber-400" />
                  <div className="flex items-center gap-2 pl-2 text-lg font-semibold text-gray-400">
                    <Utensils size={16} />
                    <span>មុខម្ហូបមេ</span>
                  </div>
                  <p className="mt-2 pl-2 text-xl font-bold text-gray-900">
                    {data.food?.localName || data.food?.canonicalName || "—"}
                  </p>
                  {data.food?.categoryName && (
                    <p className="pl-2 text-lg text-gray-400">ប្រភេទ: {data.food.categoryName}</p>
                  )}
                </div>
              </div>

              {/* Recipe Ingredients */}
              {data.ingredients && data.ingredients.length > 0 && (
                <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 p-4 transition hover:border-violet-200/60 hover:bg-violet-50/20">
                  <div className="absolute left-0 top-0 h-full w-1 rounded-l-2xl bg-violet-300 transition group-hover:bg-violet-500" />
                  <div className="flex items-center gap-2.5 pl-2 text-lg font-semibold text-gray-400">
                    <Sparkles size={16} className="text-violet-500" />
                    <span>គ្រឿងផ្សំ ({data.ingredients.length})</span>
                  </div>

                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {data.ingredients.map((ig, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between rounded-xl bg-white px-4 py-3 text-lg shadow-sm ring-1 ring-gray-100"
                      >
                        <span className="font-bold text-gray-800">
                          {ig.name || ig.code}
                          {ig.isOptional && (
                            <span className="ml-1.5 text-lg text-gray-400">(Optional)</span>
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

              {/* Dietary Types */}
              <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 p-4 transition hover:border-rose-200/60 hover:bg-rose-50/20">
                <div className="absolute left-0 top-0 h-full w-1 rounded-l-2xl bg-rose-200 transition group-hover:bg-rose-400" />
                <div className="flex items-center gap-2 pl-2 text-lg font-semibold text-gray-400">
                  <Heart size={16} />
                  <span>របបអាហារ</span>
                </div>
                <div className="mt-3 space-y-2">
                  {Array.isArray(data.dietaryTypes) && data.dietaryTypes.length > 0 ? (
                    data.dietaryTypes.map((dt: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between rounded-xl bg-white px-4 py-2.5 text-lg shadow-sm ring-1 ring-gray-100"
                      >
                        <span className="font-bold text-gray-800">{dt.name || dt.code}</span>
                        <span className="rounded-lg bg-emerald-100 px-3 py-1 text-lg font-bold text-emerald-800">
                          {dt.verificationStatus || "UNVERIFIED"}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="pl-2 text-lg text-gray-400">គ្មានទិន្នន័យ Dietary Type</p>
                  )}
                </div>
              </div>

              {/* Gallery images if more than 1 */}
              {images.length > 1 && (
                <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 p-4 transition hover:border-gray-200">
                  <div className="absolute left-0 top-0 h-full w-1 rounded-l-2xl bg-gray-200 transition group-hover:bg-gray-400" />
                  <p className="pl-2 text-lg font-semibold text-gray-400">រូបភាពបន្ថែម</p>
                  <div className="mt-3 flex flex-wrap gap-3">
                    {images.map((img, idx) => (
                      <img
                        key={idx}
                        src={resolveFoodHubCatalogImageUrl(img) || img}
                        alt={`Gallery ${idx + 1}`}
                        className="h-20 w-20 rounded-2xl border border-gray-200 object-cover shadow-sm"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}

          {/* Footer */}
          <div className="mt-6 flex justify-end">
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
