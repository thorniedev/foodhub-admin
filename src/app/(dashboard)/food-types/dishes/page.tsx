"use client";

import { useEffect, useMemo, useState } from "react";

import {
  useDeleteMenuItemMutation,
  useGetMenuItemsQuery,
  useToggleMenuItemAvailabilityMutation,
  useUpdateMenuItemMutation,
} from "../../../store/menuItemApi";
import { isFoodItem } from "../../../../lib/menuItemKind";
import type { MenuItem } from "../../../../types/menuItem";
import MenuItemsHeader from "../../../../components/menu-items/MenuItemsHeader";
import MenuItemsTabs from "../../../../components/menu-items/MenuItemsTabs";
import MenuItemsTable from "../../../../components/menu-items/MenuItemsTable";
import MenuItemsPagination from "../../../../components/menu-items/MenuItemsPagination";
import MenuItemEditModal from "../../../../components/menu-items/MenuItemEditModal";
import DeleteMenuItemConfirmModal from "../../../../components/menu-items/DeleteMenuItemConfirmModal";

const PAGE_SIZE = 10;

export default function FoodTypesDishesPage() {
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

  const foodItems = useMemo(
    () => (data ?? []).filter(isFoodItem),
    [data],
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return foodItems.filter((item) => {
      const matchesTab =
        activeTab === "all" || item.food.category.name === activeTab;

      const matchesSearch =
        query === "" ||
        item.localName.toLowerCase().includes(query) ||
        item.name.toLowerCase().includes(query);

      return matchesTab && matchesSearch;
    });
  }, [foodItems, activeTab, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const paginated = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page],
  );

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (
    uuid: string,
    changes: Partial<MenuItem>,
  ) => {
    try {
      await updateMenuItem({ uuid, changes }).unwrap();
      setEditModalOpen(false);
      setEditingItem(null);
    } catch (error) {
      console.error("Failed to update menu item:", error);
    }
  };

  const handleDelete = (item: MenuItem) => {
    setDeletingItem(item);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingItem) {
      return;
    }

    try {
      await deleteMenuItem(deletingItem.uuid).unwrap();
      setDeleteModalOpen(false);
      setDeletingItem(null);
    } catch (error) {
      console.error("Failed to delete menu item:", error);
    }
  };

  const handleToggleStatus = async (item: MenuItem) => {
    try {
      await toggleStatus(item.uuid).unwrap();
    } catch (error) {
      console.error("Failed to toggle menu item status:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="p-3 text-gray-500 sm:p-6">
        កំពុងផ្ទុកទិន្នន័យ...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-3 text-red-500 sm:p-6">
        មានបញ្ហាក្នុងការទាញយកទិន្នន័យ
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6">
      <MenuItemsHeader
        title="ប្រភេទចំណីអាហារ"
        total={foodItems.length}
        filteredCount={filtered.length}
        addHref="/food-types/dishes/create"
        addLabel="បន្ថែមម្ហូបថ្មី"
      />

      <MenuItemsTabs
        data={foodItems}
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

      <MenuItemsTable
        data={paginated}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
      />

      <MenuItemsPagination
        total={filtered.length}
        shown={paginated.length}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

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
