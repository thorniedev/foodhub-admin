"use client";

import Image from "next/image";
import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { useDeleteBannerMutation, useUpdateBannerMutation } from "../../../app/store/bannerApi";
import { Banner } from "../../../types/banner";
import { getValidImageUrl } from "../../../utils/imageUrl";
interface BannersTableProps {
  banners: Banner[];
  isLoading: boolean;
  onEdit: (banner: Banner) => void;
}

export default function BannersTable({ banners, isLoading, onEdit }: BannersTableProps) {
  const [deleteBanner] = useDeleteBannerMutation();
  const [updateBanner] = useUpdateBannerMutation();
  
  const [page, setPage] = useState(0);
  const size = 10;
  
  const totalPages = Math.max(Math.ceil(banners.length / size), 1);
  const safePage = Math.min(page, totalPages - 1);
  const pageItems = banners.slice(safePage * size, safePage * size + size);

  const handleDelete = async (id: string) => {
    if (confirm("តើអ្នកចង់លុបរូបបែនណឺនេះមែនទេ?")) {
      await deleteBanner(id);
    }
  };

  if (isLoading) {
    return <p className="py-10 text-center text-sm text-gray-500">កំពុងផ្ទុក...</p>;
  }

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
        <tbody className="divide-y divide-gray-100">
          {pageItems.map((banner) => (
            <tr key={banner.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/60">
              <td className="px-5 py-4">
                <div className="relative h-14 w-20 overflow-hidden rounded-lg bg-gray-100">
                  <Image
                    src={getValidImageUrl(banner.image_url)}
                    alt={banner.name}
                    fill
                    className="object-cover"
                  />
                </div>
              </td>
              <td className="px-5 py-4 text-base text-gray-500">{banner.location}</td>
              <td className="px-5 py-4 text-lg text-gray-800">{banner.name}</td>
              <td className="px-5 py-4 text-base text-gray-500 max-w-[220px] truncate">
                {banner.description || "-"}
              </td>
              <td className="px-5 py-4 text-center">
                <button
                  onClick={() => updateBanner({ id: banner.id, data: { ...banner, isdisplay: !banner.isdisplay } })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    banner.isdisplay ? "bg-[#136C34]" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      banner.isdisplay ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </td>
              <td className="px-5 py-4">
                <div className="flex justify-end gap-1">
                  <button
                    onClick={() => onEdit(banner)}
                    title="កែសម្រួល"
                    className="rounded-lg p-2 text-blue-500 hover:bg-blue-50"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(banner.id)}
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
          Page {safePage + 1} / {totalPages} · សរុប {banners.length}
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