"use client";

import {
  ImageIcon,
  Star,
} from "lucide-react";

import {
  normalizeCatalogAssetUrl,
} from "@/src/lib/menuItemMediaClient";

import type {
  CatalogMenuItem,
} from "@/src/types/menuItem";

function money(
  price?: number | null,
  currencyCode?: string | null,
) {
  if (
    typeof price !== "number"
  ) {
    return "—";
  }

  return `${
    currencyCode || "USD"
  } ${price.toFixed(2)}`;
}

export default function MenuItemsTable({
  items,
}: {
  items: CatalogMenuItem[];
}) {
  if (items.length === 0) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary-50 text-secondary-500">
          <ImageIcon size={30} />
        </div>

        <p className="mt-4 text-2xl font-semibold text-primary-800">
          មិនទាន់មាន Published Menu Item
        </p>

        <p className="mt-2 max-w-xl text-lg leading-8 text-gray-500">
          ជ្រើស Food Catalog + Store + តម្លៃ + រូបភាព ហើយ Publish។
          Item នោះនឹងចូល public Menu Item feed។
        </p>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 max-w-full overflow-x-auto">
      <table className="w-full min-w-[1450px] border-collapse text-left">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/70">
            <th className="px-6 py-4 text-xl font-semibold text-primary-800">
              Menu Item
            </th>

            <th className="px-6 py-4 text-xl font-semibold text-primary-800">
              Store
            </th>

            <th className="px-6 py-4 text-xl font-semibold text-primary-800">
              Food master
            </th>

            <th className="px-6 py-4 text-xl font-semibold text-primary-800">
              Price
            </th>

            <th className="px-6 py-4 text-xl font-semibold text-primary-800">
              Availability
            </th>

            <th className="px-6 py-4 text-xl font-semibold text-primary-800">
              Prep time
            </th>

            <th className="px-6 py-4 text-xl font-semibold text-primary-800">
              Source
            </th>

            <th className="px-6 py-4 text-xl font-semibold text-primary-800">
              Published
            </th>
          </tr>
        </thead>

        <tbody>
          {items.map((item) => {
            const image =
              normalizeCatalogAssetUrl(
                item.thumbnail ??
                  item.gallery?.[0],
              );

            const available =
              item.availabilityStatus ===
              "AVAILABLE";

            return (
              <tr
                key={item.uuid}
                className="border-b border-gray-100 bg-white transition-colors duration-150 last:border-b-0 hover:bg-gray-50/70"
              >
                <td className="px-6 py-4">
                  <div className="flex min-w-[330px] items-center gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-primary-100 bg-primary-50 text-primary-700">
                      {image ? (
                        <img
                          src={image}
                          alt={
                            item.localName ||
                            item.name
                          }
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <ImageIcon
                          size={22}
                        />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="max-w-[260px] truncate text-lg font-medium text-gray-800">
                          {item.localName ||
                            item.name}
                        </p>

                        {item.isFeatured && (
                          <Star
                            size={18}
                            className="fill-secondary-400 text-secondary-400"
                          />
                        )}
                      </div>

                      {item.localName && (
                        <p className="mt-1 max-w-[260px] truncate text-lg text-gray-500">
                          {item.name}
                        </p>
                      )}

                      <p className="mt-1 max-w-[300px] truncate text-lg text-gray-400">
                        {item.description ||
                          item.uuid}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <p className="text-lg font-medium text-gray-700">
                    {item.store?.storeName ||
                      item.store?.name ||
                      "—"}
                  </p>

                  {item.store?.city && (
                    <p className="mt-1 text-lg text-gray-400">
                      {item.store.city}
                    </p>
                  )}
                </td>

                <td className="px-6 py-4 text-lg text-gray-600">
                  {item.food?.localName ||
                    item.food?.canonicalName ||
                    "—"}
                </td>

                <td className="px-6 py-4">
                  <span className="text-lg font-semibold text-primary-800">
                    {money(
                      item.price,
                      item.currencyCode,
                    )}
                  </span>
                </td>

                <td className="px-6 py-4">
                  <AvailabilityBadge
                    available={available}
                    value={
                      item.availabilityStatus ||
                      "UNKNOWN"
                    }
                  />
                </td>

                <td className="px-6 py-4 text-lg text-gray-600">
                  {item.preparationTimeMinutes ??
                    "—"}{" "}
                  min
                </td>

                <td className="px-6 py-4">
                  <span className="inline-flex rounded-full bg-gray-100 px-3.5 py-1.5 text-lg font-medium text-gray-600">
                    {item.source ||
                      "—"}
                  </span>
                </td>

                <td className="px-6 py-4">
                  <span className="inline-flex rounded-full bg-primary-50 px-3.5 py-1.5 text-lg font-medium text-primary-700 ring-1 ring-inset ring-primary-100">
                    WEBSITE
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function AvailabilityBadge({
  available,
  value,
}: {
  available: boolean;
  value: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full px-3.5 py-1.5 text-lg font-medium ring-1 ring-inset ${
        available
          ? "bg-primary-50 text-primary-700 ring-primary-100"
          : "bg-secondary-50 text-secondary-600 ring-secondary-100"
      }`}
    >
      <span
        className={`h-2 w-2 shrink-0 rounded-full ${
          available
            ? "bg-primary-600"
            : "bg-secondary-500"
        }`}
      />

      {value}
    </span>
  );
}
