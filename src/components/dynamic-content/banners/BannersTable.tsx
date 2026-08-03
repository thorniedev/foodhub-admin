"use client";

import Image from "next/image";
// import { Banner } from "../../../types/banner";
import { useDeleteBannerMutation, useUpdateBannerMutation } from "../../../app/store/bannerApi";
import { Banner } from "../../../types/banner";

interface BannersTableProps {
  banners: Banner[];
  isLoading: boolean;
  onEdit: (banner: Banner) => void;
}

export default function BannersTable({ banners, isLoading, onEdit }: BannersTableProps) {
  const [deleteBanner] = useDeleteBannerMutation();
  const [updateBanner] = useUpdateBannerMutation();
 
  const handleDelete = async (id: string) => {
    if (confirm("តើអ្នកចង់លុបរូបបែនណឺនេះមែនទេ?")) {
      await deleteBanner(id);
    }
  };

  const toggleStatus = async (banner: Banner) => {
    await updateBanner({
      id: banner.id,
      data: { status: banner.status === "active" ? "inactive" : "active" },
    });
  };

  if (isLoading) {
    return <p className="py-10 text-center text-sm text-gray-500">កំពុងផ្ទុក...</p>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-100">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50 text-[#136C34]">
          <tr>
            <th className="px-4 py-3 font-medium text-lg">រូបភាព</th>
            <th className="px-4 py-3 font-medium text-lg">ចំណងជើង</th>
            <th className="px-4 py-3 font-medium text-lg">តំណភ្ជាប់</th>
            <th className="px-4 py-3 font-medium text-lg">លំដាប់</th>
            <th className="px-4 py-3 font-medium text-lg">សកម្មភាព</th>
            <th className="px-4 py-3 font-medium text-right text-lg">សកម្មភាព</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {banners.map((banner) => (
            <tr key={banner.id} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                <div className="relative h-14 w-20 overflow-hidden rounded-md bg-gray-100">
                  <Image
                    src={banner.imageUrl}
                    alt={banner.title}
                    fill
                    className="object-cover"
                  />
                </div>
              </td>
              <td className="px-4 py-3 font-medium text-gray-800">{banner.title}</td>
              <td className="max-w-[220px] truncate px-4 py-3 text-gray-500">
                {banner.link || "-"}
              </td>
              <td className="px-4 py-3 text-gray-500">{banner.order}</td>
              <td className="px-4 py-3">
                <button
                  onClick={() => toggleStatus(banner)}
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    banner.status === "active"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {banner.status === "active" ? "សកម្ម" : "អសកម្ម"}
                </button>
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => onEdit(banner)}
                    className="rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-100"
                  >
                    កែសម្រួល
                  </button>
                  <button
                    onClick={() => handleDelete(banner.id)}
                    className="rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-100"
                  >
                    លុប
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
