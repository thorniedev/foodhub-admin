import {
  Pencil,
  RotateCcw,
  Salad,
  Trash2,
} from "lucide-react";

import type { DietaryType } from "@/src/types/dietaryType";

import { formatAdminDate } from "@/src/types/safetyResource";

type Props = {
  items: DietaryType[];
  disabled?: boolean;

  onEdit: (
    item: DietaryType,
  ) => void;

  onDelete: (
    item: DietaryType,
  ) => void;

  onRestore: (
    item: DietaryType,
  ) => void;
};

export default function DietaryTypesTable({
  items,
  disabled = false,
  onEdit,
  onDelete,
  onRestore,
}: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        {/* =================================================
            HEADER
        ================================================== */}

        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/50 text-left">
            <th className="px-5 py-4 text-xl font-bold text-[#136C34]">
              របបអាហារ
            </th>

            <th className="px-5 py-4 text-xl font-bold text-[#136C34]">
              កូដ
            </th>

            <th className="px-5 py-4 text-xl font-bold text-[#136C34]">
              ប្រភេទ
            </th>

            <th className="px-5 py-4 text-xl font-bold text-[#136C34]">
              ការពិពណ៌នា
            </th>

            <th className="px-5 py-4 text-xl font-bold text-[#136C34]">
              ស្ថានភាព
            </th>

            <th className="px-5 py-4 text-xl font-bold text-[#136C34]">
              កែប្រែចុងក្រោយ
            </th>

            <th className="px-5 py-4 text-right text-xl font-bold text-[#136C34]">
              សកម្មភាព
            </th>
          </tr>
        </thead>

        {/* =================================================
            BODY
        ================================================== */}

        <tbody>
          {items.map(
            (item) => (
              <tr
                key={
                  item.uuid
                }
                className="border-b border-gray-100 transition last:border-0 hover:bg-gray-50/60"
              >
                {/* =======================================
                    NAME
                ======================================== */}

                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-[#136C34]">
                      <Salad
                        size={20}
                      />
                    </div>

                    <p className="text-lg text-gray-800">
                      {
                        item.name
                      }
                    </p>
                  </div>
                </td>

                {/* =======================================
                    CODE
                ======================================== */}

                <td className="px-5 py-4">
                  <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-base text-gray-600">
                    {
                      item.code
                    }
                  </span>
                </td>

                {/* =======================================
                    CATEGORY
                ======================================== */}

                <td className="px-5 py-4">
                  <span className="inline-flex rounded-full bg-orange-50 px-3 py-1 text-base text-orange-700">
                    {
                      item.category
                    }
                  </span>
                </td>

                {/* =======================================
                    DESCRIPTION
                ======================================== */}

                <td className="max-w-[340px] px-5 py-4 text-base leading-6 text-gray-500">
                  <p className="line-clamp-2">
                    {item.description ||
                      "—"}
                  </p>
                </td>

                {/* =======================================
                    STATUS
                ======================================== */}

                <td className="px-5 py-4">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-lg ${
                      item.active
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {item.active
                      ? "សកម្ម"
                      : "អសកម្ម"}
                  </span>
                </td>

                {/* =======================================
                    UPDATED
                ======================================== */}

                <td className="whitespace-nowrap px-5 py-4 text-base text-gray-500">
                  {formatAdminDate(
                    item.updatedAt,
                  )}
                </td>

                {/* =======================================
                    ACTIONS
                ======================================== */}

                <td className="px-5 py-4">
                  <div className="flex justify-end gap-1">
                    {/* EDIT */}

                    <button
                      type="button"
                      disabled={
                        disabled
                      }
                      onClick={() =>
                        onEdit(
                          item,
                        )
                      }
                      className="rounded-lg p-2 text-blue-500 transition hover:bg-blue-50 disabled:opacity-40"
                      title="កែប្រែ"
                    >
                      <Pencil
                        size={18}
                      />
                    </button>

                    {/* DELETE / RESTORE */}

                    {item.active ? (
                      <button
                        type="button"
                        disabled={
                          disabled
                        }
                        onClick={() =>
                          onDelete(
                            item,
                          )
                        }
                        className="rounded-lg p-2 text-red-400 transition hover:bg-red-50 disabled:opacity-40"
                        title="បិទ"
                      >
                        <Trash2
                          size={18}
                        />
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={
                          disabled
                        }
                        onClick={() =>
                          onRestore(
                            item,
                          )
                        }
                        className="rounded-lg p-2 text-emerald-600 transition hover:bg-emerald-50 disabled:opacity-40"
                        title="ស្ដារ"
                      >
                        <RotateCcw
                          size={18}
                        />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ),
          )}

          {/* =================================================
              EMPTY
          ================================================== */}

          {items.length ===
            0 && (
            <tr>
              <td
                colSpan={7}
                className="px-5 py-16 text-center"
              >
                <Salad
                  size={36}
                  className="mx-auto text-gray-300"
                />

                <p className="mt-3 text-lg text-[#F97316]">
                  មិនមានទិន្នន័យរបបអាហារ
                </p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}