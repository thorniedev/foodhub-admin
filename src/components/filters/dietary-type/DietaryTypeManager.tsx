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
import DietaryTypeFormModal from "./DietaryTypeFormModal";
import DietaryTypesHeader from "./DietaryTypesHeader";
import DietaryTypesPagination from "./DietaryTypesPagination";
import DietaryTypesTable from "./DietaryTypesTable";
import DietaryTypesTabs from "./DietaryTypesTabs";

/* =========================================================
   SORT
========================================================= */

type DietaryTypeSort =
  | "A_Z"
  | "Z_A"
  | "NEWEST"
  | "OLDEST";

export default function DietaryTypeManager() {
  /* =======================================================
     PAGINATION
  ======================================================= */

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);

  const [sizeOpen, setSizeOpen] =
    useState(false);

  /* =======================================================
     SEARCH
  ======================================================= */

  const [search, setSearch] =
    useState("");

  const [
    showSuggestions,
    setShowSuggestions,
  ] = useState(false);

  /* =======================================================
     FILTER
  ======================================================= */

  const [
    statusFilter,
    setStatusFilter,
  ] =
    useState<ResourceStatusFilter>(
      "ALL",
    );

  /* =======================================================
     SORT
  ======================================================= */

  const [sortBy, setSortBy] =
    useState<DietaryTypeSort>(
      "A_Z",
    );

  const [sortOpen, setSortOpen] =
    useState(false);

  /* =======================================================
     MODALS
  ======================================================= */

  const [editing, setEditing] =
    useState<DietaryType | null>(
      null,
    );

  const [formOpen, setFormOpen] =
    useState(false);

  const [deleting, setDeleting] =
    useState<DietaryType | null>(
      null,
    );

  const [message, setMessage] =
    useState<ApiMessage | null>(
      null,
    );

  /* =======================================================
     DATA
  ======================================================= */

  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetDietaryTypesQuery({
    page,
    size,
  });

  /*
   * Search suggestion data.
   *
   * Load more records so suggestions are
   * not limited to the current page.
   */
  const {
    data: suggestionData,
  } = useGetDietaryTypesQuery({
    page: 0,
    size: 100,
  });

  /* =======================================================
     MUTATIONS
  ======================================================= */

  const [
    createItem,
    {
      isLoading:
        isCreating,
    },
  ] =
    useCreateDietaryTypeMutation();

  const [
    updateItem,
    {
      isLoading:
        isUpdating,
    },
  ] =
    useUpdateDietaryTypeMutation();

  const [
    deleteItem,
    {
      isLoading:
        isDeleting,
    },
  ] =
    useDeleteDietaryTypeMutation();

  const [
    restoreItem,
    {
      isLoading:
        isRestoring,
    },
  ] =
    useRestoreDietaryTypeMutation();

  /* =======================================================
     ITEMS
  ======================================================= */

  const items =
    data?.contents ?? [];

  const suggestionItems =
    suggestionData?.contents ??
    [];

  /* =======================================================
     COUNTS
  ======================================================= */

  const activeCount =
    items.filter(
      (item) => item.active,
    ).length;

  const inactiveCount =
    items.length -
    activeCount;

  /* =======================================================
     SEARCH
  ======================================================= */

  const normalizedSearch =
    search
      .trim()
      .toLowerCase();

  /*
   * Search remains based on the existing Dietary Type data:
   *
   * - code
   * - name
   * - category
   * - description
   */
  const suggestions =
    normalizedSearch
      ? suggestionItems
          .filter((item) => {
            const values = [
              item.code,
              item.name,
              item.category,
              item.description ??
                "",
            ];

            return values.some(
              (value) =>
                value
                  .toLowerCase()
                  .includes(
                    normalizedSearch,
                  ),
            );
          })
          .slice(0, 8)
      : [];

  /*
   * While searching, use the larger dataset so
   * suggestions/results aren't restricted to
   * the current 20 records.
   */
  const searchSource =
    normalizedSearch
      ? suggestionItems
      : items;

  /* =======================================================
     FILTER
  ======================================================= */

  const filteredItems =
    searchSource.filter(
      (item) => {
        const statusMatches =
          statusFilter ===
            "ALL" ||
          (statusFilter ===
            "ACTIVE" &&
            item.active) ||
          (statusFilter ===
            "INACTIVE" &&
            !item.active);

        if (
          !statusMatches
        ) {
          return false;
        }

        if (
          !normalizedSearch
        ) {
          return true;
        }

        return [
          item.code,
          item.name,
          item.category,
          item.description ??
            "",
        ].some((value) =>
          value
            .toLowerCase()
            .includes(
              normalizedSearch,
            ),
        );
      },
    );

  /* =======================================================
     SORT
  ======================================================= */

  const sortedItems = [
    ...filteredItems,
  ].sort(
    (
      first,
      second,
    ) => {
      switch (sortBy) {
        /* ===============================================
           A → Z
        ================================================ */

        case "A_Z":
          return (
            first.name ?? ""
          ).localeCompare(
            second.name ?? "",
            undefined,
            {
              sensitivity:
                "base",
            },
          );

        /* ===============================================
           Z → A
        ================================================ */

        case "Z_A":
          return (
            second.name ?? ""
          ).localeCompare(
            first.name ?? "",
            undefined,
            {
              sensitivity:
                "base",
            },
          );

        /* ===============================================
           NEWEST
        ================================================ */

        case "NEWEST": {
          const firstTime =
            first.updatedAt
              ? new Date(
                  first.updatedAt,
                ).getTime()
              : 0;

          const secondTime =
            second.updatedAt
              ? new Date(
                  second.updatedAt,
                ).getTime()
              : 0;

          return (
            secondTime -
            firstTime
          );
        }

        /* ===============================================
           OLDEST
        ================================================ */

        case "OLDEST": {
          const firstTime =
            first.updatedAt
              ? new Date(
                  first.updatedAt,
                ).getTime()
              : 0;

          const secondTime =
            second.updatedAt
              ? new Date(
                  second.updatedAt,
                ).getTime()
              : 0;

          return (
            firstTime -
            secondTime
          );
        }

        default:
          return 0;
      }
    },
  );

  /* =======================================================
     SORT OPTIONS
  ======================================================= */

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

  /* =======================================================
     BUSY
  ======================================================= */

  const busy =
    isCreating ||
    isUpdating ||
    isDeleting ||
    isRestoring;

  /* =======================================================
     SAVE
  ======================================================= */

  const handleSave = async (
    values: DietaryTypeFormValues,
  ) => {
    setMessage(null);

    try {
      if (editing) {
        const body: DietaryTypePayload =
          {
            code:
              values.code,

            name:
              values.name,

            category:
              values.category,

            description:
              values.description ||
              null,

            iconMediaUuid:
              editing.iconMediaUuid ??
              null,

            active:
              values.active,
          };

        await updateItem({
          code:
            editing.code,
          body,
        }).unwrap();

        setMessage({
          type: "success",
          text: "បានកែប្រែរបបអាហារដោយជោគជ័យ។",
        });
      } else {
        const body: DietaryTypePayload =
          {
            code:
              values.code,

            name:
              values.name,

            category:
              values.category,

            description:
              values.description ||
              null,

            iconMediaUuid:
              null,

            active:
              values.active,
          };

        await createItem(
          body,
        ).unwrap();

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

        text:
          getApiErrorMessage(
            saveError,
          ),
      });
    }
  };

  /* =======================================================
     DELETE
  ======================================================= */

  const handleDelete =
    async () => {
      if (!deleting) {
        return;
      }

      try {
        await deleteItem(
          deleting.code,
        ).unwrap();

        setDeleting(null);

        setMessage({
          type: "success",
          text: "បានបិទរបបអាហារដោយជោគជ័យ។",
        });

        await refetch();
      } catch (deleteError) {
        setMessage({
          type: "error",

          text:
            getApiErrorMessage(
              deleteError,
            ),
        });
      }
    };

  /* =======================================================
     RESTORE
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
          text: "បានស្ដាររបបអាហារដោយជោគជ័យ។",
        });

        await refetch();
      } catch (restoreError) {
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
    <div className="space-y-5">
      {/* =================================================
          HEADER
      ================================================== */}

      <DietaryTypesHeader
        total={
          data?.totalElements ??
          0
        }
        activeCount={
          activeCount
        }
        inactiveCount={
          inactiveCount
        }
        onAdd={() => {
          setEditing(null);

          setMessage(null);

          setFormOpen(true);
        }}
      />

      {/* =================================================
          TABS + TOOLBAR
      ================================================== */}

      <div className="flex w-full flex-nowrap items-center justify-between gap-4">
        {/* ===============================================
            LEFT
        ================================================ */}

        <div className="shrink-0">
          <DietaryTypesTabs
            value={
              statusFilter
            }
            allCount={
              items.length
            }
            activeCount={
              activeCount
            }
            inactiveCount={
              inactiveCount
            }
            onChange={(
              value,
            ) => {
              setStatusFilter(
                value,
              );

              setPage(0);
            }}
          />
        </div>

        {/* ===============================================
            RIGHT
        ================================================ */}

        <div className="ml-auto flex shrink-0 items-center gap-2">
          {/* =============================================
              SEARCH
          ============================================== */}

          <div className="relative">
            <Search
              size={17}
              className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-gray-400"
            />

            <input
              value={search}
              onChange={(
                event,
              ) => {
                const value =
                  event.target
                    .value;

                setSearch(value);

                setPage(0);

                setShowSuggestions(
                  value
                    .trim()
                    .length > 0,
                );
              }}
              onFocus={() => {
                if (
                  search
                    .trim()
                    .length >
                  0
                ) {
                  setShowSuggestions(
                    true,
                  );
                }
              }}
              onKeyDown={(
                event,
              ) => {
                if (
                  event.key ===
                  "Escape"
                ) {
                  setShowSuggestions(
                    false,
                  );
                }

                if (
                  event.key ===
                  "Enter"
                ) {
                  setShowSuggestions(
                    false,
                  );
                }
              }}
              placeholder="ស្វែងរករបបអាហារ កូដ ប្រភេទ ឬការពិពណ៌នា..."
              className="h-11 w-[500px] rounded-2xl border border-gray-200 bg-white py-2 pl-11 pr-10 text-lg text-gray-700 outline-none transition focus:border-[#137A3D] focus:ring-2 focus:ring-[#137A3D]/10"
            />

            {/* CLEAR */}

            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");

                  setShowSuggestions(
                    false,
                  );

                  setPage(0);
                }}
                className="absolute right-3 top-1/2 z-10 -translate-y-1/2 text-gray-400 transition hover:text-gray-700"
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}

            {/* =========================================
                SUGGESTIONS
            ========================================== */}

            {showSuggestions &&
              normalizedSearch && (
                <div className="absolute left-0 top-[52px] z-[100] w-[500px] overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_18px_50px_rgba(0,0,0,0.13)]">
                  {suggestions.length ===
                  0 ? (
                    <div className="px-5 py-6 text-center">
                      <Salad
                        size={32}
                        className="mx-auto text-[#F97316]"
                      />

                      <p className="mt-2 text-lg text-[#F97316]">
                        មិនមានរបបអាហារដែលត្រូវគ្នា
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* HEADER */}

                      <div className="border-b border-gray-100 px-5 py-3">
                        <p className="text-lg uppercase tracking-wide text-[#F97316]">
                          លទ្ធផលស្វែងរក
                        </p>
                      </div>

                      {/* RESULTS */}

                      <div className="max-h-[340px] overflow-y-auto p-2">
                        {suggestions.map(
                          (item) => (
                            <button
                              key={
                                item.uuid
                              }
                              type="button"
                              onMouseDown={(
                                event,
                              ) => {
                                event.preventDefault();
                              }}
                              onClick={() => {
                                setSearch(
                                  item.name,
                                );

                                setShowSuggestions(
                                  false,
                                );

                                setPage(
                                  0,
                                );
                              }}
                              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-emerald-50"
                            >
                              {/* ICON */}

                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-[#137A3D]">
                                <Salad
                                  size={24}
                                />
                              </div>

                              {/* INFO */}

                              <div className="min-w-0 flex-1">
                                <p className="truncate text-base font-black text-gray-800">
                                  {
                                    item.name
                                  }
                                </p>

                                <div className="mt-1 flex items-center gap-2">
                                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-sm text-gray-500">
                                    {
                                      item.code
                                    }
                                  </span>

                                  <span className="rounded-full bg-orange-50 px-2 py-0.5 text-sm text-orange-600">
                                    {
                                      item.category
                                    }
                                  </span>
                                </div>

                                {item.description && (
                                  <p className="mt-1 truncate text-sm text-gray-400">
                                    {
                                      item.description
                                    }
                                  </p>
                                )}
                              </div>

                              {/* STATUS */}

                              <span
                                className={`shrink-0 rounded-full px-2 py-1 text-base font-bold ${
                                  item.active
                                    ? "bg-emerald-50 text-emerald-600"
                                    : "bg-gray-100 text-gray-500"
                                }`}
                              >
                                {item.active
                                  ? "សកម្ម"
                                  : "អសកម្ម"}
                              </span>
                            </button>
                          ),
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
          </div>

          {/* =============================================
              PAGE SIZE
          ============================================== */}

          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setSizeOpen(
                  (
                    current,
                  ) =>
                    !current,
                );

                setSortOpen(
                  false,
                );
              }}
              className={`flex h-11 min-w-[125px] items-center justify-between gap-3 rounded-2xl border bg-white px-4 text-sm font-semibold transition ${
                sizeOpen
                  ? "border-[#137A3D] ring-2 ring-[#137A3D]/10"
                  : "border-gray-200 hover:border-[#137A3D]/50"
              }`}
            >
              <span className="text-gray-700">
                {size} /
                ទំព័រ
              </span>

              <ChevronDown
                size={17}
                className={`text-gray-400 transition-transform duration-200 ${
                  sizeOpen
                    ? "rotate-180"
                    : ""
                }`}
              />
            </button>

            {sizeOpen && (
              <div className="absolute right-0 top-[52px] z-[100] w-[160px] rounded-2xl border border-gray-100 bg-white p-2 shadow-[0_15px_45px_rgba(0,0,0,0.12)]">
                <p className="px-3 pb-2 pt-1 text-lg text-[#F97316]">
                  ចំនួនក្នុងទំព័រ
                </p>

                {[10, 20, 50].map(
                  (value) => {
                    const selected =
                      size ===
                      value;

                    return (
                      <button
                        key={
                          value
                        }
                        type="button"
                        onClick={() => {
                          setSize(
                            value,
                          );

                          setPage(
                            0,
                          );

                          setSizeOpen(
                            false,
                          );
                        }}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-base font-semibold transition ${
                          selected
                            ? "bg-emerald-50 text-[#137A3D]"
                            : "text-gray-600 hover:bg-gray-50 hover:text-[#137A3D]"
                        }`}
                      >
                        <span>
                          {value} /
                          ទំព័រ
                        </span>

                        {selected && (
                          <Check
                            size={
                              16
                            }
                            className="text-[#137A3D]"
                          />
                        )}
                      </button>
                    );
                  },
                )}
              </div>
            )}
          </div>

          {/* =============================================
              SORT
          ============================================== */}

          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setSortOpen(
                  (
                    current,
                  ) =>
                    !current,
                );

                setSizeOpen(
                  false,
                );
              }}
              className={`flex h-11 w-11 items-center justify-center rounded-2xl border transition ${
                sortOpen
                  ? "border-[#137A3D] bg-emerald-50 text-[#137A3D]"
                  : "border-gray-200 bg-white text-gray-600 hover:border-[#137A3D] hover:bg-emerald-50 hover:text-[#137A3D]"
              }`}
              aria-label="Sort dietary types"
              title="Sort dietary types"
            >
              <ArrowUpDown
                size={18}
              />
            </button>

            {sortOpen && (
              <div className="absolute right-0 top-[52px] z-[100] w-[190px] rounded-2xl border border-gray-100 bg-white p-2 shadow-[0_15px_45px_rgba(0,0,0,0.12)]">
                <p className="px-3 pb-2 pt-1 text-lg uppercase tracking-wide text-[#F97316]">
                  តម្រៀប
                </p>

                {sortOptions.map(
                  (
                    option,
                  ) => {
                    const selected =
                      sortBy ===
                      option.value;

                    return (
                      <button
                        key={
                          option.value
                        }
                        type="button"
                        onClick={() => {
                          setSortBy(
                            option.value,
                          );

                          setSortOpen(
                            false,
                          );
                        }}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-base font-semibold transition ${
                          selected
                            ? "bg-emerald-50 text-[#137A3D]"
                            : "text-gray-600 hover:bg-gray-50 hover:text-[#137A3D]"
                        }`}
                      >
                        <span>
                          {
                            option.label
                          }
                        </span>

                        {selected && (
                          <Check
                            size={
                              16
                            }
                            className="text-[#137A3D]"
                          />
                        )}
                      </button>
                    );
                  },
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* =================================================
          MESSAGE
      ================================================== */}

      {message && (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm ${
            message.type ===
            "success"
              ? "border-emerald-100 bg-emerald-50 text-emerald-700"
              : "border-red-100 bg-red-50 text-red-600"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* =================================================
          TABLE
      ================================================== */}

      <section className="overflow-visible rounded-[24px] border border-gray-100 bg-white shadow-sm">
        {isLoading ? (
          <div className="flex min-h-[320px] items-center justify-center">
            <LoaderCircle
              size={30}
              className="animate-spin text-[#136C34]"
            />
          </div>
        ) : error ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">
            <AlertTriangle
              size={34}
              className="text-red-400"
            />

            <h3 className="mt-3 text-lg font-bold text-gray-800">
              មិនអាចទាញយកទិន្នន័យរបបអាហារបានទេ
            </h3>

            <p className="mt-2 text-base text-gray-500">
              {getApiErrorMessage(
                error,
              )}
            </p>

            <button
              type="button"
              onClick={() =>
                void refetch()
              }
              className="mt-4 rounded-xl bg-[#136C34] px-4 py-2.5 text-lg text-white"
            >
              សាកល្បងម្តងទៀត
            </button>
          </div>
        ) : sortedItems.length ===
          0 ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center text-center">
            <Salad
              size={40}
              className="text-[#F97316]"
            />

            <p className="mt-3 text-lg text-[#F97316]">
              មិនមានទិន្នន័យ
            </p>
          </div>
        ) : (
          <DietaryTypesTable
            items={
              sortedItems
            }
            disabled={
              busy
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
            onRestore={(
              item,
            ) =>
              void handleRestore(
                item,
              )
            }
          />
        )}

        {/* ===============================================
            PAGINATION

            Hide normal pagination while using the
            100-item client search dataset.
        ================================================ */}

        {!isLoading &&
          !error &&
          !normalizedSearch && (
            <DietaryTypesPagination
              page={
                data?.pageNumber ??
                page
              }
              totalPages={
                data?.totalPages ??
                1
              }
              totalElements={
                data?.totalElements ??
                0
              }
              disabled={
                isFetching
              }
              onPageChange={
                setPage
              }
            />
          )}
      </section>

      {/* =================================================
          FORM
      ================================================== */}

      <DietaryTypeFormModal
        open={formOpen}
        item={editing}
        saving={
          isCreating ||
          isUpdating
        }
        onClose={() => {
          if (
            isCreating ||
            isUpdating
          ) {
            return;
          }

          setFormOpen(
            false,
          );

          setEditing(
            null,
          );
        }}
        onSubmit={
          handleSave
        }
      />

      {/* =================================================
          DELETE
      ================================================== */}

      <DeleteDietaryTypeConfirmModal
        item={deleting}
        deleting={
          isDeleting
        }
        onClose={() => {
          if (
            !isDeleting
          ) {
            setDeleting(
              null,
            );
          }
        }}
        onConfirm={
          handleDelete
        }
      />
    </div>
  );
}