"use client";

import Image from "next/image";
import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { FoodByAreaImage } from "@/src/types/foodByArea";
import { getValidImageUrl } from "@/src/utils/imageUrl";
import { useUpdateFoodByAreaMutation } from "@/src/app/store/foodByAreaApi";
interface FoodByAreaTableProps {
  data: FoodByAreaImage[];
  onEdit: (item: FoodByAreaImage) => void;
  onDelete: (item: FoodByAreaImage) => void;
}

export default function FoodByAreaTable({
  data,
  onEdit,
  onDelete,
}: FoodByAreaTableProps) {
  const [updateItem] = useUpdateFoodByAreaMutation();

  const [page, setPage] = useState(0);
  const size = 10;
  
  const totalPages = Math.max(Math.ceil(data.length / size), 1);
  const safePage = Math.min(page, totalPages - 1);
  const pageItems = data.slice(safePage * size, safePage * size + size);

  return (
    <section className="overflow-hidden rounded-[24px] border border-gray-100 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] border-collapse text-left">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="px-5 py-4 text-xl font-bold text-[#136C34]">រូបភាព</th>
              <th className="px-5 py-4 text-xl font-bold text-[#136C34]">ទីតាំង</th>
              <th className="px-5 py-4 text-xl font-bold text-[#136C34]">ចំណងជើង</th>
              <th className="px-5 py-4 text-xl font-bold text-[#136C34]">ការពិពណ៌នា</th>
              <th className="px-5 py-4 text-center text-xl font-bold text-[#136C34]">បង្ហាញ</th>
              <th className="px-5 py-4 text-right text-xl font-bold text-[#136C34]">សកម្មភាព</th>
          </tr>
        </thead>
        <tbody>
          {pageItems.map((item) => (
            <tr
              key={item.id}
              className="border-b border-gray-100 last:border-0 hover:bg-gray-50/60"
            >
              <td className="px-5 py-4">
                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={getValidImageUrl(item.image_url)}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
              </td>
              <td className="px-5 py-4 text-base text-gray-500">
                {item.location}
              </td>
              <td className="px-5 py-4">
                <p className="text-lg text-gray-800">{item.name}</p>
                <p className="mt-1 text-sm text-gray-400">{item.id}</p>
              </td>
              <td className="px-5 py-4 text-base text-gray-500 max-w-[220px] truncate">
                {item.description || "-"}
              </td>
              <td className="px-5 py-4 text-center">
                <button
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
              <td className="px-5 py-4">
                <div className="flex justify-end gap-1">
                  <button
                    onClick={() => onEdit(item)}
                    title="កែសម្រួល"
                    className="rounded-lg p-2 text-blue-500 hover:bg-blue-50"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={() => onDelete(item)}
                    title="លុប"
                    className="rounded-lg p-2 text-red-400 hover:bg-red-50"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}

          {pageItems.length === 0 && (
            <tr>
              <td colSpan={6} className="px-5 py-16 text-center text-base text-gray-400">
                មិនមានទិន្នន័យ
              </td>
            </tr>
          )}
        </tbody>
      </table>
      </div>
      <div className="flex items-center justify-between border-t border-gray-100 px-5 py-4 text-base text-gray-500">
        <span>
          Page {safePage + 1} / {totalPages} · សរុប {data.length}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={safePage <= 0}
            onClick={() => setPage(Math.max(0, safePage - 1))}
            className="rounded-lg border border-gray-200 px-3 py-2 disabled:opacity-40 hover:bg-gray-50"
          >
            មុន
          </button>
          <button
            type="button"
            disabled={safePage >= totalPages - 1}
            onClick={() => setPage(Math.min(totalPages - 1, safePage + 1))}
            className="rounded-lg border border-gray-200 px-3 py-2 disabled:opacity-40 hover:bg-gray-50"
          >
            បន្ទាប់
          </button>
        </div>
      </div>
    </section>
  );
}
