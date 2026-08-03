"use client";

import { useMemo, useState } from "react";
import { useGetBannersQuery } from "../../../store/bannerApi";
import BannersHeader from "../../../../components/dynamic-content/banners/BannersHeader";
import BannersTable from "../../../../components/dynamic-content/banners/BannersTable";
import BannersPagination from "../../../../components/dynamic-content/banners/BannersPagination";
import BannerFormModal from "../../../../components/dynamic-content/banners/BannerFormModal";
import { Banner } from "../../../../types/banner";

const PAGE_SIZE = 5;

export default function BannersPage() {
  const { data: banners = [], isLoading } = useGetBannersQuery();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Banner | null>(null);

  const filtered = useMemo(() => {
    return banners
      .filter((b) => b.title.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => a.order - b.order);
  }, [banners, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openAddModal = () => {
    setEditing(null);
    setIsModalOpen(true);
  };

  const openEditModal = (banner: Banner) => {
    setEditing(banner);
    setIsModalOpen(true);
  };

  return (
    <div className="p-3 sm:p-6">
      <BannersHeader
        total={filtered.length}
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        onAddNew={openAddModal}
      />

      <BannersTable banners={paginated} isLoading={isLoading} onEdit={openEditModal} />

      <BannersPagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <BannerFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editing={editing}
      />
    </div>
  );
}