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
import Pagination from "@/src/components/ui/Pagination";

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
            className="inline-flex h-12 cursor-pointer items-center gap-2 rounded-full bg-primary-800 px-6 text-lg font-normal text-white shadow-xs transition hover:bg-primary-900 active:scale-95"
          >
            <Plus size={19} />
            <span>បង្កើតម៉ឺនុយ</span>
          </button>
        ) : (
          <Link
            href={`/menu-items?storeUuid=${storeUuid}&tab=WEBSITE`}
            className="inline-flex h-12 cursor-pointer items-center gap-2 rounded-full bg-primary-800 px-6 text-lg font-normal text-white shadow-xs transition hover:bg-primary-900 active:scale-95"
          >
            <Plus size={19} />
            <span>គ្រប់គ្រងម៉ឺនុយ</span>
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
            rounded-3xl
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

          <p className="text-lg font-normal text-gray-500">
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
            rounded-3xl
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
              rounded-full
              bg-primary-50
              text-primary-700
            "
          >
            <UtensilsCrossed size={29} />
          </div>

          <p className="mt-4 text-2xl font-medium text-primary-800">
            មិនទាន់មានម៉ឺនុយទេ
          </p>

          <p
            className="
              mt-2
              max-w-xl
              text-lg
              font-normal
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
                text-lg
                font-normal
                text-white
                transition
                hover:bg-[#0f6833]
              "
            >
              <Plus size={18} />
              <span>បង្កើតម៉ឺនុយដំបូង</span>
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
                text-lg
                font-normal
                text-white
                transition
                hover:bg-[#0f6833]
              "
            >
              <Plus size={18} />
              <span>បង្កើតម៉ឺនុយដំបូង</span>
            </Link>
          )}
        </div>
      ) : (
        /* =================================================
            MENU ITEM GRID
        ================================================== */
        <>
          {/* =================================================
              MENU ITEM GRID (HORIZONTAL RECTANGLE CARDS)
          ================================================== */}
          <div className="grid grid-cols-1 gap-4">
            {paginatedItems.map((item) => {
              const image = getMenuItemImage(item);
              const available = item.availabilityStatus === "AVAILABLE";

              return (
                <div
                  key={item.uuid}
                  onClick={() => onViewItem?.(item)}
                  className="group relative flex flex-col sm:flex-row items-stretch sm:items-center min-w-0 cursor-pointer overflow-hidden rounded-3xl border border-gray-100 bg-white p-4 shadow-xs transition-all duration-200 hover:border-emerald-200 hover:shadow-md gap-4 sm:gap-5"
                >
                  {/* IMAGE LEFT */}
                  <div className="relative h-44 sm:h-32 sm:w-44 w-full shrink-0 overflow-hidden rounded-2xl bg-gray-100">
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
                        <UtensilsCrossed size={36} />
                      </div>
                    )}
                  </div>

                  {/* CONTENT RIGHT */}
                  <div className="flex flex-1 flex-col justify-between min-w-0 h-full py-0.5 space-y-3 sm:space-y-2">
                    {/* Header Row: Title & Actions */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        {/* Name */}
                        <p
                          className="text-xl font-medium text-gray-800 transition group-hover:text-primary-800 line-clamp-1"
                          title={item.name}
                        >
                          {item.name}
                        </p>

                        {/* Canonical Name */}
                        {item.food?.canonicalName && item.food.canonicalName !== item.name && (
                          <p
                            className="mt-0.5 text-lg font-normal text-gray-500 line-clamp-1"
                            title={item.food.canonicalName}
                          >
                            {item.food.canonicalName}
                          </p>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            onViewItem?.(item);
                          }}
                          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-gray-600 transition hover:bg-gray-100 hover:text-primary-800"
                          aria-label="មើលព័ត៌មានលម្អិត"
                          title="មើលព័ត៌មានលម្អិត"
                        >
                          <Eye size={18} />
                        </button>

                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            onEditItem?.(item);
                          }}
                          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-emerald-50 text-primary-800 transition hover:bg-emerald-100 hover:text-primary-900"
                          aria-label="កែប្រែម៉ឺនុយ"
                          title="កែប្រែម៉ឺនុយ"
                        >
                          <Pencil size={18} />
                        </button>

                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            onDeleteItem?.(item);
                          }}
                          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-rose-50 text-rose-600 transition hover:bg-rose-100 hover:text-rose-700"
                          aria-label="លុបម៉ឺនុយ"
                          title="លុបម៉ឺនុយ"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    {/* Bottom Row: Price, Prep Time, and Availability status */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl font-medium text-primary-800">
                          ${Number(item.price ?? 0).toFixed(2)}
                        </span>
                        <span className="text-lg font-normal text-gray-400">
                          {item.currencyCode || "USD"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* PREPARATION TIME */}
                        {item.preparationTimeMinutes != null && (
                          <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-100 bg-amber-50 px-3 py-1 text-lg font-normal text-amber-800">
                            <Clock size={16} className="text-amber-600" />
                            <span>{item.preparationTimeMinutes} min</span>
                          </div>
                        )}

                        {/* AVAILABILITY STATUS */}
                        <div
                          className={`inline-flex items-center rounded-full px-3.5 py-1 text-lg font-normal ${
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
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalElements={sortedItems.length}
              pageSize={ITEMS_PER_PAGE}
              unit="ម៉ឺនុយ"
              onPageChange={(page) => setCurrentPage(page)}
              className="mt-6"
            />
          )}
        </>
      )}
    </Section>
  );
}
