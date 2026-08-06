"use client";

import { useMemo, useState } from "react";
import {
  useDeleteMenuItemMutation,
  useGetMenuItemsQuery,
  useToggleMenuItemAvailabilityMutation,
  useUpdateMenuItemMutation,
} from "../../../store/menuItemApi";
import { isDrinkItem } from "../../../../lib/menuItemKind";
import { MenuItem } from "../../../../types/menuItem";
import MenuItemsHeader from "../../../../components/menu-items/MenuItemsHeader";
import MenuItemsTabs from "../../../../components/menu-items/MenuItemsTabs";
import MenuItemsTable from "../../../../components/menu-items/MenuItemsTable";
import MenuItemsPagination from "../../../../components/menu-items/MenuItemsPagination";
import MenuItemEditModal from "../../../../components/menu-items/MenuItemEditModal";
import DeleteMenuItemConfirmModal from "../../../../components/menu-items/DeleteMenuItemConfirmModal";

const PAGE_SIZE = 10;

export default function FoodTypesDrinksPage() {
  const { data, isLoading, isError } = useGetMenuItemsQuery();
  const [updateMenuItem] = useUpdateMenuItemMutation();
  const [deleteMenuItem] = useDeleteMenuItemMutation();
  const [toggleStatus] = useToggleMenuItemAvailabilityMutation();

  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<MenuItem | null>(null);

  const drinkItems = useMemo(() => (data ?? []).filter(isDrinkItem), [data]);

  const filtered = useMemo(() => {
    return drinkItems.filter((item) => {
      const matchesTab = activeTab === "all" || item.food.category.name === activeTab;
      const query = search.trim().toLowerCase();
      const matchesSearch =
        query === "" ||
        item.localName.toLowerCase().includes(query) ||
        item.name.toLowerCase().includes(query);
      return matchesTab && matchesSearch;
    });
  }, [drinkItems, activeTab, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setEditModalOpen(true);
  };
  const handleEditSubmit = async (uuid: string, changes: Partial<MenuItem>) => {
    await updateMenuItem({ uuid, changes });
    setEditModalOpen(false);
    setEditingItem(null);
  };
  const handleDelete = (item: MenuItem) => {
    setDeletingItem(item);
    setDeleteModalOpen(true);
  };
  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;
    await deleteMenuItem(deletingItem.uuid);
    setDeleteModalOpen(false);
    setDeletingItem(null);
  };
  const handleToggleStatus = async (item: MenuItem) => {
    await toggleStatus(item.uuid);
  };

  if (isLoading) return <div className="p-3 sm:p-6 text-gray-500">កំពុងផ្ទុកទិន្នន័យ...</div>;
  if (isError) return <div className="p-3 sm:p-6 text-red-500">មានបញ្ហាក្នុងការទាញយកទិន្នន័យ</div>;

  return (
    <div className="p-3 sm:p-6">
      <MenuItemsHeader
        title="ប្រភេទភេសជ្ជៈ"
        total={drinkItems.length}
        filteredCount={filtered.length}
        addHref="/food-types/drinks/create"
        addLabel="បន្ថែមភេសជ្ជៈថ្មី"
      />
      <MenuItemsTabs
        data={drinkItems}
        activeTab={activeTab}
        onTabChange={(t) => {
          setActiveTab(t);
          setPage(1);
        }}
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
      />
      <MenuItemsTable data={paginated} onEdit={handleEdit} onDelete={handleDelete} onToggleStatus={handleToggleStatus} />
      <MenuItemsPagination total={filtered.length} shown={paginated.length} page={page} totalPages={totalPages} onPageChange={setPage} />
      <MenuItemEditModal
        open={editModalOpen}
        initialData={editingItem}
        onClose={() => {
          setEditModalOpen(false);
          setEditingItem(null);
        }}
        onSubmit={handleEditSubmit}
      />
      <DeleteMenuItemConfirmModal
        open={deleteModalOpen}
        itemName={deletingItem?.localName ?? ""}
        onCancel={() => {
          setDeleteModalOpen(false);
          setDeletingItem(null);
        }}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}