"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Pencil, Trash2 } from "lucide-react";
import { SeasonalFoodImage } from "../../../types/seasonalFood";
import { getValidImageUrl } from "../../../utils/imageUrl";
import { useUpdateSeasonalFoodMutation } from "../../../app/store/seasonalFoodApi";

interface SeasonalFoodTableProps {
  data: SeasonalFoodImage[];
  pageSize?: number;
  onEdit: (item: SeasonalFoodImage) => void;
  onDelete: (item: SeasonalFoodImage) => void;
}

export default function SeasonalFoodTable({
  data,
  pageSize = 20,
  onEdit,
  onDelete,
}: SeasonalFoodTableProps) {
  const [updateItem] = useUpdateSeasonalFoodMutation();

  const [page, setPage] = useState(0);
  const size = pageSize;
  
  const totalPages = Math.max(Math.ceil(data.length / size), 1);
  const safePage = Math.min(page, totalPages - 1);
  const pageItems = data.slice(safePage * size, safePage * size + size);

  return (
    <section className="overflow-hidden rounded-[26px] border border-gray-100 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/70">
              <th className="px-6 py-4 text-xl font-semibold text-primary-800">រូបភាព</th>
              <th className="px-6 py-4 text-xl font-semibold text-primary-800">ចំណងជើង</th>
              <th className="px-6 py-4 text-xl font-semibold text-primary-800">លំដាប់</th>
              <th className="px-6 py-4 text-center text-xl font-semibold text-primary-800">បង្ហាញ</th>
              <th className="px-6 py-4 text-right text-xl font-semibold text-primary-800">សកម្មភាព</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((item) => (
              <tr
                key={item.id}
                className="border-b border-gray-100 last:border-0 hover:bg-gray-50/60 transition"
              >
                <td className="px-6 py-4">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100">
                    <Image
                      src={getValidImageUrl(item.image_url)}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-lg font-semibold text-gray-900">{item.name}</p>
                  <p className="mt-1 text-sm text-gray-400 font-mono">{item.id}</p>
                </td>
                <td className="px-6 py-4 text-lg text-gray-500">
                  {item.order}
                </td>
                <td className="px-6 py-4 text-center">
                  <button
                    type="button"
                    onClick={() => updateItem({ id: item.id, changes: { ...item, isdisplay: !item.isdisplay } })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      item.isdisplay ? "bg-[#136C34]" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        item.isdisplay ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(item)}
                      title="កែសម្រួល"
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-primary-800"
                    >
                      <Pencil size={17} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(item)}
                      title="លុប"
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-red-100 text-red-400 transition hover:bg-red-50"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {pageItems.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center text-lg text-gray-400">
                  មិនមានទិន្នន័យ
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-lg text-gray-500">
          Page <span className="font-semibold text-gray-800">{safePage + 1}</span> /{" "}
          <span className="font-semibold text-gray-800">{totalPages}</span>
          {" · "}
          សរុប <span className="font-semibold text-primary-800">{data.length}</span>
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={safePage <= 0}
            onClick={() => setPage(Math.max(0, safePage - 1))}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-4 text-lg font-medium text-gray-600 transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft size={19} />
            មុន
          </button>
          <button
            type="button"
            disabled={safePage >= totalPages - 1}
            onClick={() => setPage(Math.min(totalPages - 1, safePage + 1))}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-4 text-lg font-medium text-gray-600 transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            បន្ទាប់
            <ChevronRight size={19} />
          </button>
        </div>
      </div>
    </section>
  );
}
