"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  AlertTriangle,
  ArrowUpDown,
  Check,
  Loader2,
  Search,
  Store,
  X,
} from "lucide-react";

import {
  useGetShopsQuery,
  useUpdateShopMutation,
} from "@/src/app/store/shop/shopApi";

import type {
  Store as StoreType,
  StoreReviewFilter,
  StoreStatusAction,
  UpdateStorePayload,
} from "@/src/types/shop";

import { getShopApiErrorMessage } from "@/src/lib/shopApiError";

import ShopEditModal from "./ShopEditModal";
import ShopsHeader from "./ShopsHeader";
import ShopsPagination from "./ShopsPagination";
import ShopStatusModal from "./ShopStatusModal";
import ShopsTable from "./ShopsTable";
import ShopsTabs from "./ShopsTabs";

/* =========================================================
   SORT TYPE
========================================================= */

type StoreSort =
  | "NAME_ASC"
  | "NAME_DESC"
  | "NEWEST"
  | "OLDEST";

/* =========================================================
   MANAGER
========================================================= */

export default function ShopsManager() {
  /* =======================================================
     PAGINATION
  ======================================================= */

  const [page, setPage] = useState(0);

  const [size, setSize] = useState(20);

  /* =======================================================
     SEARCH
  ======================================================= */

  const [
    searchInput,
    setSearchInput,
  ] = useState("");

  const [
    serverQuery,
    setServerQuery,
  ] = useState("");

  const [
    suggestionQuery,
    setSuggestionQuery,
  ] = useState("");

  const [
    showSuggestions,
    setShowSuggestions,
  ] = useState(false);

  const [
    suggestionSelected,
    setSuggestionSelected,
  ] = useState(false);

  /* =======================================================
     FILTER
  ======================================================= */

  const [
    filter,
    setFilter,
  ] =
    useState<StoreReviewFilter>(
      "ALL",
    );

  /* =======================================================
     SORT
  ======================================================= */

  const [
    sortBy,
    setSortBy,
  ] =
    useState<StoreSort>(
      "NAME_ASC",
    );

  const [
    sortOpen,
    setSortOpen,
  ] = useState(false);

  /* =======================================================
     EDIT
  ======================================================= */

  const [
    editing,
    setEditing,
  ] =
    useState<StoreType | null>(
      null,
    );

  /* =======================================================
     STATUS
  ======================================================= */

  const [
    statusStore,
    setStatusStore,
  ] =
    useState<StoreType | null>(
      null,
    );

  const [
    statusAction,
    setStatusAction,
  ] =
    useState<StoreStatusAction>(
      "REVIEW",
    );

  /* =======================================================
     NOTICE
  ======================================================= */

  const [
    notice,
    setNotice,
  ] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  /* =======================================================
     GET STORES
  ======================================================= */

  const {
    data,
    error,
    isLoading,
    isFetching,
    refetch,
  } = useGetShopsQuery({
    query:
      serverQuery ||
      undefined,
    page,
    size,
  });

  /* =======================================================
     STORE SUGGESTIONS
  ======================================================= */

  const {
    data: suggestionData,
    isFetching:
      suggestionsLoading,
  } = useGetShopsQuery(
    {
      query:
        suggestionQuery ||
        undefined,
      page: 0,
      size: 8,
    },
    {
      skip:
        suggestionQuery.length <
        2,
    },
  );

  const suggestions =
    suggestionData?.contents ??
    [];

  /* =======================================================
     UPDATE STORE
  ======================================================= */

  const [
    updateShop,
    {
      isLoading:
        updating,
    },
  ] =
    useUpdateShopMutation();

  /* =======================================================
     SEARCH DEBOUNCE
  ======================================================= */

  useEffect(() => {
    const cleanValue =
      searchInput.trim();

    /*
     * Stop auto suggestions after
     * admin selected a Store.
     */
    if (suggestionSelected) {
      return;
    }

    if (
      cleanValue.length < 2
    ) {
      setSuggestionQuery("");
      setShowSuggestions(
        false,
      );

      return;
    }

    const timer =
      window.setTimeout(
        () => {
          setSuggestionQuery(
            cleanValue,
          );

          setShowSuggestions(
            true,
          );
        },
        350,
      );

    return () => {
      window.clearTimeout(
        timer,
      );
    };
  }, [
    searchInput,
    suggestionSelected,
  ]);

  /* =======================================================
     DATA
  ======================================================= */

  const stores =
    data?.contents ?? [];

  /* =======================================================
     COUNTS
  ======================================================= */

  const counts = {
    all: stores.length,

    pending: stores.filter(
      (store) =>
        store.reviewStatus ===
        "PENDING",
    ).length,

    approved: stores.filter(
      (store) =>
        store.reviewStatus ===
        "APPROVED",
    ).length,

    rejected: stores.filter(
      (store) =>
        store.reviewStatus ===
        "REJECTED",
    ).length,
  };

  /* =======================================================
     FILTER STORES
  ======================================================= */

  const filteredStores =
    filter === "ALL"
      ? stores
      : stores.filter(
          (store) =>
            store.reviewStatus ===
            filter,
        );

  /* =======================================================
     SORT STORES
  ======================================================= */

  const sortedStores = [
    ...filteredStores,
  ].sort(
    (
      first,
      second,
    ) => {
      switch (sortBy) {
        case "NAME_ASC":
          return (
            first.storeName ??
            ""
          ).localeCompare(
            second.storeName ??
              "",
          );

        case "NAME_DESC":
          return (
            second.storeName ??
            ""
          ).localeCompare(
            first.storeName ??
              "",
          );

        case "NEWEST": {
          const firstTime =
            first.createdAt
              ? new Date(
                  first.createdAt,
                ).getTime()
              : 0;

          const secondTime =
            second.createdAt
              ? new Date(
                  second.createdAt,
                ).getTime()
              : 0;

          return (
            secondTime -
            firstTime
          );
        }

        case "OLDEST": {
          const firstTime =
            first.createdAt
              ? new Date(
                  first.createdAt,
                ).getTime()
              : 0;

          const secondTime =
            second.createdAt
              ? new Date(
                  second.createdAt,
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
     SEARCH
  ======================================================= */

  const handleSearch = () => {
    const cleanValue =
      searchInput.trim();

    setPage(0);

    setServerQuery(
      cleanValue,
    );

    setSuggestionQuery("");

    setShowSuggestions(
      false,
    );
  };

  /* =======================================================
     SELECT SEARCH SUGGESTION
  ======================================================= */

  const handleSelectSuggestion =
    (store: StoreType) => {
      setSuggestionSelected(
        true,
      );

      setSearchInput(
        store.storeName,
      );

      setServerQuery(
        store.storeName,
      );

      setSuggestionQuery("");

      setShowSuggestions(
        false,
      );

      setPage(0);
    };

  /* =======================================================
     CLEAR SEARCH
  ======================================================= */

  const handleClearSearch =
    () => {
      setSearchInput("");

      setServerQuery("");

      setSuggestionQuery("");

      setSuggestionSelected(
        false,
      );

      setShowSuggestions(
        false,
      );

      setPage(0);
    };

  /* =======================================================
     EDIT STORE
  ======================================================= */

  const edit = async (
    values: UpdateStorePayload,
  ) => {
    if (!editing) {
      return;
    }

    try {
      setNotice(null);

      await updateShop({
        storeUuid:
          editing.uuid,
        body: values,
      }).unwrap();

      setEditing(null);

      setNotice({
        type: "success",
        text: "បានកែប្រែ Store ដោយជោគជ័យ។",
      });

      await refetch();
    } catch (requestError) {
      setNotice({
        type: "error",

        text:
          getShopApiErrorMessage(
            requestError,
          ),
      });
    }
  };

  /* =======================================================
     SORT OPTIONS
  ======================================================= */

  const sortOptions: {
    value: StoreSort;
    label: string;
  }[] = [
    {
      value: "NAME_ASC",
      label: "ឈ្មោះ A → Z",
    },

    {
      value: "NAME_DESC",
      label: "ឈ្មោះ Z → A",
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
     UI
  ======================================================= */

  return (
    <div className="space-y-5">
      {/* =================================================
          HEADER
      ================================================== */}

      <ShopsHeader
        total={
          data?.totalElements ??
          0
        }
        approved={
          counts.approved
        }
        pending={
          counts.pending
        }
      />

      {/* =================================================
          FILTER + TOOLBAR
      ================================================== */}

      <div className="flex w-full flex-nowrap items-center justify-between gap-4">
        {/* ===============================================
            LEFT - STATUS TABS
        ================================================ */}

        <div className="shrink-0">
          <ShopsTabs
            value={filter}
            counts={counts}
            onChange={(
              value,
            ) => {
              setFilter(
                value,
              );

              setPage(0);
            }}
          />
        </div>

        {/* ===============================================
            RIGHT TOOLBAR
        ================================================ */}

        <div className="ml-auto flex shrink-0 items-center gap-2">
          {/* =============================================
              SEARCH
          ============================================== */}

          <div className="flex">
            <div className="relative">
              <Search
                size={17}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                value={
                  searchInput
                }
                onChange={(
                  event,
                ) => {
                  const value =
                    event.target
                      .value;

                  setSearchInput(
                    value,
                  );

                  setSuggestionSelected(
                    false,
                  );

                  if (
                    value
                      .trim()
                      .length >= 2
                  ) {
                    setShowSuggestions(
                      true,
                    );
                  } else {
                    setShowSuggestions(
                      false,
                    );
                  }
                }}
                onFocus={() => {
                  if (
                    searchInput
                      .trim()
                      .length >=
                      2 &&
                    !suggestionSelected
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
                    "Enter"
                  ) {
                    handleSearch();
                  }

                  if (
                    event.key ===
                    "Escape"
                  ) {
                    setShowSuggestions(
                      false,
                    );
                  }
                }}
                placeholder="ស្វែងរក Store..."
                className="h-11 w-[300px] rounded-l-2xl border border-r-0 border-gray-200 bg-white pl-11 pr-10 text-sm text-gray-700 outline-none transition focus:border-[#137A3D]"
              />

              {/* =========================================
                  CLEAR SEARCH
              ========================================== */}

              {searchInput && (
                <button
                  type="button"
                  onClick={
                    handleClearSearch
                  }
                  className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center text-gray-400 transition hover:text-gray-700"
                  aria-label="Clear search"
                >
                  <X
                    size={16}
                  />
                </button>
              )}

              {/* =========================================
                  SEARCH SUGGESTIONS
              ========================================== */}

              {showSuggestions && (
                <div className="absolute left-0 top-[52px] z-[100] w-[380px] overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_18px_50px_rgba(0,0,0,0.13)]">
                  {suggestionsLoading ? (
                    <div className="flex items-center justify-center gap-2 px-4 py-6 text-sm font-medium text-gray-500">
                      <Loader2
                        size={
                          17
                        }
                        className="animate-spin text-[#137A3D]"
                      />

                      កំពុងស្វែងរក...
                    </div>
                  ) : suggestions.length ===
                    0 ? (
                    <div className="px-4 py-6 text-center">
                      <Store
                        size={
                          26
                        }
                        className="mx-auto text-gray-300"
                      />

                      <p className="mt-2 text-sm font-semibold text-gray-400">
                        មិនមាន Store
                        ដែលត្រូវគ្នា
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="border-b border-gray-100 px-4 py-3">
                        <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                          Store
                          suggestions
                        </p>
                      </div>

                      <div className="max-h-[330px] overflow-y-auto p-2">
                        {suggestions.map(
                          (
                            store,
                          ) => (
                            <button
                              key={
                                store.uuid
                              }
                              type="button"
                              onMouseDown={(
                                event,
                              ) => {
                                event.preventDefault();
                              }}
                              onClick={() =>
                                handleSelectSuggestion(
                                  store,
                                )
                              }
                              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-emerald-50"
                            >
                              {/* STORE ICON */}

                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-[#137A3D]">
                                <Store
                                  size={
                                    18
                                  }
                                />
                              </div>

                              {/* STORE INFO */}

                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-black text-gray-800">
                                  {
                                    store.storeName
                                  }
                                </p>

                                {store.localName && (
                                  <p className="mt-0.5 truncate text-xs text-gray-500">
                                    {
                                      store.localName
                                    }
                                  </p>
                                )}

                                {(store.addressLine1 ||
                                  store.city) && (
                                  <p className="mt-1 truncate text-xs text-gray-400">
                                    {[
                                      store.addressLine1,
                                      store.city,
                                    ]
                                      .filter(
                                        Boolean,
                                      )
                                      .join(
                                        ", ",
                                      )}
                                  </p>
                                )}
                              </div>

                              {/* STATUS */}

                              {store.reviewStatus && (
                                <span className="shrink-0 rounded-full bg-gray-100 px-2 py-1 text-[10px] font-bold text-gray-500">
                                  {
                                    store.reviewStatus
                                  }
                                </span>
                              )}
                            </button>
                          ),
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* =========================================
                SEARCH BUTTON
            ========================================== */}

            <button
              type="button"
              onClick={
                handleSearch
              }
              className="h-11 rounded-r-2xl bg-[#137A3D] px-5 text-sm font-black text-white transition hover:bg-[#0f6833]"
            >
              Search
            </button>
          </div>

          {/* =============================================
              PAGE SIZE
          ============================================== */}

          <select
            value={size}
            onChange={(
              event,
            ) => {
              setSize(
                Number(
                  event.target
                    .value,
                ),
              );

              setPage(0);
            }}
            className="h-11 rounded-2xl border border-gray-200 bg-white px-4 text-sm font-black text-gray-700 outline-none transition focus:border-[#137A3D]"
          >
            {[10, 20, 50].map(
              (value) => (
                <option
                  key={
                    value
                  }
                  value={
                    value
                  }
                >
                  {value} /
                  ទំព័រ
                </option>
              ),
            )}
          </select>

          {/* =============================================
              SORT
          ============================================== */}

          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setSortOpen(
                  (
                    current,
                  ) =>
                    !current,
                )
              }
              className={`flex h-11 w-11 items-center justify-center rounded-2xl border transition ${
                sortOpen
                  ? "border-[#137A3D] bg-emerald-50 text-[#137A3D]"
                  : "border-gray-200 bg-white text-gray-600 hover:border-[#137A3D] hover:bg-emerald-50 hover:text-[#137A3D]"
              }`}
              aria-label="Sort Stores"
              title="Sort Stores"
            >
              <ArrowUpDown
                size={18}
              />
            </button>

            {sortOpen && (
              <div className="absolute right-0 top-[52px] z-50 w-[190px] rounded-2xl border border-gray-100 bg-white p-2 shadow-[0_15px_45px_rgba(0,0,0,0.12)]">
                <p className="px-3 pb-2 pt-1 text-xs font-bold uppercase tracking-wide text-gray-400">
                  Sort Store
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
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${
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
          ACTIVE SEARCH
      ================================================== */}

      {serverQuery && (
        <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Search:{" "}
          <b>
            “{serverQuery}”
          </b>

          <button
            type="button"
            onClick={
              handleClearSearch
            }
            className="ml-3 font-black underline"
          >
            Clear
          </button>
        </div>
      )}

      {/* =================================================
          NOTICE
      ================================================== */}

      {notice && (
        <div
          className={`rounded-2xl px-4 py-3 text-sm ${
            notice.type ===
            "success"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-red-50 text-red-600"
          }`}
        >
          {notice.text}
        </div>
      )}

      {/* =================================================
          STORE TABLE
      ================================================== */}

      <section className="overflow-visible rounded-[26px] border border-gray-100 bg-white shadow-sm">
        {isLoading ? (
          /* =============================================
             LOADING
          ============================================== */

          <div className="flex min-h-[360px] items-center justify-center">
            <Loader2
              size={30}
              className="animate-spin text-[#137A3D]"
            />
          </div>
        ) : error ? (
          /* =============================================
             ERROR
          ============================================== */

          <div className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center">
            <AlertTriangle
              size={38}
              className="text-red-400"
            />

            <h3 className="mt-4 text-xl font-black">
              មិនអាចទាញយក
              Store បានទេ
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              {getShopApiErrorMessage(
                error,
              )}
            </p>

            <button
              type="button"
              onClick={() =>
                void refetch()
              }
              className="mt-5 rounded-xl bg-[#137A3D] px-4 py-2.5 font-black text-white"
            >
              សាកល្បងម្តងទៀត
            </button>
          </div>
        ) : sortedStores.length ===
          0 ? (
          /* =============================================
             EMPTY
          ============================================== */

          <div className="flex min-h-[340px] flex-col items-center justify-center">
            <Store
              size={42}
              className="text-gray-300"
            />

            <p className="mt-3 font-black text-gray-600">
              មិនមាន Store
            </p>
          </div>
        ) : (
          /* =============================================
             TABLE
          ============================================== */

          <ShopsTable
            stores={
              sortedStores
            }
            disabled={
              updating ||
              isFetching
            }
            onEdit={
              setEditing
            }
            onStatus={(
              store,
              action,
            ) => {
              setStatusStore(
                store,
              );

              setStatusAction(
                action,
              );
            }}
          />
        )}

        {/* ===============================================
            PAGINATION
        ================================================ */}

        {!isLoading &&
          !error && (
            <ShopsPagination
              page={
                data?.pageNumber ??
                page
              }
              totalPages={
                data?.totalPages ??
                0
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
          EDIT MODAL
      ================================================== */}

      <ShopEditModal
        store={editing}
        saving={updating}
        onClose={() => {
          if (!updating) {
            setEditing(null);
          }
        }}
        onSubmit={edit}
      />

      {/* =================================================
          STATUS MODAL
      ================================================== */}

      <ShopStatusModal
        store={statusStore}
        initialAction={
          statusAction
        }
        onClose={() =>
          setStatusStore(
            null,
          )
        }
        onChanged={async () => {
          await refetch();
        }}
      />
    </div>
  );
}