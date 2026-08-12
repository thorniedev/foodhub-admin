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

import AgeGroupFormModal from "./AgeGroupFormModal";

import AgeGroupsHeader from "./AgeGroupsHeader";

import AgeGroupsPagination from "./AgeGroupsPagination";

import AgeGroupsTable from "./AgeGroupsTable";

import DeleteAgeGroupConfirmModal from "./DeleteAgeGroupConfirmModal";

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

  /* =========================================================
     DATA
  ========================================================= */

  const items =
    data?.contents ??
    [];

  const allSearchItems =
    suggestionData?.contents ??
    [];

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

      item.description ??
        "",

      String(
        item.minAge,
      ),

      String(
        item.maxAge,
      ),
    ].some(
      (value) =>
        String(
          value ??
            "",
        )
          .toLowerCase()
          .includes(
            query,
          ),
    );

  /* =========================================================
     SUGGESTIONS
  ========================================================= */

  const suggestions =
    useMemo(() => {
      if (
        !normalizedSearch
      ) {
        return [];
      }

      return allSearchItems
        .filter(
          (item) =>
            matchesSearch(
              item,

              normalizedSearch,
            ),
        )
        .slice(
          0,

          8,
        );
    }, [
      allSearchItems,

      normalizedSearch,
    ]);

  /* =========================================================
     SEARCH RESULTS
  ========================================================= */

  const displayedItems =
    useMemo(() => {
      if (
        !normalizedSearch
      ) {
        return items;
      }

      return allSearchItems.filter(
        (item) =>
          matchesSearch(
            item,

            normalizedSearch,
          ),
      );
    }, [
      allSearchItems,

      items,

      normalizedSearch,
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

  const handleDelete =
    async () => {
      if (
        !deleting
      ) {
        return;
      }

      try {
        await deleteItem(
          deleting.uuid,
        ).unwrap();

        setDeleting(
          null,
        );

        setNotice({
          type:
            "success",

          text:
            "បានលុបក្រុមអាយុដោយជោគជ័យ។",
        });

        if (
          items.length ===
            1 &&
          page > 0
        ) {
          setPage(
            page - 1,
          );
        } else {
          await refetch();
        }
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

  return (
    <div className="space-y-5 p-4 sm:p-6 lg:p-7">
      {/* HEADER */}
      <AgeGroupsHeader
        total={
          data?.totalElements ??
          0
        }
        currentPageCount={
          items.length
        }
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
      />

      {/* SEARCH + SIZE + SORT */}
      <div className="flex w-full items-center justify-end gap-2 overflow-visible">
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
            className="h-11 w-[390px] rounded-2xl border border-gray-200 bg-white py-2 pl-11 pr-10 text-base text-gray-700 outline-none transition focus:border-[#137A3D] focus:ring-2 focus:ring-[#137A3D]/10"
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
                      className="mx-auto text-[#F97316]"
                    />

                    <p className="mt-2 text-base text-[#F97316]">
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
                          className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-emerald-50"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-base font-semibold text-gray-800">
                              {
                                item.name
                              }
                            </p>

                            <p className="mt-0.5 text-sm text-gray-400">
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

              setShowSuggestions(
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
              size={
                17
              }
              className={`text-gray-400 transition-transform ${
                sizeOpen
                  ? "rotate-180"
                  : ""
              }`}
            />
          </button>

          {sizeOpen && (
            <div className="absolute right-0 top-[52px] z-[100] w-[170px] rounded-2xl border border-gray-100 bg-white p-2 shadow-xl">
              {[
                10,
                20,
                50,
              ].map(
                (
                  value,
                ) => {
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
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-base ${
                        selected
                          ? "bg-emerald-50 text-[#137A3D]"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <span>
                        {
                          value
                        }{" "}
                        /
                        ទំព័រ
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

        {/* SORT */}
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

              setShowSuggestions(
                false,
              );
            }}
            className={`flex h-11 w-11 items-center justify-center rounded-2xl border transition ${
              sortOpen
                ? "border-[#137A3D] bg-emerald-50 text-[#137A3D]"
                : "border-gray-200 bg-white text-gray-600 hover:border-[#137A3D] hover:bg-emerald-50 hover:text-[#137A3D]"
            }`}
            title="តម្រៀប"
          >
            <ArrowUpDown
              size={
                18
              }
            />
          </button>

          {sortOpen && (
            <div className="absolute right-0 top-[52px] z-[100] w-[190px] rounded-2xl border border-gray-100 bg-white p-2 shadow-xl">
              <p className="px-3 pb-2 pt-1 text-lg text-[#F97316]">
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
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-base ${
                        selected
                          ? "bg-emerald-50 text-[#137A3D]"
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

      {/* NOTICE */}
      {notice && (
        <div
          className={`rounded-2xl border px-4 py-3 text-base ${
            notice.type ===
            "success"
              ? "border-emerald-100 bg-emerald-50 text-emerald-700"
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
              className="animate-spin text-[#136C34]"
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

            <h3 className="mt-3 text-xl font-bold text-gray-800">
              មិនអាចទាញយកទិន្នន័យក្រុមអាយុបានទេ
            </h3>

            <p className="mt-2 max-w-lg text-base leading-7 text-gray-500">
              {getAgeGroupApiErrorMessage(
                error,
              )}
            </p>

            <button
              type="button"
              onClick={() =>
                void refetch()
              }
              className="mt-4 rounded-xl bg-[#136C34] px-4 py-2.5 text-base text-white"
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
              className="text-[#F97316]"
            />

            <p className="mt-3 text-lg text-[#F97316]">
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
          />
        )}

        {!isLoading &&
          !error &&
          !normalizedSearch && (
            <AgeGroupsPagination
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
    </div>
  );
}