"use client";

import {
  useMemo,
  useState,
} from "react";

import {
  AlertTriangle,
  ArrowUpDown,
  Check,
  ChevronDown,
  Leaf,
  LoaderCircle,
  Search,
  X,
} from "lucide-react";

import {
  useCreateIngredientMutation,
  useDeleteIngredientMutation,
  useGetIngredientsQuery,
  useRestoreIngredientMutation,
  useUpdateIngredientMutation,
} from "@/src/app/store/ingredientApi";

import type {
  CreateIngredientPayload,
  Ingredient,
  IngredientFormValues,
  IngredientStatusFilter,
} from "@/src/types/ingredient";

import {
  getIngredientApiErrorMessage,
} from "@/src/lib/ingredientApiError";

import DeleteIngredientConfirmModal from "./DeleteIngredientConfirmModal";
import IngredientDetailModal from "./IngredientDetailModal";
import IngredientFormModal from "./IngredientFormModal";
import IngredientsHeader from "./IngredientsHeader";
import IngredientsPagination from "./IngredientsPagination";
import IngredientsTable from "./IngredientsTable";
import IngredientsTabs from "./IngredientsTabs";

type SortMode =
  | "A_Z"
  | "Z_A"
  | "NEWEST"
  | "OLDEST";

type Notice =
  | {
    type: "success";
    text: string;
  }
  | {
    type: "error";
    text: string;
  }
  | null;

const sortOptions: Array<{
  value: SortMode;
  label: string;
}> = [
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

function getTime(
  value: string | null,
) {
  if (!value) {
    return 0;
  }

  const time =
    new Date(
      value,
    ).getTime();

  return Number.isFinite(
    time,
  )
    ? time
    : 0;
}

export default function IngredientManager() {
  /* =====================================================
     PAGINATION
  ===================================================== */

  const [
    page,
    setPage,
  ] = useState(0);

  const [
    size,
    setSize,
  ] = useState(20);

  const [
    sizeOpen,
    setSizeOpen,
  ] = useState(false);

  /* =====================================================
     SEARCH
  ===================================================== */

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    showSuggestions,
    setShowSuggestions,
  ] = useState(false);

  /* =====================================================
     STATUS
  ===================================================== */

  const [
    statusFilter,
    setStatusFilter,
  ] =
    useState<IngredientStatusFilter>(
      "ALL",
    );

  /* =====================================================
     SORT
  ===================================================== */

  const [
    sortMode,
    setSortMode,
  ] =
    useState<SortMode>(
      "A_Z",
    );

  const [
    sortOpen,
    setSortOpen,
  ] = useState(false);

  /* =====================================================
     MODALS
  ===================================================== */

  const [
    editing,
    setEditing,
  ] =
    useState<Ingredient | null>(
      null,
    );

  const [
    viewing,
    setViewing,
  ] =
    useState<Ingredient | null>(
      null,
    );

  const [
    deleting,
    setDeleting,
  ] =
    useState<Ingredient | null>(
      null,
    );

  const [
    formOpen,
    setFormOpen,
  ] = useState(false);

  /* =====================================================
     MESSAGE
  ===================================================== */

  const [
    notice,
    setNotice,
  ] =
    useState<Notice>(null);

  /* =====================================================
     FETCH ALL INGREDIENTS

     We load a larger page because:
     - admin endpoint returns active + inactive
     - tabs/filter/search are client-side
     - this keeps counts accurate
  ===================================================== */

  const {
    data,
    error,
    isLoading,
    isFetching,
    refetch,
  } = useGetIngredientsQuery({
    page: 0,
    size: 100,
    sort: "name,asc",
  });

  /* =====================================================
     MUTATIONS
  ===================================================== */

  const [
    createIngredient,
    {
      isLoading:
      isCreating,
    },
  ] =
    useCreateIngredientMutation();

  const [
    updateIngredient,
    {
      isLoading:
      isUpdating,
    },
  ] =
    useUpdateIngredientMutation();

  const [
    deleteIngredient,
    {
      isLoading:
      isDeleting,
    },
  ] =
    useDeleteIngredientMutation();

  const [
    restoreIngredient,
    {
      isLoading:
      isRestoring,
    },
  ] =
    useRestoreIngredientMutation();

  /* =====================================================
     DATA
  ===================================================== */

  const items =
    data?.contents ??
    [];

  const activeCount =
    items.filter(
      (item) =>
        item.isActive,
    ).length;

  const inactiveCount =
    items.filter(
      (item) =>
        !item.isActive,
    ).length;

  /* =====================================================
     SEARCH
  ===================================================== */

  const normalizedSearch =
    search
      .trim()
      .toLowerCase();

  const matchesSearch = (
    item: Ingredient,
    query: string,
  ) =>
    [
      item.code,
      item.name,
      item.description ??
      "",
    ].some((value) =>
      String(
        value ?? "",
      )
        .toLowerCase()
        .includes(query),
    );

  /* =====================================================
     SUGGESTIONS
  ===================================================== */

  const suggestions =
    useMemo(() => {
      if (
        !normalizedSearch
      ) {
        return [];
      }

      return items
        .filter((item) =>
          matchesSearch(
            item,
            normalizedSearch,
          ),
        )
        .slice(0, 8);
    }, [
      items,
      normalizedSearch,
    ]);

  /* =====================================================
     FILTER + SORT
  ===================================================== */

  const filteredItems =
    useMemo(() => {
      const result =
        items.filter(
          (item) => {
            const statusMatches =
              statusFilter ===
              "ALL" ||
              (statusFilter ===
                "ACTIVE" &&
                item.isActive) ||
              (statusFilter ===
                "INACTIVE" &&
                !item.isActive);

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

            return matchesSearch(
              item,
              normalizedSearch,
            );
          },
        );

      return [
        ...result,
      ].sort(
        (
          first,
          second,
        ) => {
          if (
            sortMode ===
            "A_Z"
          ) {
            return first.name.localeCompare(
              second.name,
              undefined,
              {
                sensitivity:
                  "base",
              },
            );
          }

          if (
            sortMode ===
            "Z_A"
          ) {
            return second.name.localeCompare(
              first.name,
              undefined,
              {
                sensitivity:
                  "base",
              },
            );
          }

          if (
            sortMode ===
            "NEWEST"
          ) {
            return (
              getTime(
                second.createdAt,
              ) -
              getTime(
                first.createdAt,
              )
            );
          }

          return (
            getTime(
              first.createdAt,
            ) -
            getTime(
              second.createdAt,
            )
          );
        },
      );
    }, [
      items,
      normalizedSearch,
      sortMode,
      statusFilter,
    ]);

  /* =====================================================
     CLIENT PAGINATION
  ===================================================== */

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        filteredItems.length /
        size,
      ),
    );

  const currentPage =
    Math.min(
      page,
      totalPages - 1,
    );

  const displayedItems =
    useMemo(() => {
      const start =
        currentPage *
        size;

      return filteredItems.slice(
        start,
        start + size,
      );
    }, [
      currentPage,
      filteredItems,
      size,
    ]);

  /* =====================================================
     BUSY
  ===================================================== */

  const busy =
    isCreating ||
    isUpdating ||
    isDeleting ||
    isRestoring;

  /* =====================================================
     SAVE
  ===================================================== */

  const handleSave =
    async (
      values:
        IngredientFormValues,
    ) => {
      setNotice(null);

      const body: CreateIngredientPayload =
      {
        code:
          values.code
            .trim()
            .toUpperCase(),

        name:
          values.name.trim(),

        description:
          values.description.trim() ||
          null,

        isActive:
          values.isActive,
      };

      try {
        if (editing) {
          await updateIngredient({
            uuid:
              editing.uuid,

            body,
          }).unwrap();

          setNotice({
            type: "success",

            text: "បានកែប្រែគ្រឿងផ្សំដោយជោគជ័យ។",
          });
        } else {
          await createIngredient(
            body,
          ).unwrap();

          setNotice({
            type: "success",

            text: "បានបន្ថែមគ្រឿងផ្សំដោយជោគជ័យ។",
          });
        }

        setFormOpen(
          false,
        );

        setEditing(
          null,
        );

        setPage(0);

        await refetch();
      } catch (
      requestError
      ) {
        setNotice({
          type: "error",

          text:
            getIngredientApiErrorMessage(
              requestError,
            ),
        });
      }
    };

  /* =====================================================
     DELETE
  ===================================================== */

  const handleDelete =
    async () => {
      if (!deleting) {
        return;
      }

      try {
        await deleteIngredient(
          deleting.uuid,
        ).unwrap();

        setDeleting(
          null,
        );

        setNotice({
          type: "success",

          text: "បានបិទគ្រឿងផ្សំដោយជោគជ័យ។",
        });

        setPage(0);

        await refetch();
      } catch (
      requestError
      ) {
        setNotice({
          type: "error",

          text:
            getIngredientApiErrorMessage(
              requestError,
            ),
        });
      }
    };

  /* =====================================================
     RESTORE
  ===================================================== */

  const handleRestore =
    async (
      item: Ingredient,
    ) => {
      try {
        setNotice(null);

        await restoreIngredient(
          item.uuid,
        ).unwrap();

        setNotice({
          type: "success",

          text: "បានស្ដារគ្រឿងផ្សំដោយជោគជ័យ។",
        });

        setPage(0);

        await refetch();
      } catch (
      requestError
      ) {
        setNotice({
          type: "error",

          text:
            getIngredientApiErrorMessage(
              requestError,
            ),
        });
      }
    };

  const handleRestoreAll = async () => {
    const inactives = items.filter((item) => !item.isActive);
    if (!inactives.length) return;
    try {
      setNotice(null);
      for (const item of inactives) {
        await restoreIngredient(item.uuid).unwrap();
      }
      setNotice({
        type: "success",
        text: `បានស្ដារគ្រឿងផ្សំអសកម្មទាំងអស់ (${inactives.length}) ដោយជោគជ័យ!`,
      });
      setPage(0);
      await refetch();
    } catch (requestError) {
      setNotice({
        type: "error",
        text: getIngredientApiErrorMessage(requestError),
      });
    }
  };

  return (
    <div className="space-y-5">
      {/* =================================================
          HEADER
      ================================================== */}

      <IngredientsHeader
        total={
          data?.totalElements ??
          items.length
        }
        activeCount={
          activeCount
        }
        inactiveCount={
          inactiveCount
        }
        onAdd={() => {
          setEditing(null);

          setNotice(null);

          setFormOpen(true);
        }}
        onRestoreAll={inactiveCount > 0 ? handleRestoreAll : undefined}
      />

      {/* =================================================
          TABS + TOOLBAR
      ================================================== */}

      <div className="flex w-full flex-nowrap items-center justify-between gap-4 overflow-visible">
        {/* LEFT */}

        <div className="shrink-0">
          <IngredientsTabs
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

              setShowSuggestions(
                false,
              );
            }}
          />
        </div>

        {/* RIGHT */}

        <div className="ml-auto flex shrink-0 items-center gap-2">
          {/* SEARCH */}

          <div className="relative">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-gray-400"
            />

            <input
              value={
                search
              }
              onChange={(
                event,
              ) => {
                const value =
                  event.target
                    .value;

                setSearch(
                  value,
                );

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
                  search.trim()
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
                  "Escape" ||
                  event.key ===
                  "Enter"
                ) {
                  setShowSuggestions(
                    false,
                  );
                }
              }}
              placeholder="ស្វែងរកឈ្មោះ កូដ ឬការពិពណ៌នា..."
              className="h-[52px] w-[390px] rounded-full border border-gray-200 bg-white py-2 pl-11 pr-10 text-lg text-gray-700 outline-none transition focus:border-primary-600 focus:ring-2 focus:ring-primary-100"
            />

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
              >
                <X
                  size={
                    16
                  }
                />
              </button>
            )}

            {/* SEARCH SUGGESTIONS */}

            {showSuggestions &&
              normalizedSearch && (
                <div className="absolute left-0 top-[56px] z-[100] w-[390px] overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_18px_50px_rgba(0,0,0,0.13)]">
                  {suggestions.length ===
                    0 ? (
                    <div className="px-5 py-6 text-center">
                      <Leaf
                        size={
                          30
                        }
                        className="mx-auto text-secondary-600"
                      />

                      <p className="mt-2 text-lg text-secondary-600">
                        មិនមានគ្រឿងផ្សំដែលត្រូវគ្នា
                      </p>
                    </div>
                  ) : (
                    <div className="max-h-[340px] overflow-y-auto p-2">
                      {suggestions.map(
                        (
                          item,
                        ) => (
                          <button
                            key={
                              item.uuid
                            }
                            type="button"
                            onMouseDown={(
                              event,
                            ) =>
                              event.preventDefault()
                            }
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
                            className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-primary-50"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-lg font-semibold text-gray-800">
                                {
                                  item.name
                                }
                              </p>

                              <div className="mt-1 flex items-center gap-2">
                                <span className="rounded-md bg-gray-100 px-2.5 py-0.5 font-mono text-lg font-semibold text-gray-500">
                                  {
                                    item.code
                                  }
                                </span>

                                {item.description && (
                                  <span className="max-w-[200px] truncate text-lg text-gray-400">
                                    {
                                      item.description
                                    }
                                  </span>
                                )}
                              </div>
                            </div>

                            <span
                              className={`shrink-0 rounded-full px-3 py-1 text-lg font-bold ${item.isActive
                                  ? "bg-primary-50 text-primary-700"
                                  : "bg-gray-100 text-gray-500"
                                }`}
                            >
                              {item.isActive
                                ? "សកម្ម"
                                : "អសកម្ម"}
                            </span>
                          </button>
                        ),
                      )}
                    </div>
                  )}
                </div>
              )}
          </div>

          {/* PAGE SIZE */}

          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => {
                setSizeOpen((current) => !current);
                setSortOpen(false);
                setShowSuggestions(false);
              }}
              className="flex h-[52px] min-w-[150px] items-center justify-between gap-3 rounded-full border border-gray-200 bg-white px-4 text-lg font-medium text-gray-700 transition hover:border-primary-200 hover:bg-primary-50"
            >
              <span className="text-gray-700">{size} / ទំព័រ</span>

              <ChevronDown
                size={18}
                className={`text-gray-400 transition-transform ${sizeOpen ? "rotate-180" : ""
                  }`}
              />
            </button>

            {sizeOpen && (
              <div className="absolute right-0 top-[60px] z-[100] w-[180px] rounded-2xl border border-gray-100 bg-white p-2 shadow-xl">
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
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-lg transition ${selected
                          ? "bg-primary-50 font-medium text-primary-800"
                          : "text-gray-600 hover:bg-gray-50"
                        }`}
                    >
                      <span>{value} / ទំព័រ</span>

                      {selected && (
                        <Check size={18} className="text-primary-800" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* SORT */}

          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => {
                setSortOpen((current) => !current);
                setSizeOpen(false);
                setShowSuggestions(false);
              }}
              className="flex h-[52px] w-[52px] items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-800"
            >
              <ArrowUpDown size={20} />
            </button>

            {sortOpen && (
              <div className="absolute right-0 top-[60px] z-[100] w-[190px] rounded-2xl border border-gray-100 bg-white p-2 shadow-xl">
                <p className="px-3 pb-2 pt-1 text-lg text-secondary-600">
                  តម្រៀប
                </p>

                {sortOptions.map(
                  (
                    option,
                  ) => {
                    const selected =
                      sortMode ===
                      option.value;

                    return (
                      <button
                        key={
                          option.value
                        }
                        type="button"
                        onClick={() => {
                          setSortMode(
                            option.value,
                          );

                          setSortOpen(
                            false,
                          );

                          setPage(
                            0,
                          );
                        }}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left ${selected
                            ? "bg-primary-50 text-primary-800"
                            : "text-gray-600 hover:bg-gray-50"
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

      {/* NOTICE */}

      {notice && (
        <div
          className={`rounded-2xl border px-4 py-3 ${notice.type ===
              "success"
              ? "border-primary-100 bg-primary-50 text-primary-700"
              : "border-red-100 bg-red-50 text-red-600"
            }`}
        >
          {
            notice.text
          }
        </div>
      )}

      {/* TABLE */}

      <section className="overflow-visible rounded-[24px] border border-gray-100 bg-white shadow-sm">
        {isLoading ? (
          <div className="flex min-h-[340px] items-center justify-center">
            <LoaderCircle
              size={
                32
              }
              className="animate-spin text-primary-800"
            />
          </div>
        ) : error ? (
          <div className="flex min-h-[340px] flex-col items-center justify-center px-6 text-center">
            <AlertTriangle
              size={
                38
              }
              className="text-red-400"
            />

            <p className="mt-3 text-xl font-bold text-gray-800">
              មិនអាចទាញយកទិន្នន័យគ្រឿងផ្សំបានទេ
            </p>

            <p className="mt-2 max-w-xl text-lg leading-7 text-gray-500">
              {getIngredientApiErrorMessage(
                error,
              )}
            </p>

            <button
              type="button"
              onClick={() =>
                void refetch()
              }
              className="mt-4 rounded-full bg-primary-800 px-5 py-2.5 text-white"
            >
              សាកល្បងម្តងទៀត
            </button>
          </div>
        ) : (
          <>
            <IngredientsTable
              items={
                displayedItems
              }
              disabled={busy}
              onView={(
                item,
              ) => {
                setViewing(
                  item,
                );
              }}
              onEdit={(
                item,
              ) => {
                setEditing(
                  item,
                );

                setNotice(
                  null,
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
              ) => {
                void handleRestore(
                  item,
                );
              }}
            />

            <IngredientsPagination
              page={
                currentPage
              }
              totalPages={
                totalPages
              }
              totalElements={
                filteredItems.length
              }
              disabled={
                isFetching ||
                busy
              }
              onPageChange={
                setPage
              }
            />
          </>
        )}
      </section>

      {/* CREATE / EDIT */}

      <IngredientFormModal
        open={
          formOpen
        }
        item={
          editing
        }
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

      {/* DELETE */}

      <DeleteIngredientConfirmModal
        item={
          deleting
        }
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
        onConfirm={() =>
          void handleDelete()
        }
      />

      {/* DETAIL VIEW */}

      <IngredientDetailModal
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