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

function getMenuItemImage(item: MenuItemRecord): string | null {
  const raw =
    item.thumbnail ||
    item.imageUrl ||
    item.primaryMediaUrls?.[0] ||
    item.images?.[0] ||
    item.gallery?.[0] ||
    null;

  return resolveFoodHubCatalogImageUrl(raw);
}

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
      title="មុខម្ហូបក្នុងហាង (Menu Items)"
      icon={<UtensilsCrossed size={22} />}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
            {items.length} មុខម្ហូប
          </span>
          {isFetching && (
            <Loader2 size={14} className="animate-spin text-gray-400" />
          )}
        </div>

        <button
          type="button"
          onClick={onAddMenuItem}
          className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50/70 px-3.5 py-1.5 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100 active:scale-95"
        >
          <Plus size={14} />
          + បន្ថែម Menu Item
        </button>
      </div>

      {isLoading ? (
        <div className="flex min-h-[180px] flex-col items-center justify-center gap-2 rounded-2xl bg-gray-50/60 p-6">
          <Loader2 size={26} className="animate-spin text-[#137A3D]" />
          <p className="text-xs font-semibold text-gray-400">
            កំពុងទាញយកមុខម្ហូប...
          </p>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 p-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
            <UtensilsCrossed size={22} />
          </div>
          <p className="mt-3 font-bold text-gray-700">
            មិនទាន់មាន Menu Item ទេ
          </p>
          <p className="mt-1 max-w-sm text-xs text-gray-400">
            ហាងនេះមិនទាន់មានមុខម្ហូបណាមួយត្រូវបានដាក់លក់លើ Website នៅឡើយទេ។
          </p>
          <button
            type="button"
            onClick={onAddMenuItem}
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#137A3D] px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-[#0f6833] active:scale-95"
          >
            <Plus size={14} />
            + បន្ថែម Menu Item សម្រាប់ហាងនេះ
          </button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((item) => {
            const image = getMenuItemImage(item);

            return (
              <div
                key={item.uuid}
                onClick={() => onViewItem?.(item)}
                className="group relative flex cursor-pointer gap-3.5 rounded-2xl border border-gray-100 bg-gray-50/60 p-3 transition hover:border-emerald-200 hover:bg-emerald-50/30 hover:shadow-xs"
              >
                {/* Thumbnail */}
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-200">
                  {image ? (
                    <img
                      src={image}
                      alt={item.name}
                      className="h-full w-full object-cover transition group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-2xl text-gray-400">
                      🍜
                    </div>
                  )}

                  {item.isFeatured && (
                    <span className="absolute left-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-white shadow">
                      <Sparkles size={11} />
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="flex min-w-0 flex-1 flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="truncate font-bold text-gray-900 group-hover:text-[#137A3D]">
                        {item.name}
                      </h4>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewItem?.(item);
                        }}
                        className="rounded-lg p-1 text-gray-400 hover:bg-white hover:text-gray-700"
                        title="មើលព័ត៌មានលម្អិត"
                      >
                        <Eye size={15} />
                      </button>
                    </div>

                    {item.food?.canonicalName &&
                      item.food.canonicalName !== item.name && (
                        <p className="truncate text-xs text-gray-400">
                          {item.food.canonicalName}
                        </p>
                      )}
                  </div>

                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-0.5 font-black text-[#137A3D]">
                      <DollarSign size={13} />
                      <span>
                        {Number(item.price ?? 0).toFixed(2)}{" "}
                        <span className="text-[10px] text-gray-400">
                          {item.currencyCode || "USD"}
                        </span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.preparationTimeMinutes != null && (
                        <span className="flex items-center gap-1 text-[11px] text-gray-400">
                          <Clock size={11} />
                          {item.preparationTimeMinutes}mn
                        </span>
                      )}

                      <span
                        className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                          item.availabilityStatus === "AVAILABLE"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {item.availabilityStatus || "AVAILABLE"}
                      </span>
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
