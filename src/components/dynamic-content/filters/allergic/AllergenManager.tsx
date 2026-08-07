"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, LoaderCircle, ShieldAlert } from "lucide-react";

import {
  useCreateAllergenMutation,
  useDeactivateAllergenMutation,
  useGetAllergensQuery,
  useRestoreAllergenMutation,
  useUpdateAllergenMutation,
} from "@/src/app/store/allergenApi";

import type {
  Allergen,
  AllergenFormValues,
  AllergenStatusFilter,
  CreateAllergenRequest,
  UpdateAllergenRequest,
} from "@/src/types/allergen";

import AllergenFormModal from "./AllergenFormModal";
import AllergensHeader from "./AllergensHeader";
import AllergensPagination from "./AllergensPagination";
import AllergensTable from "./AllergensTable";
import AllergensTabs from "./AllergensTabs";
import AllergensToolbar from "./AllergensToolbar";
import DeleteAllergenConfirmModal from "./DeleteAllergenConfirmModal";

function getErrorMessage(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "data" in error
  ) {
    const data = (error as { data?: unknown }).data;

    if (typeof data === "string") {
      return data;
    }

    if (
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof (data as { message?: unknown }).message === "string"
    ) {
      return (data as { message: string }).message;
    }

    if (
      typeof data === "object" &&
      data !== null &&
      "error" in data &&
      typeof (data as { error?: unknown }).error === "string"
    ) {
      return (data as { error: string }).error;
    }
  }

  return "មានបញ្ហាក្នុងការភ្ជាប់ទៅកាន់ម៉ាស៊ីនមេ។";
}

export default function AllergenManager() {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<AllergenStatusFilter>("ALL");

  const [formOpen, setFormOpen] = useState(false);
  const [editingAllergen, setEditingAllergen] =
    useState<Allergen | null>(null);

  const [deletingAllergen, setDeletingAllergen] =
    useState<Allergen | null>(null);

  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetAllergensQuery({
    page,
    size,
  });

  const [createAllergen, { isLoading: isCreating }] =
    useCreateAllergenMutation();

  const [updateAllergen, { isLoading: isUpdating }] =
    useUpdateAllergenMutation();

  const [deactivateAllergen, { isLoading: isDeactivating }] =
    useDeactivateAllergenMutation();

  const [restoreAllergen, { isLoading: isRestoring }] =
    useRestoreAllergenMutation();

  const allergens = data?.items ?? [];

  const activeCount = useMemo(
    () => allergens.filter((item) => item.active).length,
    [allergens],
  );

  const inactiveCount = allergens.length - activeCount;

  const filteredAllergens = useMemo(() => {
    const query = search.trim().toLowerCase();

    return allergens.filter((item) => {
      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && item.active) ||
        (statusFilter === "INACTIVE" && !item.active);

      if (!matchesStatus) {
        return false;
      }

      if (!query) {
        return true;
      }

      return [
        item.code,
        item.name,
        item.description ?? "",
        item.uuid,
      ].some((value) => value.toLowerCase().includes(query));
    });
  }, [allergens, search, statusFilter]);

  const mutationLoading =
    isCreating ||
    isUpdating ||
    isDeactivating ||
    isRestoring;

  const openCreate = () => {
    setMessage(null);
    setEditingAllergen(null);
    setFormOpen(true);
  };

  const openEdit = (allergen: Allergen) => {
    setMessage(null);
    setEditingAllergen(allergen);
    setFormOpen(true);
  };

  const closeForm = () => {
    if (isCreating || isUpdating) {
      return;
    }

    setFormOpen(false);
    setEditingAllergen(null);
  };

  const handleSave = async (values: AllergenFormValues) => {
    setMessage(null);

    try {
      if (editingAllergen) {
        const body: UpdateAllergenRequest = {
          code: values.code,
          name: values.name,
          description: values.description || null,
          iconMediaUuid: editingAllergen.iconMediaUuid ?? null,
          active: values.active,
        };

        await updateAllergen({
          // The backend route identifies the allergen by CODE, not UUID.
          originalCode: editingAllergen.code,
          body,
        }).unwrap();

        setMessage({
          type: "success",
          text: "បានកែប្រែអាឡែស៊ីដោយជោគជ័យ។",
        });
      } else {
        const body: CreateAllergenRequest = {
          code: values.code,
          name: values.name,
          description: values.description || null,
          iconMediaUuid: null,
          active: values.active,
        };

        await createAllergen(body).unwrap();

        setPage(0);

        setMessage({
          type: "success",
          text: "បានបន្ថែមអាឡែស៊ីថ្មីដោយជោគជ័យ។",
        });
      }

      setFormOpen(false);
      setEditingAllergen(null);
    } catch (saveError) {
      setMessage({
        type: "error",
        text: getErrorMessage(saveError),
      });
    }
  };

  const handleDeactivate = async () => {
    if (!deletingAllergen) {
      return;
    }

    setMessage(null);

    try {
      // DELETE is a SOFT DELETE in this backend.
      await deactivateAllergen(deletingAllergen.code).unwrap();

      setDeletingAllergen(null);

      setMessage({
        type: "success",
        text: "បានបិទអាឡែស៊ីដោយជោគជ័យ។ អ្នកអាចស្ដារវិញបាន។",
      });
    } catch (deleteError) {
      setMessage({
        type: "error",
        text: getErrorMessage(deleteError),
      });
    }
  };

  const handleRestore = async (allergen: Allergen) => {
    setMessage(null);

    try {
      await restoreAllergen(allergen.code).unwrap();

      setMessage({
        type: "success",
        text: "បានស្ដារអាឡែស៊ីឱ្យសកម្មវិញដោយជោគជ័យ។",
      });
    } catch (restoreError) {
      setMessage({
        type: "error",
        text: getErrorMessage(restoreError),
      });
    }
  };

  const totalPages = Math.max(data?.totalPages ?? 1, 1);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 pb-10">
      <AllergensHeader
        total={data?.totalElements ?? allergens.length}
        activeCount={activeCount}
        inactiveCount={inactiveCount}
        onAdd={openCreate}
      />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <AllergensTabs
          value={statusFilter}
          allCount={allergens.length}
          activeCount={activeCount}
          inactiveCount={inactiveCount}
          onChange={setStatusFilter}
        />

        <AllergensToolbar
          search={search}
          size={size}
          refreshing={isFetching}
          onSearchChange={setSearch}
          onSizeChange={(nextSize) => {
            setSize(nextSize);
            setPage(0);
          }}
          onRefresh={() => {
            void refetch();
          }}
        />
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

      <section className="overflow-hidden rounded-[24px] border border-gray-100 bg-white shadow-sm">
        {isLoading ? (
          <div className="flex min-h-[320px] items-center justify-center">
            <div className="text-center text-gray-500">
              <LoaderCircle
                size={30}
                className="mx-auto animate-spin text-[#136C34]"
              />
              <p className="mt-3 text-sm">
                កំពុងទាញយកទិន្នន័យអាឡែស៊ី...
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">
            <AlertTriangle size={34} className="text-red-400" />

            <h3 className="mt-3 font-bold text-gray-800">
              មិនអាចទាញយកទិន្នន័យអាឡែស៊ីបានទេ
            </h3>

            <p className="mt-1 max-w-md text-sm text-gray-500">
              {getErrorMessage(error)}
            </p>

            <button
              type="button"
              onClick={() => {
                void refetch();
              }}
              className="mt-4 rounded-xl bg-[#136C34] px-4 py-2 text-sm font-semibold text-white"
            >
              សាកល្បងម្តងទៀត
            </button>
          </div>
        ) : filteredAllergens.length === 0 ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">
            <ShieldAlert size={38} className="text-gray-300" />

            <h3 className="mt-3 font-bold text-gray-700">
              មិនមានទិន្នន័យអាឡែស៊ី
            </h3>

            <p className="mt-1 text-sm text-gray-400">
              សូមបន្ថែមអាឡែស៊ីថ្មី ឬសាកល្បងតម្រងផ្សេងទៀត។
            </p>
          </div>
        ) : (
          <AllergensTable
            allergens={filteredAllergens}
            mutating={mutationLoading}
            onEdit={openEdit}
            onDeactivate={(allergen) => {
              setMessage(null);
              setDeletingAllergen(allergen);
            }}
            onRestore={(allergen) => {
              void handleRestore(allergen);
            }}
          />
        )}

        {!isLoading && !error && (
          <AllergensPagination
            page={page}
            totalPages={totalPages}
            totalElements={data?.totalElements ?? allergens.length}
            disabled={isFetching}
            onPageChange={setPage}
          />
        )}
      </section>

      <AllergenFormModal
        open={formOpen}
        allergen={editingAllergen}
        saving={isCreating || isUpdating}
        onClose={closeForm}
        onSubmit={handleSave}
      />

      <DeleteAllergenConfirmModal
        allergen={deletingAllergen}
        deleting={isDeactivating}
        onClose={() => {
          if (!isDeactivating) {
            setDeletingAllergen(null);
          }
        }}
        onConfirm={handleDeactivate}
      />
    </div>
  );
}
