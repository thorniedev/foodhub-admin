"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Pencil, Trash2 } from "lucide-react";
import { getValidImageUrl } from "../../utils/imageUrl";

export type UnifiedItem = {
  id: string;
  type: "banner" | "seasonal" | "area";
  name: string;
  image_url: string;
  isdisplay?: boolean;
  extraInfo: string; // location or season
  description?: string;
  originalItem: any;
};

interface UnifiedContentTableProps {
  data: UnifiedItem[];
  pageSize?: number;
  onEdit: (item: UnifiedItem) => void;
  onDelete?: (item: UnifiedItem) => void;
}

export default function UnifiedContentTable({
  data,
  pageSize = 20,
  onEdit,
  onDelete,
}: UnifiedContentTableProps) {
  const [page, setPage] = useState(0);
  const size = pageSize;
  
  const totalPages = Math.max(Math.ceil(data.length / size), 1);
  const safePage = Math.min(page, totalPages - 1);
  const pageItems = data.slice(safePage * size, safePage * size + size);

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "banner": return "រូបភាពផ្សព្វផ្សាយ";
      case "seasonal": return "អាហារតាមរដូវកាល";
      case "area": return "អាហារតាមតំបន់";
      default: return type;
    }
  };

  return (
    <section className="overflow-hidden rounded-[26px] border border-gray-100 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/70">
              <th className="px-6 py-4 text-xl font-semibold text-primary-800">រូបភាព</th>
              <th className="px-6 py-4 text-xl font-semibold text-primary-800">ប្រភព</th>
              <th className="px-6 py-4 text-xl font-semibold text-primary-800">ចំណងជើង</th>
              <th className="px-6 py-4 text-xl font-semibold text-primary-800">ព័ត៌មានបន្ថែម</th>
              <th className="px-6 py-4 text-xl font-semibold text-primary-800">ការពិពណ៌នា</th>
              <th className="px-6 py-4 text-right text-xl font-semibold text-primary-800">សកម្មភាព</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((item) => (
              <tr
                key={`${item.type}-${item.id}`}
                className="border-b border-gray-100 last:border-0 hover:bg-gray-50/60 transition"
              >
                <td className="px-6 py-4">
                  <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-gray-100 bg-gray-50 sm:h-20 sm:w-20">
                    <Image
                      src={getValidImageUrl(item.image_url)}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
                    {getTypeLabel(item.type)}
                  </span>
                </td>
                <td className="px-6 py-4 font-semibold text-lg text-gray-900">{item.name}</td>
                <td className="px-6 py-4 text-lg text-gray-500 capitalize">{item.extraInfo || "—"}</td>
                <td className="px-6 py-4 text-lg text-gray-500 max-w-[240px]">
                  <p className="line-clamp-2">{item.description || "—"}</p>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onEdit(item)}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-primary-800"
                      title="កែប្រែ"
                    >
                      <Pencil size={17} />
                    </button>
                    {onDelete && item.type !== "banner" && (
                      <button
                        onClick={() => onDelete(item)}
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-red-100 text-red-400 transition hover:bg-red-50"
                        title="លុប"
                      >
                        <Trash2 size={17} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}

            {pageItems.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center text-lg text-gray-400">
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
