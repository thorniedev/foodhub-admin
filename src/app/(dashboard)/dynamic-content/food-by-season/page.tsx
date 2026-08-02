"use client";

import { useMemo, useState } from "react";
import {
  useAddSeasonalFoodMutation,
  useDeleteSeasonalFoodMutation,
  useGetSeasonalFoodsQuery,
  useToggleSeasonalFoodStatusMutation,
  useUpdateSeasonalFoodMutation,
} from "../../../store/seasonalFoodApi";
import { Season, SeasonalFoodImage } from "../../../../types/seasonalFood";
import SeasonalFoodBanner from "../../../../components/seasonal-food/SeasonalFoodBanner";
import SeasonalFoodTabs from "../../../../components/seasonal-food/SeasonalFoodTabs";
import SeasonalFoodTable from "../../../../components/seasonal-food/SeasonalFoodTable";
import SeasonalFoodPagination from "../../../../components/seasonal-food/SeasonalFoodPagination";
import SeasonalFoodFormModal from "../../../../components/seasonal-food/SeasonalFoodFormModal";
// import { Season, SeasonalFoodImage } from "@/types/seasonalFood";
// import SeasonalFoodBanner from "@/components/seasonal-food/SeasonalFoodBanner";
// import SeasonalFoodTabs from "@/components/seasonal-food/SeasonalFoodTabs";
// import SeasonalFoodTable from "@/components/seasonal-food/SeasonalFoodTable";
// import SeasonalFoodPagination from "@/components/seasonal-food/SeasonalFoodPagination";
// import SeasonalFoodFormModal from "@/components/seasonal-food/SeasonalFoodFormModal";

const PAGE_SIZE = 8;

export default function FoodBySeasonPage() {
  const { data, isLoading, isError } = useGetSeasonalFoodsQuery();
  const [addItem] = useAddSeasonalFoodMutation();
  const [updateItem] = useUpdateSeasonalFoodMutation();
  const [deleteItem] = useDeleteSeasonalFoodMutation();
  const [toggleStatus] = useToggleSeasonalFoodStatusMutation();

  const [activeTab, setActiveTab] = useState<Season | "all">("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SeasonalFoodImage | null>(null);

  const allData: SeasonalFoodImage[] = data ?? [];

  const filtered = useMemo(() => {
    return allData.filter((item) => {
      const matchesTab = activeTab === "all" || item.season === activeTab;
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

  const handleEdit = (item: SeasonalFoodImage) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleDelete = async (item: SeasonalFoodImage) => {
    await deleteItem(item.id);
  };

  const handleToggleStatus = async (item: SeasonalFoodImage) => {
    await toggleStatus(item.id);
  };

  const handleSubmit = async (values: Omit<SeasonalFoodImage, "id">) => {
    if (editingItem) {
      await updateItem({ id: editingItem.id, changes: values });
    } else {
      await addItem(values);
    }
    setModalOpen(false);
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
      <SeasonalFoodBanner
        total={allData.length}
        activeCount={activeCount}
        pendingCount={pendingCount}
        onAddNew={handleAddNew}
      />

      <SeasonalFoodTabs
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

      <SeasonalFoodTable
        data={paginated}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
      />

      <SeasonalFoodPagination
        total={filtered.length}
        shown={paginated.length}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      <SeasonalFoodFormModal
        open={modalOpen}
        initialData={editingItem}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}