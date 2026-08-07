"use client";

import { useMemo, useState } from "react";
import { Eye } from "lucide-react";
import {
  useAddFilterOptionMutation,
  useDeleteFilterOptionMutation,
  useGetFilterOptionsQuery,
  useReorderFilterOptionMutation,
  useUpdateFilterOptionMutation,
  useGetFilterGroupsQuery,
  useAddFilterGroupMutation,
  useUpdateFilterGroupMutation,
  useDeleteFilterGroupMutation,
} from "../../store/dynamicContentApi";
import { FilterOption, SortDirection } from "../../../types/dynamicContent";
import DynamicContentBanner from "../../../components/dynamic-content/filters/DynamicContentBanner";
import DynamicContentGroupTabs from "../../../components/dynamic-content/filters/DynamicContentGroupTabs";
import DynamicContentSearchSort from "../../../components/dynamic-content/filters/DynamicContentSearchSort";
import DynamicContentTable from "../../../components/dynamic-content/filters/DynamicContentTable";
import DynamicContentFormModal from "../../../components/dynamic-content/filters/DynamicContentFormModal";
import DynamicContentPreview from "../../../components/dynamic-content/filters/DynamicContentPreview";

export default function DynamicContentPage() {
  const { data: groups, isLoading: groupsLoading } = useGetFilterGroupsQuery();
  const { data, isLoading, isError } = useGetFilterOptionsQuery();

  const [addOption] = useAddFilterOptionMutation();
  const [updateOption] = useUpdateFilterOptionMutation();
  const [deleteOption] = useDeleteFilterOptionMutation();
  const [reorderOption] = useReorderFilterOptionMutation();

  const [addGroup] = useAddFilterGroupMutation();
  const [renameGroup] = useUpdateFilterGroupMutation();
  const [deleteGroup] = useDeleteFilterGroupMutation();

  const allGroups = groups ?? [];
  const [activeGroup, setActiveGroup] = useState("time");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FilterOption | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [useAlphaSort, setUseAlphaSort] = useState(false);

  const allData: FilterOption[] = data ?? [];

  const groupItems = useMemo(() => {
    let items = allData.filter((o) => o.groupKey === activeGroup);

    const query = search.trim().toLowerCase();
    if (query) {
      items = items.filter(
        (o) =>
          o.label.toLowerCase().includes(query) ||
          o.value.toLowerCase().includes(query),
      );
    }

    if (useAlphaSort) {
      items = [...items].sort((a, b) =>
        sortDirection === "asc"
          ? a.label.localeCompare(b.label)
          : b.label.localeCompare(a.label),
      );
    } else {
      items = [...items].sort((a, b) => a.order - b.order);
    }

    return items;
  }, [allData, activeGroup, search, sortDirection, useAlphaSort]);

  const groupOnlyItems = allData.filter((o) => o.groupKey === activeGroup);
  const nextOrder =
    groupOnlyItems.length > 0
      ? Math.max(...groupOnlyItems.map((o) => o.order)) + 1
      : 1;

  const handleAddNew = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  const handleEdit = (item: FilterOption) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleDelete = async (item: FilterOption) => {
    await deleteOption(item.id);
  };

  const handleToggleActive = async (item: FilterOption) => {
    await updateOption({ id: item.id, changes: { active: !item.active } });
  };

  const handleMove = async (item: FilterOption, direction: "up" | "down") => {
    await reorderOption({ id: item.id, direction });
  };

  const handleSubmit = async (values: Omit<FilterOption, "id">) => {
    if (editingItem) {
      await updateOption({ id: editingItem.id, changes: values });
    } else {
      await addOption(values);
    }
    setModalOpen(false);
  };

  const handleAddGroup = async (label: string) => {
    const result: any = await addGroup({ label });
    if (result?.data?.key) setActiveGroup(result.data.key);
  };

  const handleRenameGroup = async (key: string, label: string) => {
    await renameGroup({ key, label });
  };

  const handleDeleteGroup = async (key: string) => {
    await deleteGroup(key);
    const remaining = allGroups.filter((g) => g.key !== key);
    if (remaining.length > 0) setActiveGroup(remaining[0].key);
  };

  const toggleSort = () => {
    if (!useAlphaSort) {
      setUseAlphaSort(true);
      setSortDirection("asc");
    } else if (sortDirection === "asc") {
      setSortDirection("desc");
    } else {
      setUseAlphaSort(false);
    }
  };

  if (isLoading || groupsLoading) {
    return (
      <div className="p-3 sm:p-6 text-gray-500">កំពុងផ្ទុកទិន្នន័យ...</div>
    );
  }

  if (isError) {
    return (
      <div className="p-3 sm:p-6 text-red-500">
        មានបញ្ហាក្នុងការទាញយកទិន្នន័យ សូមព្យាយាមម្តងទៀត
      </div>
    );
  }

  const activeCount = allData.filter((o) => o.active).length;

  return (
    <div className="p-3 sm:p-6">
      <DynamicContentBanner
        totalOptions={allData.length}
        totalGroups={allGroups.length}
        activeCount={activeCount}
        onAddNew={handleAddNew}
      />

      <DynamicContentGroupTabs
        groups={allGroups}
        data={allData}
        activeGroup={activeGroup}
        onGroupChange={setActiveGroup}
        onAddGroup={handleAddGroup}
        onRenameGroup={handleRenameGroup}
        onDeleteGroup={handleDeleteGroup}
      />

      <div className="flex items-center justify-end mb-2">
        <button
          onClick={() => setPreviewOpen(true)}
          className="flex items-center gap-2 text-sm sm:text-base font-medium text-[#136C34] hover:text-emerald-700 px-3 py-2 rounded-lg hover:bg-emerald-50"
        >
          <Eye size={16} />
          មើលការបង្ហាញជាមុន
        </button>
      </div>

      <DynamicContentSearchSort
        search={search}
        onSearchChange={setSearch}
        sortDirection={sortDirection}
        onToggleSort={toggleSort}
      />

      <DynamicContentTable
        data={groupItems}
        reorderable={!useAlphaSort && search.trim() === ""}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleActive={handleToggleActive}
        onMove={handleMove}
      />

      <DynamicContentFormModal
        open={modalOpen}
        groups={allGroups}
        defaultGroup={activeGroup}
        initialData={editingItem}
        nextOrder={nextOrder}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />

      <DynamicContentPreview
        groups={allGroups}
        data={allData}
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
      />
    </div>
  );
}
