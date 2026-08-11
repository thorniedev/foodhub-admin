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
  Pencil,
  Plus,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Trash2,
  X,
} from "lucide-react";

import {
  getFilterGroupBySlug,
} from "@/src/config/filterCatalog";

import {
  useFilterCatalog,
} from "@/src/hooks/useFilterCatalog";

import type {
  FilterCatalogOption,
  FilterCatalogOptionFormValues,
} from "@/src/types/filterCatalog";

import FilterOptionFormModal from "./FilterOptionFormModal";

type StatusFilter =
  | "ALL"
  | "ACTIVE"
  | "INACTIVE";

type SortMode =
  | "A_Z"
  | "Z_A"
  | "NEWEST"
  | "OLDEST";

export default function FilterCatalogManager({
  groupSlug,
}: {
  groupSlug: string;
}) {
  const group =
    getFilterGroupBySlug(
      groupSlug,
    );

  if (!group) {
    return (
      <div className="p-6">
        <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-4 text-red-600">
          មិនស្គាល់ filter group:{" "}
          {groupSlug}
        </div>
      </div>
    );
  }

  if (
    group.source !==
    "LOCAL"
  ) {
    return (
      <div className="p-6">
        <div className="rounded-[24px] border border-amber-100 bg-amber-50 p-6 text-amber-800">
          <p className="text-xl font-bold">
            {group.labelKm}
          </p>

          <p className="mt-2 text-base leading-7">
            Group នេះប្រើ API ដែលមានស្រាប់។ សូមប្រើ page ដែលមានស្រាប់ក្នុង sidebar។
          </p>
        </div>
      </div>
    );
  }

  return (
    <LocalCatalogManager
      groupSlug={
        groupSlug
      }
    />
  );
}

function LocalCatalogManager({
  groupSlug,
}: {
  groupSlug: string;
}) {
  const group =
    getFilterGroupBySlug(
      groupSlug,
    )!;

  const {
    groupOptions,
    createOption,
    updateOption,
    setActive,
  } =
    useFilterCatalog(
      group.code,
    );

  const [search, setSearch] =
    useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] =
    useState<StatusFilter>(
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

  const [size, setSize] =
    useState(20);

  const [
    sizeOpen,
    setSizeOpen,
  ] = useState(false);

  const [page, setPage] =
    useState(0);

  const [
    editing,
    setEditing,
  ] =
    useState<FilterCatalogOption | null>(
      null,
    );

  const [
    formOpen,
    setFormOpen,
  ] = useState(false);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    deleting,
    setDeleting,
  ] =
    useState<FilterCatalogOption | null>(
      null,
    );

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    showSuggestions,
    setShowSuggestions,
  ] = useState(false);

  const normalizedSearch =
    search
      .trim()
      .toLowerCase();

  const activeCount =
    groupOptions.filter(
      (item) => item.active,
    ).length;

  const inactiveCount =
    groupOptions.length -
    activeCount;

  const suggestions =
    useMemo(() => {
      if (
        !normalizedSearch
      ) {
        return [];
      }

      return groupOptions
        .filter((item) =>
          [
            item.localName,
            item.name,
            item.code,
            item.description ??
              "",
          ].some((value) =>
            String(
              value ?? "",
            )
              .toLowerCase()
              .includes(
                normalizedSearch,
              ),
          ),
        )
        .slice(0, 8);
    }, [
      groupOptions,
      normalizedSearch,
    ]);

  const filtered =
    useMemo(() => {
      return groupOptions.filter(
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
            item.localName,
            item.name,
            item.code,
            item.description ??
              "",
          ].some((value) =>
            String(
              value ?? "",
            )
              .toLowerCase()
              .includes(
                normalizedSearch,
              ),
          );
        },
      );
    }, [
      groupOptions,
      normalizedSearch,
      statusFilter,
    ]);

  const sorted =
    useMemo(() => {
      return [
        ...filtered,
      ].sort(
        (
          first,
          second,
        ) => {
          const firstLabel =
            first.localName ||
            first.name;

          const secondLabel =
            second.localName ||
            second.name;

          if (
            sortMode ===
            "A_Z"
          ) {
            return firstLabel.localeCompare(
              secondLabel,
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
            return secondLabel.localeCompare(
              firstLabel,
              undefined,
              {
                sensitivity:
                  "base",
              },
            );
          }

          const firstTime =
            new Date(
              first.createdAt,
            ).getTime();

          const secondTime =
            new Date(
              second.createdAt,
            ).getTime();

          return sortMode ===
            "NEWEST"
            ? secondTime -
                firstTime
            : firstTime -
                secondTime;
        },
      );
    }, [
      filtered,
      sortMode,
    ]);

  const totalPages =
    Math.max(
      Math.ceil(
        sorted.length /
          size,
      ),
      1,
    );

  const safePage =
    Math.min(
      page,
      totalPages - 1,
    );

  const pageItems =
    sorted.slice(
      safePage * size,
      safePage *
        size +
        size,
    );

  const handleSave =
    async (
      values:
        FilterCatalogOptionFormValues,
    ) => {
      setSaving(true);
      setErrorMessage("");

      try {
        if (editing) {
          updateOption(
            editing.uuid,
            values,
          );
        } else {
          createOption(
            values,
          );
        }

        setFormOpen(
          false,
        );

        setEditing(
          null,
        );

        setPage(0);
      } catch (error) {
        setErrorMessage(
          error instanceof
            Error
            ? error.message
            : "មិនអាចរក្សាទុកទិន្នន័យបានទេ។",
        );
      } finally {
        setSaving(false);
      }
    };

  return (
    <div className="space-y-5 p-4 sm:p-6 lg:p-7">
      <section className="relative overflow-hidden rounded-[30px] bg-[#14833E] px-6 py-7 text-white shadow-sm sm:px-8">
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/5" />

        <div className="relative flex flex-col gap-7 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
                <SlidersHorizontal
                  size={24}
                />
              </div>

              <div>
                <p className="text-5xl font-bold">
                  {group.labelKm}
                </p>

                <p className="mt-2 max-w-2xl text-xl leading-7 text-white/85">
                  {
                    group.descriptionKm
                  }
                </p>
              </div>
            </div>

            <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Stat
                label="សរុប"
                value={
                  groupOptions.length
                }
              />

              <Stat
                label="សកម្ម"
                value={
                  activeCount
                }
              />

              <Stat
                label="អសកម្ម"
                value={
                  inactiveCount
                }
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setEditing(
                null,
              );

              setErrorMessage(
                "",
              );

              setFormOpen(
                true,
              );
            }}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-lg font-bold text-[#136C34] sm:w-fit"
          >
            <Plus size={20} />
            បន្ថែម
            {
              group.labelKm
            }
          </button>
        </div>
      </section>

      <div className="flex w-full flex-nowrap items-center justify-between gap-4 overflow-x-auto pb-1">
        <div className="flex shrink-0 gap-2">
          {(
            [
              [
                "ALL",
                "ទាំងអស់",
                groupOptions.length,
              ],
              [
                "ACTIVE",
                "សកម្ម",
                activeCount,
              ],
              [
                "INACTIVE",
                "អសកម្ម",
                inactiveCount,
              ],
            ] as const
          ).map(
            ([
              value,
              label,
              count,
            ]) => (
              <button
                key={
                  value
                }
                type="button"
                onClick={() => {
                  setStatusFilter(
                    value,
                  );

                  setPage(
                    0,
                  );
                }}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-lg transition ${
                  statusFilter ===
                  value
                    ? "bg-[#136C34] text-white"
                    : "bg-white text-gray-500 hover:bg-emerald-50 hover:text-[#136C34]"
                }`}
              >
                {label}

                <span
                  className={`flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-sm ${
                    statusFilter ===
                    value
                      ? "bg-white/20 text-white"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {count}
                </span>
              </button>
            ),
          )}
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <div className="relative">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              value={
                search
              }
              onChange={(event) => {
                setSearch(
                  event.target
                    .value,
                );

                setShowSuggestions(
                  event.target
                    .value
                    .trim()
                    .length >
                    0,
                );

                setPage(0);
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
              placeholder={`ស្វែងរក ${group.labelKm}...`}
              className="h-11 w-[330px] rounded-2xl border border-gray-200 bg-white pl-11 pr-10 text-base text-gray-700 outline-none focus:border-[#137A3D]"
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

                  setPage(0);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                <X size={16} />
              </button>
            )}

            {showSuggestions &&
              normalizedSearch && (
                <div className="absolute left-0 top-[52px] z-[100] w-[330px] overflow-hidden rounded-2xl border border-gray-100 bg-white p-2 shadow-xl">
                  {suggestions.length ===
                  0 ? (
                    <p className="px-3 py-4 text-center text-base text-gray-400">
                      មិនមានលទ្ធផល
                    </p>
                  ) : (
                    suggestions.map(
                      (
                        item,
                      ) => (
                        <button
                          key={
                            item.uuid
                          }
                          type="button"
                          onClick={() => {
                            setSearch(
                              item.localName ||
                                item.name,
                            );

                            setShowSuggestions(
                              false,
                            );
                          }}
                          className="w-full rounded-xl px-3 py-2.5 text-left transition hover:bg-emerald-50"
                        >
                          <p className="text-base font-semibold text-gray-800">
                            {item.localName ||
                              item.name}
                          </p>

                          <p className="mt-0.5 text-sm text-gray-400">
                            {
                              item.code
                            }
                          </p>
                        </button>
                      ),
                    )
                  )}
                </div>
              )}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setSizeOpen(
                  !sizeOpen,
                );

                setSortOpen(
                  false,
                );
              }}
              className="flex h-11 min-w-[125px] items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700"
            >
              {size} /
              ទំព័រ

              <ChevronDown
                size={17}
              />
            </button>

            {sizeOpen && (
              <div className="absolute right-0 top-[52px] z-[100] w-[170px] rounded-2xl border border-gray-100 bg-white p-2 shadow-xl">
                {[10, 20, 50].map(
                  (
                    value,
                  ) => (
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
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-base ${
                        size ===
                        value
                          ? "bg-emerald-50 text-[#137A3D]"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {value} /
                      ទំព័រ

                      {size ===
                        value && (
                        <Check
                          size={
                            16
                          }
                        />
                      )}
                    </button>
                  ),
                )}
              </div>
            )}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setSortOpen(
                  !sortOpen,
                );

                setSizeOpen(
                  false,
                );
              }}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-600 hover:border-[#137A3D] hover:bg-emerald-50 hover:text-[#137A3D]"
            >
              <ArrowUpDown
                size={18}
              />
            </button>

            {sortOpen && (
              <div className="absolute right-0 top-[52px] z-[100] w-[190px] rounded-2xl border border-gray-100 bg-white p-2 shadow-xl">
                {(
                  [
                    [
                      "A_Z",
                      "A → Z",
                    ],
                    [
                      "Z_A",
                      "Z → A",
                    ],
                    [
                      "NEWEST",
                      "ថ្មីបំផុត",
                    ],
                    [
                      "OLDEST",
                      "ចាស់បំផុត",
                    ],
                  ] as const
                ).map(
                  ([
                    value,
                    label,
                  ]) => (
                    <button
                      key={
                        value
                      }
                      type="button"
                      onClick={() => {
                        setSortMode(
                          value,
                        );

                        setSortOpen(
                          false,
                        );
                      }}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-base ${
                        sortMode ===
                        value
                          ? "bg-emerald-50 text-[#137A3D]"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {label}

                      {sortMode ===
                        value && (
                        <Check
                          size={
                            16
                          }
                        />
                      )}
                    </button>
                  ),
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="flex gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          <AlertTriangle
            size={18}
          />
          {errorMessage}
        </div>
      )}

      <section className="overflow-hidden rounded-[24px] border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-5 py-4 text-xl font-bold text-[#136C34]">
                  {
                    group.labelKm
                  }
                </th>

                <th className="px-5 py-4 text-xl font-bold text-[#136C34]">
                  Code
                </th>

                <th className="px-5 py-4 text-xl font-bold text-[#136C34]">
                  Value
                </th>

                <th className="px-5 py-4 text-xl font-bold text-[#136C34]">
                  ស្ថានភាព
                </th>

                <th className="px-5 py-4 text-right text-xl font-bold text-[#136C34]">
                  សកម្មភាព
                </th>
              </tr>
            </thead>

            <tbody>
              {pageItems.map(
                (item) => (
                  <tr
                    key={
                      item.uuid
                    }
                    className="border-b border-gray-100 last:border-0 hover:bg-gray-50/60"
                  >
                    <td className="px-5 py-4">
                      <p className="text-lg text-gray-800">
                        {item.localName ||
                          item.name}
                      </p>

                      {item.description && (
                        <p className="mt-1 max-w-[360px] truncate text-sm text-gray-400">
                          {
                            item.description
                          }
                        </p>
                      )}
                    </td>

                    <td className="px-5 py-4 text-base text-gray-500">
                      {
                        item.code
                      }
                    </td>

                    <td className="px-5 py-4 text-base text-gray-500">
                      {item.numericValue ??
                        "—"}
                      {item.numericValue !==
                        null &&
                      item.unit
                        ? ` ${item.unit}`
                        : ""}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-lg ${
                          item.active
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {item.active
                          ? "សកម្ម"
                          : "អសកម្ម"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditing(
                              item,
                            );

                            setFormOpen(
                              true,
                            );
                          }}
                          className="rounded-lg p-2 text-blue-500 hover:bg-blue-50"
                        >
                          <Pencil
                            size={
                              18
                            }
                          />
                        </button>

                        {item.active ? (
                          <button
                            type="button"
                            onClick={() =>
                              setDeleting(
                                item,
                              )
                            }
                            className="rounded-lg p-2 text-red-400 hover:bg-red-50"
                          >
                            <Trash2
                              size={
                                18
                              }
                            />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              setActive(
                                item.uuid,
                                true,
                              )
                            }
                            className="rounded-lg p-2 text-emerald-600 hover:bg-emerald-50"
                          >
                            <RotateCcw
                              size={
                                18
                              }
                            />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ),
              )}

              {pageItems.length ===
                0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-16 text-center text-base text-gray-400"
                  >
                    មិនមានទិន្នន័យ
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 px-5 py-4 text-base text-gray-500">
          <span>
            Page{" "}
            {safePage + 1} /
            {totalPages} ·
            សរុប{" "}
            {sorted.length}
          </span>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={
                safePage <=
                0
              }
              onClick={() =>
                setPage(
                  Math.max(
                    0,
                    safePage -
                      1,
                  ),
                )
              }
              className="rounded-lg border border-gray-200 px-3 py-2 disabled:opacity-40"
            >
              មុន
            </button>

            <button
              type="button"
              disabled={
                safePage >=
                totalPages -
                  1
              }
              onClick={() =>
                setPage(
                  Math.min(
                    totalPages -
                      1,
                    safePage +
                      1,
                  ),
                )
              }
              className="rounded-lg border border-gray-200 px-3 py-2 disabled:opacity-40"
            >
              បន្ទាប់
            </button>
          </div>
        </div>
      </section>

      <FilterOptionFormModal
        open={formOpen}
        group={group}
        item={editing}
        saving={saving}
        onClose={() => {
          if (
            saving
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

      {deleting && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl">
            <h3 className="text-2xl font-bold text-gray-900">
              បិទ{" "}
              {
                deleting.localName
              }
              ?
            </h3>

            <p className="mt-3 text-base leading-7 text-gray-500">
              វានឹងបាត់ពី Form បង្កើតម្ហូប ប៉ុន្តែមិនលុបចេញទាំងស្រុងទេ។
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() =>
                  setDeleting(
                    null,
                  )
                }
                className="rounded-xl border border-gray-200 px-4 py-2.5 text-lg text-gray-600"
              >
                បោះបង់
              </button>

              <button
                type="button"
                onClick={() => {
                  setActive(
                    deleting.uuid,
                    false,
                  );

                  setDeleting(
                    null,
                  );
                }}
                className="rounded-xl bg-red-500 px-4 py-2.5 text-lg text-white"
              >
                បិទ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-3xl bg-white/10 px-5 py-4">
      <p className="text-xl text-white/75">
        {label}
      </p>

      <p className="mt-1 text-2xl font-bold">
        {value}
      </p>
    </div>
  );
}
