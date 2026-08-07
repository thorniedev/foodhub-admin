import {
  LoaderCircle,
  Pencil,
  RotateCcw,
  ShieldAlert,
  Trash2,
} from "lucide-react";

import type { Allergen } from "@/src/types/allergen";

type AllergensTableProps = {
  allergens: Allergen[];
  mutating: boolean;
  onEdit: (allergen: Allergen) => void;
  onDeactivate: (allergen: Allergen) => void;
  onRestore: (allergen: Allergen) => void;
};

function formatDate(value: string) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("km-KH", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function AllergensTable({
  allergens,
  mutating,
  onEdit,
  onDeactivate,
  onRestore,
}: AllergensTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[980px] border-collapse">
        <thead>
          <tr className="border-b border-gray-100 bg-[#fbfcfb] text-left">
            <th className="px-5 py-4 text-sm font-bold text-[#136C34]">
              អាឡែស៊ី
            </th>
            <th className="px-5 py-4 text-sm font-bold text-[#136C34]">
              កូដ
            </th>
            <th className="px-5 py-4 text-sm font-bold text-[#136C34]">
              ការពិពណ៌នា
            </th>
            <th className="px-5 py-4 text-sm font-bold text-[#136C34]">
              ស្ថានភាព
            </th>
            <th className="px-5 py-4 text-sm font-bold text-[#136C34]">
              កែប្រែចុងក្រោយ
            </th>
            <th className="px-5 py-4 text-right text-sm font-bold text-[#136C34]">
              សកម្មភាព
            </th>
          </tr>
        </thead>

        <tbody>
          {allergens.map((allergen) => (
            <tr
              key={allergen.uuid}
              className="border-b border-gray-100 transition last:border-0 hover:bg-gray-50/60"
            >
              <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-[#136C34]">
                    <ShieldAlert size={20} />
                  </div>

                  <div className="min-w-0">
                    <p className="font-semibold text-gray-800">
                      {allergen.name}
                    </p>
                    <p className="mt-0.5 max-w-[220px] truncate text-xs text-gray-400">
                      {allergen.uuid}
                    </p>
                  </div>
                </div>
              </td>

              <td className="px-5 py-4">
                <span className="inline-block max-w-[180px] truncate rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
                  {allergen.code}
                </span>
              </td>

              <td className="max-w-[340px] px-5 py-4 text-sm leading-6 text-gray-500">
                <p className="line-clamp-2">{allergen.description || "—"}</p>
              </td>

              <td className="px-5 py-4">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                    allergen.active
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      allergen.active ? "bg-emerald-500" : "bg-gray-400"
                    }`}
                  />
                  {allergen.active ? "សកម្ម" : "អសកម្ម"}
                </span>
              </td>

              <td className="px-5 py-4 text-sm text-gray-500">
                {formatDate(allergen.updatedAt)}
              </td>

              <td className="px-5 py-4">
                <div className="flex items-center justify-end gap-1">
                  <button
                    type="button"
                    onClick={() => onEdit(allergen)}
                    disabled={mutating}
                    className="rounded-lg p-2 text-blue-500 transition hover:bg-blue-50 disabled:opacity-40"
                    title="កែប្រែ"
                  >
                    <Pencil size={18} />
                  </button>

                  {allergen.active ? (
                    <button
                      type="button"
                      onClick={() => onDeactivate(allergen)}
                      disabled={mutating}
                      className="rounded-lg p-2 text-red-400 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-40"
                      title="បិទអាឡែស៊ី"
                    >
                      <Trash2 size={18} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onRestore(allergen)}
                      disabled={mutating}
                      className="rounded-lg p-2 text-emerald-600 transition hover:bg-emerald-50 disabled:opacity-40"
                      title="ស្ដារអាឡែស៊ី"
                    >
                      {mutating ? (
                        <LoaderCircle size={18} className="animate-spin" />
                      ) : (
                        <RotateCcw size={18} />
                      )}
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
