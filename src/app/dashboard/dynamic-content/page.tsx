"use client";

import { useMemo, useState } from "react";
import {
  useAddFilterOptionMutation,
  useDeleteFilterOptionMutation,
  useGetFilterOptionsQuery,
  useReorderFilterOptionMutation,
  useUpdateFilterOptionMutation,
} from "../../store/dynamicContentApi";
// import { FilterGroupKey, FilterOption } from "@/types/dynamicContent";
// import DynamicContentBanner from "@/components/dynamic-content/DynamicContentBanner";
// import DynamicContentGroupTabs from "@/components/dynamic-content/DynamicContentGroupTabs";
// import DynamicContentTable from "@/components/dynamic-content/DynamicContentTable";
// import DynamicContentFormModal from "@/components/dynamic-content/DynamicContentFormModal";
// import DynamicContentPreview from "@/components/dynamic-content/DynamicContentPreview";
import { Eye } from "lucide-react";
import { FilterGroupKey, FilterOption } from "../../../types/dynamicContent";
import DynamicContentBanner from "../../../components/dynamic-content/DynamicContentBanner";
import DynamicContentGroupTabs from "../../../components/dynamic-content/DynamicContentGroupTabs";
import DynamicContentTable from "../../../components/dynamic-content/DynamicContentTable";
import DynamicContentFormModal from "../../../components/dynamic-content/DynamicContentFormModal";
import DynamicContentPreview from "../../../components/dynamic-content/DynamicContentPreview";

export default function DynamicContentPage() {
  const { data, isLoading, isError } = useGetFilterOptionsQuery();
  const [addOption] = useAddFilterOptionMutation();
  const [updateOption] = useUpdateFilterOptionMutation();
  const [deleteOption] = useDeleteFilterOptionMutation();
  const [reorderOption] = useReorderFilterOptionMutation();

  const [activeGroup, setActiveGroup] = useState<FilterGroupKey>("time");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FilterOption | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const allData: FilterOption[] = data ?? [];

  const groupItems = useMemo(
    () => allData.filter((o) => o.groupKey === activeGroup),
    [allData, activeGroup]
  );

  const nextOrder =
    groupItems.length > 0
      ? Math.max(...groupItems.map((o) => o.order)) + 1
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

  const activeCount = allData.filter((o) => o.active).length;
  const totalGroups = new Set(allData.map((o) => o.groupKey)).size;

  return (
    <div className="p-6">
      <DynamicContentBanner
        totalOptions={allData.length}
        totalGroups={totalGroups}
        activeCount={activeCount}
        onAddNew={handleAddNew}
      />

      <div className="flex items-center justify-between mb-4">
        <DynamicContentGroupTabs
          data={allData}
          activeGroup={activeGroup}
          onGroupChange={setActiveGroup}
        />

        <button
          onClick={() => setPreviewOpen(true)}
          className="flex items-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 px-3 py-2 rounded-lg hover:bg-emerald-50 shrink-0"
        >
          <Eye size={16} />
          មើលការបង្ហាញជាមុន
        </button>
      </div>

      <DynamicContentTable
        data={groupItems}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleActive={handleToggleActive}
        onMove={handleMove}
      />

      <DynamicContentFormModal
        open={modalOpen}
        defaultGroup={activeGroup}
        initialData={editingItem}
        nextOrder={nextOrder}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />

      <DynamicContentPreview
        data={allData}
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
      />
    </div>
  );
}