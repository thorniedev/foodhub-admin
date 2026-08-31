"use client";

import Image from "next/image";
import { useState } from "react";
import { Pencil, Trash2, MapPin } from "lucide-react";
import { useUpdateBannerStatusMutation } from "../../../app/store/bannerApi";
import {
  AdminBannerResponse,
  BANNER_CATEGORY_LABELS,
  GetAdminBannersParams,
} from "../../../types/banner";
import { resolveFoodHubCatalogImageUrl } from "../../../lib/resolveFoodHubImageUrl";
import { getAdminApiErrorMessage } from "../../../lib/adminApiError";
import { formatShortDate } from "../../../lib/formatDate";

interface BannersTableProps {
  banners: AdminBannerResponse[];
  isLoading: boolean;
  /** Exact args of the currently active list query, used for optimistic status patching. */
  listArgs: GetAdminBannersParams;
  onEdit: (banner: AdminBannerResponse) => void;
  onDeleteRequest: (banner: AdminBannerResponse) => void;
}

const CATEGORY_BADGE_STYLES: Record<string, string> = {
  MAIN: "bg-emerald-50 text-emerald-700",
  POPULAR: "bg-orange-50 text-orange-700",
  LOCATION: "bg-blue-50 text-blue-700",
  SEASON: "bg-purple-50 text-purple-700",
};

function TableSkeleton() {
  return (
    <div className="animate-pulse divide-y divide-gray-100" role="status" aria-label="កំពុងផ្ទុកបញ្ជីបែនណឺ">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="flex items-center gap-4 px-5 py-4">
          <div className="h-14 w-20 shrink-0 rounded-lg bg-gray-100" />
          <div className="h-4 w-40 rounded bg-gray-100" />
          <div className="h-6 w-20 rounded-full bg-gray-100" />
          <div className="ml-auto h-6 w-11 rounded-full bg-gray-100" />
        </div>
      ))}
    </div>
  );
}

export default function BannersTable({
  banners,
  isLoading,
  listArgs,
  onEdit,
  onDeleteRequest,
}: BannersTableProps) {
  const [updateBannerStatus] = useUpdateBannerStatusMutation();
  const [rowError, setRowError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const handleToggleStatus = async (banner: AdminBannerResponse) => {
    if (pendingId) return;

    setRowError(null);
    setPendingId(banner.id);
    try {
      await updateBannerStatus({
        id: banner.id,
        isPublished: !banner.isPublished,
        listArgs,
      }).unwrap();
    } catch (error) {
      setRowError(getAdminApiErrorMessage(error));
    } finally {
      setPendingId(null);
    }
  };

  return (
    <section className="overflow-hidden rounded-[24px] border border-gray-100 bg-white shadow-sm">
      {rowError && (
        <p role="alert" className="border-b border-red-100 bg-red-50 px-5 py-3 text-sm font-medium text-red-600">
          {rowError}
        </p>
      )}

      {isLoading ? (
        <TableSkeleton />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/80 text-left text-xl font-medium text-primary-900">
                <th className="px-5 py-4 font-medium">រូបភាព</th>
                <th className="px-5 py-4 font-medium">ចំណងជើង</th>
                <th className="px-5 py-4 font-medium">ប្រភេទ</th>
                <th className="px-5 py-4 font-medium">ទីតាំង</th>
                <th className="px-5 py-4 text-center font-medium">បង្ហាញ</th>
                <th className="px-5 py-4 font-medium">បង្កើតនៅ</th>
                <th className="px-5 py-4 text-right font-medium">សកម្មភាព</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {banners.map((banner) => (
                <tr
                  key={banner.id}
                  className="border-b border-gray-100 last:border-0 hover:bg-gray-50/60"
                >
                  <td className="px-5 py-4">
                    <div className="relative h-14 w-20 overflow-hidden rounded-2xl bg-gray-100">
                      <Image
                        src={resolveFoodHubCatalogImageUrl(banner.imageUrl || (banner as any).imageMediaUuid) ?? "/Image/banner/placeholder.jpg"}
                        alt=""
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  </td>
                  <td className="px-5 py-4 text-lg font-normal text-gray-800">{banner.title}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-full border border-gray-100 px-3.5 py-1 text-lg font-normal ${CATEGORY_BADGE_STYLES[banner.category] ??
                        "bg-gray-100 text-gray-600"
                        }`}
                    >
                      {BANNER_CATEGORY_LABELS[banner.category]}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-lg font-normal text-gray-500">
                    {banner.location ? (
                      <span className="inline-flex items-center gap-1">
                        <MapPin size={16} />
                        {banner.location}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-5 py-4 text-center">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={banner.isPublished}
                      aria-label={
                        banner.isPublished
                          ? `Unpublish ${banner.title}`
                          : `Publish ${banner.title}`
                      }
                      disabled={pendingId === banner.id}
                      onClick={() => handleToggleStatus(banner)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 ${banner.isPublished ? "bg-[#136C34]" : "bg-gray-300"
                        }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${banner.isPublished ? "translate-x-6" : "translate-x-1"
                          }`}
                      />
                    </button>
                  </td>
                  <td className="px-5 py-4 text-lg font-normal text-gray-500">
                    {formatShortDate(banner.createdAt)}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onEdit(banner)}
                        aria-label={`Edit ${banner.title}`}
                        title="កែសម្រួល"
                        className="rounded-lg p-2 text-blue-500 hover:bg-blue-50"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        type="button"
                        disabled={pendingId === banner.id}
                        onClick={() => onDeleteRequest(banner)}
                        aria-label={`Delete ${banner.title}`}
                        title="លុប"
                        className="rounded-lg p-2 text-red-400 hover:bg-red-50 disabled:opacity-50"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {banners.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center text-base text-gray-400">
                    មិនមានទិន្នន័យ
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
