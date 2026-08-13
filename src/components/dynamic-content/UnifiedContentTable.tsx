"use client";

import Image from "next/image";
import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
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
  onEdit: (item: UnifiedItem) => void;
  onDelete?: (item: UnifiedItem) => void;
}

export default function UnifiedContentTable({
  data,
  onEdit,
  onDelete,
}: UnifiedContentTableProps) {
  const [page, setPage] = useState(0);
  const size = 10;
  
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
    <section className="overflow-hidden rounded-[24px] border border-gray-100 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="px-5 py-4 text-xl font-bold text-[#136C34]">រូបភាព</th>
              <th className="px-5 py-4 text-xl font-bold text-[#136C34]">ប្រភព</th>
              <th className="px-5 py-4 text-xl font-bold text-[#136C34]">ចំណងជើង</th>
              <th className="px-5 py-4 text-xl font-bold text-[#136C34]">ព័ត៌មានបន្ថែម</th>
              <th className="px-5 py-4 text-xl font-bold text-[#136C34]">ការពិពណ៌នា</th>
              <th className="px-5 py-4 text-right text-xl font-bold text-[#136C34]">សកម្មភាព</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((item) => (
              <tr
                key={`${item.type}-${item.id}`}
                className="border-b border-gray-100 last:border-0 hover:bg-gray-50/60"
              >
                <td className="px-5 py-3">
                  <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-gray-100 bg-gray-50 sm:h-20 sm:w-20 lg:h-24 lg:w-24">
                    <Image
                      src={getValidImageUrl(item.image_url)}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                </td>
                <td className="px-5 py-4 font-medium text-gray-900">
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                    {getTypeLabel(item.type)}
                  </span>
                </td>
                <td className="px-5 py-4 font-medium text-gray-900">{item.name}</td>
                <td className="px-5 py-4 text-gray-500 capitalize">{item.extraInfo || "-"}</td>
                <td className="px-5 py-4 text-gray-500 line-clamp-2 max-w-[200px] mt-4">{item.description || "-"}</td>
                <td className="px-5 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onEdit(item)}
                      className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-emerald-50 hover:text-[#136C34]"
                      title="កែប្រែ"
                    >
                      <Pencil size={18} />
                    </button>
                    {onDelete && item.type !== "banner" && (
                      <button
                        onClick={() => onDelete(item)}
                        className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                        title="លុប"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
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
