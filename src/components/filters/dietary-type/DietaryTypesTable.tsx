import {
  Pencil,
  RotateCcw,
  Salad,
  Trash2,
} from "lucide-react";

import type { DietaryType } from "@/src/types/dietaryType";

import {
  formatAdminDate,
} from "@/src/types/safetyResource";

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
    <div className="w-full min-w-0 max-w-full overflow-x-auto">
      <table className="w-full min-w-[1100px] border-collapse text-left">
        {/* =================================================
            TABLE HEADER
        ================================================== */}
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/70">
            <th className="px-6 py-4 text-xl font-semibold text-primary-800">
              របបអាហារ
            </th>

            <th className="px-6 py-4 text-xl font-semibold text-primary-800">
              កូដ
            </th>

            <th className="px-6 py-4 text-xl font-semibold text-primary-800">
              ប្រភេទ
            </th>

            <th className="px-6 py-4 text-xl font-semibold text-primary-800">
              ការពិពណ៌នា
            </th>

            <th className="px-6 py-4 text-xl font-semibold text-primary-800">
              ស្ថានភាព
            </th>

            <th className="px-6 py-4 text-xl font-semibold text-primary-800">
              កែប្រែចុងក្រោយ
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
          {items.map((item) => (
            <tr
              key={item.uuid}
              className="border-b border-gray-100 bg-white transition-colors duration-150 last:border-b-0 hover:bg-gray-50/70"
            >
              {/* Dietary type */}
              <td className="px-6 py-5">
                <div className="flex min-w-[220px] items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-800">
                    <Salad size={20} />
                  </div>

                  <p className="text-lg font-medium text-gray-800">
                    {item.name}
                  </p>
                </div>
              </td>

              {/* Code */}
              <td className="px-6 py-5">
                <span className="inline-flex rounded-lg bg-gray-100 px-3 py-1.5 font-mono text-lg font-medium text-gray-600">
                  {item.code}
                </span>
              </td>

              {/* Category */}
              <td className="px-6 py-5">
                <span className="inline-flex rounded-full bg-secondary-50 px-3.5 py-1.5 text-lg font-medium text-secondary-600 ring-1 ring-inset ring-secondary-100">
                  {item.category}
                </span>
              </td>

              {/* Description */}
              <td className="max-w-[360px] px-6 py-5">
                <p className="line-clamp-2 text-lg leading-8 text-gray-500">
                  {item.description || "—"}
                </p>
              </td>

              {/* Status */}
              <td className="px-6 py-5">
                <StatusBadge
                  active={item.active}
                />
              </td>

              {/* Updated date */}
              <td className="whitespace-nowrap px-6 py-5 text-lg text-gray-500">
                {formatAdminDate(
                  item.updatedAt,
                )}
              </td>

              {/* Actions */}
              <td className="px-6 py-5">
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() =>
                      onEdit(item)
                    }
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-blue-500 transition hover:bg-blue-50 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-40"
                    title="កែប្រែ"
                  >
                    <Pencil size={20} />
                  </button>

                  {item.active ? (
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() =>
                        onDelete(item)
                      }
                      className="flex h-10 w-10 items-center justify-center rounded-xl text-red-500 transition hover:bg-red-50 focus:outline-none focus:ring-4 focus:ring-red-100 disabled:cursor-not-allowed disabled:opacity-40"
                      title="បិទ"
                    >
                      <Trash2 size={20} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() =>
                        onRestore(item)
                      }
                      className="flex h-10 w-10 items-center justify-center rounded-xl text-primary-700 transition hover:bg-primary-50 focus:outline-none focus:ring-4 focus:ring-primary-100 disabled:cursor-not-allowed disabled:opacity-40"
                      title="ស្ដារ"
                    >
                      <RotateCcw size={20} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}

          {/* Empty state */}
          {items.length === 0 && (
            <tr>
              <td
                colSpan={7}
                className="px-6 py-16 text-center"
              >
                <Salad
                  size={36}
                  className="mx-auto text-gray-300"
                />

                <p className="mt-3 text-lg font-medium text-gray-500">
                  មិនមានទិន្នន័យរបបអាហារ
                </p>

                <p className="mt-1 text-lg text-gray-400">
                  ទិន្នន័យរបបអាហារនឹងបង្ហាញនៅទីនេះ។
                </p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function StatusBadge({
  active,
}: {
  active: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full px-3.5 py-1.5 text-lg font-medium ring-1 ring-inset ${
        active
          ? "bg-primary-50 text-primary-700 ring-primary-100"
          : "bg-gray-100 text-gray-500 ring-gray-200"
      }`}
    >
      <span
        className={`h-2 w-2 shrink-0 rounded-full ${
          active
            ? "bg-primary-600"
            : "bg-gray-400"
        }`}
      />

      {active
        ? "សកម្ម"
        : "អសកម្ម"}
    </span>
  );
}
