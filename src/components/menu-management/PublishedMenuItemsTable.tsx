"use client";

import { Eye, Globe2, ImageIcon, Pencil, Star, Trash2 } from "lucide-react";

import { resolveFoodHubCatalogImageUrl } from "@/src/lib/resolveFoodHubImageUrl";

import type { MenuItemRecord } from "@/src/types/menu-management";

/* =========================================================
   HELPERS
========================================================= */

function storeName(item: MenuItemRecord): string {
  return (
    item.store?.storeName || item.store?.name || item.store?.localName || "—"
  );
}

function foodName(item: MenuItemRecord): string {
  return item.food?.localName || item.food?.canonicalName || "—";
}

function imageUrl(item: MenuItemRecord): string | null {
  const raw =
    item.thumbnail ||
    item.imageUrl ||
    item.primaryMediaUrls?.[0] ||
    item.images?.[0] ||
    item.gallery?.[0] ||
    null;

  return resolveFoodHubCatalogImageUrl(raw);
}

function formatPrice(item: MenuItemRecord): string {
  const price = Number(item.price ?? 0);

  const currency = item.currencyCode || "USD";

  return `${price.toFixed(2)} ${currency}`;
}

/* =========================================================
   PUBLISHED MENU ITEMS TABLE

   UI consistency:
   - follows Users / Shops table concept
   - minimum normal text = text-lg
   - table headings = text-xl
   - no h1-h6 tags
   - no horizontal overflow
   - table always fits parent width
   - long content truncates inside its own column
========================================================= */

export default function PublishedMenuItemsTable({
  items,
  busy,
  onView,
  onEdit,
  onDelete,
}: {
  items: MenuItemRecord[];
  busy: boolean;
  onView: (item: MenuItemRecord) => void;
  onEdit: (item: MenuItemRecord) => void;
  onDelete: (item: MenuItemRecord) => void;
}) {
  /* =======================================================
     EMPTY STATE
  ======================================================= */

  if (!items.length) {
    return (
      <div className="flex min-h-[340px] flex-col items-center justify-center px-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 text-primary-800">
          <Globe2 size={30} />
        </div>

        <p className="mt-4 text-2xl font-semibold text-primary-800">
          មិនទាន់មាន Menu Item លើ វែបសាយ
        </p>

        <p className="mt-2 max-w-xl text-lg leading-8 text-gray-500">
          Menu Item ដែល Store បាន Publish នឹងបង្ហាញនៅទីនេះ។
        </p>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 max-w-full">
      <table className="w-full table-fixed border-collapse text-left">
        {/* =================================================
            CONTROL COLUMN WIDTH
            Total = 100%

            Menu Item   27%
            Store       16%
            Food        16%
            Price       12%
            Availability 14%
            Actions     15%
        ================================================== */}

        <colgroup>
          <col className="w-[27%]" />
          <col className="w-[16%]" />
          <col className="w-[16%]" />
          <col className="w-[12%]" />
          <col className="w-[14%]" />
          <col className="w-[15%]" />
        </colgroup>

        {/* =================================================
            TABLE HEADER
        ================================================== */}

        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/70">
            <th className="px-4 py-4 text-xl font-semibold text-primary-800">
              Menu Item
            </th>

            <th className="px-4 py-4 text-xl font-semibold text-primary-800">
              Store
            </th>

            <th className="px-4 py-4 text-xl font-semibold text-primary-800">
              Food
            </th>

            <th className="px-4 py-4 text-xl font-semibold text-primary-800">
              Price
            </th>

            <th className="px-4 py-4 text-xl font-semibold text-primary-800">
              Availability
            </th>

            <th className="px-4 py-4 text-start text-xl font-semibold text-primary-800">
              សកម្មភាព
            </th>
          </tr>
        </thead>

        {/* =================================================
            TABLE BODY
        ================================================== */}

        <tbody>
          {items.map((item) => {
            const image = imageUrl(item);

            return (
              <tr
                key={item.uuid}
                className="
                    border-b
                    border-gray-100
                    bg-white
                    transition-colors
                    duration-150
                    last:border-b-0
                    hover:bg-gray-50/70
                  "
              >
                {/* =========================================
                      MENU ITEM
                  ========================================== */}

                <td className="min-w-0 px-4 py-5">
                  <div className="flex min-w-0 items-center gap-3">
                    {/* Image */}
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-100 bg-primary-50 text-primary-800">
                      {image ? (
                        <img
                          src={image}
                          alt={item.name || "Menu item"}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <ImageIcon size={24} />
                      )}
                    </div>

                    {/* Name */}
                    <div className="min-w-0 flex-1">
                      <div className="flex min-w-0 items-center gap-2">
                        <p
                          title={item.name || "—"}
                          className="min-w-0 truncate text-lg font-semibold text-gray-800"
                        >
                          {item.name || "—"}
                        </p>

                        {item.isFeatured && (
                          <Star
                            size={18}
                            className="shrink-0 fill-secondary-400 text-secondary-400"
                          />
                        )}
                      </div>

                      {item.isFeatured && (
                        <p className="mt-1 truncate text-lg font-medium text-secondary-600">
                          Featured
                        </p>
                      )}
                    </div>
                  </div>
                </td>

                {/* =========================================
                      STORE
                  ========================================== */}

                <td className="min-w-0 px-4 py-5">
                  <p
                    title={storeName(item)}
                    className="truncate text-lg font-medium text-gray-700"
                  >
                    {storeName(item)}
                  </p>
                </td>

                {/* =========================================
                      FOOD MASTER
                  ========================================== */}

                <td className="min-w-0 px-4 py-5">
                  <p
                    title={foodName(item)}
                    className="truncate text-lg font-medium text-gray-600"
                  >
                    {foodName(item)}
                  </p>
                </td>

                {/* =========================================
                      PRICE
                  ========================================== */}

                <td className="min-w-0 px-4 py-5">
                  <p
                    title={formatPrice(item)}
                    className="truncate text-lg font-semibold text-primary-800"
                  >
                    {formatPrice(item)}
                  </p>
                </td>

                {/* =========================================
                      AVAILABILITY
                  ========================================== */}

                <td className="min-w-0 px-4 py-5">
                  <div className="min-w-0">
                    <AvailabilityBadge
                      value={item.availabilityStatus || "AVAILABLE"}
                    />
                  </div>
                </td>

                {/* =========================================
                      ACTIONS
                  ========================================== */}

                <td className="px-4 py-5">
                  <div className="flex items-center justify-start gap-1.5">
                    {/* View */}
                    <button
                      type="button"
                      onClick={() => onView(item)}
                      aria-label="View menu item"
                      title="មើលព័ត៌មាន"
                      className="
                          flex
                          h-10
                          w-10
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl
                          text-primary-700
                          transition
                          hover:bg-primary-50
                          focus:outline-none
                          focus:ring-4
                          focus:ring-primary-100
                        "
                    >
                      <Eye size={20} />
                    </button>

                    {/* Edit */}
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => onEdit(item)}
                      aria-label="Edit menu item"
                      title="កែប្រែ"
                      className="
                          flex
                          h-10
                          w-10
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl
                          text-blue-500
                          transition
                          hover:bg-blue-50
                          focus:outline-none
                          focus:ring-4
                          focus:ring-blue-100
                          disabled:cursor-not-allowed
                          disabled:opacity-40
                        "
                    >
                      <Pencil size={20} />
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => onDelete(item)}
                      aria-label="Delete menu item"
                      title="លុប"
                      className="
                          flex
                          h-10
                          w-10
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl
                          text-red-500
                          transition
                          hover:bg-red-50
                          focus:outline-none
                          focus:ring-4
                          focus:ring-red-100
                          disabled:cursor-not-allowed
                          disabled:opacity-40
                        "
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* =========================================================
   AVAILABILITY BADGE
========================================================= */

function AvailabilityBadge({ value }: { value: string }) {
  const status = value.toUpperCase();

  const available = status === "AVAILABLE";

  const soldOut = status === "SOLD_OUT";

  const unavailable = status === "UNAVAILABLE";

  const badgeClass = available
    ? "bg-primary-50 text-primary-700 ring-primary-100"
    : soldOut
      ? "bg-red-50 text-red-600 ring-red-100"
      : unavailable
        ? "bg-secondary-50 text-secondary-600 ring-secondary-100"
        : "bg-gray-100 text-gray-500 ring-gray-200";

  const dotClass = available
    ? "bg-primary-600"
    : soldOut
      ? "bg-red-500"
      : unavailable
        ? "bg-secondary-500"
        : "bg-gray-400";

  return (
    <span
      title={status}
      className={`
        inline-flex
        max-w-full
        items-center
        gap-2
        rounded-full
        px-3
        py-1.5
        text-lg
        font-medium
        ring-1
        ring-inset
        ${badgeClass}
      `}
    >
      <span
        className={`
          h-2
          w-2
          shrink-0
          rounded-full
          ${dotClass}
        `}
      />

      <span className="min-w-0 truncate">{status.replace(/_/g, " ")}</span>
    </span>
  );
}
