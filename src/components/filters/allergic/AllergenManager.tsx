"use client";

import { useMemo, useState } from "react";
import {
  useCreateAllergenMutation,
  useDeleteAllergenMutation,
  useGetAllergensQuery,
  useRestoreAllergenMutation,
  useUpdateAllergenMutation,
} from "@/src/app/store/allergenApi";

import type {
  Allergen,
  AllergenFormValues,
  AllergenPayload,
} from "@/src/types/allergen";
import {
  getApiErrorMessage,
  type ApiMessage,
  type ResourceStatusFilter,
} from "@/src/types/safetyResource";

import AllergenFormModal from "./AllergenFormModal";
import AllergensHeader from "./AllergensHeader";
import AllergensPagination from "./AllergensPagination";
import AllergensTable from "./AllergensTable";
import AllergensTabs from "./AllergensTabs";
import AllergensToolbar from "./AllergensToolbar";
import DeleteAllergenConfirmModal from "./DeleteAllergenConfirmModal";

export default function AllergenManager() {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ResourceStatusFilter>("ALL");

  const [editing, setEditing] = useState<Allergen | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState<Allergen | null>(null);
  const [message, setMessage] = useState<ApiMessage | null>(null);

  const { data, isLoading, isFetching, error, refetch } = useGetAllergensQuery({
    page,
    size,
  });
  const [createItem, { isLoading: isCreating }] = useCreateAllergenMutation();
  const [updateItem, { isLoading: isUpdating }] = useUpdateAllergenMutation();
  const [deleteItem, { isLoading: isDeleting }] = useDeleteAllergenMutation();
  const [restoreItem, { isLoading: isRestoring }] =
    useRestoreAllergenMutation();

  const items = useMemo(() => data?.contents ?? [], [data?.contents]);
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

  const handleSave = async (values: AllergenFormValues) => {
    setMessage(null);

    try {
      if (editing) {
        const body: AllergenPayload = {
          code: values.code,
          name: values.name,
          description: values.description || null,
          iconMediaUuid: editing.iconMediaUuid ?? null,
          active: values.active,
        };

        await updateItem({
          code: editing.code,
          body,
        }).unwrap();

        setMessage({ type: "success", text: "បានកែប្រែអាឡែស៊ីដោយជោគជ័យ។" });
      } else {
        const body: AllergenPayload = {
          code: values.code,
          name: values.name,
          description: values.description || null,
          iconMediaUuid: null,
          active: values.active,
        };

        await createItem(body).unwrap();
        setPage(0);
        setMessage({ type: "success", text: "បានបន្ថែមអាឡែស៊ីដោយជោគជ័យ។" });
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
      setMessage({ type: "success", text: "បានបិទអាឡែស៊ីដោយជោគជ័យ។" });
      await refetch();
    } catch (deleteError) {
      setMessage({ type: "error", text: getApiErrorMessage(deleteError) });
    }
  };

  const handleRestore = async (item: Allergen) => {
    try {
      await restoreItem(item.code).unwrap();
      setMessage({ type: "success", text: "បានស្ដារអាឡែស៊ីដោយជោគជ័យ។" });
      await refetch();
    } catch (restoreError) {
      setMessage({ type: "error", text: getApiErrorMessage(restoreError) });
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 pb-10">
      <AllergensHeader
        total={data?.totalElements ?? 0}
        activeCount={activeCount}
        inactiveCount={inactiveCount}
        onAdd={() => {
          setEditing(null);
          setMessage(null);
          setFormOpen(true);
        }}
      />

      <div className="flex w-full flex-nowrap items-center justify-between gap-4">

        <div className="shrink-0">
          <AllergensTabs
            value={statusFilter}
            allCount={items.length}
            activeCount={activeCount}
            inactiveCount={inactiveCount}
            onChange={setStatusFilter}
          />
        </div>

        {/* RIGHT - SEARCH / SIZE / REFRESH */}
        <div className="ml-auto min-w-0">
          <AllergensToolbar
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
      </div>

      {message && (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm ${
            message.type === "success"
              ? "border-emerald-100 bg-emerald-50 text-emerald-700"
              : "border-red-100 bg-red-50 text-red-600"
          }`}
        >
          {message.text}
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          {getApiErrorMessage(error)}
        </div>
      )}

      <section className="overflow-hidden rounded-[24px] border border-gray-100 bg-white shadow-sm">
        <AllergensTable
          allergens={filtered}
          disabled={busy}
          onEdit={(item) => {
            setEditing(item);
            setFormOpen(true);
          }}
          onDelete={setDeleting}
          onRestore={(item) => void handleRestore(item)}
        />

        {!isLoading && !error && (
          <AllergensPagination
            page={data?.pageNumber ?? page}
            totalPages={data?.totalPages ?? 1}
            totalElements={data?.totalElements ?? 0}
            disabled={isFetching}
            onPageChange={setPage}
          />
        )}
      </section>

      <AllergenFormModal
        open={formOpen}
        allergen={editing}
        saving={isCreating || isUpdating}
        onClose={() => {
          if (isCreating || isUpdating) return;
          setFormOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSave}
      />

      <DeleteAllergenConfirmModal
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
