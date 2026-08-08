"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, HeartPulse, LoaderCircle } from "lucide-react";

import {
  useCreateMedicalConditionMutation,
  useDeleteMedicalConditionMutation,
  useGetMedicalConditionsQuery,
  useRestoreMedicalConditionMutation,
  useUpdateMedicalConditionMutation,
} from "@/src/app/store/medicalConditionApi";

import type {
  MedicalCondition,
  MedicalConditionFormValues,
  MedicalConditionPayload,
} from "@/src/types/medicalCondition";
import {
  getApiErrorMessage,
  type ApiMessage,
  type ResourceStatusFilter,
} from "@/src/types/safetyResource";

import DeleteMedicalConditionConfirmModal from "./DeleteMedicalConditionConfirmModal";
import MedicalConditionFormModal from "./MedicalConditionFormModal";
import MedicalConditionsHeader from "./MedicalConditionsHeader";
import MedicalConditionsPagination from "./MedicalConditionsPagination";
import MedicalConditionsTable from "./MedicalConditionsTable";
import MedicalConditionsTabs from "./MedicalConditionsTabs";
import MedicalConditionsToolbar from "./MedicalConditionsToolbar";

export default function MedicalConditionManager() {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ResourceStatusFilter>("ALL");

  const [editing, setEditing] = useState<MedicalCondition | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState<MedicalCondition | null>(null);
  const [message, setMessage] = useState<ApiMessage | null>(null);

  const { data, isLoading, isFetching, error, refetch } =
    useGetMedicalConditionsQuery({ page, size });

  const [createItem, { isLoading: isCreating }] =
    useCreateMedicalConditionMutation();
  const [updateItem, { isLoading: isUpdating }] =
    useUpdateMedicalConditionMutation();
  const [deleteItem, { isLoading: isDeleting }] =
    useDeleteMedicalConditionMutation();
  const [restoreItem, { isLoading: isRestoring }] =
    useRestoreMedicalConditionMutation();

  const items = data?.contents ?? [];
  const activeCount = items.filter((item) => item.active).length;
  const inactiveCount = items.length - activeCount;

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return items.filter((item) => {
      const statusMatches =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && item.active) ||
        (statusFilter === "INACTIVE" && !item.active);

      if (!statusMatches) return false;
      if (!query) return true;

      return [item.code, item.name, item.description ?? ""].some((value) =>
        value.toLowerCase().includes(query),
      );
    });
  }, [items, search, statusFilter]);

  const busy = isCreating || isUpdating || isDeleting || isRestoring;

  const handleSave = async (values: MedicalConditionFormValues) => {
    setMessage(null);

    try {
      const body: MedicalConditionPayload = {
        code: values.code,
        name: values.name,
        description: values.description || null,
        active: values.active,
      };

      if (editing) {
        await updateItem({ code: editing.code, body }).unwrap();
        setMessage({
          type: "success",
          text: "បានកែប្រែស្ថានភាពសុខភាពដោយជោគជ័យ។",
        });
      } else {
        await createItem(body).unwrap();
        setPage(0);
        setMessage({
          type: "success",
          text: "បានបន្ថែមស្ថានភាពសុខភាពដោយជោគជ័យ។",
        });
      }

      setFormOpen(false);
      setEditing(null);
      await refetch();
    } catch (saveError) {
      setMessage({ type: "error", text: getApiErrorMessage(saveError) });
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;

    try {
      await deleteItem(deleting.code).unwrap();
      setDeleting(null);
      setMessage({
        type: "success",
        text: "បានបិទស្ថានភាពសុខភាពដោយជោគជ័យ។",
      });
      await refetch();
    } catch (deleteError) {
      setMessage({ type: "error", text: getApiErrorMessage(deleteError) });
    }
  };

  const handleRestore = async (item: MedicalCondition) => {
    try {
      await restoreItem(item.code).unwrap();
      setMessage({
        type: "success",
        text: "បានស្ដារស្ថានភាពសុខភាពដោយជោគជ័យ។",
      });
      await refetch();
    } catch (restoreError) {
      setMessage({ type: "error", text: getApiErrorMessage(restoreError) });
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 pb-10">
      <MedicalConditionsHeader
        total={data?.totalElements ?? 0}
        activeCount={activeCount}
        inactiveCount={inactiveCount}
        onAdd={() => {
          setEditing(null);
          setMessage(null);
          setFormOpen(true);
        }}
      />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <MedicalConditionsTabs
          value={statusFilter}
          allCount={items.length}
          activeCount={activeCount}
          inactiveCount={inactiveCount}
          onChange={setStatusFilter}
        />

        <MedicalConditionsToolbar
          search={search}
          size={size}
          refreshing={isFetching}
          onSearchChange={setSearch}
          onSizeChange={(value) => {
            setSize(value);
            setPage(0);
          }}
          onRefresh={() => void refetch()}
        />
      </div>

      {message && (
        <div className={`rounded-2xl border px-4 py-3 text-sm ${
          message.type === "success"
            ? "border-emerald-100 bg-emerald-50 text-emerald-700"
            : "border-red-100 bg-red-50 text-red-600"
        }`}>
          {message.text}
        </div>
      )}

      <section className="overflow-hidden rounded-[24px] border border-gray-100 bg-white shadow-sm">
        {isLoading ? (
          <div className="flex min-h-[320px] items-center justify-center">
            <LoaderCircle size={30} className="animate-spin text-[#136C34]" />
          </div>
        ) : error ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">
            <AlertTriangle size={34} className="text-red-400" />
            <h3 className="mt-3 font-bold text-gray-800">
              មិនអាចទាញយកទិន្នន័យស្ថានភាពសុខភាពបានទេ
            </h3>
            <p className="mt-2 text-sm text-gray-500">{getApiErrorMessage(error)}</p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="mt-4 rounded-xl bg-[#136C34] px-4 py-2 text-sm font-semibold text-white"
            >
              សាកល្បងម្តងទៀត
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center text-center">
            <HeartPulse size={38} className="text-gray-300" />
            <p className="mt-3 font-semibold text-gray-600">មិនមានទិន្នន័យ</p>
          </div>
        ) : (
          <MedicalConditionsTable
            items={filtered}
            disabled={busy}
            onEdit={(item) => {
              setEditing(item);
              setFormOpen(true);
            }}
            onDelete={setDeleting}
            onRestore={(item) => void handleRestore(item)}
          />
        )}

        {!isLoading && !error && (
          <MedicalConditionsPagination
            page={data?.pageNumber ?? page}
            totalPages={data?.totalPages ?? 1}
            totalElements={data?.totalElements ?? 0}
            disabled={isFetching}
            onPageChange={setPage}
          />
        )}
      </section>

      <MedicalConditionFormModal
        open={formOpen}
        item={editing}
        saving={isCreating || isUpdating}
        onClose={() => {
          if (isCreating || isUpdating) return;
          setFormOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSave}
      />

      <DeleteMedicalConditionConfirmModal
        item={deleting}
        deleting={isDeleting}
        onClose={() => {
          if (!isDeleting) setDeleting(null);
        }}
        onConfirm={handleDelete}
      />
    </div>
  );
}
