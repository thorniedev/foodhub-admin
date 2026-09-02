"use client";

import { useMemo, useState } from "react";

import FeedbackFormModal from "@/src/components/feedback/FeedbackFormModal";
import {
  Feedback,
  FeedbackCategory,
  FeedbackStatus,
} from "@/src/types/feedback";
import FeedbackBanner from "@/src/components/feedback/FeedbackBanner";
import FeedbackTabs from "@/src/components/feedback/FeedbackTabs";
import FeedbackTable from "@/src/components/feedback/FeedbackTable";
import FeedbackTableSkeleton from "@/src/components/dynamic-content/feedback/FeedbackTableSkeleton";
import FeedbackPagination from "@/src/components/feedback/FeedbackPagination";
import {
  useAddFeedbackMutation,
  useDeleteFeedbackMutation,
  useGetFeedbacksQuery,
  useToggleFeedbackStatusMutation,
  useUpdateFeedbackMutation,
} from "@/src/app/store/feedbackApi";

const PAGE_SIZE = 8;

export default function FeedbackPage() {
  const { data, isLoading, isError } = useGetFeedbacksQuery();
  const [addItem] = useAddFeedbackMutation();
  const [updateItem] = useUpdateFeedbackMutation();
  const [deleteItem] = useDeleteFeedbackMutation();
  const [cycleStatus] = useToggleFeedbackStatusMutation();

  const [activeTab, setActiveTab] = useState<FeedbackCategory | "all">("all");
  const [statusFilter, setStatusFilter] = useState<FeedbackStatus | "all">(
    "all",
  );
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Feedback | null>(null);

  const allData: Feedback[] = data ?? [];

  const filtered = useMemo(() => {
    return allData.filter((item) => {
      const matchesTab = activeTab === "all" || item.category === activeTab;
      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;
      const query = search.trim().toLowerCase();
      const matchesSearch =
        query === "" ||
        item.customerName.toLowerCase().includes(query) ||
        item.message.toLowerCase().includes(query);
      return matchesTab && matchesStatus && matchesSearch;
    });
  }, [allData, activeTab, statusFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const newCount = allData.filter((f) => f.status === "new").length;
  const resolvedCount = allData.filter((f) => f.status === "resolved").length;
  const averageRating =
    allData.length === 0
      ? 0
      : allData.reduce((sum, f) => sum + f.rating, 0) / allData.length;

  const handleAddNew = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  const handleEdit = (item: Feedback) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleDelete = async (item: Feedback) => {
    await deleteItem(item.id);
  };

  const handleCycleStatus = async (item: Feedback) => {
    await cycleStatus(item.id);
  };

  const handleSubmit = async (values: Omit<Feedback, "id" | "createdAt">) => {
    if (editingItem) {
      await updateItem({ id: editingItem.id, changes: values });
    } else {
      await addItem(values);
    }
    setModalOpen(false);
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <FeedbackBanner
          total={0}
          newCount={0}
          resolvedCount={0}
          averageRating={0}
          onAddNew={handleAddNew}
        />
        <FeedbackTableSkeleton rows={5} />
      </div>
    );
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
      <FeedbackBanner
        total={allData.length}
        newCount={newCount}
        resolvedCount={resolvedCount}
        averageRating={averageRating}
        onAddNew={handleAddNew}
      />

      <FeedbackTabs
        data={allData}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setPage(1);
        }}
        statusFilter={statusFilter}
        onStatusFilterChange={(status) => {
          setStatusFilter(status);
          setPage(1);
        }}
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
      />

      <FeedbackTable
        data={paginated}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCycleStatus={handleCycleStatus}
      />

      <FeedbackPagination
        total={filtered.length}
        shown={paginated.length}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      <FeedbackFormModal
        open={modalOpen}
        initialData={editingItem}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
