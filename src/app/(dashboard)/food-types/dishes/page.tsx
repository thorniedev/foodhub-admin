"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  useDeleteFoodTypeMutation,
  useGetFoodTypesQuery,
  useToggleFoodTypeStatusMutation,
  useUpdateFoodTypeMutation,
} from "../../../store/foodTypeApi";
import { FoodCategory, FoodType } from "../../../../types/foodType";
import FoodTypesHeader from "../../../../components/food-types/FoodTypesHeader";
import FoodTypesTabs from "../../../../components/food-types/FoodTypesTabs";
import FoodTypesTable from "../../../../components/food-types/FoodTypesTable";
import FoodTypesPagination from "../../../../components/food-types/FoodTypesPagination";
import FoodTypeEditModal from "../../../../components/food-types/FoodTypeEditModal";
import DeleteConfirmModal from "../../../../components/food-types/DeleteConfirmModal";

const PAGE_SIZE = 10;

export default function FoodTypesDishesPage() {
  const router = useRouter();
  const { data, isLoading, isError } = useGetFoodTypesQuery();
  const [updateFoodType] = useUpdateFoodTypeMutation();
  const [deleteFoodType] = useDeleteFoodTypeMutation();
  const [toggleStatus] = useToggleFoodTypeStatusMutation();

  const [activeTab, setActiveTab] = useState<FoodCategory | "all">("all");
  const [tabSearch, setTabSearch] = useState("");
  const [headerSearch, setHeaderSearch] = useState("");
  const [page, setPage] = useState(1);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FoodType | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<FoodType | null>(null);

  const allData: FoodType[] = data ?? [];

  const filtered = useMemo(() => {
    return allData.filter((item) => {
      const matchesTab = activeTab === "all" || item.category === activeTab;
      const query = (tabSearch || headerSearch).trim().toLowerCase();
      const matchesSearch =
        query === "" ||
        item.name.toLowerCase().includes(query) ||
        item.shopName.toLowerCase().includes(query);
      return matchesTab && matchesSearch;
    });
  }, [allData, activeTab, tabSearch, headerSearch]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleEdit = (item: FoodType) => {
    setEditingItem(item);
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (id: string, changes: Partial<FoodType>) => {
    await updateFoodType({ id, changes });
    setEditModalOpen(false);
    setEditingItem(null);
  };

  const handleDelete = (item: FoodType) => {
    setDeletingItem(item);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;
    await deleteFoodType(deletingItem.id);
    setDeleteModalOpen(false);
    setDeletingItem(null);
  };

  const handleToggleStatus = async (item: FoodType) => {
    await toggleStatus(item.id);
  };

  const handleAddNew = () => {
    router.push("/food-types/foods/create");
  };

  if (isLoading) {
    return <div className="p-3 sm:p-6 text-gray-500">កំពុងផ្ទុកទិន្នន័យ...</div>;
  }

  if (isError) {
    return (
      <div className="p-3 sm:p-6 text-red-500">
        មានបញ្ហាក្នុងការទាញយកទិន្នន័យ សូមព្យាយាមម្តងទៀត
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6">
      <FoodTypesHeader
        total={allData.length}
        filteredCount={filtered.length}
        search={headerSearch}
        onSearchChange={(value) => {
          setHeaderSearch(value);
          setPage(1);
        }}
        onAddNew={handleAddNew}
      />

      <FoodTypesTabs
        data={allData}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setPage(1);
        }}
        tabSearch={tabSearch}
        onTabSearchChange={(value) => {
          setTabSearch(value);
          setPage(1);
        }}
      />

      <FoodTypesTable
        data={paginated}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
      />

      <FoodTypesPagination
        total={filtered.length}
        shown={paginated.length}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      <FoodTypeEditModal
        open={editModalOpen}
        initialData={editingItem}
        onClose={() => {
          setEditModalOpen(false);
          setEditingItem(null);
        }}
        onSubmit={handleEditSubmit}
      />

      <DeleteConfirmModal
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