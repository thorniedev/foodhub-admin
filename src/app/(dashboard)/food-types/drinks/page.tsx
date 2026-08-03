"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  useDeleteDrinkMutation,
  useGetDrinksQuery,
  useToggleDrinkStatusMutation,
  useUpdateDrinkMutation,
} from "@/src/app/store/drinkApi";
import { Drink, DrinkCategory } from "@/src/types/drink";
import DrinksHeader from "@/src/components/drinks/DrinksHeader";
import DrinksTabs from "@/src/components/drinks/DrinksTabs";
import DrinksTable from "@/src/components/drinks/DrinksTable";
import DrinksPagination from "@/src/components/drinks/DrinksPagination";
import DrinkEditModal from "@/src/components/drinks/DrinkEditModal";
import DeleteDrinkConfirmModal from "@/src/components/drinks/DeleteDrinkConfirmModal";
// import DeleteDrinkConfirmModal from "@src/components/drinks/DeleteDrinkConfirmModal";

const PAGE_SIZE = 10;

export default function DrinksPage() {
  const router = useRouter();
  const { data, isLoading, isError } = useGetDrinksQuery();
  const [updateDrink] = useUpdateDrinkMutation();
  const [deleteDrink] = useDeleteDrinkMutation();
  const [toggleStatus] = useToggleDrinkStatusMutation();

  const [activeTab, setActiveTab] = useState<DrinkCategory | "all">("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Drink | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<Drink | null>(null);

  const allData: Drink[] = data ?? [];

  const filtered = useMemo(() => {
    return allData.filter((item) => {
      const matchesTab = activeTab === "all" || item.category === activeTab;
      const query = search.trim().toLowerCase();
      const matchesSearch =
        query === "" ||
        item.name.toLowerCase().includes(query) ||
        item.shopName.toLowerCase().includes(query);
      return matchesTab && matchesSearch;
    });
  }, [allData, activeTab, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleEdit = (item: Drink) => {
    setEditingItem(item);
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (id: string, changes: Partial<Drink>) => {
    await updateDrink({ id, changes });
    setEditModalOpen(false);
    setEditingItem(null);
  };

  const handleDelete = (item: Drink) => {
    setDeletingItem(item);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;
    await deleteDrink(deletingItem.id);
    setDeleteModalOpen(false);
    setDeletingItem(null);
  };

  const handleToggleStatus = async (item: Drink) => {
    await toggleStatus(item.id);
  };

  const handleAddNew = () => {
    router.push("/dashboard/food-types/drinks/create");
  };

  if (isLoading) {
    return <div className="p-6 text-gray-500">កំពុងផ្ទុកទិន្នន័យ...</div>;
  }

  if (isError) {
    return (
      <div className="p-6 text-red-500">
        មានបញ្ហាក្នុងការទាញយកទិន្នន័យ សូមព្យាយាមម្តងទៀត
      </div>
    );
  }

  return (
    <div className="p-6">
      <DrinksHeader
        total={allData.length}
        filteredCount={filtered.length}
        onAddNew={handleAddNew}
      />

      <DrinksTabs
        data={allData}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setPage(1);
        }}
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
      />

      <DrinksTable
        data={paginated}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
      />

      <DrinksPagination
        total={filtered.length}
        shown={paginated.length}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      <DrinkEditModal
        open={editModalOpen}
        initialData={editingItem}
        onClose={() => {
          setEditModalOpen(false);
          setEditingItem(null);
        }}
        onSubmit={handleEditSubmit}
      />

      <DeleteDrinkConfirmModal
        open={deleteModalOpen}
        itemName={deletingItem?.name ?? ""}
        onCancel={() => {
          setDeleteModalOpen(false);
          setDeletingItem(null);
        }}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
