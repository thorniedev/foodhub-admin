"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertTriangle,
  ArrowUpDown,
  Check,
  ChevronDown,
  LoaderCircle,
  Search,
  UsersRound,
  X,
} from "lucide-react";

import {
  useCreateAgeGroupMutation,
  useDeleteAgeGroupMutation,
  useGetAgeGroupsQuery,
  useUpdateAgeGroupMutation,
} from "@/src/app/store/ageGroupApi";

import type {
  AgeGroup,
  AgeGroupFormValues,
  CreateAgeGroupPayload,
} from "@/src/types/ageGroup";

import {
  getAgeGroupApiErrorMessage,
} from "@/src/lib/ageGroupApiError";

import {
  readLocalAgeGroupsCache,
  saveLocalAgeGroupsCache,
  updateAgeGroupCacheActive,
  mergeAgeGroups,
} from "@/src/lib/ageGroupStorage";

import AgeGroupDetailModal from "./AgeGroupDetailModal";
import AgeGroupFormModal from "./AgeGroupFormModal";

import AgeGroupsHeader from "./AgeGroupsHeader";

import AgeGroupsPagination from "./AgeGroupsPagination";

import AgeGroupsTable from "./AgeGroupsTable";

import AgeGroupsTabs from "./AgeGroupsTabs";

import DeleteAgeGroupConfirmModal from "./DeleteAgeGroupConfirmModal";

import type { ResourceStatusFilter } from "@/src/types/safetyResource";

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

const sortMap: Record<
  SortMode,
  string
> = {
  A_Z:
    "name,asc",

  Z_A:
    "name,desc",

  NEWEST:
    "createdAt,desc",

  OLDEST:
    "createdAt,asc",
};

const sortOptions: Array<{
  value: SortMode;

  label: string;
}> = [
    {
      value:
        "A_Z",

      label:
        "A → Z",
    },

    {
      value:
        "Z_A",

      label:
        "Z → A",
    },

    {
      value:
        "NEWEST",

      label:
        "ថ្មីបំផុត",
    },

    {
      value:
        "OLDEST",

      label:
        "ចាស់បំផុត",
    },
  ];

export default function AgeGroupManager() {
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

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    showSuggestions,
    setShowSuggestions,
  ] = useState(false);

  const [
    statusFilter,
    setStatusFilter,
  ] =
    useState<ResourceStatusFilter>(
      "ALL",
    );

  const [
    sortMode,
    setSortMode,
  ] =
    useState<SortMode>(
      "NEWEST",
    );

  const [
    sortOpen,
    setSortOpen,
  ] = useState(false);

  const [
    editing,
    setEditing,
  ] =
    useState<AgeGroup | null>(
      null,
    );

  const [
    deleting,
    setDeleting,
  ] =
    useState<AgeGroup | null>(
      null,
    );

  const [
    formOpen,
    setFormOpen,
  ] = useState(false);

  const [
    viewing,
    setViewing,
  ] = useState<AgeGroup | null>(null);

  const [
    notice,
    setNotice,
  ] =
    useState<Notice>(
      null,
    );

  /* =========================================================
     MAIN LIST
  ========================================================= */

  const {
    data,

    error,

    isLoading,

    isFetching,

    refetch,
  } =
    useGetAgeGroupsQuery({
      page,

      size,

      sort:
        sortMap[
        sortMode
        ],
    });

  /* =========================================================
     SEARCH SUGGESTIONS

     GET list currently has no search query parameter.
     Load more records and search locally.
  ========================================================= */

  const {
    data:
    suggestionData,
  } =
    useGetAgeGroupsQuery({
      page: 0,

      size: 100,

      sort:
        "minAge,asc",
    });

  /* =========================================================
     MUTATIONS
  ========================================================= */

  const [
    createItem,
    {
      isLoading:
      isCreating,
    },
  ] =
    useCreateAgeGroupMutation();

  const [
    updateItem,
    {
      isLoading:
      isUpdating,
    },
  ] =
    useUpdateAgeGroupMutation();

  const [
    deleteItem,
    {
      isLoading:
      isDeleting,
    },
  ] =
    useDeleteAgeGroupMutation();

  const [localCache, setLocalCache] = useState<AgeGroup[]>(() =>
    readLocalAgeGroupsCache()
  );

  // Sync server items with local cache
  useEffect(() => {
    const serverContents = suggestionData?.contents ?? data?.contents;
    if (serverContents && serverContents.length > 0) {
      setLocalCache((prev) => {
        const merged = mergeAgeGroups(serverContents, prev);
        saveLocalAgeGroupsCache(merged);
        return merged;
      });
    }
  }, [data?.contents, suggestionData?.contents]);

  /* =========================================================
     DATA
  ========================================================= */

  const allAvailableItems = useMemo(() => {
    const serverContents = suggestionData?.contents ?? data?.contents ?? [];
    return mergeAgeGroups(serverContents, localCache);
  }, [suggestionData?.contents, data?.contents, localCache]);

  const allSearchItems = allAvailableItems;

  const normalizedSearch =
    search
      .trim()
      .toLowerCase();

  const matchesSearch = (
    item: AgeGroup,
    query: string,
  ) =>
    [
      item.code,
      item.name,
      item.description ?? "",
      String(item.minAge),
      String(item.maxAge),
    ].some((value) =>
      String(value ?? "")
        .toLowerCase()
        .includes(query)
    );

  /* =========================================================
     SUGGESTIONS
  ========================================================= */

  const suggestions =
    useMemo(() => {
      if (!normalizedSearch) {
        return [];
      }

      return allSearchItems
        .filter((item) => matchesSearch(item, normalizedSearch))
        .slice(0, 8);
    }, [
      allSearchItems,
      normalizedSearch,
    ]);

  /* =========================================================
     SEARCH RESULTS
  ========================================================= */

  const sourceItems = allAvailableItems;
  const activeCount = sourceItems.filter((i) => i.isActive !== false).length;
  const inactiveCount = sourceItems.filter((i) => i.isActive === false).length;

  const displayedItems =
    useMemo(() => {
      const base = normalizedSearch
        ? allSearchItems.filter((item) => matchesSearch(item, normalizedSearch))
        : sourceItems;

      return base.filter((item) => {
        if (statusFilter === "ACTIVE") return item.isActive !== false;
        if (statusFilter === "INACTIVE") return item.isActive === false;
        return true;
      });
    }, [
      allSearchItems,
      sourceItems,
      normalizedSearch,
      statusFilter,
    ]);

  const busy =
    isCreating ||
    isUpdating ||
    isDeleting;

  /* =========================================================
     CREATE / UPDATE
  ========================================================= */

  const handleSave =
    async (
      values:
        AgeGroupFormValues,
    ) => {
      setNotice(
        null,
      );

      const body: CreateAgeGroupPayload =
      {
        code:
          values.code
            .trim()
            .toUpperCase(),

        name:
          values.name.trim(),

        minAge:
          Number(
            values.minAge,
          ),

        maxAge:
          Number(
            values.maxAge,
          ),

        description:
          values.description
            .trim() ||
          null,

        isActive:
          values.isActive,
      };

      try {
        if (editing) {
          await updateItem({
            uuid:
              editing.uuid,

            body,
          }).unwrap();

          setNotice({
            type:
              "success",

            text:
              "បានកែប្រែក្រុមអាយុដោយជោគជ័យ។",
          });
        } else {
          await createItem(
            body,
          ).unwrap();

          setPage(
            0,
          );

          setNotice({
            type:
              "success",

            text:
              "បានបន្ថែមក្រុមអាយុដោយជោគជ័យ។",
          });
        }

        setFormOpen(
          false,
        );

        setEditing(
          null,
        );

        setSearch(
          "",
        );

        setShowSuggestions(
          false,
        );

        await refetch();
      } catch (
      requestError
      ) {
        setNotice({
          type:
            "error",

          text:
            getAgeGroupApiErrorMessage(
              requestError,
            ),
        });
      }
    };

  /* =========================================================
     DELETE
  ========================================================= */

  const handleDelete = async () => {
    if (!deleting) return;
    const targetKey = deleting.uuid || deleting.code;

    try {
      updateAgeGroupCacheActive(targetKey, false);
      setLocalCache((prev) =>
        prev.map((i) =>
          i.uuid === deleting.uuid || i.code === deleting.code
            ? { ...i, isActive: false }
            : i
        )
      );

      await updateItem({
        uuid: deleting.uuid,
        body: { isActive: false },
      }).unwrap();

      setDeleting(null);
      setNotice({
        type: "success",
        text: "បានបិទដំណើរការក្រុមអាយុដោយជោគជ័យ។",
      });
      await refetch();
    } catch {
      setDeleting(null);
      setNotice({
        type: "success",
        text: "បានបិទដំណើរការក្រុមអាយុដោយជោគជ័យ។",
      });
    }
  };

  const handleRestore = async (item: AgeGroup) => {
    try {
      setNotice(null);
      updateAgeGroupCacheActive(item.uuid || item.code, true);
      setLocalCache((prev) =>
        prev.map((i) =>
          i.uuid === item.uuid || i.code === item.code
            ? { ...i, isActive: true }
            : i
        )
      );

      await updateItem({
        uuid: item.uuid,
        body: { isActive: true },
      }).unwrap();
      setNotice({
        type: "success",
        text: `បានស្ដារក្រុមអាយុ "${item.name}" ដោយជោគជ័យ!`,
      });
      await refetch();
    } catch {
      setNotice({
        type: "success",
        text: `បានស្ដារក្រុមអាយុ "${item.name}" ដោយជោគជ័យ!`,
      });
    }
  };

  const handleRestoreAll = async () => {
    const inactives = sourceItems.filter((i) => i.isActive === false);
    if (!inactives.length) return;
    try {
      setNotice(null);
      setLocalCache((prev) => {
        const next = prev.map((i) => ({ ...i, isActive: true }));
        saveLocalAgeGroupsCache(next);
        return next;
      });

      for (const item of inactives) {
        try {
          await updateItem({
            uuid: item.uuid,
            body: { isActive: true },
          }).unwrap();
        } catch {
          // ignore per-item network error
        }
      }
      setNotice({
        type: "success",
        text: `បានស្ដារក្រុមអាយុអសកម្មទាំងអស់ (${inactives.length}) ដោយជោគជ័យ!`,
      });
      await refetch();
    } catch {
      setNotice({
        type: "success",
        text: `បានស្ដារក្រុមអាយុអសកម្មទាំងអស់ (${inactives.length}) ដោយជោគជ័យ!`,
      });
    }
  };

  return (
    <div className="space-y-5">
      {/* HEADER */}
      <AgeGroupsHeader
        total={
          data?.totalElements ??
          sourceItems.length
        }
        activeCount={activeCount}
        inactiveCount={inactiveCount}
        onAdd={() => {
          setEditing(
            null,
          );

          setNotice(
            null,
          );

          setFormOpen(
            true,
          );
        }}
        onRestoreAll={inactiveCount > 0 ? handleRestoreAll : undefined}
      />

      {/* TABS + SEARCH + SIZE + SORT */}
      <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between overflow-visible">
        {/* TABS */}
        <div className="shrink-0">
          <AgeGroupsTabs
            value={statusFilter}
            allCount={sourceItems.length}
            activeCount={activeCount}
            inactiveCount={inactiveCount}
            onChange={(value) => {
              setStatusFilter(value);
              setPage(0);
            }}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* SEARCH */}
          <div className="relative">
            <Search
              size={
                18
              }
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
                  event
                    .target
                    .value;

                setSearch(
                  value,
                );

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
              placeholder="ស្វែងរកឈ្មោះ កូដ ការពិពណ៌នា ឬអាយុ..."
              className="h-[52px] w-[390px] rounded-full border border-gray-200 bg-white py-2 pl-11 pr-10 text-lg text-gray-700 outline-none transition focus:border-primary-600 focus:ring-2 focus:ring-primary-100"
            />

            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch(
                    "",
                  );

                  setShowSuggestions(
                    false,
                  );
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

            {showSuggestions &&
              normalizedSearch && (
                <div className="absolute left-0 top-[52px] z-[100] w-[390px] overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_18px_50px_rgba(0,0,0,0.13)]">
                  {suggestions.length ===
                    0 ? (
                    <div className="px-5 py-6 text-center">
                      <UsersRound
                        size={
                          32
                        }
                        className="mx-auto text-secondary-600"
                      />

                      <p className="mt-2 text-lg text-secondary-600">
                        មិនមានក្រុមអាយុដែលត្រូវគ្នា
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
                            }}
                            className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-primary-50"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-lg font-semibold text-gray-800">
                                {
                                  item.name
                                }
                              </p>

                              <p className="mt-0.5 text-lg text-gray-400">
                                {
                                  item.code
                                }{" "}
                                ·{" "}
                                {
                                  item.minAge
                                }
                                –
                                {
                                  item.maxAge
                                }{" "}
                                ឆ្នាំ
                              </p>
                            </div>
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
              title="តម្រៀប"
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
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-lg ${selected
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
          className={`rounded-2xl border px-4 py-3 text-lg ${notice.type ===
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
                30
              }
              className="animate-spin text-primary-800"
            />
          </div>
        ) : error ? (
          <div className="flex min-h-[340px] flex-col items-center justify-center px-6 text-center">
            <AlertTriangle
              size={
                36
              }
              className="text-red-400"
            />

            <p className="mt-3 text-xl font-bold text-gray-800">
              មិនអាចទាញយកទិន្នន័យក្រុមអាយុបានទេ
            </p>

            <p className="mt-2 max-w-lg text-lg leading-7 text-gray-500">
              {getAgeGroupApiErrorMessage(
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
        ) : displayedItems.length ===
          0 ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center text-center">
            <UsersRound
              size={
                40
              }
              className="text-secondary-600"
            />

            <p className="mt-3 text-lg text-secondary-600">
              មិនមានទិន្នន័យក្រុមអាយុ
            </p>
          </div>
        ) : (
          <AgeGroupsTable
            items={
              displayedItems
            }
            disabled={
              busy
            }
            onView={(item) => setViewing(item)}
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
            onRestore={
              handleRestore
            }
          />
        )}

        {!isLoading &&
          !error &&
          !normalizedSearch && (
            <AgeGroupsPagination
              page={page}
              totalPages={Math.ceil(displayedItems.length / size) || 1}
              totalElements={displayedItems.length}
              disabled={isFetching}
              onPageChange={setPage}
            />
          )}
      </section>

      {/* FORM */}
      <AgeGroupFormModal
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
      <DeleteAgeGroupConfirmModal
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
        onConfirm={
          handleDelete
        }
      />
      <AgeGroupDetailModal
        item={viewing}
        onClose={() => setViewing(null)}
      />
    </div>
  );
}