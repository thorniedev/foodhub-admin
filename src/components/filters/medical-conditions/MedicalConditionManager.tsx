"use client";

import { useState } from "react";

import {
  AlertTriangle,
  ArrowUpDown,
  Check,
  ChevronDown,
  HeartPulse,
  LoaderCircle,
  Search,
  X,
} from "lucide-react";

import {
  useCreateMedicalConditionMutation,
  useDeleteMedicalConditionMutation,
  useGetMedicalConditionsQuery,
  useHardDeleteMedicalConditionMutation,
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
import MedicalConditionDetailModal from "./MedicalConditionDetailModal";
import MedicalConditionFormModal from "./MedicalConditionFormModal";
import MedicalConditionsHeader from "./MedicalConditionsHeader";
import MedicalConditionsPagination from "./MedicalConditionsPagination";
import MedicalConditionsTable from "./MedicalConditionsTable";
import MedicalConditionsTabs from "./MedicalConditionsTabs";

/* =========================================================
   SORT TYPE
========================================================= */

type MedicalConditionSort =
  | "A_Z"
  | "Z_A"
  | "NEWEST"
  | "OLDEST";

export default function MedicalConditionManager() {
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
    useState<MedicalConditionSort>(
      "A_Z",
    );

  const [sortOpen, setSortOpen] =
    useState(false);

  /* =======================================================
     MODALS
  ======================================================= */

  const [editing, setEditing] =
    useState<MedicalCondition | null>(
      null,
    );

  const [viewing, setViewing] =
    useState<MedicalCondition | null>(
      null,
    );

  const [formOpen, setFormOpen] =
    useState(false);

  const [deleting, setDeleting] =
    useState<MedicalCondition | null>(
      null,
    );

  const [message, setMessage] =
    useState<ApiMessage | null>(
      null,
    );

  /* =======================================================
     MAIN DATA
  ======================================================= */

  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetMedicalConditionsQuery({
    page,
    size,
  });

  /* =======================================================
     SUGGESTION DATA
  ======================================================= */

  const {
    data: suggestionData,
  } = useGetMedicalConditionsQuery({
    page: 0,
    size: 100,
  });

  /* =======================================================
     MUTATIONS
  ======================================================= */

  const [
    createItem,
    { isLoading: isCreating },
  ] =
    useCreateMedicalConditionMutation();

  const [
    updateItem,
    { isLoading: isUpdating },
  ] =
    useUpdateMedicalConditionMutation();

  const [
    deleteItem,
    { isLoading: isDeleting },
  ] =
    useDeleteMedicalConditionMutation();

  const [
    restoreItem,
    { isLoading: isRestoring },
  ] =
    useRestoreMedicalConditionMutation();

  /* =======================================================
     DATA
  ======================================================= */

  const items =
    data?.contents ?? [];

  const suggestionItems =
    suggestionData?.contents ?? [];

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
   * Keep existing search data:
   *
   * - code
   * - name
   * - description
   */

  const suggestions =
    normalizedSearch
      ? suggestionItems
        .filter((item) => {
          return [
            item.code,
            item.name,
            item.description ?? "",
          ].some((value) =>
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
   * While searching, use the larger
   * suggestion dataset.
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

        if (!statusMatches) {
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
          item.description ?? "",
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
        /* A → Z */

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

        /* Z → A */

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

        /* NEWEST */

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

        /* OLDEST */

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
    value: MedicalConditionSort;
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
    values: MedicalConditionFormValues,
  ) => {
    setMessage(null);

    try {
      const body: MedicalConditionPayload =
      {
        code:
          values.code,

        name:
          values.name,

        description:
          values.description ||
          null,

        active:
          values.active,
      };

      if (editing) {
        await updateItem({
          code:
            editing.code,
          body,
        }).unwrap();

        setMessage({
          type: "success",
          text: "បានកែប្រែស្ថានភាពសុខភាពដោយជោគជ័យ។",
        });
      } else {
        await createItem(
          body,
        ).unwrap();

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
          text: "បានបិទស្ថានភាពសុខភាពដោយជោគជ័យ។",
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
      item: MedicalCondition,
    ) => {
      try {
        await restoreItem(
          item.code,
        ).unwrap();

        setMessage({
          type: "success",
          text: "បានស្ដារស្ថានភាពសុខភាពដោយជោគជ័យ។",
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
      {/* =================================================
          HEADER
      ================================================== */}

      <MedicalConditionsHeader
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
        {/* LEFT */}

        <div className="shrink-0">
          <MedicalConditionsTabs
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

        {/* RIGHT */}

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
                    .length >
                  0,
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
              placeholder="ស្វែងរកតាមឈ្មោះ កូដ ឬការពិពណ៌នា..."
              className="h-[52px] w-[500px] rounded-full border border-gray-200 bg-white py-2 pl-11 pr-10 text-lg text-gray-700 outline-none transition focus:border-primary-600 focus:ring-2 focus:ring-primary-100"
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
                SUGGESTION
            ========================================== */}

            {showSuggestions &&
              normalizedSearch && (
                <div className="absolute left-0 top-[52px] z-[100] w-[500px] overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_18px_50px_rgba(0,0,0,0.13)]">
                  {suggestions.length ===
                    0 ? (
                    <div className="px-5 py-6 text-center">
                      <HeartPulse
                        size={32}
                        className="mx-auto text-secondary-600"
                      />

                      <p className="mt-2 text-lg text-secondary-600">
                        មិនមានស្ថានភាពសុខភាពដែលត្រូវគ្នា
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* HEADER */}

                      <div className="border-b border-gray-100 px-5 py-3">
                        <p className="text-lg uppercase tracking-wide text-secondary-600">
                          លទ្ធផលស្វែងរក
                        </p>
                      </div>

                      {/* RESULT */}

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
                              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-primary-50"
                            >
                              {/* ICON */}

                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-800">
                                <HeartPulse
                                  size={24}
                                />
                              </div>

                              {/* INFORMATION */}

                              <div className="min-w-0 flex-1">
                                <p className="truncate text-lg font-black text-gray-800">
                                  {
                                    item.name
                                  }
                                </p>

                                <span className="mt-1 inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-lg text-gray-500">
                                  {
                                    item.code
                                  }
                                </span>

                                {item.description && (
                                  <p className="mt-1 truncate text-lg text-gray-400">
                                    {
                                      item.description
                                    }
                                  </p>
                                )}
                              </div>

                              {/* STATUS */}

                              <span
                                className={`shrink-0 rounded-full px-2 py-1 text-lg font-bold ${item.active
                                    ? "bg-primary-50 text-primary-700"
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
              className={`flex h-11 min-w-[125px] items-center justify-between gap-3 rounded-2xl border bg-white px-4 text-lg font-semibold transition ${sizeOpen
                  ? "border-primary-800 ring-2 ring-primary-100"
                  : "border-gray-200 hover:border-primary-800/50"
                }`}
            >
              <span className="text-gray-700">
                {size} /
                ទំព័រ
              </span>

              <ChevronDown
                size={17}
                className={`text-gray-400 transition-transform duration-200 ${sizeOpen
                    ? "rotate-180"
                    : ""
                  }`}
              />
            </button>

            {sizeOpen && (
              <div className="absolute right-0 top-[52px] z-[100] w-[160px] rounded-2xl border border-gray-100 bg-white p-2 shadow-[0_15px_45px_rgba(0,0,0,0.12)]">
                <p className="px-3 pb-2 pt-1 text-lg text-secondary-600">
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
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-lg font-semibold transition ${selected
                            ? "bg-primary-50 text-primary-800"
                            : "text-gray-600 hover:bg-gray-50 hover:text-primary-800"
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
                            className="text-primary-800"
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
              className={`flex h-11 w-11 items-center justify-center rounded-2xl border transition ${sortOpen
                  ? "border-primary-800 bg-primary-50 text-primary-800"
                  : "border-gray-200 bg-white text-gray-600 hover:border-primary-800 hover:bg-primary-50 hover:text-primary-800"
                }`}
              aria-label="Sort medical conditions"
              title="Sort medical conditions"
            >
              <ArrowUpDown
                size={18}
              />
            </button>

            {sortOpen && (
              <div className="absolute right-0 top-[52px] z-[100] w-[190px] rounded-2xl border border-gray-100 bg-white p-2 shadow-[0_15px_45px_rgba(0,0,0,0.12)]">
                <p className="px-3 pb-2 pt-1 text-lg uppercase tracking-wide text-secondary-600">
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
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-lg font-semibold transition ${selected
                            ? "bg-primary-50 text-primary-800"
                            : "text-gray-600 hover:bg-gray-50 hover:text-primary-800"
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
                            className="text-primary-800"
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
          className={`rounded-2xl border px-4 py-3 text-lg ${message.type ===
              "success"
              ? "border-primary-100 bg-primary-50 text-primary-700"
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
              className="animate-spin text-primary-800"
            />
          </div>
        ) : error ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">
            <AlertTriangle
              size={34}
              className="text-red-400"
            />

            <p className="mt-3 text-lg font-bold text-gray-800">
              មិនអាចទាញយកទិន្នន័យស្ថានភាពសុខភាពបានទេ
            </p>

            <p className="mt-2 text-lg text-gray-500">
              {getApiErrorMessage(
                error,
              )}
            </p>

            <button
              type="button"
              onClick={() =>
                void refetch()
              }
              className="mt-4 rounded-full bg-primary-800 px-4 py-2.5 text-lg text-white"
            >
              សាកល្បងម្តងទៀត
            </button>
          </div>
        ) : sortedItems.length ===
          0 ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center text-center">
            <HeartPulse
              size={40}
              className="text-secondary-600"
            />

            <p className="mt-3 text-lg text-secondary-600">
              មិនមានទិន្នន័យ
            </p>
          </div>
        ) : (
          <MedicalConditionsTable
            items={
              sortedItems
            }
            disabled={
              isCreating ||
              isUpdating ||
              isDeleting ||
              isRestoring
            }
            onView={(
              item,
            ) =>
              setViewing(
                item,
              )
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

        {!isLoading &&
          !error &&
          !normalizedSearch && (
            <MedicalConditionsPagination
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

      <MedicalConditionFormModal
        key={formOpen ? editing?.uuid || "new-med" : "closed"}
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

      <DeleteMedicalConditionConfirmModal
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

      {/* =================================================
          DETAIL VIEW
      ================================================== */}

      <MedicalConditionDetailModal
        item={viewing}
        onClose={() =>
          setViewing(
            null,
          )
        }
      />
    </div>
  );
}