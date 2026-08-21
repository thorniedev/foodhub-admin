"use client";

import {
  CircleMinus,
  CloudRain,
  Eye,
  Pencil,
  RotateCcw,
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
  onRestore,
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
  onRestore?: (
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
      <table className="min-w-[950px] w-full border-collapse text-left">
        <thead className="border-b border-gray-100 bg-gray-50/70">
          <tr>
            <th className="px-6 py-4 text-xl font-semibold text-primary-800">
              ឈ្មោះស្ថានភាពអាកាសធាតុ
            </th>

            <th className="px-6 py-4 text-xl font-semibold text-primary-800">
              ឈ្មោះជាភាសាអង់គ្លេស
            </th>

            <th className="px-6 py-4 text-xl font-semibold text-primary-800">
              ការពិពណ៌នា
            </th>

            <th className="px-6 py-4 text-xl font-semibold text-primary-800">
              ស្ថានភាព
            </th>

            <th className="px-6 py-4 text-right text-xl font-semibold text-primary-800">
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
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-primary-800">
                        <CloudRain
                          size={
                            20
                          }
                        />
                      </div>

                      <p className="text-lg font-semibold text-gray-900">
                        {
                          item.localName || item.name
                        }
                      </p>
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <span className="inline-flex rounded-lg bg-gray-100 px-3 py-1 font-mono text-base font-semibold text-gray-700">
                      {item.code || "—"}
                    </span>
                  </td>

                  <td className="max-w-[320px] px-6 py-5 text-lg text-gray-500">
                    <p className="line-clamp-2">
                      {item.description ||
                        "—"}
                    </p>
                  </td>

                  <td className="px-6 py-5">
                    <span
                      className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full px-3.5 py-1.5 text-lg font-medium ring-1 ring-inset ${
                        active
                          ? "bg-primary-50 text-primary-700 ring-primary-100"
                          : "bg-gray-100 text-gray-500 ring-gray-200"
                      }`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${
                          active ? "bg-primary-600" : "bg-gray-400"
                        }`}
                      />
                      {active
                        ? "សកម្ម"
                        : "អសកម្ម"}
                    </span>
                  </td>

                  <td className="px-6 py-5">
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

                      {active ? (
                        <button
                          type="button"
                          disabled={
                            busy
                          }
                          onClick={() =>
                            onDeactivate(
                              item,
                            )
                          }
                          className="flex h-10 w-10 items-center justify-center rounded-full border border-red-100 text-red-500 transition hover:bg-red-50 disabled:opacity-40"
                          title="បិទ (Deactivate)"
                          aria-label="Deactivate"
                        >
                          <CircleMinus
                            size={
                              18
                            }
                          />
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={
                            busy
                          }
                          onClick={() =>
                            onRestore &&
                            onRestore(
                              item,
                            )
                          }
                          className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-200 text-emerald-600 transition hover:bg-emerald-50 focus:outline-none focus:ring-4 focus:ring-emerald-100 disabled:opacity-40"
                          title="ស្ដារ (Restore / Activate)"
                          aria-label="Restore"
                        >
                          <RotateCcw
                            size={
                              17
                            }
                          />
                        </button>
                      )}
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
