import {
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
  onEdit,
  onDelete,
  onRestore,
}: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1000px] border-collapse text-left">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/50">
            <th className="px-5 py-4 text-xl font-bold text-[#136C34]">
              គ្រឿងផ្សំ
            </th>

            <th className="px-5 py-4 text-xl font-bold text-[#136C34]">
              កូដ
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

                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-[#136C34]">
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

                {/* CODE */}

                <td className="px-5 py-4">
                  <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-sm font-semibold text-gray-600">
                    {
                      item.code
                    }
                  </span>
                </td>

                {/* DESCRIPTION */}

                <td className="max-w-[380px] px-5 py-4 text-base leading-6 text-gray-500">
                  <p className="line-clamp-2">
                    {item.description ||
                      "—"}
                  </p>
                </td>

                {/* STATUS */}

                <td className="px-5 py-4">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-base ${
                      item.isActive
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {item.isActive
                      ? "សកម្ម"
                      : "អសកម្ម"}
                  </span>
                </td>

                {/* UPDATED */}

                <td className="px-5 py-4 text-base text-gray-500">
                  {formatDate(
                    item.updatedAt ??
                      item.createdAt,
                  )}
                </td>

                {/* ACTION */}

                <td className="px-5 py-4">
                  <div className="flex justify-end gap-1">
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
                      className="rounded-lg p-2 text-blue-500 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40"
                      title="កែប្រែ"
                    >
                      <Pencil
                        size={
                          18
                        }
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
                        className="rounded-lg p-2 text-red-400 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
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
                        className="rounded-lg p-2 text-emerald-600 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-40"
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
                colSpan={6}
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