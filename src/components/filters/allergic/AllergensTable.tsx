import {
  Eye,
  MinusCircle,
  Pencil,
  RotateCcw,
  ShieldAlert,
} from "lucide-react";
import type { Allergen } from "@/src/types/allergen";
import { formatAdminDate } from "@/src/types/safetyResource";

type Props = {
  allergens: Allergen[];
  disabled?: boolean;
  onView: (item: Allergen) => void;
  onEdit: (item: Allergen) => void;
  onDelete: (item: Allergen) => void;
  onRestore: (item: Allergen) => void;
};

export default function AllergensTable({
  allergens,
  disabled = false,
  onView,
  onEdit,
  onDelete,
  onRestore,
}: Props) {
  return (
    <div className="w-full min-w-0 max-w-full overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <table className="w-full min-w-[700px] table-auto border-collapse text-left">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/70">
              <th className="whitespace-nowrap px-4 py-3.5 text-xl font-normal text-primary-800">
                អាឡែស៊ី
              </th>
              <th className="whitespace-nowrap px-4 py-3.5 text-xl font-normal text-primary-800">
                កូដ
              </th>
              <th className="whitespace-nowrap px-4 py-3.5 text-xl font-normal text-primary-800">
                ការពិពណ៌នា
              </th>
              <th className="whitespace-nowrap px-4 py-3.5 text-center text-xl font-normal text-primary-800">
                ស្ថានភាព
              </th>
           
              <th className="whitespace-nowrap px-4 py-3.5 text-center text-xl font-normal text-primary-800 min-w-[120px]">
                សកម្មភាព
              </th>
            </tr>
          </thead>

          <tbody>
            {allergens.map((item) => (
              <tr
                key={item.uuid}
                className="border-b border-gray-100 bg-white transition-colors duration-150 last:border-b-0 hover:bg-gray-50/70"
              >
                {/* Allergen */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-primary-100 bg-primary-50 text-primary-800">
                      <ShieldAlert size={20} />
                    </div>
                    <p className="text-lg font-normal text-gray-800">
                      {item.name || item.code}
                    </p>
                  </div>
                </td>

                {/* Code */}
                <td className="whitespace-nowrap px-4 py-3">
                  <span className="inline-flex rounded-lg bg-gray-100 px-3 py-1 font-mono text-lg font-normal text-gray-700">
                    {item.code || "—"}
                  </span>
                </td>

                {/* Description */}
                <td className="max-w-[400px] px-4 py-3">
                  <p className="line-clamp-2 text-lg font-normal text-gray-500">
                    {item.description || "—"}
                  </p>
                </td>

                {/* Status */}
                <td className="px-4 py-3 text-center">
                  <span
                    className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1 text-lg font-normal border ${
                      item.active
                        ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                        : "border-gray-200 bg-gray-50 text-gray-600"
                    }`}
                  >
                    <span
                      className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                        item.active ? "bg-emerald-500" : "bg-gray-400"
                      }`}
                    />
                    {item.active ? "សកម្ម" : "អសកម្ម"}
                  </span>
                </td>

              

                {/* Actions */}
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => onView(item)}
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-40"
                      title="មើលព័ត៌មានលម្អិត"
                    >
                      <Eye size={18} />
                    </button>

                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => onEdit(item)}
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-500 transition hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-40"
                      title="កែប្រែ"
                    >
                      <Pencil size={18} />
                    </button>

                    {item.active ? (
                      <button
                        type="button"
                        disabled={disabled}
                        onClick={() => onDelete(item)}
                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 transition hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-100 disabled:cursor-not-allowed disabled:opacity-40"
                        title="បិទដំណើរការ"
                      >
                        <MinusCircle size={18} />
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={disabled}
                        onClick={() => onRestore(item)}
                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-40"
                        title="ស្ដារឡើងវិញ"
                      >
                        <RotateCcw size={18} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}

            {allergens.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center">
                  <p className="text-lg font-medium text-gray-500">
                    មិនមានទិន្នន័យអាឡែស៊ី
                  </p>
                  <p className="mt-1 text-lg text-gray-400">
                    សូមចុចប៊ូតុងខាងលើដើម្បីបន្ថែមអាឡែស៊ីថ្មី
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
  );
}