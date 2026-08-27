"use client";

import { useMemo, useState } from "react";

import {
  ArrowUpDown,
  Check,
  ChevronDown,
  Search,
  ShieldAlert,
  X,
} from "lucide-react";

import {
  useCreateAllergenMutation,
  useDeleteAllergenMutation,
  useGetAllergensQuery,
  useHardDeleteAllergenMutation,
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

import AllergenDetailModal from "./AllergenDetailModal";
import AllergenFormModal from "./AllergenFormModal";
import AllergensHeader from "./AllergensHeader";
import AllergensPagination from "./AllergensPagination";
import AllergensTable from "./AllergensTable";
import AllergensTabs from "./AllergensTabs";
import DeleteAllergenConfirmModal from "./DeleteAllergenConfirmModal";

/* =========================================================
   SORT TYPE
========================================================= */

type AllergenSort = "A_Z" | "Z_A" | "NEWEST" | "OLDEST";

export default function AllergenManager() {
  /* =======================================================
     PAGINATION
  ======================================================= */

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);

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

  const [sortBy, setSortBy] = useState<AllergenSort>("A_Z");

  const [sortOpen, setSortOpen] = useState(false);

  /* =======================================================
     MODALS
  ======================================================= */

  const [editing, setEditing] = useState<Allergen | null>(null);

  const [viewing, setViewing] = useState<Allergen | null>(null);

  const [formOpen, setFormOpen] = useState(false);

  const [deleting, setDeleting] = useState<Allergen | null>(null);

  const [message, setMessage] = useState<ApiMessage | null>(null);

  /* =======================================================
     MAIN DATA
  ======================================================= */

  const { data, isLoading, isFetching, error, refetch } = useGetAllergensQuery({
    page,
    size,
  });

  /* =======================================================
     SUGGESTION DATA

     Load more items so search suggestions are not limited
     to the current 20 rows.
  ======================================================= */

  const { data: suggestionData } = useGetAllergensQuery({
    page: 0,
    size: 100,
  });

  /* =======================================================
     MUTATIONS
  ======================================================= */

  const [createItem, { isLoading: isCreating }] = useCreateAllergenMutation();

  const [updateItem, { isLoading: isUpdating }] = useUpdateAllergenMutation();

  const [deleteItem, { isLoading: isDeleting }] = useDeleteAllergenMutation();

  const [restoreItem, { isLoading: isRestoring }] =
    useRestoreAllergenMutation();
  const [sizeOpen, setSizeOpen] = useState(false);
  /* =======================================================
     DATA
  ======================================================= */

  const items = data?.contents ?? [];

  const suggestionItems = suggestionData?.contents ?? [];

  /* =======================================================
     COUNTS
  ======================================================= */

  const activeCount = items.filter((item) => item.active).length;

  const inactiveCount = items.length - activeCount;

  /* =======================================================
     SEARCH SUGGESTIONS

     Search only:
     - code = displayed as Allergen
     - description

     Do NOT search item.name.
  ======================================================= */

  const suggestions = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return [];
    }

    return suggestionItems
      .filter((item) => {
        const code = item.code?.toLowerCase() ?? "";

        const description = item.description?.toLowerCase() ?? "";

        return code.includes(query) || description.includes(query);
      })
      .slice(0, 8);
  }, [suggestionItems, search]);

  /* =======================================================
     FILTER

     Search only:
     - item.code
     - item.description
  ======================================================= */

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    return items.filter((item) => {
      /* STATUS */

      const statusMatches =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && item.active) ||
        (statusFilter === "INACTIVE" && !item.active);

      if (!statusMatches) {
        return false;
      }

      /* NO SEARCH */

      if (!query) {
        return true;
      }

      /* SEARCH */

      const code = item.code?.toLowerCase() ?? "";

      const description = item.description?.toLowerCase() ?? "";

      return code.includes(query) || description.includes(query);
    });
  }, [items, search, statusFilter]);

  /* =======================================================
     SORT

     A-Z / Z-A:
     sort by Allergen = item.code

     Newest / Oldest:
     sort by updatedAt
  ======================================================= */

  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((first, second) => {
      switch (sortBy) {
        /* ===========================================
               A → Z
            ============================================ */

        case "A_Z":
          return (first.code ?? "").localeCompare(
            second.code ?? "",
            undefined,
            {
              sensitivity: "base",
            },
          );

        /* ===========================================
               Z → A
            ============================================ */

        case "Z_A":
          return (second.code ?? "").localeCompare(
            first.code ?? "",
            undefined,
            {
              sensitivity: "base",
            },
          );

        /* ===========================================
               NEWEST
            ============================================ */

        case "NEWEST": {
          const firstTime = first.updatedAt
            ? new Date(first.updatedAt).getTime()
            : 0;

          const secondTime = second.updatedAt
            ? new Date(second.updatedAt).getTime()
            : 0;

          return secondTime - firstTime;
        }

        /* ===========================================
               OLDEST
            ============================================ */

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
  }, [filteredItems, sortBy]);

  /* =======================================================
     BUSY
  ======================================================= */

  const busy =
    isCreating ||
    isUpdating ||
    isDeleting ||
    isRestoring;

  /* =======================================================
     SORT OPTIONS
  ======================================================= */

  const sortOptions: {
    value: AllergenSort;
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
     SAVE
  ======================================================= */

  const handleSave = async (values: AllergenFormValues) => {
    setMessage(null);

    try {
      if (editing) {
        const body: AllergenPayload = {
          code: values.code,

          /*
           * Hidden internal field.
           * Generated automatically
           * by AllergenFormModal.
           */
          name: values.name,

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
          text: "បានកែប្រែអាឡែស៊ីដោយជោគជ័យ។",
        });
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

        setMessage({
          type: "success",
          text: "បានបន្ថែមអាឡែស៊ីដោយជោគជ័យ។",
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
        text: "បានបិទអាឡែស៊ីដោយជោគជ័យ។",
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
     RESTORE
  ======================================================= */

  const handleRestore = async (item: Allergen) => {
    try {
      await restoreItem(item.code).unwrap();

      setMessage({
        type: "success",
        text: "បានស្ដារអាឡែស៊ីដោយជោគជ័យ។",
      });

      await refetch();
    } catch (restoreError) {
      setMessage({
        type: "error",
        text: getApiErrorMessage(restoreError),
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

      {/* =================================================
          TABS + TOOLBAR
      ================================================== */}

      <div className="flex w-full flex-nowrap items-center justify-between gap-4">
        {/* ===============================================
            LEFT
        ================================================ */}

        <div className="shrink-0">
          <AllergensTabs
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
              placeholder="ស្វែងរកតាមអាឡែស៊ី ឬការពិពណ៌នា..."
              className="h-[52px] w-[500px] rounded-full border border-gray-200 bg-white py-2 pl-11 pr-10 text-lg text-gray-700 outline-none transition focus:border-primary-600 focus:ring-2 focus:ring-primary-100"
            />

            {/* =========================================
                CLEAR SEARCH
            ========================================== */}

            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");

                  setShowSuggestions(false);

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

            {showSuggestions && search.trim().length > 0 && (
              <div className="absolute left-0 top-[52px] z-[100] w-[400px] overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_18px_50px_rgba(0,0,0,0.13)]">
                {/* ===================================
                      NO RESULT
                  ==================================== */}

                {suggestions.length === 0 ? (
                  <div className="px-5 py-6 text-center ">
                    <ShieldAlert size={32} className="mx-auto text-secondary-600" />

                    <p className="mt-2 text-lg text-secondary-600">
                      មិនមានអាឡែស៊ីដែលត្រូវគ្នា
                    </p>
                  </div>
                ) : (
                  <>
                    {/* =================================
                          SUGGESTION HEADER
                      ================================== */}

                    <div className="border-b border-gray-100 px-5 py-3">
                      <p className="text-lg uppercase tracking-wide text-secondary-600">
                        លទ្ធផលស្វែងរក
                      </p>
                    </div>

                    {/* =================================
                          RESULT LIST
                      ================================== */}

                    <div className="max-h-[320px] overflow-y-auto p-2">
                      {suggestions.map((item) => (
                        <button
                          key={item.uuid}
                          type="button"
                          onMouseDown={(event) => {
                            event.preventDefault();
                          }}
                          onClick={() => {
                            /*
                             * Allergen shown to
                             * Admin = code
                             */
                            setSearch(item.code);

                            setShowSuggestions(false);

                            setPage(0);
                          }}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-primary-50"
                        >
                          {/* ICON */}

                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-800">
                            <ShieldAlert size={24} />
                          </div>

                          {/* INFORMATION */}

                          <div className="min-w-0 flex-1">
                            {/* ALLERGEN */}

                            <p className="truncate text-lg font-black text-gray-800">
                              {item.code}
                            </p>

                            {/* DESCRIPTION */}

                            {item.description && (
                              <p className="mt-1 truncate text-lg text-gray-400">
                                {item.description}
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

          {/* =============================================
              PAGE SIZE
          ============================================== */}

          <div className="relative">
            <button
              type="button"
              onClick={() => setSizeOpen((current) => !current)}
              className={`flex h-12 min-w-[125px] items-center justify-between gap-3 rounded-full border bg-white px-4 text-lg font-normal transition ${sizeOpen
                  ? "border-primary-800 ring-2 ring-primary-100"
                  : "border-gray-200 hover:border-primary-800/50"
                }`}
            >
              <span className="text-gray-700">{size} / ទំព័រ</span>

              <ChevronDown
                size={17}
                className={`text-gray-400 transition-transform duration-200 ${sizeOpen ? "rotate-180" : ""
                  }`}
              />
            </button>

            {sizeOpen && (
              <div className="absolute right-0 top-[56px] z-[100] w-[170px] rounded-2xl border border-gray-100 bg-white p-2 shadow-xl">
                <p className="px-3 pb-2 pt-1 text-lg text-secondary-600">
                  ទំហំទំព័រ
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
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-lg font-normal transition ${selected
                          ? "bg-primary-50 text-primary-800"
                          : "text-gray-600 hover:bg-gray-50 hover:text-primary-800"
                        }`}
                    >
                      <span>{value} / ទំព័រ</span>

                      {selected && (
                        <Check size={16} className="text-primary-800" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* =============================================
              SORT
          ============================================== */}

          <div className="relative">
            <button
              type="button"
              onClick={() => setSortOpen((current) => !current)}
              className={`flex h-12 w-12 items-center justify-center rounded-full border transition ${sortOpen
                  ? "border-primary-800 bg-primary-50 text-primary-800"
                  : "border-gray-200 bg-white text-gray-600 hover:border-primary-800 hover:bg-primary-50 hover:text-primary-800"
                }`}
              aria-label="Sort allergens"
              title="តម្រៀប"
            >
              <ArrowUpDown size={18} />
            </button>

            {/* =========================================
                SORT MENU
            ========================================== */}

            {sortOpen && (
              <div className="absolute right-0 top-[56px] z-[100] w-[190px] rounded-2xl border border-gray-100 bg-white p-2 shadow-xl">
                <p className="px-3 pb-2 pt-1 text-lg text-secondary-600">
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
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-lg transition ${selected
                          ? "bg-primary-50 text-primary-800"
                          : "text-gray-600 hover:bg-gray-50 hover:text-primary-800"
                        }`}
                    >
                      <span>{option.label}</span>

                      {selected && (
                        <Check size={16} className="text-primary-800" />
                      )}
                    </button>
                  );
                })}
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
          className={`rounded-2xl border px-4 py-3 text-lg ${message.type === "success"
              ? "border-primary-100 bg-primary-50 text-primary-700"
              : "border-red-100 bg-red-50 text-red-600"
            }`}
        >
          {message.text}
        </div>
      )}

      {/* =================================================
          ERROR
      ================================================== */}

      {error && (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-lg text-red-600">
          {getApiErrorMessage(error)}
        </div>
      )}

      {/* =================================================
          TABLE
      ================================================== */}

      <section className="overflow-visible rounded-[24px] border border-gray-100 bg-white shadow-sm">
        <AllergensTable
          allergens={sortedItems}
          disabled={busy}
          onView={(item) => setViewing(item)}
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

      {/* =================================================
          CREATE / EDIT
      ================================================== */}

      <AllergenFormModal
        open={formOpen}
        allergen={editing}
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

      {/* =================================================
          DELETE
      ================================================== */}

      <DeleteAllergenConfirmModal
        item={deleting}
        deleting={isDeleting}
        onClose={() => {
          if (!isDeleting) {
            setDeleting(null);
          }
        }}
        onConfirm={handleDelete}
      />

      <AllergenDetailModal
        item={viewing}
        onClose={() => setViewing(null)}
      />
    </div>
  );
}
