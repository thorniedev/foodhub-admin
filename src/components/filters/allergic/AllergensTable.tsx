import { Pencil, RotateCcw, ShieldAlert, Trash2 } from "lucide-react";

import type { Allergen } from "@/src/types/allergen";
import { formatAdminDate } from "@/src/types/safetyResource";

type Props = {
  allergens: Allergen[];
  disabled?: boolean;
  onEdit: (item: Allergen) => void;
  onDelete: (item: Allergen) => void;
  onRestore: (item: Allergen) => void;
};

export default function AllergensTable({
  allergens,
  disabled = false,
  onEdit,
  onDelete,
  onRestore,
}: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[980px] border-collapse">
        <thead>
          <tr className="border-b border-gray-100 bg-[#fbfcfb] text-left">
            <th className="px-5 py-4 text-sm font-bold text-[#136C34]">អាឡែស៊ី</th>
            <th className="px-5 py-4 text-sm font-bold text-[#136C34]">កូដ</th>
            <th className="px-5 py-4 text-sm font-bold text-[#136C34]">ការពិពណ៌នា</th>
            <th className="px-5 py-4 text-sm font-bold text-[#136C34]">ស្ថានភាព</th>
            <th className="px-5 py-4 text-sm font-bold text-[#136C34]">កែប្រែចុងក្រោយ</th>
            <th className="px-5 py-4 text-right text-sm font-bold text-[#136C34]">សកម្មភាព</th>
          </tr>
        </thead>

        <tbody>
          {allergens.map((item) => (
            <tr key={item.uuid} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/60">
              <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-[#136C34]">
                    <ShieldAlert size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{item.name}</p>
                    {/* <p className="mt-0.5 max-w-[220px] truncate text-xs text-gray-400">{item.uuid}</p> */}
                  </div>
                </div>
              </td>

              <td className="px-5 py-4">
                <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
                  {item.code}
                </span>
              </td>

              <td className="max-w-[340px] px-5 py-4 text-sm leading-6 text-gray-500">
                <p className="line-clamp-2">{item.description || "—"}</p>
              </td>

              <td className="px-5 py-4">
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                  item.active
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-gray-100 text-gray-500"
                }`}>
                  {item.active ? "សកម្ម" : "អសកម្ម"}
                </span>
              </td>

              <td className="px-5 py-4 text-sm text-gray-500">
                {formatAdminDate(item.updatedAt)}
              </td>

              <td className="px-5 py-4">
                <div className="flex justify-end gap-1">
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => onEdit(item)}
                    className="rounded-lg p-2 text-blue-500 hover:bg-blue-50 disabled:opacity-40"
                    title="កែប្រែ"
                  >
                    <Pencil size={18} />
                  </button>

                  {item.active ? (
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => onDelete(item)}
                      className="rounded-lg p-2 text-red-400 hover:bg-red-50 disabled:opacity-40"
                      title="បិទ"
                    >
                      <Trash2 size={18} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => onRestore(item)}
                      className="rounded-lg p-2 text-emerald-600 hover:bg-emerald-50 disabled:opacity-40"
                      title="ស្ដារ"
                    >
                      <RotateCcw size={18} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
