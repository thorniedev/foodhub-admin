"use client";

import { useMemo, useState, type ReactNode } from "react";

import {
  AlertTriangle,
  ArrowUpDown,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Trash2,
  X,
} from "lucide-react";

import { getFilterGroupBySlug } from "@/src/config/filterCatalog";

import { useCuisineCatalog } from "@/src/hooks/useCuisineCatalog";

import { useFoodCategoryCatalog } from "@/src/hooks/useFoodCategoryCatalog";

import { useMealTypeCatalog } from "@/src/hooks/useMealTypeCatalog";

import { useFilterCatalog } from "@/src/hooks/useFilterCatalog";

import type {
  FilterCatalogOption,
  FilterCatalogOptionFormValues,
} from "@/src/types/filterCatalog";

import FilterOptionFormModal from "./FilterOptionFormModal";

/* =========================================================
   TYPES
   Easy to move later into filterCatalogManager.types.ts
========================================================= */

type StatusFilter = "ALL" | "ACTIVE" | "INACTIVE";

type SortMode = "A_Z" | "Z_A" | "NEWEST" | "OLDEST";

type FilterGroup = NonNullable<ReturnType<typeof getFilterGroupBySlug>>;

/* =========================================================
   MAIN COMPONENT
   File: FilterCatalogManager.tsx
========================================================= */

export default function FilterCatalogManager({
  groupSlug,
}: {
  groupSlug: string;
}) {
  const group = getFilterGroupBySlug(groupSlug);

  if (!group) {
    return (
      <div className="w-full min-w-0 max-w-full ">
        <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-lg text-red-600">
          <AlertTriangle size={22} className="mt-0.5 shrink-0" />

          <p>
            មិនស្គាល់ filter group:{" "}
            <span className="font-semibold">{groupSlug}</span>
          </p>
        </div>
      </div>
    );
  }

  if (
    group.source !== "LOCAL" &&
    group.source !== "CUISINE_API" &&
    group.source !== "FOOD_CATEGORY_API" &&
    group.source !== "MEAL_TYPE_API"
  ) {
    return (
      <div className="w-full min-w-0 max-w-full p-4 sm:p-6">
        <div className="rounded-2xl border border-secondary-100 bg-secondary-50 p-5 sm:p-6">
          <p className="text-2xl font-semibold text-secondary-600">
            {group.labelKm}
          </p>

          <p className="mt-2 text-lg leading-8 text-gray-600">
            Group នេះប្រើ API ដែលមានស្រាប់។ សូមប្រើ page ដែលមានស្រាប់ក្នុង
            sidebar។
          </p>
        </div>
      </div>
    );
  }

  return <LocalCatalogManager groupSlug={groupSlug} />;
}

/* =========================================================
   DATA / STATE COMPONENT
   File: LocalCatalogManager.tsx
   Keeps all business logic in one place.
========================================================= */

function LocalCatalogManager({ groupSlug }: { groupSlug: string }) {
  const group = getFilterGroupBySlug(groupSlug)!;

  const localCatalog = useFilterCatalog(group.code);

  const cuisineCatalog = useCuisineCatalog();

  const foodCategoryCatalog = useFoodCategoryCatalog();

  const mealTypeCatalog = useMealTypeCatalog();

  const { groupOptions, createOption, updateOption, setActive } =
    group.source === "CUISINE_API"
      ? cuisineCatalog
      : group.source === "FOOD_CATEGORY_API"
        ? foodCategoryCatalog
        : group.source === "MEAL_TYPE_API"
          ? mealTypeCatalog
          : localCatalog;

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  const [sortMode, setSortMode] = useState<SortMode>("NEWEST");

  const [sortOpen, setSortOpen] = useState(false);

  const [size, setSize] = useState(20);

  const [sizeOpen, setSizeOpen] = useState(false);

  const [page, setPage] = useState(0);

  const [editing, setEditing] = useState<FilterCatalogOption | null>(null);

  const [formOpen, setFormOpen] = useState(false);

  const [saving, setSaving] = useState(false);

  const [deleting, setDeleting] = useState<FilterCatalogOption | null>(null);

  const [errorMessage, setErrorMessage] = useState("");

  const [showSuggestions, setShowSuggestions] = useState(false);

  const normalizedSearch = search.trim().toLowerCase();

  const activeCount = groupOptions.filter((item) => item.active).length;

  const inactiveCount = groupOptions.length - activeCount;

  const suggestions = useMemo(() => {
    if (!normalizedSearch) {
      return [];
    }

    return groupOptions
      .filter((item) =>
        [item.localName, item.name, item.code, item.description ?? ""].some(
          (value) =>
            String(value ?? "")
              .toLowerCase()
              .includes(normalizedSearch),
        ),
      )
      .slice(0, 8);
  }, [groupOptions, normalizedSearch]);

  const filtered = useMemo(() => {
    return groupOptions.filter((item) => {
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

      return [
        item.localName,
        item.name,
        item.code,
        item.description ?? "",
      ].some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(normalizedSearch),
      );
    });
  }, [groupOptions, normalizedSearch, statusFilter]);

  const sorted = useMemo(() => {
    return [...filtered].sort((first, second) => {
      const firstLabel = first.localName || first.name;

      const secondLabel = second.localName || second.name;

      if (sortMode === "A_Z") {
        return firstLabel.localeCompare(secondLabel, undefined, {
          sensitivity: "base",
        });
      }

      if (sortMode === "Z_A") {
        return secondLabel.localeCompare(firstLabel, undefined, {
          sensitivity: "base",
        });
      }

      const firstTime = new Date(first.createdAt).getTime();

      const secondTime = new Date(second.createdAt).getTime();

      return sortMode === "NEWEST"
        ? secondTime - firstTime
        : firstTime - secondTime;
    });
  }, [filtered, sortMode]);

  const totalPages = Math.max(Math.ceil(sorted.length / size), 1);

  const safePage = Math.min(page, totalPages - 1);

  const pageItems = sorted.slice(safePage * size, safePage * size + size);

  const handleSave = async (values: FilterCatalogOptionFormValues) => {
    setSaving(true);
    setErrorMessage("");

    try {
      if (editing) {
        updateOption(editing.uuid, values);
      } else {
        createOption(values);
      }

      setFormOpen(false);
      setEditing(null);
      setPage(0);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "មិនអាចរក្សាទុកទិន្នន័យបានទេ។",
      );
    } finally {
      setSaving(false);
    }
  };

  const openCreateModal = () => {
    setEditing(null);
    setErrorMessage("");
    setFormOpen(true);
  };

  const openEditModal = (item: FilterCatalogOption) => {
    setEditing(item);
    setErrorMessage("");
    setFormOpen(true);
  };

  const clearSearch = () => {
    setSearch("");
    setShowSuggestions(false);
    setPage(0);
  };

  return (
    <div className="w-full min-w-0 max-w-full space-y-5">
      {/* COMPONENT: CatalogHeader */}
      <CatalogHeader
        group={group}
        total={groupOptions.length}
        active={activeCount}
        inactive={inactiveCount}
        onCreate={openCreateModal}
      />

      {/* COMPONENT: CatalogToolbar */}
      <CatalogToolbar
        groupLabel={group.labelKm}
        search={search}
        statusFilter={statusFilter}
        sortMode={sortMode}
        size={size}
        sortOpen={sortOpen}
        sizeOpen={sizeOpen}
        showSuggestions={showSuggestions}
        suggestions={suggestions}
        totalCount={groupOptions.length}
        activeCount={activeCount}
        inactiveCount={inactiveCount}
        onSearchChange={(value) => {
          setSearch(value);
          setShowSuggestions(value.trim().length > 0);
          setPage(0);
        }}
        onSearchFocus={() => {
          if (search.trim()) {
            setShowSuggestions(true);
          }
        }}
        onClearSearch={clearSearch}
        onSuggestionSelect={(item) => {
          setSearch(item.localName || item.name);
          setShowSuggestions(false);
          setPage(0);
        }}
        onStatusChange={(value) => {
          setStatusFilter(value);
          setPage(0);
        }}
        onSortOpenChange={(open) => {
          setSortOpen(open);
          if (open) {
            setSizeOpen(false);
          }
        }}
        onSizeOpenChange={(open) => {
          setSizeOpen(open);
          if (open) {
            setSortOpen(false);
          }
        }}
        onSortChange={(value) => {
          setSortMode(value);
          setSortOpen(false);
        }}
        onSizeChange={(value) => {
          setSize(value);
          setPage(0);
          setSizeOpen(false);
        }}
      />

      {/* COMPONENT: ErrorNotice */}
      {errorMessage && <ErrorNotice message={errorMessage} />}

      {/* COMPONENT: CatalogTable */}
      <CatalogTable
        groupLabel={group.labelKm}
        items={pageItems}
        onEdit={openEditModal}
        onDelete={setDeleting}
        onRestore={(item) => setActive(item.uuid, true)}
      />

      {/* COMPONENT: CatalogPagination */}
      <CatalogPagination
        page={safePage}
        totalPages={totalPages}
        totalElements={sorted.length}
        onPageChange={setPage}
      />

      {/* EXISTING COMPONENT: FilterOptionFormModal */}
      <FilterOptionFormModal
        open={formOpen}
        group={group}
        item={editing}
        saving={saving}
        options={groupOptions}
        onClose={() => {
          if (saving) {
            return;
          }

          setFormOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSave}
      />

      {/* COMPONENT: DeleteCatalogOptionModal */}
      <DeleteCatalogOptionModal
        item={deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() => {
          if (!deleting) {
            return;
          }

          setActive(deleting.uuid, false);

          setDeleting(null);
        }}
      />
    </div>
  );
}

/* =========================================================
   COMPONENT 1: CATALOG HEADER
   Suggested file: CatalogHeader.tsx
   Same visual language as UsersHeader / ShopsHeader.
========================================================= */

function CatalogHeader({
  group,
  total,
  active,
  inactive,
  onCreate,
}: {
  group: FilterGroup;
  total: number;
  active: number;
  inactive: number;
  onCreate: () => void;
}) {
  return (
    <section className="relative overflow-hidden rounded-[30px] bg-[#14833E] px-6 py-7 text-white shadow-sm sm:px-8 sm:py-8">
      <div className="pointer-events-none absolute -right-12 -top-16 h-52 w-52 rounded-full bg-white/5" />
      <div className="pointer-events-none absolute -bottom-24 right-20 h-64 w-64 rounded-full bg-white/5" />

      <div className="relative flex flex-col gap-7 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex items-start gap-4">
            <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-2xl bg-white/15">
              <SlidersHorizontal size={25} />
            </div>

            <div className="min-w-0">
              <p className="text-3xl font-bold text-accent-400">
                {group.labelKm}
              </p>

              <p className="mt-6 max-w-2xl text-xl leading-8 text-white/85">
                {group.descriptionKm}
              </p>
            </div>
          </div>

          <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <StatCard label="សរុប" value={total} />

            <StatCard label="សកម្ម" value={active} />

            <StatCard label="អសកម្ម" value={inactive} />
          </div>
        </div>

        <button
          type="button"
          onClick={onCreate}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-lg font-bold text-primary-800 shadow-sm transition hover:bg-primary-50 sm:w-fit"
        >
          <Plus size={20} />
          បន្ថែម {group.labelKm}
        </button>
      </div>
    </section>
  );
}

/* =========================================================
   COMPONENT 2: CATALOG TOOLBAR
   Suggested file: CatalogToolbar.tsx
========================================================= */

function CatalogToolbar({
  groupLabel,
  search,
  statusFilter,
  sortMode,
  size,
  sortOpen,
  sizeOpen,
  showSuggestions,
  suggestions,
  totalCount,
  activeCount,
  inactiveCount,
  onSearchChange,
  onSearchFocus,
  onClearSearch,
  onSuggestionSelect,
  onStatusChange,
  onSortOpenChange,
  onSizeOpenChange,
  onSortChange,
  onSizeChange,
}: {
  groupLabel: string;
  search: string;
  statusFilter: StatusFilter;
  sortMode: SortMode;
  size: number;
  sortOpen: boolean;
  sizeOpen: boolean;
  showSuggestions: boolean;
  suggestions: FilterCatalogOption[];
  totalCount: number;
  activeCount: number;
  inactiveCount: number;
  onSearchChange: (value: string) => void;
  onSearchFocus: () => void;
  onClearSearch: () => void;
  onSuggestionSelect: (item: FilterCatalogOption) => void;
  onStatusChange: (value: StatusFilter) => void;
  onSortOpenChange: (open: boolean) => void;
  onSizeOpenChange: (open: boolean) => void;
  onSortChange: (value: SortMode) => void;
  onSizeChange: (value: number) => void;
}) {
  const statusTabs = [
    {
      value: "ALL" as const,
      label: "ទាំងអស់",
      count: totalCount,
    },
    {
      value: "ACTIVE" as const,
      label: "សកម្ម",
      count: activeCount,
    },
    {
      value: "INACTIVE" as const,
      label: "អសកម្ម",
      count: inactiveCount,
    },
  ];

  const sortOptions = [
    {
      value: "A_Z" as const,
      label: "A → Z",
    },
    {
      value: "Z_A" as const,
      label: "Z → A",
    },
    {
      value: "NEWEST" as const,
      label: "ថ្មីបំផុត",
    },
    {
      value: "OLDEST" as const,
      label: "ចាស់បំផុត",
    },
  ];

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        {/* Status tabs */}
        <div className="flex w-full min-w-0 gap-2 overflow-x-auto pb-1 xl:w-auto">
          {statusTabs.map((tab) => {
            const active = statusFilter === tab.value;

            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => onStatusChange(tab.value)}
                className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-lg font-medium transition ${
                  active
                    ? "bg-primary-800 text-white"
                    : "bg-gray-50 text-gray-500 hover:bg-primary-50 hover:text-primary-800"
                }`}
              >
                {tab.label}

                <span
                  className={`flex h-7 min-w-7 items-center justify-center rounded-full px-1.5 text-lg font-medium ${
                    active ? "bg-white/20 text-white" : "bg-white text-gray-500"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search + controls */}
        <div className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-center xl:w-auto">
          <div className="relative min-w-0 flex-1 sm:min-w-[340px]">
            <Search
              size={20}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              onFocus={onSearchFocus}
              placeholder={`ស្វែងរក ${groupLabel}...`}
              className="h-[52px] w-full rounded-full border border-gray-200 bg-gray-50 pl-12 pr-11 text-lg text-gray-800 outline-none transition placeholder:text-gray-400 hover:border-gray-300 focus:border-primary-600 focus:bg-white focus:ring-4 focus:ring-primary-100"
            />

            {search && (
              <button
                type="button"
                onClick={onClearSearch}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
              >
                <X size={18} />
              </button>
            )}

            {showSuggestions && search.trim() && (
              <div className="absolute left-0 top-[60px] z-[100] w-full min-w-[300px] overflow-hidden rounded-2xl border border-gray-100 bg-white p-2 shadow-xl">
                {suggestions.length === 0 ? (
                  <p className="px-3 py-5 text-center text-lg text-gray-400">
                    មិនមានលទ្ធផល
                  </p>
                ) : (
                  suggestions.map((item) => (
                    <button
                      key={item.uuid}
                      type="button"
                      onClick={() => onSuggestionSelect(item)}
                      className="w-full rounded-xl px-3 py-3 text-left transition hover:bg-primary-50"
                    >
                      <p className="text-lg font-semibold text-gray-800">
                        {item.localName || item.name}
                      </p>

                      <p className="mt-1 text-lg text-gray-400">{item.code}</p>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Page size */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => onSizeOpenChange(!sizeOpen)}
              className="flex h-[52px] min-w-[150px] items-center justify-between gap-3 rounded-full border border-gray-200 bg-white px-4 text-lg font-medium text-gray-700 transition hover:border-primary-200 hover:bg-primary-50"
            >
              {size} / ទំព័រ
              <ChevronDown size={18} />
            </button>

            {sizeOpen && (
              <div className="absolute right-0 top-[60px] z-[100] w-[180px] rounded-2xl border border-gray-100 bg-white p-2 shadow-xl">
                {[10, 20, 50].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => onSizeChange(value)}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-lg transition ${
                      size === value
                        ? "bg-primary-50 font-medium text-primary-800"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {value} / ទំព័រ
                    {size === value && <Check size={18} />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sort */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => onSortOpenChange(!sortOpen)}
              aria-label="Sort"
              title="Sort"
              className="flex h-[52px] w-[52px] items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-800"
            >
              <ArrowUpDown size={20} />
            </button>

            {sortOpen && (
              <div className="absolute right-0 top-[60px] z-[100] w-[210px] rounded-2xl border border-gray-100 bg-white p-2 shadow-xl">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => onSortChange(option.value)}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-lg transition ${
                      sortMode === option.value
                        ? "bg-primary-50 font-medium text-primary-800"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {option.label}

                    {sortMode === option.value && <Check size={18} />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   COMPONENT 3: ERROR NOTICE
   Suggested file: ErrorNotice.tsx
========================================================= */

function ErrorNotice({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-lg leading-7 text-red-600">
      <AlertTriangle size={21} className="mt-0.5 shrink-0" />

      <span>{message}</span>
    </div>
  );
}

/* =========================================================
   COMPONENT 4: CATALOG TABLE
   Suggested file: CatalogTable.tsx
========================================================= */

function CatalogTable({
  groupLabel,
  items,
  onEdit,
  onDelete,
  onRestore,
}: {
  groupLabel: string;
  items: FilterCatalogOption[];
  onEdit: (item: FilterCatalogOption) => void;
  onDelete: (item: FilterCatalogOption) => void;
  onRestore: (item: FilterCatalogOption) => void;
}) {
  return (
    <section className="w-full min-w-0 max-w-full overflow-hidden rounded-[24px] border border-gray-100 bg-white shadow-sm">
      <div className="w-full max-w-full overflow-x-auto">
        <table className="w-full min-w-[980px] border-collapse text-left">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/70">
              <th className="px-6 py-4 text-xl font-semibold text-primary-800">
                {groupLabel}
              </th>

              <th className="px-6 py-4 text-xl font-semibold text-primary-800">
                Code
              </th>

              <th className="px-6 py-4 text-xl font-semibold text-primary-800">
                Value
              </th>

              <th className="px-6 py-4 text-xl font-semibold text-primary-800">
                ស្ថានភាព
              </th>

              <th className="px-6 py-4 text-right text-xl font-semibold text-primary-800">
                សកម្មភាព
              </th>
            </tr>
          </thead>

          <tbody>
            {items.map((item) => (
              <tr
                key={item.uuid}
                className="border-b border-gray-100 bg-white transition-colors duration-150 last:border-b-0 hover:bg-gray-50/70"
              >
                {/* Name + description */}
                <td className="px-6 py-5">
                  <div className="min-w-[280px]">
                    <p className="text-lg font-medium text-gray-800">
                      {item.localName || item.name}
                    </p>

                    {item.description && (
                      <p className="mt-1 max-w-[400px] truncate text-lg leading-7 text-gray-400">
                        {item.description}
                      </p>
                    )}
                  </div>
                </td>

                {/* Code */}
                <td className="px-6 py-5">
                  <span className="inline-flex rounded-lg bg-gray-50 px-3 py-1.5 font-mono text-lg font-medium text-gray-600">
                    {item.code}
                  </span>
                </td>

                {/* Numeric value + unit */}
                <td className="px-6 py-5">
                  <NumericValue value={item.numericValue} unit={item.unit} />
                </td>

                {/* Status */}
                <td className="px-6 py-5">
                  <CatalogStatusBadge active={item.active} />
                </td>

                {/* Actions */}
                <td className="px-6 py-5">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(item)}
                      title="កែប្រែ"
                      className="flex h-10 w-10 items-center justify-center rounded-xl text-blue-500 transition hover:bg-blue-50 focus:outline-none focus:ring-4 focus:ring-blue-100"
                    >
                      <Pencil size={20} />
                    </button>

                    {item.active ? (
                      <button
                        type="button"
                        onClick={() => onDelete(item)}
                        title="បិទ"
                        className="flex h-10 w-10 items-center justify-center rounded-xl text-red-500 transition hover:bg-red-50 focus:outline-none focus:ring-4 focus:ring-red-100"
                      >
                        <Trash2 size={20} />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onRestore(item)}
                        title="ស្ដារឡើងវិញ"
                        className="flex h-10 w-10 items-center justify-center rounded-xl text-primary-700 transition hover:bg-primary-50 focus:outline-none focus:ring-4 focus:ring-primary-100"
                      >
                        <RotateCcw size={20} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}

            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center">
                  <Search size={34} className="mx-auto text-gray-300" />

                  <p className="mt-3 text-lg font-medium text-gray-500">
                    មិនមានទិន្នន័យ
                  </p>

                  <p className="mt-1 text-lg text-gray-400">
                    សូមសាកល្បងស្វែងរក ឬជ្រើស filter ផ្សេងទៀត។
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/* =========================================================
   COMPONENT 5: NUMERIC VALUE CELL
   Suggested file: NumericValue.tsx
========================================================= */

function NumericValue({
  value,
  unit,
}: {
  value: number | null | undefined;
  unit: string | null | undefined;
}) {
  if (value === null || value === undefined) {
    return <span className="text-lg text-gray-400">—</span>;
  }

  return (
    <div className="flex items-baseline gap-1.5">
      <span className="text-lg font-semibold text-gray-800">{value}</span>

      {unit && (
        <span className="text-lg font-medium text-gray-500">{unit}</span>
      )}
    </div>
  );
}

/* =========================================================
   COMPONENT 6: STATUS BADGE
   Suggested file: CatalogStatusBadge.tsx
========================================================= */

function CatalogStatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full px-3.5 py-1.5 text-lg font-medium ring-1 ring-inset ${
        active
          ? "bg-primary-50 text-primary-700 ring-primary-100"
          : "bg-gray-100 text-gray-500 ring-gray-200"
      }`}
    >
      <span
        className={`h-2 w-2 rounded-full ${
          active ? "bg-primary-600" : "bg-gray-400"
        }`}
      />

      {active ? "សកម្ម" : "អសកម្ម"}
    </span>
  );
}

/* =========================================================
   COMPONENT 7: PAGINATION
   Suggested file: CatalogPagination.tsx
========================================================= */

function CatalogPagination({
  page,
  totalPages,
  totalElements,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  totalElements: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-lg text-gray-500">
        Page <span className="font-semibold text-gray-800">{page + 1}</span> /{" "}
        <span className="font-semibold text-gray-800">{totalPages}</span>
        {" · "}
        សរុប{" "}
        <span className="font-semibold text-primary-800">{totalElements}</span>
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page <= 0}
          onClick={() => onPageChange(Math.max(0, page - 1))}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-4 text-lg font-medium text-gray-600 transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={19} />
          មុន
        </button>

        <button
          type="button"
          disabled={page >= totalPages - 1}
          onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-4 text-lg font-medium text-gray-600 transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          បន្ទាប់
          <ChevronRight size={19} />
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   COMPONENT 8: DELETE / DEACTIVATE MODAL
   Suggested file: DeleteCatalogOptionModal.tsx
========================================================= */

function DeleteCatalogOptionModal({
  item,
  onClose,
  onConfirm,
}: {
  item: FilterCatalogOption | null;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!item) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[3px]">
      <div className="w-full max-w-md rounded-3xl border border-gray-100 bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
            <Trash2 size={24} />
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-[52px] w-[52px] items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
          >
            <X size={22} />
          </button>
        </div>

        <p className="mt-5 text-3xl font-semibold text-primary-800">
          បិទ {item.localName || item.name}?
        </p>

        <p className="mt-3 text-lg leading-8 text-gray-500">
          វានឹងបាត់ពី Form បង្កើតម្ហូប ប៉ុន្តែមិនលុបចេញពី system ទាំងស្រុងទេ។
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onClose}
            className="min-h-12 rounded-full border border-gray-200 px-4 text-lg font-medium text-gray-600 transition hover:bg-gray-50"
          >
            បោះបង់
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="min-h-12 rounded-full bg-red-500 px-4 text-lg font-medium text-white transition hover:bg-red-600"
          >
            បិទ
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   COMPONENT 9: HEADER STAT CARD
   Suggested file: CatalogStatCard.tsx
========================================================= */

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-3xl bg-white/20 px-5 py-4">
      <div className="flex items-center gap-2 text-xl text-white/80">
        {icon}
        <span>{label}</span>
      </div>

      <p className="mt-1 text-2xl font-bold text-white">{value}</p>
    </div>
  );
}
