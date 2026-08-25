"use client";

import {
  CloudRain,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";

import type {
  WeatherCondition,
} from "@/src/types/weather-condition";

function activeOf(
  item: WeatherCondition,
): boolean {
  return (
    item.isActive ??
    item.active ??
    true
  );
}

export default function WeatherConditionTable({
  items,
  busy,
  onView,
  onEdit,
  onDeactivate,
}: {
  items: WeatherCondition[];
  busy: boolean;
  onView: (
    item: WeatherCondition,
  ) => void;
  onEdit: (
    item: WeatherCondition,
  ) => void;
  onDeactivate: (
    item: WeatherCondition,
  ) => void;
}) {
  if (
    items.length === 0
  ) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center px-5 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-primary-800">
          <CloudRain
            size={28}
          />
        </div>

        <p className="mt-4 text-2xl font-black text-gray-800">
          មិនទាន់មាន Weather Condition
        </p>

        <p className="mt-2 max-w-md text-lg leading-7 text-gray-500">
          បន្ថែមស្ថានភាពអាកាសធាតុដូចជា Rainy, Sunny ឬ Cold។
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-[950px] w-full">
        <thead className="bg-gray-50 text-left text-sm font-black uppercase tracking-wide text-gray-500">
          <tr>
            <th className="px-5 py-4">
              Weather
            </th>

            <th className="px-5 py-4">
              Code
            </th>

            <th className="px-5 py-4">
              Local name
            </th>

            <th className="px-5 py-4">
              Description
            </th>

            <th className="px-5 py-4">
              Status
            </th>

            <th className="px-5 py-4 text-right">
              សកម្មភាព
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100 bg-white">
          {items.map(
            (item) => {
              const active =
                activeOf(
                  item,
                );

              return (
                <tr
                  key={
                    item.uuid
                  }
                  className="transition hover:bg-emerald-50/20"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-primary-800">
                        <CloudRain
                          size={
                            20
                          }
                        />
                      </div>

                      <p className="text-lg font-black text-gray-900">
                        {
                          item.name
                        }
                      </p>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-black text-gray-600">
                      {
                        item.code
                      }
                    </span>
                  </td>

                  <td className="px-5 py-4 text-lg font-semibold text-gray-600">
                    {item.localName ||
                      "—"}
                  </td>

                  <td className="max-w-[320px] px-5 py-4 text-lg text-gray-500">
                    <p className="line-clamp-2">
                      {item.description ||
                        "—"}
                    </p>
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-sm font-black ${
                        active
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {active
                        ? "ACTIVE"
                        : "INACTIVE"}
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
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition hover:bg-gray-50"
                        aria-label="View"
                      >
                        <Eye
                          size={
                            17
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
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-primary-800 disabled:opacity-50"
                        aria-label="Edit"
                      >
                        <Pencil
                          size={
                            17
                          }
                        />
                      </button>

                      <button
                        type="button"
                        disabled={
                          busy ||
                          !active
                        }
                        onClick={() =>
                          onDeactivate(
                            item,
                          )
                        }
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-red-100 text-red-400 transition hover:bg-red-50 disabled:opacity-40"
                        aria-label="Deactivate"
                      >
                        <Trash2
                          size={
                            17
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
