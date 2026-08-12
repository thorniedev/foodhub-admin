import {
  Pencil,
  Trash2,
  UsersRound,
} from "lucide-react";

import type {
  AgeGroup,
} from "@/src/types/ageGroup";

type Props = {
  items: AgeGroup[];

  disabled?: boolean;

  onEdit: (
    item: AgeGroup,
  ) => void;

  onDelete: (
    item: AgeGroup,
  ) => void;
};

export default function AgeGroupsTable({
  items,

  disabled = false,

  onEdit,

  onDelete,
}: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-[980px] w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/50">
            <th className="px-5 py-4 text-xl font-bold text-[#136C34]">
              ក្រុមអាយុ
            </th>

            <th className="px-5 py-4 text-xl font-bold text-[#136C34]">
              កូដ
            </th>

            <th className="px-5 py-4 text-xl font-bold text-[#136C34]">
              ចន្លោះអាយុ
            </th>

            <th className="px-5 py-4 text-xl font-bold text-[#136C34]">
              ការពិពណ៌នា
            </th>

            <th className="px-5 py-4 text-xl font-bold text-[#136C34]">
              ស្ថានភាព
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
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-[#136C34]">
                      <UsersRound
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

                <td className="px-5 py-4">
                  <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-sm font-semibold text-gray-600">
                    {
                      item.code
                    }
                  </span>
                </td>

                <td className="whitespace-nowrap px-5 py-4 text-base text-gray-600">
                  {
                    item.minAge
                  }{" "}
                  –{" "}
                  {
                    item.maxAge
                  }{" "}
                  ឆ្នាំ
                </td>

                <td className="max-w-[380px] px-5 py-4 text-base leading-6 text-gray-500">
                  <p className="line-clamp-2">
                    {item.description ||
                      "—"}
                  </p>
                </td>

                <td className="px-5 py-4">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-base font-semibold ${
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
                      className="rounded-lg p-2 text-blue-500 transition hover:bg-blue-50 disabled:opacity-40"
                      title="កែប្រែ"
                    >
                      <Pencil
                        size={
                          18
                        }
                      />
                    </button>

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
                      title="លុប"
                    >
                      <Trash2
                        size={
                          18
                        }
                      />
                    </button>
                  </div>
                </td>
              </tr>
            ),
          )}

          {items.length ===
            0 && (
            <tr>
              <td
                colSpan={
                  6
                }
                className="px-5 py-16 text-center"
              >
                <UsersRound
                  size={
                    36
                  }
                  className="mx-auto text-gray-300"
                />

                <p className="mt-3 text-base text-gray-500">
                  មិនមានទិន្នន័យក្រុមអាយុ
                </p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}