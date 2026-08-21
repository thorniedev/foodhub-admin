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
            <th className="px-6 py-5 text-xl font-semibold text-primary-800">
              ក្រុមអាយុ
            </th>

            <th className="px-6 py-5 text-xl font-semibold text-primary-800">
              ឈ្មោះជាភាសាអង់គ្លេស
            </th>

            <th className="px-6 py-5 text-xl font-semibold text-primary-800">
              ចន្លោះអាយុ
            </th>

            <th className="px-6 py-5 text-xl font-semibold text-primary-800">
              ការពិពណ៌នា
            </th>

            <th className="px-6 py-5 text-xl font-semibold text-primary-800">
              ស្ថានភាព
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
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-800">
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

                <td className="px-6 py-5">
                  <span className="inline-flex rounded-lg bg-gray-100 px-3 py-1 font-mono text-base font-semibold text-gray-700">
                    {item.code || "—"}
                  </span>
                </td>

                <td className="whitespace-nowrap px-6 py-5 text-lg text-gray-600">
                  {
                    item.minAge
                  }{" "}
                  –{" "}
                  {
                    item.maxAge
                  }{" "}
                  ឆ្នាំ
                </td>

                <td className="max-w-[380px] px-6 py-5 text-lg leading-6 text-gray-500">
                  <p className="line-clamp-2">
                    {item.description ||
                      "—"}
                  </p>
                </td>

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

                <td className="px-6 py-5">
                  <div className="flex justify-end gap-2">
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
                      className="flex h-10 w-10 items-center justify-center rounded-xl text-red-400 transition hover:bg-red-50 disabled:opacity-40"
                      title="លុប"
                    >
                      <Trash2
                        size={20}
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
                  5
                }
                className="px-5 py-16 text-center"
              >
                <UsersRound
                  size={
                    36
                  }
                  className="mx-auto text-gray-300"
                />

                <p className="mt-3 text-lg text-gray-500">
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