"use client";

import { useState } from "react";

import {
  AlertTriangle,
  ArrowUpDown,
  Check,
  ChevronDown,
  LoaderCircle,
  Salad,
  Search,
  X,
} from "lucide-react";

import {
  useCreateDietaryTypeMutation,
  useDeleteDietaryTypeMutation,
  useGetDietaryTypesQuery,
  useHardDeleteDietaryTypeMutation,
  useRestoreDietaryTypeMutation,
  useUpdateDietaryTypeMutation,
} from "@/src/app/store/dietaryTypeApi";

import type {
  DietaryType,
  DietaryTypeFormValues,
  DietaryTypePayload,
} from "@/src/types/dietaryType";

import {
  getApiErrorMessage,
  type ApiMessage,
  type ResourceStatusFilter,
} from "@/src/types/safetyResource";

import DeleteDietaryTypeConfirmModal from "./DeleteDietaryTypeConfirmModal";
import DietaryTypeDetailModal from "./DietaryTypeDetailModal";
import DietaryTypeFormModal from "./DietaryTypeFormModal";
import DietaryTypesHeader from "./DietaryTypesHeader";
import DietaryTypesPagination from "./DietaryTypesPagination";
import DietaryTypesTable from "./DietaryTypesTable";
import DietaryTypesTabs from "./DietaryTypesTabs";
import HardDeleteDietaryTypeConfirmModal from "./HardDeleteDietaryTypeConfirmModal";

/* =========================================================
   SORT
========================================================= */

type DietaryTypeSort = "A_Z" | "Z_A" | "NEWEST" | "OLDEST";

export default function DietaryTypeManager() {
  /* =======================================================
     PAGINATION
  ======================================================= */
  const [page, setPage] = useState(0);

  const [size, setSize] = useState(20);

  const [sizeOpen, setSizeOpen] = useState(false);

  /* =======================================================
     SEARCH
  ======================================================= */
  const [search, setSearch] = useState("");

  const [showSuggestions, setShowSuggestions] = useState(false);

  /* =======================================================
     FILTER
  ======================================================= */
  const [statusFilter, setStatusFilter] = useState<ResourceStatusFilter>("ALL");

  /* =======================================================
     SORT
  ======================================================= */
  const [sortBy, setSortBy] = useState<DietaryTypeSort>("A_Z");

  const [sortOpen, setSortOpen] = useState(false);

  /* =======================================================
     MODALS
  ======================================================= */
  const [editing, setEditing] = useState<DietaryType | null>(null);

  const [
    viewing,
    setViewing,
  ] =
    useState<DietaryType | null>(
      null,
    );

  const [
    formOpen,
    setFormOpen,
  ] = useState(false);

  const [deleting, setDeleting] = useState<DietaryType | null>(null);

  const [
    hardDeletingItem,
    setHardDeletingItem,
  ] =
    useState<DietaryType | null>(
      null,
    );

  const [
    message,
    setMessage,
  ] =
    useState<ApiMessage | null>(
      null,
    );

  /* =======================================================
     DATA
  ======================================================= */
  const { data, isLoading, isFetching, error, refetch } =
    useGetDietaryTypesQuery({
      page,
      size,
    });

  /*
   * Load a larger list for search suggestions/results so
   * search is not limited to the current page.
   */
  const { data: suggestionData } = useGetDietaryTypesQuery({
    page: 0,
    size: 100,
  });

  /* =======================================================
     MUTATIONS
  ======================================================= */
  const [createItem, { isLoading: isCreating }] =
    useCreateDietaryTypeMutation();

  const [updateItem, { isLoading: isUpdating }] =
    useUpdateDietaryTypeMutation();

  const [deleteItem, { isLoading: isDeleting }] =
    useDeleteDietaryTypeMutation();

  const [
    hardDeleteItem,
    {
      isLoading:
      isHardDeleting,
    },
  ] =
    useHardDeleteDietaryTypeMutation();

  const [
    restoreItem,
    {
      isLoading:
      isRestoring,
    },
  ] =
    useRestoreDietaryTypeMutation();

  /* =======================================================
     ITEMS + COUNTS
  ======================================================= */
  const items = data?.contents ?? [];

  const suggestionItems = suggestionData?.contents ?? [];

  const activeCount = items.filter((item) => item.active).length;

  const inactiveCount = items.length - activeCount;

  /* =======================================================
     SEARCH
  ======================================================= */
  const normalizedSearch = search.trim().toLowerCase();

  const suggestions = normalizedSearch
    ? suggestionItems
      .filter((item) =>
        [item.code, item.name, item.category, item.description ?? ""].some(
          (value) => value.toLowerCase().includes(normalizedSearch),
        ),
      )
      .slice(0, 8)
    : [];

  const searchSource = normalizedSearch ? suggestionItems : items;

  /* =======================================================
     FILTER
  ======================================================= */
  const filteredItems = searchSource.filter((item) => {
    const statusMatches =
      statusFilter === "ALL" ||
      (statusFilter === "ACTIVE" && item.active) ||
      (statusFilter === "INACTIVE" && !item.active);

    if (!statusMatches) {
      return false;
    }

    if (!normalizedSearch) {
      return true;
    }

    return [item.code, item.name, item.category, item.description ?? ""].some(
      (value) => value.toLowerCase().includes(normalizedSearch),
    );
  });

  /* =======================================================
     SORT
  ======================================================= */
  const sortedItems = [...filteredItems].sort((first, second) => {
    switch (sortBy) {
      case "A_Z":
        return (first.name ?? "").localeCompare(second.name ?? "", undefined, {
          sensitivity: "base",
        });

      case "Z_A":
        return (second.name ?? "").localeCompare(first.name ?? "", undefined, {
          sensitivity: "base",
        });

      case "NEWEST": {
        const firstTime = first.updatedAt
          ? new Date(first.updatedAt).getTime()
          : 0;

        const secondTime = second.updatedAt
          ? new Date(second.updatedAt).getTime()
          : 0;

        return secondTime - firstTime;
      }

      case "OLDEST": {
        const firstTime = first.updatedAt
          ? new Date(first.updatedAt).getTime()
          : 0;

        const secondTime = second.updatedAt
          ? new Date(second.updatedAt).getTime()
          : 0;

        return firstTime - secondTime;
      }

      default:
        return 0;
    }
  });

  const sortOptions: {
    value: DietaryTypeSort;
    label: string;
  }[] = [
      {
        value: "A_Z",
        label: "A → Z",
      },
      {
        value: "Z_A",
        label: "Z → A",
      },
      {
        value: "NEWEST",
        label: "ថ្មីបំផុត",
      },
      {
        value: "OLDEST",
        label: "ចាស់បំផុត",
      },
    ];

  const busy =
    isCreating ||
    isUpdating ||
    isDeleting ||
    isHardDeleting ||
    isRestoring;

  /* =======================================================
     SAVE
  ======================================================= */
  const handleSave = async (values: DietaryTypeFormValues) => {
    setMessage(null);

    try {
      if (editing) {
        const body: DietaryTypePayload = {
          code: values.code,
          name: values.name,
          category: values.category,
          description: values.description || null,
          iconMediaUuid: editing.iconMediaUuid ?? null,
          active: values.active,
        };

        await updateItem({
          code: editing.code,
          body,
        }).unwrap();

        setMessage({
          type: "success",
          text: "បានកែប្រែរបបអាហារដោយជោគជ័យ។",
        });
      } else {
        const body: DietaryTypePayload = {
          code: values.code,
          name: values.name,
          category: values.category,
          description: values.description || null,
          iconMediaUuid: null,
          active: values.active,
        };

        await createItem(body).unwrap();

        setPage(0);

        setMessage({
          type: "success",
          text: "បានបន្ថែមរបបអាហារដោយជោគជ័យ។",
        });
      }

      setFormOpen(false);
      setEditing(null);

      await refetch();
    } catch (saveError) {
      setMessage({
        type: "error",
        text: getApiErrorMessage(saveError),
      });
    }
  };

  /* =======================================================
     DELETE
  ======================================================= */
  const handleDelete = async () => {
    if (!deleting) {
      return;
    }

    try {
      await deleteItem(deleting.code).unwrap();

      setDeleting(null);

      setMessage({
        type: "success",
        text: "បានបិទរបបអាហារដោយជោគជ័យ។",
      });

      await refetch();
    } catch (deleteError) {
      setMessage({
        type: "error",
        text: getApiErrorMessage(deleteError),
      });
    }
  };

  /* =======================================================
     លុប
  ======================================================= */
  const handleHardDelete =
    async () => {
      if (!hardDeletingItem) {
        return;
      }

      try {
        await hardDeleteItem(
          hardDeletingItem.code,
        ).unwrap();

        setMessage({
          type: "success",
          text: `បានលុបរបបអាហារ "${hardDeletingItem.name}" ជាអចិន្ត្រៃយ៍ដោយជោគជ័យ។`,
        });

        setHardDeletingItem(null);

        await refetch();
      } catch (
      hardDeleteError
      ) {
        setMessage({
          type: "error",
          text:
            getApiErrorMessage(
              hardDeleteError,
            ),
        });
      }
    };

  /* =======================================================
     លុប
  ======================================================= */
  const handleRestore =
    async (
      item: DietaryType,
    ) => {
      try {
        await restoreItem(
          item.code,
        ).unwrap();

        setMessage({
          type: "success",
          text:
            "បានស្ដាររបបអាហារដោយជោគជ័យ។",
        });

        await refetch();
      } catch (
      restoreError
      ) {
        setMessage({
          type: "error",
          text:
            getApiErrorMessage(
              restoreError,
            ),
        });
      }
    };

  /* =======================================================
     UI
  ======================================================= */
  return (
    <div className="w-full min-w-0 max-w-full space-y-5">
      {/* COMPONENT: DietaryTypesHeader */}
      <DietaryTypesHeader
        total={data?.totalElements ?? 0}
        activeCount={activeCount}
        inactiveCount={inactiveCount}
        onAdd={() => {
          setEditing(null);
          setMessage(null);
          setFormOpen(true);
        }}
      />

      {/* =================================================
          FILTER + SEARCH + SORT TOOLBAR
      ================================================== */}
      <section className=" ">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          {/* Status tabs */}
          <div className="w-full min-w-0 overflow-x-auto pb-1 xl:w-auto">
            <DietaryTypesTabs
              value={statusFilter}
              allCount={items.length}
              activeCount={activeCount}
              inactiveCount={inactiveCount}
              onChange={(value) => {
                setStatusFilter(value);
                setPage(0);
              }}
            />
          </div>

          {/* Search + controls */}
          <div className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-center xl:w-auto">
            {/* Search */}
            <div className="relative min-w-0 flex-1 sm:min-w-[380px]">
              <Search
                size={20}
                className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-gray-400"
              />

              <input
                value={search}
                onChange={(event) => {
                  const value = event.target.value;

                  setSearch(value);

                  setPage(0);

                  setShowSuggestions(value.trim().length > 0);
                }}
                onFocus={() => {
                  if (search.trim().length > 0) {
                    setShowSuggestions(true);
                  }
                }}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    setShowSuggestions(false);
                  }

                  if (event.key === "Enter") {
                    setShowSuggestions(false);
                  }
                }}
                placeholder="ស្វែងរករបបអាហារ កូដ ប្រភេទ ឬការពិពណ៌នា..."
                className="h-[52px] w-full rounded-full border border-gray-200 bg-gray-50 pl-12 pr-11 text-lg text-gray-800 outline-none transition placeholder:text-gray-400 hover:border-gray-300 focus:border-primary-600 focus:bg-white focus:ring-4 focus:ring-primary-100"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setShowSuggestions(false);
                    setPage(0);
                  }}
                  className="absolute right-3 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                  aria-label="Clear search"
                >
                  <X size={18} />
                </button>
              )}

              {/* Search suggestions */}
              {showSuggestions && normalizedSearch && (
                <div className="absolute left-0 top-[60px] z-[100] w-full min-w-[320px] overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl">
                  {suggestions.length === 0 ? (
                    <div className="px-5 py-6 text-center">
                      <Salad size={32} className="mx-auto text-gray-300" />

                      <p className="mt-2 text-lg font-medium text-gray-500">
                        មិនមានរបបអាហារដែលត្រូវគ្នា
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="border-b border-gray-100 px-5 py-3">
                        <p className="text-lg font-medium text-primary-800">
                          លទ្ធផលស្វែងរក
                        </p>
                      </div>

                      <div className="max-h-[340px] overflow-y-auto p-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                        {suggestions.map((item) => (
                          <button
                            key={item.uuid}
                            type="button"
                            onMouseDown={(event) => {
                              event.preventDefault();
                            }}
                            onClick={() => {
                              setSearch(item.name);
                              setShowSuggestions(false);
                              setPage(0);
                            }}
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-primary-50"
                          >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-800">
                              <Salad size={20} />
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="truncate text-lg font-semibold text-gray-800">
                                {item.name}
                              </p>

                              <div className="mt-1 flex flex-wrap items-center gap-2">
                                <span className="rounded-lg bg-gray-100 px-2.5 py-1 font-mono text-lg text-gray-500">
                                  {item.code}
                                </span>

                                <span className="rounded-full bg-secondary-50 px-2.5 py-1 text-lg font-medium text-secondary-600">
                                  {item.category}
                                </span>
                              </div>

                              {item.description && (
                                <p className="mt-1 truncate text-lg text-gray-400">
                                  {item.description}
                                </p>
                              )}
                            </div>

                            <span
                              className={`shrink-0 rounded-full px-3 py-1.5 text-lg font-medium ${item.active
                                  ? "bg-primary-50 text-primary-700"
                                  : "bg-gray-100 text-gray-500"
                                }`}
                            >
                              {item.active ? "សកម្ម" : "អសកម្ម"}
                            </span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Page size */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => {
                  setSizeOpen((current) => !current);

                  setSortOpen(false);
                }}
                className={`flex h-[52px] min-w-[150px] items-center justify-between gap-3 rounded-full border bg-white px-4 text-lg font-medium transition ${sizeOpen
                    ? "border-primary-600 ring-4 ring-primary-100"
                    : "border-gray-200 text-gray-700 hover:border-primary-200 hover:bg-primary-50"
                  }`}
              >
                <span>{size} / ទំព័រ</span>

                <ChevronDown
                  size={18}
                  className={`text-gray-400 transition-transform duration-200 ${sizeOpen ? "rotate-180" : ""
                    }`}
                />
              </button>

              {sizeOpen && (
                <div className="absolute right-0 top-[60px] z-[100] w-[190px] rounded-2xl border border-gray-100 bg-white p-2 shadow-xl">
                  <p className="px-3 pb-2 pt-1 text-lg font-medium text-primary-800">
                    ចំនួនក្នុងទំព័រ
                  </p>

                  {[10, 20, 50].map((value) => {
                    const selected = size === value;

                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => {
                          setSize(value);
                          setPage(0);
                          setSizeOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-lg font-medium transition ${selected
                            ? "bg-primary-50 text-primary-800"
                            : "text-gray-600 hover:bg-gray-50 hover:text-primary-800"
                          }`}
                      >
                        <span>{value} / ទំព័រ</span>

                        {selected && <Check size={18} />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Sort */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => {
                  setSortOpen((current) => !current);

                  setSizeOpen(false);
                }}
                className={`flex h-[52px] w-[52px] items-center justify-center rounded-full border transition ${sortOpen
                    ? "border-primary-600 bg-primary-50 text-primary-800 ring-4 ring-primary-100"
                    : "border-gray-200 bg-white text-gray-600 hover:border-primary-200 hover:bg-primary-50 hover:text-primary-800"
                  }`}
                aria-label="Sort dietary types"
                title="Sort dietary types"
              >
                <ArrowUpDown size={20} />
              </button>

              {sortOpen && (
                <div className="absolute right-0 top-[60px] z-[100] w-[210px] rounded-2xl border border-gray-100 bg-white p-2 shadow-xl">
                  <p className="px-3 pb-2 pt-1 text-lg font-medium text-primary-800">
                    តម្រៀប
                  </p>

                  {sortOptions.map((option) => {
                    const selected = sortBy === option.value;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setSortBy(option.value);
                          setSortOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-lg font-medium transition ${selected
                            ? "bg-primary-50 text-primary-800"
                            : "text-gray-600 hover:bg-gray-50 hover:text-primary-800"
                          }`}
                      >
                        <span>{option.label}</span>

                        {selected && <Check size={18} />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* COMPONENT: Notice */}
      {message && (
        <div
          className={`rounded-2xl border px-5 py-4 text-lg leading-7 ${message.type === "success"
              ? "border-primary-100 bg-primary-50 text-primary-700"
              : "border-red-100 bg-red-50 text-red-600"
            }`}
        >
          {message.text}
        </div>
      )}

      {/* =================================================
          TABLE AREA
      ================================================== */}
      <section className="w-full min-w-0 max-w-full overflow-visible rounded-[24px] border border-gray-100 bg-white shadow-sm">
        {isLoading ? (
          <div className="flex min-h-[320px] items-center justify-center">
            <div className="text-center">
              <LoaderCircle
                size={32}
                className="mx-auto animate-spin text-primary-800"
              />

              <p className="mt-3 text-lg font-medium text-gray-500">
                កំពុងទាញទិន្នន័យ...
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
              <AlertTriangle size={28} />
            </div>

            <p className="mt-4 text-2xl font-semibold text-primary-800">
              មិនអាចទាញយកទិន្នន័យរបបអាហារបានទេ
            </p>

            <p className="mt-2 max-w-xl text-lg leading-8 text-gray-500">
              {getApiErrorMessage(error)}
            </p>

            <button
              type="button"
              onClick={() => void refetch()}
              className="mt-5 inline-flex min-h-12 items-center justify-center rounded-full bg-primary-800 px-6 text-lg font-medium text-white transition hover:bg-primary-900 focus:outline-none focus:ring-4 focus:ring-primary-200"
            >
              សាកល្បងម្តងទៀត
            </button>
          </div>
        ) : sortedItems.length === 0 ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">
            <Salad size={40} className="text-gray-300" />

            <p className="mt-3 text-lg font-medium text-gray-500">
              មិនមានទិន្នន័យ
            </p>

            <p className="mt-1 text-lg text-gray-400">
              សូមសាកល្បងស្វែងរក ឬជ្រើស filter ផ្សេងទៀត។
            </p>
          </div>
        ) : (
          <DietaryTypesTable
            items={sortedItems}
            disabled={busy}
            onView={(item) =>
              setViewing(item)
            }
            onEdit={(
              item,
            ) => {
              setEditing(
                item,
              );
              setFormOpen(
                true,
              );
            }}
            onDelete={
              setDeleting
            }
            onHardDelete={(
              item,
            ) =>
              setHardDeletingItem(
                item,
              )
            }
            onRestore={(
              item,
            ) =>
              void handleRestore(
                item,
              )
            }
          />
        )}

        {!isLoading && !error && !normalizedSearch && (
          <DietaryTypesPagination
            page={data?.pageNumber ?? page}
            totalPages={data?.totalPages ?? 1}
            totalElements={data?.totalElements ?? 0}
            disabled={isFetching}
            onPageChange={setPage}
          />
        )}
      </section>

      {/* COMPONENT: DietaryTypeFormModal */}
      <DietaryTypeFormModal
        open={formOpen}
        item={editing}
        saving={isCreating || isUpdating}
        onClose={() => {
          if (isCreating || isUpdating) {
            return;
          }

          setFormOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSave}
      />

      {/* COMPONENT: DeleteDietaryTypeConfirmModal */}
      <DeleteDietaryTypeConfirmModal
        item={deleting}
        deleting={
          isDeleting
        }
        onClose={() => {
          if (!isDeleting) {
            setDeleting(
              null,
            );
          }
        }}
        onConfirm={
          handleDelete
        }
      />

      {/* COMPONENT: HardDeleteDietaryTypeConfirmModal */}
      <HardDeleteDietaryTypeConfirmModal
        item={hardDeletingItem}
        deleting={
          isHardDeleting
        }
        onClose={() => {
          if (!isHardDeleting) {
            setHardDeletingItem(
              null,
            );
          }
        }}
        onConfirm={
          handleHardDelete
        }
      />

      {/* COMPONENT: DietaryTypeDetailModal */}
      <DietaryTypeDetailModal
        item={viewing}
        onClose={() =>
          setViewing(null)
        }
      />
    </div>
  );
}
