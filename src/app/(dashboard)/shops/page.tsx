"use client";

import { useMemo, useState } from "react";
import ShopsHeader from "../../../components/shops/ShopsHeader";
import ShopsTabs, { ShopFilter } from "../../../components/shops/ShopsTabs";
import ShopsTable from "../../../components/shops/ShopsTable";
import ShopsPagination from "../../../components/shops/ShopsPagination";
import ShopEditModal from "../../../components/shops/ShopEditModal";
import DeleteShopConfirmModal from "../../../components/shops/DeleteShopConfirmModal";
import { Shop } from "../../../types/shop";
import { useDeleteShopMutation, useGetShopsQuery, useToggleShopStatusMutation, useUpdateShopMutation } from "../../store/shopApi";

export default function ShopsPage() {
  const { data, isLoading } = useGetShopsQuery();
  const [updateShop] = useUpdateShopMutation();
  const [deleteShop] = useDeleteShopMutation();
  const [toggleStatus] = useToggleShopStatusMutation();

  const [filter, setFilter] = useState<ShopFilter>("all");
  const [search, setSearch] = useState("");

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingShop, setEditingShop] = useState<Shop | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingShop, setDeletingShop] = useState<Shop | null>(null);

  const counts = useMemo(() => {
    const base = { all: 0, active: 0, stopped: 0, banned: 0 };
    data?.forEach((shop) => {
      base.all += 1;
      base[shop.status] += 1;
    });
    return base;
  }, [data]);

  const filtered = useMemo(() => {
    if (!data) return [];
    return data
      .filter((shop) => filter === "all" || shop.status === filter)
      .filter(
        (shop) => shop.name.includes(search) || shop.phone.includes(search)
      );
  }, [data, filter, search]);

  const handleEdit = (shop: Shop) => {
    setEditingShop(shop);
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (id: string, changes: Partial<Shop>) => {
    await updateShop({ id, changes });
    setEditModalOpen(false);
    setEditingShop(null);
  };

  const handleDelete = (shop: Shop) => {
    setDeletingShop(shop);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingShop) return;
    await deleteShop(deletingShop.id);
    setDeleteModalOpen(false);
    setDeletingShop(null);
  };

  const handleToggleStatus = async (shop: Shop) => {
    await toggleStatus(shop.id);
  };

  if (isLoading || !data) return null;

  return (
    <div className="w-full">
      <ShopsHeader total={counts.all} filteredCount={filtered.length} />
      <ShopsTabs
        counts={counts}
        active={filter}
        onChange={setFilter}
        search={search}
        onSearchChange={setSearch}
      />
      <ShopsTable
        shops={filtered}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
      />
      <ShopsPagination total={counts.all} shown={filtered.length} />

      <ShopEditModal
        open={editModalOpen}
        initialData={editingShop}
        onClose={() => {
          setEditModalOpen(false);
          setEditingShop(null);
        }}
        onSubmit={handleEditSubmit}
      />

      <DeleteShopConfirmModal
        open={deleteModalOpen}
        shopName={deletingShop?.name ?? ""}
        onCancel={() => {
          setDeleteModalOpen(false);
          setDeletingShop(null);
        }}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}