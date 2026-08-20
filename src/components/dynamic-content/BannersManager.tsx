"use client";

import { useMemo, useState } from "react";
import {
  useGetAdminBannersQuery,
} from "../../app/store/bannerApi";
import { AdminBannerResponse, BannerCategory } from "../../types/banner";
import { getAdminApiErrorMessage } from "../../lib/adminApiError";

import BannersHeader from "./banners/BannersHeader";
import BannersFilters, { PublishedFilter } from "./banners/BannersFilters";
import BannersTable from "./banners/BannersTable";
import BannersPagination from "./banners/BannersPagination";
import BannerFormModal from "./banners/BannerFormModal";

const PAGE_SIZE = 10;

export default function BannersManager() {
  const [category, setCategory] = useState<BannerCategory | "ALL">("ALL");
  const [published, setPublished] = useState<PublishedFilter>("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<AdminBannerResponse | null>(
    null,
  );

  const isPublished =
    published === "ALL" ? undefined : published === "PUBLISHED";

  const { data, isLoading, isFetching, error } = useGetAdminBannersQuery({
    category: category === "ALL" ? undefined : category,
    isPublished,
    page,
    size: PAGE_SIZE,
  });

  const { data: publishedStats } = useGetAdminBannersQuery({
    isPublished: true,
    page: 0,
    size: 1,
  });

  const banners = useMemo(() => {
    const contents = data?.contents ?? [];
    if (!search.trim()) return contents;
    const term = search.trim().toLowerCase();
    return contents.filter((b) => b.title.toLowerCase().includes(term));
  }, [data, search]);

  const handleCategoryChange = (value: BannerCategory | "ALL") => {
    setCategory(value);
    setPage(0);
  };

  const handlePublishedChange = (value: PublishedFilter) => {
    setPublished(value);
    setPage(0);
  };

  return (
    <div className="p-3 sm:p-6 space-y-6">
      <BannersHeader
        totalBanners={data?.totalElements ?? 0}
        publishedCount={publishedStats?.totalElements ?? 0}
        onAddNew={() => {
          setEditingBanner(null);
          setIsModalOpen(true);
        }}
      />

      <BannersFilters
        category={category}
        onCategoryChange={handleCategoryChange}
        published={published}
        onPublishedChange={handlePublishedChange}
        search={search}
        onSearchChange={setSearch}
      />

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {getAdminApiErrorMessage(error)}
        </p>
      )}

      <BannersTable
        banners={banners}
        isLoading={isLoading || isFetching}
        onEdit={(banner) => {
          setEditingBanner(banner);
          setIsModalOpen(true);
        }}
      />

      {data && (
        <BannersPagination
          page={data.pageNumber}
          totalPages={data.totalPages}
          totalElements={data.totalElements}
          onPageChange={setPage}
        />
      )}

      {isModalOpen && (
        <BannerFormModal
          onClose={() => setIsModalOpen(false)}
          editing={editingBanner}
          defaultCategory={category === "ALL" ? "MAIN" : category}
        />
      )}
    </div>
  );
}
