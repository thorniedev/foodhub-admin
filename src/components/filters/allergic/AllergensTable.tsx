import {
  AlertOctagon,
  Eye,
  Pencil,
  RotateCcw,
  ShieldAlert,
  Trash2,
} from "lucide-react";

import type { Allergen } from "@/src/types/allergen";

import { formatAdminDate } from "@/src/types/safetyResource";

type Props = {
  allergens: Allergen[];
  disabled?: boolean;

  onView: (
    item: Allergen,
  ) => void;

  onEdit: (
    item: Allergen,
  ) => void;

  onDelete: (
    item: Allergen,
  ) => void;

  onHardDelete?: (
    item: Allergen,
  ) => void;

  onRestore: (
    item: Allergen,
  ) => void;
};

export default function AllergensTable({
  allergens,
  disabled = false,
  onView,
  onEdit,
  onDelete,
  onHardDelete,
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
            {/* code displayed as Allergen */}

            <th className="px-6 py-5 text-xl font-semibold text-primary-800">
              អាឡែស៊ី
            </th>

            <th className="px-6 py-5 text-xl font-semibold text-primary-800">
              ការពិពណ៌នា
            </th>

            <th className="px-6 py-5 text-xl font-semibold text-primary-800">
              ស្ថានភាព
            </th>

            <th className="px-6 py-5 text-xl font-semibold text-primary-800">
              កែប្រែចុងក្រោយ
            </th>

            <th className="px-6 py-5 text-right text-xl font-semibold text-primary-800">
              សកម្មភាព
            </th>
          </tr>
        </thead>

        {/* =================================================
            BODY
        ================================================== */}

        <tbody>
          {allergens.map(
            (item) => (
              <tr
                key={item.uuid}
                className="border-b border-gray-100 transition last:border-0 hover:bg-gray-50/60"
              >
                {/* =======================================
                    ALLERGEN

                    UI label: Allergen
                    Backend data: item.code
                ======================================== */}

                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-800">
                      <ShieldAlert
                        size={20}
                      />
                    </div>

                    <div className="min-w-0">
                      <p className=" test-lg text-gray-800">
                        {
                          item.code
                        }
                      </p>
                    </div>
                  </div>
                </td>

                {/* =======================================
                    DESCRIPTION
                ======================================== */}

                <td className="max-w-[440px] px-6 py-5 text-lg leading-6 text-gray-500">
                  <p className="line-clamp-2">
                    {item.description ||
                      "—"}
                  </p>
                </td>

                {/* =======================================
                    STATUS
                ======================================== */}

                <td className="px-6 py-5">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-lg ${
                      item.active
                        ? "bg-primary-50 text-primary-700"
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

                <td className="whitespace-nowrap px-6 py-5 text-lg text-gray-500">
                  {formatAdminDate(
                    item.updatedAt,
                  )}
                </td>

                {/* =======================================
                    ACTIONS
                ======================================== */}

                <td className="px-6 py-5">
                  <div className="flex justify-end gap-2">
                    {/* VIEW */}

                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => onView(item)}
                      className="flex h-10 w-10 items-center justify-center rounded-xl text-emerald-600 transition hover:bg-emerald-50 focus:outline-none focus:ring-4 focus:ring-emerald-100 disabled:opacity-40"
                      title="មើលព័ត៌មានលម្អិត"
                    >
                      <Eye size={20} />
                    </button>

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
                      className="flex h-10 w-10 items-center justify-center rounded-xl text-blue-500 transition hover:bg-blue-50 disabled:opacity-40"
                      title="កែប្រែ"
                    >
                      <Pencil
                        size={20}
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
                        className="flex h-10 w-10 items-center justify-center rounded-xl text-amber-600 transition hover:bg-amber-50 disabled:opacity-40"
                        title="បិទ"
                      >
                        <Trash2
                          size={20}
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
                        className="flex h-10 w-10 items-center justify-center rounded-xl text-primary-700 transition hover:bg-primary-50 disabled:opacity-40"
                        title="ស្ដារ"
                      >
                        <RotateCcw
                          size={20}
                        />
                      </button>
                    )}

                    {/* HARD DELETE */}

                    {onHardDelete && (
                      <button
                        type="button"
                        disabled={disabled}
                        onClick={() => onHardDelete(item)}
                        className="flex h-10 w-10 items-center justify-center rounded-xl text-red-600 transition hover:bg-red-50 focus:outline-none focus:ring-4 focus:ring-red-100 disabled:opacity-40"
                        title="លុបជាអចិន្ត្រៃយ៍ (Hard Delete)"
                      >
                        <AlertOctagon size={20} />
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

          {allergens.length ===
            0 && (
            <tr>
              <td
                colSpan={5}
                className="px-5 py-16 text-center"
              >
                <ShieldAlert
                  size={36}
                  className="mx-auto text-secondary-600"
                />

                <p className="mt-3 text-xl font-semibold text-secondary-600">
                  មិនមានទិន្នន័យអាឡែស៊ី
                </p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}