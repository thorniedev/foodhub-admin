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
}: {
  storeUuid: string;
  onViewItem?: (item: MenuItemRecord) => void;
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
      title="មុខម្ហូបក្នុងហាង (Menu Items)"
      icon={<UtensilsCrossed size={22} />}
    >
      {/* =================================================
          TOP ACTIONS
      ================================================== */}

      <div
        className="
          mb-6
          flex
          flex-col
          gap-4
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >
        {/* ITEM COUNT */}

        <div className="flex items-center gap-3">
          <div
            className="
              inline-flex
              min-h-11
              items-center
              gap-2
              rounded-full
              bg-primary-50
              px-4
              text-lg
              font-medium
              text-primary-800
            "
          >
            <UtensilsCrossed size={19} />
            {items.length} មុខម្ហូប
          </div>

          {isFetching && (
            <Loader2
              size={22}
              className="
                animate-spin
                text-primary-700
              "
            />
          )}
        </div>

        {/* MANAGE MENU */}

        <Link
          href="/menu-items"
          className="
            inline-flex
            min-h-[48px]
            w-full
            items-center
            justify-center
            gap-2
            rounded-full
            border
            border-primary-200
            bg-primary-50
            px-5
            text-lg
            font-medium
            text-primary-800
            transition
            hover:border-primary-300
            hover:bg-primary-100
            focus:outline-none
            focus:ring-4
            focus:ring-primary-100
            sm:w-fit
          "
        >
          <Plus size={20} />
          គ្រប់គ្រង Menu
        </Link>
      </div>

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

          <Link
            href="/menu-items"
            className="
              mt-5
              inline-flex
              min-h-[52px]
              items-center
              justify-center
              gap-2
              rounded-full
              bg-primary-800
              px-6
              text-lg
              font-medium
              text-white
              transition
              hover:bg-primary-900
              focus:outline-none
              focus:ring-4
              focus:ring-primary-200
            "
          >
            <Plus size={20} />
            Publish Menu Item ដំបូង
          </Link>
        </div>
      ) : (
        /* =================================================
            MENU ITEM GRID
        ================================================== */

        <div
          className="
            grid
            grid-cols-1
            gap-5
            xl:grid-cols-2
          "
        >
          {items.map((item) => {
            const image = getMenuItemImage(item);

            const available = item.availabilityStatus === "AVAILABLE";

            return (
              <div
                key={item.uuid}
                onClick={() => onViewItem?.(item)}
                className="
                    group
                    relative
                    min-w-0
                    cursor-pointer
                    overflow-hidden
                    rounded-2xl
                    border
                    border-gray-100
                    bg-white
                    p-4
                    transition
                    hover:border-primary-200
                    hover:shadow-md
                    sm:p-5
                  "
              >
                <div
                  className="
                      flex
                      flex-col
                      gap-4
                      sm:flex-row
                    "
                >
                  {/* =====================================
                        IMAGE
                    ====================================== */}

                  <div
                    className="
                        relative
                        h-48
                        w-full
                        shrink-0
                        overflow-hidden
                        rounded-2xl
                        bg-gray-100
                        sm:h-32
                        sm:w-32
                      "
                  >
                    {image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={image}
                        alt={item.name}
                        loading="lazy"
                        className="
                            h-full
                            w-full
                            object-cover
                            transition
                            duration-300
                            group-hover:scale-105
                          "
                      />
                    ) : (
                      <div
                        className="
                            flex
                            h-full
                            w-full
                            items-center
                            justify-center
                            bg-primary-50
                            text-primary-700
                          "
                      >
                        <UtensilsCrossed size={34} />
                      </div>
                    )}

                    {/* FEATURED */}

                    {item.isFeatured && (
                      <div
                        className="
                            absolute
                            left-2
                            top-2
                            flex
                            h-10
                            w-10
                            items-center
                            justify-center
                            rounded-full
                            bg-secondary-500
                            text-white
                            shadow-sm
                          "
                        title="Featured"
                      >
                        <Sparkles size={19} />
                      </div>
                    )}
                  </div>

                  {/* =====================================
                        CONTENT
                    ====================================== */}

                  <div className="flex min-w-0 flex-1 flex-col">
                    {/* NAME + VIEW */}

                    <div className="flex min-w-0 items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p
                          className="
                              truncate
                              text-xl
                              font-semibold
                              text-gray-900
                              transition
                              group-hover:text-primary-800
                            "
                          title={item.name}
                        >
                          {item.name}
                        </p>

                        {item.food?.canonicalName &&
                          item.food.canonicalName !== item.name && (
                            <p
                              className="
                                  mt-1
                                  truncate
                                  text-lg
                                  text-gray-500
                                "
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
                        className="
                            flex
                            h-11
                            w-11
                            shrink-0
                            items-center
                            justify-center
                            rounded-xl
                            border
                            border-gray-100
                            bg-gray-50
                            text-gray-500
                            transition
                            hover:border-primary-200
                            hover:bg-primary-50
                            hover:text-primary-800
                            focus:outline-none
                            focus:ring-4
                            focus:ring-primary-100
                          "
                        aria-label="មើលព័ត៌មានលម្អិត"
                        title="មើលព័ត៌មានលម្អិត"
                      >
                        <Eye size={20} />
                      </button>
                    </div>

                    {/* =====================================
                          PRICE
                      ====================================== */}

                    <div className="mt-4 flex items-center gap-2">
                      <div
                        className="
                            flex
                            h-10
                            w-10
                            shrink-0
                            items-center
                            justify-center
                            rounded-xl
                            bg-primary-50
                            text-primary-800
                          "
                      >
                        <DollarSign size={20} />
                      </div>

                      <div className="min-w-0">
                        <p className="text-lg font-semibold text-primary-800">
                          {Number(item.price ?? 0).toFixed(2)}{" "}
                          <span className="font-medium text-gray-500">
                            {item.currencyCode || "USD"}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* =====================================
                          META
                      ====================================== */}

                    <div
                      className="
                          mt-auto
                          flex
                          flex-wrap
                          items-center
                          gap-3
                          pt-4
                        "
                    >
                      {/* PREPARATION TIME */}

                      {item.preparationTimeMinutes != null && (
                        <div
                          className="
                              inline-flex
                              min-h-10
                              items-center
                              gap-2
                              rounded-full
                              bg-gray-50
                              px-4
                              text-lg
                              font-medium
                              text-gray-600
                            "
                        >
                          <Clock size={19} />
                          {item.preparationTimeMinutes} min
                        </div>
                      )}

                      {/* AVAILABILITY */}

                      <div
                        className={`
                            inline-flex
                            min-h-10
                            items-center
                            rounded-full
                            px-4
                            text-lg
                            font-medium

                            ${
                              available
                                ? "bg-primary-50 text-primary-800"
                                : "bg-gray-100 text-gray-600"
                            }
                          `}
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
