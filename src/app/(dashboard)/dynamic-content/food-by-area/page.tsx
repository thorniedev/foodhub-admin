"use client";

import { useMemo, useState } from "react";
import {
  useAddFoodByAreaMutation,
  useDeleteFoodByAreaMutation,
  useGetFoodByAreasQuery,
  useToggleFoodByAreaStatusMutation,
  useUpdateFoodByAreaMutation,
} from "../../../store/foodByAreaApi";
import { Area, FoodByAreaImage } from "../../../../types/foodByArea";
import FoodByAreaBanner from "../../../../components/dynamic-content/food-by-area/FoodByAreaBanner";
import FoodByAreaTabs from "../../../../components/FoodByAreaTabs";
import FoodByAreaTable from "../../../../components/FoodByAreaTable";
import FoodByAreaPagination from "../../../../components/FoodByAreaPagination";
import FoodByAreaFormModal from "../../../../components/FoodByAreaFormModal";

const PAGE_SIZE = 8;

export default function FoodByAreaPage() {
  const { data, isLoading, isError } = useGetFoodByAreasQuery();
  const [addItem] = useAddFoodByAreaMutation();
  const [updateItem] = useUpdateFoodByAreaMutation();
  const [deleteItem] = useDeleteFoodByAreaMutation();
  const [toggleStatus] = useToggleFoodByAreaStatusMutation();

  const [activeTab, setActiveTab] = useState<Area | "all">("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FoodByAreaImage | null>(null);

  const allData: FoodByAreaImage[] = data ?? [];

  const filtered = useMemo(() => {
    return allData.filter((item) => {
      const matchesTab = activeTab === "all" || item.area === activeTab;
      const query = search.trim().toLowerCase();
      const matchesSearch =
        query === "" ||
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query);
      return matchesTab && matchesSearch;
    });
  }, [allData, activeTab, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const activeCount = allData.filter((f) => f.status === "active").length;
  const pendingCount = allData.filter((f) => f.status === "pending").length;

  const handleAddNew = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  const handleEdit = (item: FoodByAreaImage) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleDelete = async (item: FoodByAreaImage) => {
    await deleteItem(item.id);
  };

  const handleToggleStatus = async (item: FoodByAreaImage) => {
    await toggleStatus(item.id);
  };

  const handleSubmit = async (values: Omit<FoodByAreaImage, "id">) => {
    if (editingItem) {
      await updateItem({ id: editingItem.id, changes: values });
    } else {
      await addItem(values);
    }
    setModalOpen(false);
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
      <FoodByAreaBanner
        total={allData.length}
        activeCount={activeCount}
        pendingCount={pendingCount}
        onAddNew={handleAddNew}
      />

      <FoodByAreaTabs
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

      <FoodByAreaTable
        data={paginated}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
      />

      <FoodByAreaPagination
        total={filtered.length}
        shown={paginated.length}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      <FoodByAreaFormModal
        open={modalOpen}
        initialData={editingItem}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}