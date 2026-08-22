"use client";

import {
  Clock,
  DollarSign,
  Eye,
  Loader2,
  Plus,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react";

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


/* =========================================================
   COMPONENT
========================================================= */

export default function StoreMenuItemsSection({
  storeUuid,
  onViewItem,
  onAddMenuItem,
}: {
  storeUuid: string;
  onViewItem?: (item: MenuItemRecord) => void;
  onAddMenuItem?: () => void;
}) {
  const { data, isLoading, isFetching } = useGetPublishedMenuItemsQuery(
    {
      storeUuid,
      size: 100,
    },
    {
      skip: !storeUuid,
    },
  );

  const items = data?.content ?? [];

  return (
    <Section
      title={`មុខម្ហូបក្នុងហាង (${items.length})`}
      icon={<UtensilsCrossed size={22} />}
      action={
        onAddMenuItem ? (
          <button
            type="button"
            onClick={onAddMenuItem}
            className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#137A3D] px-4 text-sm font-semibold text-white shadow-xs transition hover:bg-[#0f6833]"
          >
            <Plus size={16} />
            បង្កើតមីនុយ
          </button>
        ) : (
          <Link
            href={`/menu-items?storeUuid=${storeUuid}&tab=WEBSITE`}
            className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#137A3D] px-4 text-sm font-semibold text-white shadow-xs transition hover:bg-[#0f6833]"
          >
            <Plus size={16} />
            គ្រប់គ្រង Menu
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
            មិនទាន់មាន Menu Item ទេ
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
              Publish Menu Item ដំបូង
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
              Publish Menu Item ដំបូង
            </Link>
          )}
        </div>
      ) : (
        /* =================================================
            MENU ITEM GRID
        ================================================== */
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {items.map((item) => {
            const image = getMenuItemImage(item);
            const available = item.availabilityStatus === "AVAILABLE";

            return (
              <div
                key={item.uuid}
                onClick={() => onViewItem?.(item)}
                className="group relative min-w-0 cursor-pointer overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-2xs transition-all duration-200 hover:border-emerald-200 hover:shadow-md sm:p-4.5"
              >
                <div className="flex flex-col gap-3.5 sm:flex-row">
                  {/* =====================================
                        IMAGE (Star badge deleted as requested)
                    ====================================== */}
                  <div className="relative h-44 w-full shrink-0 overflow-hidden rounded-xl bg-gray-100 sm:h-28 sm:w-28">
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
                        <UtensilsCrossed size={28} />
                      </div>
                    )}
                  </div>

                  {/* =====================================
                        CONTENT
                    ====================================== */}
                  <div className="flex min-w-0 flex-1 flex-col justify-between">
                    {/* NAME + VIEW BUTTON */}
                    <div className="flex min-w-0 items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p
                          className="text-base font-bold leading-snug text-gray-900 transition group-hover:text-[#137A3D] line-clamp-2"
                          title={item.name}
                        >
                          {item.name}
                        </p>

                        {item.food?.canonicalName &&
                          item.food.canonicalName !== item.name && (
                            <p
                              className="mt-0.5 text-xs text-gray-500 line-clamp-1"
                              title={item.food.canonicalName}
                            >
                              {item.food.canonicalName}
                            </p>
                          )}
                      </div>

                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          onViewItem?.(item);
                        }}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-500 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-[#137A3D]"
                        aria-label="មើលព័ត៌មានលម្អិត"
                        title="មើលព័ត៌មានលម្អិត"
                      >
                        <Eye size={16} />
                      </button>
                    </div>

                    {/* PRICE */}
                    <div className="mt-2 flex items-baseline gap-1.5">
                      <span className="text-base font-extrabold text-[#137A3D]">
                        ${Number(item.price ?? 0).toFixed(2)}
                      </span>
                      <span className="text-xs font-bold text-secondary-600">
                        {item.currencyCode || "USD"}
                      </span>
                    </div>

                    {/* META TAGS (PREP TIME & AVAILABILITY) */}
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {/* PREPARATION TIME */}
                      {item.preparationTimeMinutes != null && (
                        <div className="inline-flex items-center gap-1.5 rounded-lg border border-secondary-100 bg-secondary-50 px-2.5 py-1 text-xs font-semibold text-secondary-700">
                          <Clock size={13} className="text-secondary-500" />
                          <span>{item.preparationTimeMinutes} min</span>
                        </div>
                      )}

                      {/* AVAILABILITY */}
                      <div
                        className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold ${available
                          ? "bg-emerald-50 text-[#137A3D]"
                          : "bg-gray-100 text-gray-600"
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
      )}
    </Section>
  );
}
