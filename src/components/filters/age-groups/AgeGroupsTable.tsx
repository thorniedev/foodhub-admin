import { Pencil, Trash2, UsersRound } from "lucide-react";
import type { AgeGroup } from "@/src/types/ageGroup";
import { formatAdminDate } from "@/src/types/safetyResource";

type Props = {
  items: AgeGroup[];
  disabled?: boolean;
  onEdit: (item: AgeGroup) => void;
  onDelete: (item: AgeGroup) => void;
};

export default function AgeGroupsTable({
  items,
  disabled = false,
  onEdit,
  onDelete,
}: Props) {
  return (
    <div className="w-full min-w-0 max-w-full overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <table className="w-full min-w-[700px] table-auto border-collapse text-left">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/70">
              <th className="whitespace-nowrap px-4 py-3.5 text-lg font-semibold text-primary-800">
                ក្រុមអាយុ
              </th>
              <th className="whitespace-nowrap px-4 py-3.5 text-lg font-semibold text-primary-800">
                កូដ
              </th>
              <th className="whitespace-nowrap px-4 py-3.5 text-lg font-semibold text-primary-800">
                ចន្លោះអាយុ
              </th>
              <th className="whitespace-nowrap px-4 py-3.5 text-lg font-semibold text-primary-800">
                ការពិពណ៌នា
              </th>
              <th className="whitespace-nowrap px-4 py-3.5 text-center text-lg font-semibold text-primary-800">
                ស្ថានភាព
              </th>
              <th className="whitespace-nowrap px-4 py-3.5 text-lg font-semibold text-primary-800">
                កែប្រែចុងក្រោយ
              </th>
              <th className="whitespace-nowrap px-4 py-3.5 text-center text-lg font-semibold text-primary-800 min-w-[110px]">
                សកម្មភាព
              </th>
            </tr>
          </thead>

          <tbody>
            {items.map((item) => (
              <tr
                key={item.uuid}
                className="border-b border-gray-100 bg-white transition-colors duration-150 last:border-b-0 hover:bg-gray-50/70"
              >
                {/* Age Group Name */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-primary-100 bg-primary-50 text-primary-800">
                      <UsersRound size={20} />
                    </div>
                    <p className="text-base font-semibold text-gray-800">
                      {item.name}
                    </p>
                  </div>
                </td>

                {/* Code */}
                <td className="whitespace-nowrap px-4 py-3">
                  <span className="inline-flex rounded-lg bg-gray-100 px-2.5 py-1 font-mono text-base font-semibold text-gray-700">
                    {item.code || "—"}
                  </span>
                </td>

                {/* Range */}
                <td className="whitespace-nowrap px-4 py-3 text-base font-normal text-gray-600">
                  {item.minAge} – {item.maxAge} ឆ្នាំ
                </td>

                {/* Description */}
                <td className="max-w-[380px] px-4 py-3">
                  <p className="line-clamp-2 text-base font-normal text-gray-500">
                    {item.description || "—"}
                  </p>
                </td>

                {/* Status */}
                <td className="px-4 py-3 text-center">
                  <span
                    className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1 text-base font-semibold border ${
                      item.isActive
                        ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                        : "border-gray-200 bg-gray-50 text-gray-600"
                    }`}
                  >
                    <span
                      className={`h-2 w-2 shrink-0 rounded-full ${
                        item.isActive ? "bg-emerald-500" : "bg-gray-400"
                      }`}
                    />
                    {item.isActive ? "សកម្ម" : "អសកម្ម"}
                  </span>
                </td>

                {/* Updated Date */}
                <td className="whitespace-nowrap px-4 py-3 text-base font-normal text-gray-500">
                  {formatAdminDate(item.updatedAt ?? item.createdAt ?? "")}
                </td>

                {/* Actions */}
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => onEdit(item)}
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-500 transition hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-40"
                      title="កែប្រែ"
                    >
                      <Pencil size={18} />
                    </button>

                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => onDelete(item)}
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-500 transition hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-100 disabled:cursor-not-allowed disabled:opacity-40"
                      title="លុប"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {items.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-16 text-center">
                  <p className="text-lg font-medium text-gray-500">
                    មិនមានទិន្នន័យក្រុមអាយុ
                  </p>
                  <p className="mt-1 text-base text-gray-400">
                    សូមចុចប៊ូតុងខាងលើដើម្បីបន្ថែមក្រុមអាយុថ្មី
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
  );
}