import {
  Eye,
  Leaf,
  Pencil,
  RotateCcw,
  Trash2,
} from "lucide-react";

import type {
  Ingredient,
} from "@/src/types/ingredient";

interface Props {
  items: Ingredient[];
  disabled?: boolean;

  onView: (
    item: Ingredient,
  ) => void;

  onEdit: (
    item: Ingredient,
  ) => void;

  onDelete: (
    item: Ingredient,
  ) => void;

  onRestore: (
    item: Ingredient,
  ) => void;
}

function formatDate(
  value: string | null,
) {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value;
  }

  return date.toLocaleString(
    "en-US",
    {
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  );
}

export default function IngredientsTable({
  items,
  disabled = false,
  onView,
  onEdit,
  onDelete,
  onRestore,
}: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1000px] border-collapse text-left">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/50">
            <th className="px-6 py-5 text-xl font-semibold text-primary-800">
              គ្រឿងផ្សំ
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

        <tbody>
          {items.map(
            (item) => (
              <tr
                key={
                  item.uuid
                }
                className="border-b border-gray-100 transition last:border-0 hover:bg-gray-50/60"
              >
                {/* NAME */}

                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-800">
                      <Leaf
                        size={
                          20
                        }
                      />
                    </div>

                    <p className="text-lg text-gray-800">
                      {
                        item.name
                      }
                    </p>
                  </div>
                </td>

                {/* DESCRIPTION */}

                <td className="max-w-[380px] px-6 py-5 text-lg leading-6 text-gray-500">
                  <p className="line-clamp-2">
                    {item.description ||
                      "—"}
                  </p>
                </td>

                {/* STATUS */}

                <td className="px-6 py-5">
                  <span
                    className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full px-3.5 py-1.5 text-lg font-medium ring-1 ring-inset ${
                      item.isActive
                        ? "bg-primary-50 text-primary-700 ring-primary-100"
                        : "bg-gray-100 text-gray-500 ring-gray-200"
                    }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${
                        item.isActive ? "bg-primary-600" : "bg-gray-400"
                      }`}
                    />
                    {item.isActive
                      ? "សកម្ម"
                      : "អសកម្ម"}
                  </span>
                </td>

                {/* UPDATED */}

                <td className="px-6 py-5 text-lg text-gray-500">
                  {formatDate(
                    item.updatedAt ??
                      item.createdAt,
                  )}
                </td>

                {/* ACTION */}

                <td className="px-6 py-5">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => onView(item)}
                      className="flex h-10 w-10 items-center justify-center rounded-xl text-emerald-600 transition hover:bg-emerald-50 focus:outline-none focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-40"
                      title="មើលព័ត៌មានលម្អិត"
                    >
                      <Eye size={20} />
                    </button>

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
                      className="flex h-10 w-10 items-center justify-center rounded-xl text-blue-500 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40"
                      title="កែប្រែ"
                    >
                      <Pencil
                        size={20}
                      />
                    </button>

                    {item.isActive ? (
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
                        className="flex h-10 w-10 items-center justify-center rounded-xl text-red-400 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                        title="បិទ"
                      >
                        <Trash2
                          size={
                            18
                          }
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
                        className="flex h-10 w-10 items-center justify-center rounded-xl text-primary-700 transition hover:bg-primary-50 disabled:cursor-not-allowed disabled:opacity-40"
                        title="ស្ដារ"
                      >
                        <RotateCcw
                          size={
                            18
                          }
                        />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ),
          )}

          {items.length ===
            0 && (
            <tr>
              <td
                colSpan={5}
                className="px-5 py-16 text-center"
              >
                <Leaf
                  size={
                    38
                  }
                  className="mx-auto text-gray-300"
                />

                <p className="mt-3 text-lg text-gray-500">
                  មិនមានទិន្នន័យគ្រឿងផ្សំ
                </p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}