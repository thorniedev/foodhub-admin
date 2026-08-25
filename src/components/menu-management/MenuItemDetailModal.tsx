"use client";

import {
  Clock,
  DollarSign,
  Heart,
  Loader2,
  Pencil,
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

  const isAvailable = data?.availabilityStatus !== "UNAVAILABLE";

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl animate-in zoom-in-95 duration-150">

        {/* ─── COMPACT HERO HEADER ─── */}
        <div className="relative shrink-0 bg-gradient-to-r from-primary-800 to-primary-700 px-6 py-4 text-white">
          <div className="absolute right-4 top-4 flex items-center gap-2">
            {data && onEdit && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(data);
                }}
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

          <div className="flex items-center gap-3.5 pr-20">
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-white/20 shadow-sm border border-white/20">
              {images[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={resolveFoodHubCatalogImageUrl(images[0]) || images[0]}
                  alt={data?.name || ""}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-2xl">🍜</div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-[20px] font-bold text-white">
                {data?.name || "ព័ត៌មានម៉ឺនុយ"}
              </p>
              {data?.description && (
                <p className="mt-0.5 line-clamp-1 truncate text-[18px] text-white/90 font-normal">
                  {data.description}
                </p>
              )}

              {/* Badges row */}
              {data && (
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-medium">
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 font-bold text-white border border-white/20">
                    <DollarSign size={13} />
                    {Number(data.price ?? 0).toFixed(2)} USD
                  </span>

                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-bold border ${
                      isAvailable
                        ? "bg-emerald-500/30 border-emerald-300/40 text-white"
                        : "bg-red-500/30 border-red-300/40 text-white"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        isAvailable ? "bg-emerald-300" : "bg-red-300"
                      }`}
                    />
                    {isAvailable ? "មានលក់" : "អស់/បិទ"}
                  </span>

                  {data.isFeatured && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/30 border border-amber-300/40 px-2.5 py-0.5 font-bold text-white">
                      ★ ពិសេស
                    </span>
                  )}

                  {data.preparationTimeMinutes != null && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/10 border border-white/15 px-2.5 py-0.5 text-white">
                      <Clock size={12} />
                      {data.preparationTimeMinutes} នាទី
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ─── BODY (SCROLL-FREE / COMPACT) ─── */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3.5 text-gray-800">
          {isLoading ? (
            <div className="flex py-12 flex-col items-center justify-center gap-3">
              <Loader2 size={32} className="animate-spin text-primary-800" />
              <p className="text-sm font-medium text-gray-500">កំពុងទាញយកព័ត៌មាន...</p>
            </div>
          ) : isError ? (
            <div className="my-4 rounded-xl bg-red-50 p-4 text-center text-sm font-semibold text-red-600">
              មិនអាចទាញយក Detail របស់ Menu Item នេះបានទេ។
            </div>
          ) : data ? (
            <>
              {/* Store & Food Reference */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-3.5">
                  <div className="flex items-center gap-1.5 text-[18px] font-semibold text-gray-500">
                    <Store size={18} className="text-primary-800" />
                    <span>ហាង</span>
                  </div>
                  <p className="mt-1 truncate text-[18px] font-bold text-gray-800">
                    {data.store?.storeName || data.store?.name || data.store?.localName || "—"}
                  </p>
                  {data.store?.city && (
                    <p className="text-sm text-gray-500 mt-0.5">
                      ទីតាំង: {data.store.city}
                    </p>
                  )}
                </div>

                <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-3.5">
                  <div className="flex items-center gap-1.5 text-[18px] font-semibold text-gray-500">
                    <Utensils size={18} className="text-primary-800" />
                    <span>មុខម្ហូបមេ</span>
                  </div>
                  <p className="mt-1 truncate text-[18px] font-bold text-gray-800">
                    {data.food?.localName || data.food?.canonicalName || "—"}
                  </p>
                  {data.food?.categoryName && (
                    <p className="text-sm text-gray-500 mt-0.5">
                      ប្រភេទ: {data.food.categoryName}
                    </p>
                  )}
                </div>
              </div>

              {/* Recipe Ingredients */}
              {Array.isArray(data.ingredients) && data.ingredients.length > 0 && (
                <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-3.5">
                  <div className="flex items-center gap-1.5 text-[18px] font-semibold text-gray-700 mb-2">
                    <Sparkles size={18} className="text-primary-800" />
                    <span>គ្រឿងផ្សំ ({data.ingredients.length})</span>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2">
                    {data.ingredients.map((ig: any, idx: number) => {
                      const igName =
                        typeof ig === "string"
                          ? ig
                          : ig?.localName ||
                            ig?.name ||
                            ig?.ingredientLocalName ||
                            ig?.ingredientName ||
                            ig?.ingredient?.localName ||
                            ig?.ingredient?.name ||
                            ig?.code ||
                            "គ្រឿងផ្សំ";
                      const qty = typeof ig === "object" && ig ? ig.quantity ?? ig.amount : null;
                      const unit = typeof ig === "object" && ig ? ig.unit || ig.measurementUnit || "" : "";
                      const igQty = qty != null || unit ? `${qty != null ? qty : ""} ${unit}`.trim() : "";
                      const isOptional = typeof ig === "object" && Boolean(ig?.isOptional);

                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm border border-gray-100"
                        >
                          <span className="font-semibold text-gray-800">
                            {igName}
                            {isOptional && (
                              <span className="ml-1 text-xs text-gray-400 font-normal">(ជម្រើស)</span>
                            )}
                          </span>
                          {igQty && <span className="font-medium text-gray-500">{igQty}</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Dietary Types */}
              <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-3.5">
                <div className="flex items-center gap-1.5 text-[18px] font-semibold text-gray-700 mb-2">
                  <Heart size={18} className="text-primary-800" />
                  <span>របបអាហារ</span>
                </div>
                <div>
                  {Array.isArray(data.dietaryTypes) && data.dietaryTypes.length > 0 ? (
                    <div className="space-y-1.5">
                      {data.dietaryTypes.map((dt: any, idx: number) => {
                        const dtName =
                          typeof dt === "string"
                            ? dt
                            : dt?.localName ||
                              dt?.name ||
                              dt?.dietaryTypeLocalName ||
                              dt?.dietaryTypeName ||
                              dt?.dietaryType?.localName ||
                              dt?.dietaryType?.name ||
                              dt?.code ||
                              "របបអាហារ";

                        const vStatus = typeof dt === "object" ? dt?.verificationStatus : undefined;

                        return (
                          <div
                            key={idx}
                            className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm border border-gray-100"
                          >
                            <span className="font-semibold text-gray-800">{dtName}</span>
                            <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-100">
                              {vStatus === "VERIFIED" ? "បានផ្ទៀងផ្ទាត់" : "មិនទាន់ផ្ទៀងផ្ទាត់"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">គ្មានទិន្នន័យរបបអាហារ</p>
                  )}
                </div>
              </div>

              {/* Gallery images if more than 1 */}
              {images.length > 1 && (
                <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-3">
                  <p className="text-xs font-semibold text-gray-600 mb-2">រូបភាពបន្ថែម</p>
                  <div className="flex flex-wrap gap-2">
                    {images.map((img, idx) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={idx}
                        src={resolveFoodHubCatalogImageUrl(img) || img}
                        alt={`Gallery ${idx + 1}`}
                        className="h-14 w-14 rounded-xl border border-gray-200 object-cover shadow-2xs"
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* ─── FOOTER ACTIONS ─── */}
        <div className="shrink-0 flex items-center justify-end gap-2.5 border-t border-gray-100 bg-gray-50/50 px-6 py-3">
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
              onClick={() => {
                onClose();
                onEdit(data);
              }}
              className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-primary-800 px-5 text-sm font-semibold text-white shadow-xs transition hover:bg-primary-900 active:scale-95"
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
