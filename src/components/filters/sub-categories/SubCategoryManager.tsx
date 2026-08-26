"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2, X } from "lucide-react";

import {
  useCreateFoodCategoryMutation,
  useDeleteFoodCategoryMutation,
  useGetFoodCategoriesQuery,
  useUpdateFoodCategoryMutation,
} from "@/src/app/store/foodCategoryApi";

import {
  isDrinkCategory,
  isFoodCategory,
  isParentCategory,
} from "@/src/lib/catalogCategoryHelper";

import type {
  FoodCategory,
  FoodCategoryPayload,
} from "@/src/types/foodCategory";

import DeleteSubCategoryConfirmModal from "./DeleteSubCategoryConfirmModal";
import SubCategoryDetailModal from "./SubCategoryDetailModal";
import SubCategoryFormModal from "./SubCategoryFormModal";
import SubCategoryHeader from "./SubCategoryHeader";
import SubCategoryPagination from "./SubCategoryPagination";
import SubCategoryTable from "./SubCategoryTable";
import SubCategoryToolbar, {
  type SubCategorySortMode,
  type SubCategoryStatusFilter,
} from "./SubCategoryToolbar";

const DEFAULT_FOOD_ROOT_UUID = "834c39dc-67df-4544-a48d-816103115631";
const DEFAULT_DRINK_ROOT_UUID = "172b3ccf-9edd-4ef6-8a03-6af40bf6ba83";

type Props = {
  mode?: "FOOD" | "DRINK";
};

export default function SubCategoryManager({ mode = "FOOD" }: Props) {
  const isDrink = mode === "DRINK";

  // Data fetching
  const {
    data,
    isLoading,
    isFetching,
    error: fetchError,
    refetch,
  } = useGetFoodCategoriesQuery({
    page: 0,
    size: 200,
    includeInactive: true,
  });

  const [createFoodCategory, { isLoading: isCreating }] =
    useCreateFoodCategoryMutation();
  const [updateFoodCategory, { isLoading: isUpdating }] =
    useUpdateFoodCategoryMutation();
  const [deleteFoodCategory, { isLoading: isDeletingRequest }] =
    useDeleteFoodCategoryMutation();

  const allCategories = useMemo(
    () => data?.contents ?? [],
    [data?.contents],
  );

  // Dynamically identify ROOT category
  const rootCategory = useMemo(() => {
    if (isDrink) {
      return (
        allCategories.find(
          (c) =>
            !c.parentCategoryUuid &&
            (c.code?.toUpperCase() === "DRINK" ||
              c.name === "ភេសជ្ជៈ" ||
              c.uuid === DEFAULT_DRINK_ROOT_UUID),
        ) ?? {
          uuid: DEFAULT_DRINK_ROOT_UUID,
          code: "DRINK",
          name: "ភេសជ្ជៈ",
        }
      );
    }

    return (
      allCategories.find(
        (c) =>
          !c.parentCategoryUuid &&
          (c.code?.toUpperCase() === "FOOD" ||
            c.name === "ម្ហូបអាហារ" ||
            c.uuid === DEFAULT_FOOD_ROOT_UUID),
      ) ?? {
        uuid: DEFAULT_FOOD_ROOT_UUID,
        code: "FOOD",
        name: "ម្ហូបអាហារ",
      }
    );
  }, [allCategories, isDrink]);

  // Filter only sub-categories belonging to this root
  const subCategories = useMemo(() => {
    const rootUuid = rootCategory.uuid;

    return allCategories.filter((item) => {
      // Must not be a root category itself
      if (item.uuid === rootUuid || !item.parentCategoryUuid) {
        return false;
      }

      if (isDrink) {
        return (
          item.parentCategoryUuid === rootUuid ||
          item.parentCategoryName === "ភេសជ្ជៈ" ||
          isDrinkCategory(
            {
              uuid: item.uuid,
              code: item.code,
              name: item.name,
              parentCategoryUuid: item.parentCategoryUuid,
              parentCategoryName: item.parentCategoryName,
              isActive: item.isActive,
            },
            allCategories as any,
          )
        );
      }

      return (
        item.parentCategoryUuid === rootUuid ||
        item.parentCategoryName === "ម្ហូបអាហារ" ||
        isFoodCategory(
          {
            uuid: item.uuid,
            code: item.code,
            name: item.name,
            parentCategoryUuid: item.parentCategoryUuid,
            parentCategoryName: item.parentCategoryName,
            isActive: item.isActive,
          },
          allCategories as any,
        )
      );
    });
  }, [allCategories, isDrink, rootCategory.uuid]);

  // States
  const [search, setSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [statusFilter, setStatusFilter] =
    useState<SubCategoryStatusFilter>("ALL");
  const [sortMode, setSortMode] = useState<SubCategorySortMode>("NEWEST");
  const [sortOpen, setSortOpen] = useState(false);
  const [size, setSize] = useState(20);
  const [sizeOpen, setSizeOpen] = useState(false);
  const [page, setPage] = useState(0);

  // Modals state
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<FoodCategory | null>(null);
  const [viewing, setViewing] = useState<FoodCategory | null>(null);
  const [deleting, setDeleting] = useState<FoodCategory | null>(null);
  const [notice, setNotice] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Counts
  const activeCount = subCategories.filter(
    (item) => item.isActive !== false,
  ).length;
  const inactiveCount = subCategories.length - activeCount;

  // Search suggestions
  const normalizedSearch = search.trim().toLowerCase();
  const suggestions = useMemo(() => {
    if (!normalizedSearch) return [];
    return subCategories
      .filter((item) =>
        [item.name, item.code, item.description ?? ""].some((val) =>
          String(val).toLowerCase().includes(normalizedSearch),
        ),
      )
      .slice(0, 6);
  }, [subCategories, normalizedSearch]);

  // Filtered & Sorted items
  const filtered = useMemo(() => {
    return subCategories.filter((item) => {
      const active = item.isActive !== false;
      const statusMatches =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && active) ||
        (statusFilter === "INACTIVE" && !active);

      if (!statusMatches) return false;

      if (!normalizedSearch) return true;

      return [item.name, item.code, item.description ?? ""].some((val) =>
        String(val).toLowerCase().includes(normalizedSearch),
      );
    });
  }, [subCategories, normalizedSearch, statusFilter]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (sortMode === "A_Z") {
        return (a.name || "").localeCompare(b.name || "", "km");
      }
      if (sortMode === "Z_A") {
        return (b.name || "").localeCompare(a.name || "", "km");
      }
      const timeA = new Date(a.createdAt || 0).getTime();
      const timeB = new Date(b.createdAt || 0).getTime();
      return sortMode === "NEWEST" ? timeB - timeA : timeA - timeB;
    });
  }, [filtered, sortMode]);

  const totalPages = Math.max(Math.ceil(sorted.length / size), 1);
  const safePage = Math.min(page, totalPages - 1);
  const pagedItems = sorted.slice(
    safePage * size,
    safePage * size + size,
  );

  // Action Handlers
  const handleOpenCreate = () => {
    setEditing(null);
    setFormOpen(true);
    setNotice(null);
  };

  const handleOpenEdit = (item: FoodCategory) => {
    setEditing(item);
    setFormOpen(true);
    setNotice(null);
  };

  const handleSave = async (payload: FoodCategoryPayload) => {
    try {
      if (editing) {
        await updateFoodCategory({
          uuid: editing.uuid,
          body: {
            ...payload,
            parentCategoryUuid: rootCategory.uuid,
          },
        }).unwrap();
        setNotice({
          type: "success",
          text: "បានកែប្រែព័ត៌មានអនុប្រភេទដោយជោគជ័យ!",
        });
      } else {
        await createFoodCategory({
          ...payload,
          parentCategoryUuid: rootCategory.uuid,
        }).unwrap();
        setNotice({
          type: "success",
          text: "បានបង្កើតអនុប្រភេទថ្មីដោយជោគជ័យ!",
        });
      }

      setFormOpen(false);
      setEditing(null);
      await refetch();
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : (err as any)?.data?.message ||
            "មិនអាចរក្សាទុកអនុប្រភេទបានទេ សូមព្យាយាមម្តងទៀត។";
      throw new Error(msg);
    }
  };

  const handleToggleActive = async (item: FoodCategory) => {
    const newStatus = item.isActive === false;
    try {
      await updateFoodCategory({
        uuid: item.uuid,
        body: {
          isActive: newStatus,
          parentCategoryUuid: rootCategory.uuid,
        },
      }).unwrap();
      setNotice({
        type: "success",
        text: `បាន${newStatus ? "បើក" : "បិទ"}ដំណើរការអនុប្រភេទ "${item.name}" រួចរាល់!`,
      });
      await refetch();
    } catch (err) {
      setNotice({
        type: "error",
        text: "មិនអាចផ្លាស់ប្តូរស្ថានភាពបានទេ។",
      });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleting) return;
    try {
      await deleteFoodCategory(deleting.uuid).unwrap();
      setNotice({
        type: "success",
        text: `បានលុបអនុប្រភេទ "${deleting.name}" ដោយជោគជ័យ!`,
      });
      setDeleting(null);
      await refetch();
    } catch (err) {
      setNotice({
        type: "error",
        text:
          (err as any)?.data?.message ||
          "មិនអាចលុបអនុប្រភេទនេះបានទេ ព្រោះប្រហែលជាមានមុខម្ហូប/ភេសជ្ជៈកំពុងប្រើប្រាស់វា។",
      });
    }
  };

  const handleReset = () => {
    setSearch("");
    setStatusFilter("ALL");
    setSortMode("NEWEST");
    setSize(20);
    setPage(0);
    setShowSuggestions(false);
    refetch();
  };

  const handleRestoreAll = async () => {
    const inactives = subCategories.filter((item) => item.isActive === false);
    if (!inactives.length) return;
    try {
      for (const item of inactives) {
        await updateFoodCategory({
          uuid: item.uuid,
          body: { isActive: true },
        }).unwrap();
      }
      setNotice({
        type: "success",
        text: `បានស្ដារអនុប្រភេទអសកម្មទាំងអស់ (${inactives.length}) ដោយជោគជ័យ!`,
      });
      await refetch();
    } catch (err) {
      setNotice({
        type: "error",
        text: "មានបញ្ហាក្នុងការស្ដារអនុប្រភេទទាំងអស់។",
      });
    }
  };

  return (
    <div className="w-full min-w-0 max-w-full space-y-6">
      {/* Header Banner */}
      <SubCategoryHeader
        mode={mode}
        total={subCategories.length}
        activeCount={activeCount}
        inactiveCount={inactiveCount}
        onAdd={handleOpenCreate}
        onRestoreAll={inactiveCount > 0 ? handleRestoreAll : undefined}
      />

      {/* Notice Message */}
      {notice && (
        <div
          className={`flex items-center justify-between rounded-2xl p-4 text-sm font-semibold transition ${
            notice.type === "success"
              ? "border border-emerald-100 bg-emerald-50 text-emerald-800"
              : "border border-red-100 bg-red-50 text-red-700"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {notice.type === "success" ? (
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle size={18} className="text-red-500 shrink-0" />
            )}
            <span>{notice.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotice(null)}
            className="rounded-full p-1 text-gray-400 hover:bg-black/5 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Fetch Error */}
      {fetchError && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
          <AlertTriangle size={20} className="shrink-0" />
          <p>
            មិនអាចទាញយកបញ្ជីអនុប្រភេទបានទេ។ សូមពិនិត្យការតភ្ជាប់អ៊ីនធឺណិត ឬ
            Session ចូលប្រើប្រាស់។
          </p>
        </div>
      )}

      {/* Toolbar */}
      <SubCategoryToolbar
        mode={mode}
        search={search}
        statusFilter={statusFilter}
        sortMode={sortMode}
        size={size}
        sortOpen={sortOpen}
        sizeOpen={sizeOpen}
        showSuggestions={showSuggestions}
        suggestions={suggestions}
        totalCount={subCategories.length}
        activeCount={activeCount}
        inactiveCount={inactiveCount}
        onSearchChange={(val) => {
          setSearch(val);
          setShowSuggestions(val.trim().length > 0);
          setPage(0);
        }}
        onSearchFocus={() => {
          if (search.trim()) setShowSuggestions(true);
        }}
        onClearSearch={() => {
          setSearch("");
          setShowSuggestions(false);
          setPage(0);
        }}
        onSuggestionSelect={(item) => {
          setSearch(item.name);
          setShowSuggestions(false);
          setPage(0);
        }}
        onStatusFilterChange={(st) => {
          setStatusFilter(st);
          setPage(0);
        }}
        onSortModeChange={(sm) => {
          setSortMode(sm);
          setPage(0);
        }}
        onSizeChange={(sz) => {
          setSize(sz);
          setPage(0);
        }}
        onToggleSortOpen={() => {
          setSortOpen((prev) => !prev);
          setSizeOpen(false);
        }}
        onToggleSizeOpen={() => {
          setSizeOpen((prev) => !prev);
          setSortOpen(false);
        }}
        onCloseDropdowns={() => {
          setSortOpen(false);
          setSizeOpen(false);
          setShowSuggestions(false);
        }}
        onReset={handleReset}
      />

      {/* Table & Pagination Container */}
      <section className="overflow-visible rounded-3xl border border-gray-100 bg-white shadow-sm">
        {isLoading ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center">
            <Loader2 size={32} className="animate-spin text-primary-600" />
            <p className="mt-3 text-base font-semibold text-gray-500">
              កំពុងទាញយកទិន្នន័យ...
            </p>
          </div>
        ) : (
          <>
            {/* Table */}
            <SubCategoryTable
              items={pagedItems}
              mode={mode}
              busy={isCreating || isUpdating || isDeletingRequest || isFetching}
              onView={(item) => setViewing(item)}
              onEdit={handleOpenEdit}
              onToggleActive={handleToggleActive}
              onDelete={(item) => setDeleting(item)}
            />

            {/* Pagination */}
            <SubCategoryPagination
              page={safePage}
              totalPages={totalPages}
              totalElements={sorted.length}
              pageSize={size}
              onPageChange={(p) => setPage(p)}
            />
          </>
        )}
      </section>

      {/* Create / Edit Form Modal */}
      <SubCategoryFormModal
        open={formOpen}
        mode={mode}
        item={editing}
        parentRootUuid={rootCategory.uuid}
        parentRootName={rootCategory.name}
        parentRootCode={rootCategory.code}
        saving={isCreating || isUpdating}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSave}
      />

      {/* Detail Modal */}
      <SubCategoryDetailModal
        item={viewing}
        mode={mode}
        parentRootName={rootCategory.name}
        onClose={() => setViewing(null)}
        onEdit={(item) => {
          setViewing(null);
          handleOpenEdit(item);
        }}
      />

      {/* Delete Confirmation Modal */}
      <DeleteSubCategoryConfirmModal
        open={Boolean(deleting)}
        item={deleting}
        deleting={isDeletingRequest}
        onClose={() => setDeleting(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
