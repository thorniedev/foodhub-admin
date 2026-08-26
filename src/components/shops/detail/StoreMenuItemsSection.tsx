"use client";

import {
  ChevronLeft,
  ChevronRight,
  Clock,
  DollarSign,
  Eye,
  Loader2,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  UtensilsCrossed,
} from "lucide-react";

import React, { useMemo, useState } from "react";
import Link from "next/link";

import { useGetPublishedMenuItemsQuery } from "@/src/app/store/menuManagementApi";

import { resolveFoodHubCatalogImageUrl } from "@/src/lib/resolveFoodHubImageUrl";

import type { MenuItemRecord } from "@/src/types/menu-management";

import { Section } from "./StoreOverviewSection";

/* =========================================================
   IMAGE RESOLVER
========================================================= */

function getMenuItemImage(item: MenuItemRecord): string | null {
  const raw =
    item.thumbnail ||
    item.imageUrl ||
    (item as any).primaryMediaUuid ||
    item.primaryMediaUrls?.[0] ||
    item.primaryMediaUuids?.[0] ||
    item.images?.[0] ||
    item.gallery?.[0] ||
    item.thumbnailMediaUuid ||
    item.food?.thumbnail ||
    item.food?.imageUrl ||
    (item.food as any)?.primaryMediaUuid ||
    item.food?.primaryMediaUrls?.[0] ||
    item.food?.primaryMediaUuids?.[0] ||
    item.food?.images?.[0] ||
    item.food?.gallery?.[0] ||
    null;

  return resolveFoodHubCatalogImageUrl(raw);
}

const ITEMS_PER_PAGE = 6;

/* =========================================================
   COMPONENT
========================================================= */

export default function StoreMenuItemsSection({
  storeUuid,
  onViewItem,
  onEditItem,
  onDeleteItem,
  onAddMenuItem,
}: {
  storeUuid: string;
  onViewItem?: (item: MenuItemRecord) => void;
  onEditItem?: (item: MenuItemRecord) => void;
  onDeleteItem?: (item: MenuItemRecord) => void;
  onAddMenuItem?: () => void;
}) {
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading, isFetching } = useGetPublishedMenuItemsQuery(
    {
      storeUuid,
      size: 100,
    },
    {
      skip: !storeUuid,
      refetchOnMountOrArgChange: true,
    },
  );

  // Sort items by numeric ID descending, timestamp descending, or array reverse to guarantee NEWEST items FIRST!
  const sortedItems = useMemo(() => {
    const raw = data?.content ?? [];
    return [...raw].sort((a, b) => {
      // 1. Sort by numeric ID descending if available
      const idA =
        typeof a.id === "number"
          ? a.id
          : (a as any).menuItemId
            ? Number((a as any).menuItemId)
            : null;
      const idB =
        typeof b.id === "number"
          ? b.id
          : (b as any).menuItemId
            ? Number((b as any).menuItemId)
            : null;

      if (
        idA !== null &&
        idB !== null &&
        Number.isFinite(idA) &&
        Number.isFinite(idB) &&
        idA !== idB
      ) {
        return idB - idA;
      }

      // 2. Sort by date timestamp descending if available
      const timeA =
        a.createdAt || a.updatedAt
          ? new Date(a.createdAt || a.updatedAt!).getTime()
          : null;
      const timeB =
        b.createdAt || b.updatedAt
          ? new Date(b.createdAt || b.updatedAt!).getTime()
          : null;

      if (
        timeA !== null &&
        timeB !== null &&
        Number.isFinite(timeA) &&
        Number.isFinite(timeB) &&
        timeA !== timeB
      ) {
        return timeB - timeA;
      }

      // 3. Fallback: Reverse array order so newest appended items appear first
      return raw.indexOf(b) - raw.indexOf(a);
    });
  }, [data?.content]);

  const totalPages = Math.ceil(sortedItems.length / ITEMS_PER_PAGE) || 1;

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedItems.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedItems, currentPage]);

  const items = sortedItems;

  return (
    <Section
      title={`មុខម្ហូបក្នុងហាង (${items.length})`}
      icon={<UtensilsCrossed size={22} />}
      action={
        onAddMenuItem ? (
          <button
            type="button"
            onClick={onAddMenuItem}
            className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-2xl bg-primary-800 px-5 text-base font-semibold text-white shadow-xs transition hover:bg-primary-900 active:scale-95"
          >
            <Plus size={18} />
            បង្កើតម៉ឺនុយ
          </button>
        ) : (
          <Link
            href={`/menu-items?storeUuid=${storeUuid}&tab=WEBSITE`}
            className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-2xl bg-primary-800 px-5 text-base font-semibold text-white shadow-xs transition hover:bg-primary-900 active:scale-95"
          >
            <Plus size={18} />
            គ្រប់គ្រងម៉ឺនុយ
          </Link>
        )
      }
    >

      {/* =================================================
          LOADING
      ================================================== */}

      {isLoading ? (
        <div
          className="
            flex
            min-h-[220px]
            flex-col
            items-center
            justify-center
            gap-3
            rounded-2xl
            border
            border-gray-100
            bg-gray-50/70
            p-6
            text-center
          "
        >
          <Loader2
            size={32}
            className="
              animate-spin
              text-primary-700
            "
          />

          <p className="text-lg font-medium text-gray-500">
            កំពុងទាញយកមុខម្ហូប...
          </p>
        </div>
      ) : items.length === 0 ? (
        /* =================================================
            EMPTY STATE
        ================================================== */

        <div
          className="
            flex
            min-h-[280px]
            flex-col
            items-center
            justify-center
            rounded-2xl
            border
            border-dashed
            border-gray-200
            bg-gray-50/50
            p-6
            text-center
            sm:p-8
          "
        >
          <div
            className="
              flex
              h-16
              w-16
              items-center
              justify-center
              rounded-2xl
              bg-primary-50
              text-primary-700
            "
          >
            <UtensilsCrossed size={29} />
          </div>

          <p className="mt-4 text-xl font-semibold text-primary-800">
            មិនទាន់មានម៉ឺនុយទេ
          </p>

          <p
            className="
              mt-2
              max-w-xl
              text-lg
              leading-8
              text-gray-500
            "
          >
            ហាងនេះមិនទាន់មានមុខម្ហូបណាមួយត្រូវបាន Publish ចូលក្នុង វែបសាយ
            នៅឡើយទេ។
          </p>

          {onAddMenuItem ? (
            <button
              type="button"
              onClick={onAddMenuItem}
              className="
                mt-5
                inline-flex
                min-h-[48px]
                items-center
                justify-center
                gap-2
                rounded-full
                bg-[#137A3D]
                px-6
                text-base
                font-semibold
                text-white
                transition
                hover:bg-[#0f6833]
              "
            >
              <Plus size={18} />
              បង្កើតម៉ឺនុយដំបូង
            </button>
          ) : (
            <Link
              href="/menu-items"
              className="
                mt-5
                inline-flex
                min-h-[48px]
                items-center
                justify-center
                gap-2
                rounded-full
                bg-[#137A3D]
                px-6
                text-base
                font-semibold
                text-white
                transition
                hover:bg-[#0f6833]
              "
            >
              <Plus size={18} />
              បង្កើតម៉ឺនុយដំបូង
            </Link>
          )}
        </div>
      ) : (
        /* =================================================
            MENU ITEM GRID
        ================================================== */
        <>
          {/* =================================================
              MENU ITEM GRID
          ================================================== */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedItems.map((item) => {
              const image = getMenuItemImage(item);
              const available = item.availabilityStatus === "AVAILABLE";

              return (
                <div
                  key={item.uuid}
                  onClick={() => onViewItem?.(item)}
                  className="group relative flex flex-col min-w-0 cursor-pointer overflow-hidden rounded-2xl border border-gray-100 bg-white p-3.5 shadow-2xs transition-all duration-200 hover:border-emerald-200 hover:shadow-md"
                >
                  {/* IMAGE TOP */}
                  <div className="relative h-44 w-full shrink-0 overflow-hidden rounded-xl bg-gray-100">
                    {image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={image}
                        alt={item.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-emerald-50 text-[#137A3D]">
                        <UtensilsCrossed size={32} />
                      </div>
                    )}

                    {/* Action buttons over image top-right (hidden by default, shown on hover) */}
                    <div className="absolute right-2 top-2 flex items-center gap-1 rounded-xl bg-white/90 p-1 shadow-xs backdrop-blur-xs opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          onViewItem?.(item);
                        }}
                        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-gray-600 transition hover:bg-gray-100 hover:text-primary-800"
                        aria-label="មើលព័ត៌មានលម្អិត"
                        title="មើលព័ត៌មានលម្អិត"
                      >
                        <Eye size={16} />
                      </button>

                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          onEditItem?.(item);
                        }}
                        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-emerald-50 text-primary-800 transition hover:bg-emerald-100 hover:text-primary-900"
                        aria-label="កែប្រែម៉ឺនុយ"
                        title="កែប្រែម៉ឺនុយ"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          onDeleteItem?.(item);
                        }}
                        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-rose-50 text-rose-600 transition hover:bg-rose-100 hover:text-rose-700"
                        aria-label="លុបម៉ឺនុយ"
                        title="លុបម៉ឺនុយ"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* CONTENT UNDER IMAGE */}
                  <div className="mt-3 flex flex-1 flex-col justify-between space-y-2.5">
                    <div>
                      {/* Name */}
                      <p
                        className="text-base font-bold text-gray-900 transition group-hover:text-primary-800 line-clamp-1"
                        title={item.name}
                      >
                        {item.name}
                      </p>

                      {/* Canonical Name */}
                      {item.food?.canonicalName && item.food.canonicalName !== item.name && (
                        <p
                          className="mt-0.5 text-xs text-gray-500 line-clamp-1"
                          title={item.food.canonicalName}
                        >
                          {item.food.canonicalName}
                        </p>
                      )}
                    </div>

                    {/* Price, Prep Time, and Availability status UNDER Image */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100">
                      <div className="flex items-baseline gap-1">
                        <span className="text-base font-bold text-primary-800">
                          ${Number(item.price ?? 0).toFixed(2)}
                        </span>
                        <span className="text-xs font-semibold text-gray-400">
                          {item.currencyCode || "USD"}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* PREPARATION TIME */}
                        {item.preparationTimeMinutes != null && (
                          <div className="inline-flex items-center gap-1 rounded-md border border-amber-100 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800">
                            <Clock size={12} className="text-amber-600" />
                            <span>{item.preparationTimeMinutes} min</span>
                          </div>
                        )}

                        {/* AVAILABILITY STATUS */}
                        <div
                          className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${
                            available
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                              : "bg-gray-100 text-gray-600 border border-gray-200"
                          }`}
                        >
                          {(() => {
                            const s = (item.availabilityStatus || "AVAILABLE").toUpperCase();
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
                                return item.availabilityStatus || "មានលក់";
                            }
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* PAGINATION CONTROLS */}
          {totalPages > 1 && (
            <div className="mt-6 flex flex-col items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-gray-50/50 p-3.5 sm:flex-row">
              <p className="text-sm font-semibold text-gray-500">
                បង្ហាញ {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, sortedItems.length)} -{" "}
                {Math.min(currentPage * ITEMS_PER_PAGE, sortedItems.length)} នៃ {sortedItems.length} ម៉ឺនុយ
              </p>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="ទំព័រមុន"
                >
                  <ChevronLeft size={18} />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`flex h-9 min-w-[36px] cursor-pointer items-center justify-center rounded-xl px-3 text-sm font-bold transition ${
                      currentPage === page
                        ? "bg-primary-800 text-white shadow-xs"
                        : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="ទំព័របន្ទាប់"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </Section>
  );
}
