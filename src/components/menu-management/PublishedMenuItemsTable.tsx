"use client";

import { useState } from "react";
import {
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";

import {
  resolveFoodHubCatalogImageUrl,
} from "@/src/lib/resolveFoodHubImageUrl";

import type {
  MenuItemRecord,
} from "@/src/types/menu-management";

function storeName(
  item: MenuItemRecord,
): string {
  return (
    item.store?.storeName ||
    item.store?.name ||
    item.store?.localName ||
    "—"
  );
}

function foodName(
  item: MenuItemRecord,
): string {
  return (
    item.food?.localName ||
    item.food?.canonicalName ||
    "—"
  );
}

function imageUrl(
  item: MenuItemRecord,
): string | null {
  const raw =
    item.thumbnail ||
    item.imageUrl ||
    item.primaryMediaUuid ||
    item.thumbnailMediaUuid ||
    item.primaryMediaUrls?.[0] ||
    item.primaryMediaUuids?.[0] ||
    item.images?.[0] ||
    item.gallery?.[0] ||
    item.galleryMediaUuids?.[0] ||
    (item as any).mediaUuid ||
    item.food?.thumbnail ||
    item.food?.imageUrl ||
    item.food?.primaryMediaUuid ||
    item.food?.thumbnailMediaUuid ||
    item.food?.primaryMediaUrls?.[0] ||
    item.food?.primaryMediaUuids?.[0] ||
    (item.food as any)?.mediaUuid ||
    null;

  return resolveFoodHubCatalogImageUrl(
    raw,
  );
}

function TableAvatar({
  src,
  alt,
  fallbackEmoji,
}: {
  src: string | null;
  alt: string;
  fallbackEmoji: string;
}) {
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div className="flex h-full w-full items-center justify-center text-lg text-gray-300">
        {fallbackEmoji}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className="h-full w-full object-cover"
      loading="lazy"
      onError={() => setError(true)}
    />
  );
}

export default function PublishedMenuItemsTable({
  items,
  busy,
  onView,
  onEdit,
  onDelete,
}: {
  items: MenuItemRecord[];
  busy: boolean;
  onView: (
    item: MenuItemRecord,
  ) => void;
  onEdit: (
    item: MenuItemRecord,
  ) => void;
  onDelete: (
    item: MenuItemRecord,
  ) => void;
}) {
  if (!items.length) {
    return (
      <div className="px-6 py-20 text-center text-gray-400">
        មិនទាន់មាន Menu Item ដែលបង្ហាញលើវេបសាយទេ។
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/70 text-left text-xs font-black uppercase tracking-wide text-gray-400">
            <th className="px-5 py-4">
              Menu Item
            </th>

            <th className="px-5 py-4">
              Store
            </th>

            <th className="px-5 py-4">
              Food
            </th>

            <th className="px-5 py-4">
              Price
            </th>

            <th className="px-5 py-4">
              Availability
            </th>

            <th className="px-5 py-4 text-right">
              សកម្មភាព
            </th>
          </tr>
        </thead>

        <tbody>
          {items.map(
            (item) => {
              const image =
                imageUrl(item);

              return (
                <tr
                  key={
                    item.uuid
                  }
                  className="border-b border-gray-50 last:border-b-0"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                        <TableAvatar
                          src={image}
                          alt={item.name}
                          fallbackEmoji="🍜"
                        />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate font-bold text-gray-900">
                          {
                            item.name
                          }
                        </p>

                        {item.isFeatured && (
                          <span className="mt-1 inline-block rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-bold text-orange-500">
                            FEATURED
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4 text-sm text-gray-600">
                    {storeName(
                      item,
                    )}
                  </td>

                  <td className="px-5 py-4 text-sm text-gray-600">
                    {foodName(
                      item,
                    )}
                  </td>

                  <td className="px-5 py-4 text-sm font-bold text-gray-800">
                    {Number(
                      item.price ??
                        0,
                    ).toFixed(
                      2,
                    )}{" "}
                    {item.currencyCode ||
                      "USD"}
                  </td>

                  <td className="px-5 py-4">
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                      {item.availabilityStatus ||
                        "AVAILABLE"}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          onView(
                            item,
                          )
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50"
                      >
                        <Eye
                          size={
                            16
                          }
                        />
                      </button>

                      <button
                        type="button"
                        disabled={
                          busy
                        }
                        onClick={() =>
                          onEdit(
                            item,
                          )
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:border-emerald-200 hover:bg-emerald-50 hover:text-[#137A3D]"
                      >
                        <Pencil
                          size={
                            16
                          }
                        />
                      </button>

                      <button
                        type="button"
                        disabled={
                          busy
                        }
                        onClick={() =>
                          onDelete(
                            item,
                          )
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-100 text-red-400 hover:bg-red-50"
                      >
                        <Trash2
                          size={
                            16
                          }
                        />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            },
          )}
        </tbody>
      </table>
    </div>
  );
}
