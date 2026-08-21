"use client";

import { Eye, ImageIcon, Pencil, Trash2, Utensils } from "lucide-react";

import { resolveFoodHubCatalogImageUrl } from "@/src/lib/resolveFoodHubImageUrl";

import type { FoodRecord } from "@/src/types/menu-management";

/* =========================================================
   HELPERS
========================================================= */

function foodName(item: FoodRecord): string {
  return item.localName || item.canonicalName || item.name || "—";
}

function categoryName(item: FoodRecord): string {
  return item.category?.name || item.categoryName || "—";
}

function cuisineName(item: FoodRecord): string {
  return item.cuisine?.name || item.cuisineName || "—";
}

function imageUrl(item: FoodRecord): string | null {
  const raw =
    item.thumbnail ||
    item.imageUrl ||
    (item as any).primaryMediaUuid ||
    item.primaryMediaUrls?.[0] ||
    item.primaryMediaUuids?.[0] ||
    item.images?.[0] ||
    item.gallery?.[0] ||
    null;

  return resolveFoodHubCatalogImageUrl(raw);
}


/* =========================================================
   FOOD CATALOG TABLE
   Same UI concept as Users / Shops table
========================================================= */

export default function FoodCatalogTable({
  items,
  busy,
  onView,
  onEdit,
  onDelete,
}: {
  items: FoodRecord[];
  busy: boolean;
  onView?: (item: FoodRecord) => void;
  onEdit: (item: FoodRecord) => void;
  onDelete: (item: FoodRecord) => void;
}) {
  if (!items.length) {
    return (
      <div className="flex min-h-[340px] flex-col items-center justify-center px-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 text-primary-800">
          <Utensils size={30} />
        </div>

        <p className="mt-4 text-2xl font-semibold text-primary-800">
          មិនទាន់មាន Food Catalog ទេ
        </p>

        <p className="mt-2 max-w-xl text-lg leading-8 text-gray-500">
          Food Catalog ដែលបានបង្កើតនឹងបង្ហាញនៅទីនេះ។
        </p>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 max-w-full overflow-x-auto">
      <table className="w-full min-w-[1000px] border-collapse text-left">
        {/* =================================================
            TABLE HEADER
        ================================================== */}
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/70">
            <th className="px-6 py-4 text-xl font-semibold text-primary-800">
              ម្ហូប
            </th>

            <th className="px-6 py-4 text-xl font-semibold text-primary-800">
              Category
            </th>

            <th className="px-6 py-4 text-xl font-semibold text-primary-800">
              Cuisine
            </th>

            <th className="px-6 py-4 text-xl font-semibold text-primary-800">
              Status
            </th>

            <th className="px-6 py-4 text-right text-xl font-semibold text-primary-800">
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

            const active = item.isActive !== false;

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
                      FOOD
                  ========================================== */}
                <td className="px-6 py-5">
                  <div className="flex min-w-[320px] items-center gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-100 bg-primary-50 text-primary-800">
                      {image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={image}
                          alt={foodName(item)}
                          className="h-full w-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display = "none";
                            const fallback = e.currentTarget.parentElement?.querySelector(".img-fallback");
                            if (fallback) fallback.classList.remove("hidden");
                          }}
                        />
                      ) : null}
                      <div className={`img-fallback flex h-full w-full items-center justify-center ${image ? "hidden" : ""}`}>
                        <ImageIcon size={24} />
                      </div>
                    </div>


                    <div className="min-w-0">
                      <p className="max-w-[300px] truncate text-lg font-semibold text-gray-800">
                        {foodName(item)}
                      </p>

                      {item.canonicalName &&
                        item.canonicalName !== foodName(item) && (
                          <p className="mt-1 max-w-[300px] truncate text-lg text-gray-400">
                            {item.canonicalName}
                          </p>
                        )}
                    </div>
                  </div>
                </td>

                {/* =========================================
                      CATEGORY
                  ========================================== */}
                <td className="px-6 py-5">
                  <p className="text-lg font-medium text-gray-600">
                    {categoryName(item)}
                  </p>
                </td>

                {/* =========================================
                      CUISINE
                  ========================================== */}
                <td className="px-6 py-5">
                  <p className="text-lg font-medium text-gray-600">
                    {cuisineName(item)}
                  </p>
                </td>

                {/* =========================================
                      STATUS
                  ========================================== */}
                <td className="px-6 py-5">
                  <FoodStatusBadge active={active} />
                </td>

                {/* =========================================
                      ACTIONS
                  ========================================== */}
                <td className="px-6 py-5">
                  <div className="flex items-center justify-end gap-2">
                    {onView && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => onView(item)}
                        aria-label="View food detail"
                        title="មើលលម្អិត"
                        className="
                            flex
                            h-10
                            w-10
                            items-center
                            justify-center
                            rounded-xl
                            text-primary-700
                            transition
                            hover:bg-primary-50
                            focus:outline-none
                            focus:ring-4
                            focus:ring-primary-100
                            disabled:cursor-not-allowed
                            disabled:opacity-40
                          "
                      >
                        <Eye size={20} />
                      </button>
                    )}

                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => onEdit(item)}
                      aria-label="Edit food"
                      title="កែប្រែ"
                      className="
                          flex
                          h-10
                          w-10
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

                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => onDelete(item)}
                      aria-label="Deactivate food"
                      title="បិទ"
                      className="
                          flex
                          h-10
                          w-10
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
   STATUS BADGE
========================================================= */

function FoodStatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`
        inline-flex
        items-center
        gap-2
        whitespace-nowrap
        rounded-full
        px-3.5
        py-1.5
        text-lg
        font-medium
        ring-1
        ring-inset
        ${
          active
            ? "bg-primary-50 text-primary-700 ring-primary-100"
            : "bg-gray-100 text-gray-500 ring-gray-200"
        }
      `}
    >
      <span
        className={`
          h-2
          w-2
          shrink-0
          rounded-full
          ${active ? "bg-primary-600" : "bg-gray-400"}
        `}
      />

      {active ? "សកម្ម" : "អសកម្ម"}
    </span>
  );
}
