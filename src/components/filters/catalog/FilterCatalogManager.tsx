"use client";

import { useMemo, useState, type ReactNode } from "react";
import Pagination from "@/src/components/ui/Pagination";

import {
  AlertTriangle,
  ArrowUpDown,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  CloudSun,
  Eye,
  Flame,
  Globe,
  MapPin,
  MinusCircle,
  Navigation,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
  Timer,
  UtensilsCrossed,
  X,
} from "lucide-react";

import { getFilterGroupBySlug } from "@/src/config/filterCatalog";
import { formatAdminDate } from "@/src/types/safetyResource";

import { useCuisineCatalog } from "@/src/hooks/useCuisineCatalog";
import { useFoodCategoryCatalog } from "@/src/hooks/useFoodCategoryCatalog";
import { useMealTypeCatalog } from "@/src/hooks/useMealTypeCatalog";
import { useSeasonCatalog } from "@/src/hooks/useSeasonCatalog";
import { useEventCatalog } from "@/src/hooks/useEventCatalog";
import { useWeatherConditionCatalog } from "@/src/hooks/useWeatherConditionCatalog";
import { useFilterCatalog } from "@/src/hooks/useFilterCatalog";

import type {
  FilterCatalogOption,
  FilterCatalogOptionFormValues,
} from "@/src/types/filterCatalog";

import FilterOptionFormModal from "./FilterOptionFormModal";
import FilterCatalogDetailModal from "./FilterCatalogDetailModal";
import CatalogTableSkeleton from "./CatalogTableSkeleton";

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
    group.source !== "MEAL_TYPE_API" &&
    group.source !== "SEASON_API" &&
    group.source !== "EVENT_API" &&
    group.source !== "WEATHER_CONDITION_API"
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
  const seasonCatalog = useSeasonCatalog();
  const eventCatalog = useEventCatalog();
  const weatherConditionCatalog = useWeatherConditionCatalog();

  const activeCatalog =
    group.source === "CUISINE_API"
      ? cuisineCatalog
      : group.source === "FOOD_CATEGORY_API"
        ? foodCategoryCatalog
        : group.source === "MEAL_TYPE_API"
          ? mealTypeCatalog
          : group.source === "SEASON_API"
            ? seasonCatalog
            : group.source === "EVENT_API"
              ? eventCatalog
              : group.source === "WEATHER_CONDITION_API"
                ? weatherConditionCatalog
                : null;

  const { groupOptions, createOption, updateOption, setActive } =
    activeCatalog || localCatalog;

  const isLoading = Boolean(activeCatalog?.isLoading && groupOptions.length === 0);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  const [sortMode, setSortMode] = useState<SortMode>("NEWEST");

  const [sortOpen, setSortOpen] = useState(false);

  const [size, setSize] = useState(20);

  const [sizeOpen, setSizeOpen] = useState(false);

  const [page, setPage] = useState(0);

  const [editing, setEditing] = useState<FilterCatalogOption | null>(null);

  const [viewing, setViewing] = useState<FilterCatalogOption | null>(null);

  const [formOpen, setFormOpen] = useState(false);

  const [saving, setSaving] = useState(false);

  const [deleting, setDeleting] = useState<FilterCatalogOption | null>(null);

  const [errorMessage, setErrorMessage] = useState("");

  const normalizedSearch = search.trim().toLowerCase();

  const activeCount = groupOptions.filter((item) => item.active).length;

  const inactiveCount = groupOptions.length - activeCount;

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
        await updateOption(editing.uuid, values);
      } else {
        await createOption(values);
      }

      setFormOpen(false);
      setEditing(null);
      setPage(0);
    } catch (error: any) {
      const msg =
        error?.data?.message ||
        error?.message ||
        (typeof error === "string" ? error : "មិនអាចរក្សាទុកទិន្នន័យបានទេ។");
      setErrorMessage(msg);
      throw error;
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
        totalCount={groupOptions.length}
        activeCount={activeCount}
        inactiveCount={inactiveCount}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(0);
        }}
        onClearSearch={clearSearch}
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
        onReset={() => {
          setSearch("");
          setStatusFilter("ALL");
          setSortMode("NEWEST");
          setSize(20);
          setSortOpen(false);
          setSizeOpen(false);
          setPage(0);
        }}
      />

      {/* COMPONENT: ErrorNotice */}
      {errorMessage && <ErrorNotice message={errorMessage} />}

      {/* COMPONENT: CatalogTable & Pagination */}
      <section className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
        {isLoading ? (
          <CatalogTableSkeleton
            rows={size === 10 ? 5 : 7}
            groupLabel={group.labelKm}
            hasValueColumn={["PREPARATION_TIME", "DISTANCE", "SPICE_LEVEL"].includes(group.code)}
            hasDescriptionColumn={group.code !== "MEAL_TIME"}
          />
        ) : (
          <>
            <CatalogTable
              groupCode={group.code}
              groupLabel={group.labelKm}
              items={pageItems}
              onView={(item) => setViewing(item)}
              onEdit={openEditModal}
              onDelete={setDeleting}
              onRestore={(item) => setActive(item.uuid, true)}
            />

            <CatalogPagination
              page={safePage}
              totalPages={totalPages}
              totalElements={sorted.length}
              onPageChange={setPage}
            />
          </>
        )}
      </section>

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

      {/* COMPONENT: FilterCatalogDetailModal */}
      <FilterCatalogDetailModal
        uuid={viewing?.uuid ?? null}
        group={group}
        initialOption={viewing}
        options={groupOptions}
        onToggleStatus={async (targetUuid, nextActive) => {
          await setActive(targetUuid, nextActive);
        }}
        onClose={() => setViewing(null)}
      />
    </div>
  );
}

/* =========================================================
   COMPONENT 1: CATALOG HEADER
   Suggested file: CatalogHeader.tsx
   Same visual language as UsersHeader / ShopsHeader.
========================================================= */

function getFilterGroupIcon(groupCode: string, size = 20) {
  switch (groupCode) {
    case "PREPARATION_TIME":
      return <Timer size={size} />;
    case "DISTANCE":
      return <Navigation size={size} />;
    case "REGION":
      return <MapPin size={size} />;
    case "SEASON":
      return <CloudSun size={size} />;
    case "EVENT":
      return <CalendarDays size={size} />;
    case "MEAL_TIME":
      return <Clock size={size} />;
    case "FOOD_CATEGORY":
      return <UtensilsCrossed size={size} />;
    case "CUISINE":
      return <Globe size={size} />;
    case "COOKING_METHOD":
      return <Flame size={size} />;
    case "FOOD_STYLE":
      return <Sparkles size={size} />;
    case "TASTE":
      return <Flame size={size} />;
    case "TEXTURE":
      return <Sparkles size={size} />;
    default:
      return <SlidersHorizontal size={size} />;
  }
}

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
              {getFilterGroupIcon(group.code, 26)}
            </div>

            <div className="min-w-0">
              <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-accent-400">
                {group.labelKm}
              </p>

              <p className="mt-6 max-w-2xl text-xl leading-8 text-white/85">
                {group.descriptionKm}
              </p>
            </div>
          </div>

          <div className="mt-5 sm:mt-7 grid grid-cols-3 gap-2 sm:gap-3">
            <StatCard label="សរុប" value={total} />

            <StatCard label="សកម្ម" value={active} />

            <StatCard label="អសកម្ម" value={inactive} />
          </div>
        </div>

        <button
          type="button"
          onClick={onCreate}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-xl font-normal text-primary-800 shadow-sm transition hover:bg-primary-50 sm:w-fit"
        >
          <Plus size={22} />
          បន្ថែម{group.labelKm}
        </button>
      </div>
    </section>
  );
}

/* =========================================================
   COMPONENT 2: CATALOG TOOLBAR
   Suggested file: CatalogToolbar.tsx
========================================================= */

const CATALOG_SORT_LABELS: Record<SortMode, string> = {
  A_Z: "ឈ្មោះ (A-Z)",
  Z_A: "ឈ្មោះ (Z-A)",
  NEWEST: "ថ្មីបំផុត",
  OLDEST: "ចាស់បំផុត",
};

function CatalogToolbar({
  groupLabel,
  search,
  statusFilter,
  sortMode,
  size,
  sortOpen,
  sizeOpen,
  totalCount,
  activeCount,
  inactiveCount,
  onSearchChange,
  onClearSearch,
  onStatusChange,
  onSortOpenChange,
  onSizeOpenChange,
  onSortChange,
  onSizeChange,
  onReset,
}: {
  groupLabel: string;
  search: string;
  statusFilter: StatusFilter;
  sortMode: SortMode;
  size: number;
  sortOpen: boolean;
  sizeOpen: boolean;
  totalCount: number;
  activeCount: number;
  inactiveCount: number;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
  onStatusChange: (value: StatusFilter) => void;
  onSortOpenChange: (open: boolean) => void;
  onSizeOpenChange: (open: boolean) => void;
  onSortChange: (value: SortMode) => void;
  onSizeChange: (value: number) => void;
  onReset?: () => void;
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

  const hasActiveFilters = Boolean(
    search.trim() || statusFilter !== "ALL" || sortMode !== "NEWEST" || size !== 20,
  );

  return (
    <div className="space-y-3">
      <div className="flex w-full flex-wrap items-center justify-between gap-3">
        {/* Status Tabs (Left: 2x2 grid on mobile + Controls in slot 4) */}
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-2 w-full sm:w-auto">
          {statusTabs.map((tab) => {
            const active = tab.value === statusFilter;

            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => onStatusChange(tab.value)}
                className={`group relative flex w-full sm:w-auto h-12 cursor-pointer items-center justify-between sm:justify-start gap-2 sm:gap-2.5 rounded-full px-4 sm:px-5 text-lg font-normal transition-all duration-200 ease-out active:scale-95 ${
                  active
                    ? "border border-primary-800 bg-primary-800 text-white shadow-md shadow-primary-900/15"
                    : "border border-gray-200 bg-white text-gray-700 hover:border-primary-300 hover:bg-gray-50/80 hover:text-gray-900"
                }`}
              >
                <span className="truncate">{tab.label}</span>
                <span
                  className={`flex h-7 min-w-7 shrink-0 items-center justify-center rounded-full px-2 text-base sm:text-lg font-normal transition-colors duration-200 ${
                    active
                      ? "bg-white/20 text-white backdrop-blur-xs"
                      : "bg-gray-100 text-gray-600 group-hover:bg-primary-50 group-hover:text-primary-800"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}

          {/* Slot 4 on Mobile: Page Size + Sort */}
          <div className="flex sm:hidden items-center gap-1.5 w-full">
            {/* Page Size Select */}
            <div className="relative flex-1 min-w-0">
              <button
                type="button"
                onClick={() => onSizeOpenChange(!sizeOpen)}
                className={`flex h-12 w-full items-center justify-between gap-1.5 rounded-full border bg-white px-3 text-lg font-normal transition ${
                  sizeOpen
                    ? "border-primary-600 ring-2 ring-primary-100"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <span className="text-gray-700 truncate">{size} / ទំព័រ</span>
                <ChevronDown
                  size={18}
                  className={`shrink-0 text-gray-400 transition-transform duration-200 ${
                    sizeOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {sizeOpen && (
                <div className="absolute right-0 top-[52px] z-[110] w-[180px] rounded-2xl border border-gray-100 bg-white p-2 shadow-xl">
                  <p className="px-3 pb-2 pt-1 text-base text-secondary-600">
                    ទំហំទំព័រ
                  </p>
                  {[10, 20, 50, 100].map((pageSize) => (
                    <button
                      key={pageSize}
                      type="button"
                      onClick={() => {
                        onSizeChange(pageSize);
                        onSizeOpenChange(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-lg font-normal transition ${
                        size === pageSize
                          ? "bg-primary-50 text-primary-800"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <span>{pageSize} / ទំព័រ</span>
                      {size === pageSize && (
                        <Check size={18} className="text-primary-800" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => onSortOpenChange(!sortOpen)}
                className={`flex h-12 w-12 items-center justify-center rounded-full border transition ${
                  sortOpen
                    ? "border-primary-800 bg-primary-50 text-primary-800"
                    : "border-gray-200 bg-white text-gray-600 hover:border-primary-800 hover:bg-primary-50 hover:text-primary-800"
                }`}
                title="តម្រៀប"
              >
                <ArrowUpDown size={18} />
              </button>

              {sortOpen && (
                <div className="absolute right-0 top-[52px] z-[110] w-[200px] rounded-2xl border border-gray-100 bg-white p-2 shadow-xl">
                  <p className="px-3 pb-2 pt-1 text-base font-normal text-secondary-600">
                    តម្រៀប
                  </p>
                  {(Object.keys(CATALOG_SORT_LABELS) as SortMode[]).map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        onSortChange(key);
                        onSortOpenChange(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-lg font-normal transition ${
                        sortMode === key
                          ? "bg-primary-50 text-primary-800"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <span>{CATALOG_SORT_LABELS[key]}</span>
                      {sortMode === key && (
                        <Check size={18} className="text-primary-800" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Controls (Right): Search + Page Size + Sort + Reset */}
        <div className="hidden sm:flex sm:min-w-[320px] sm:flex-1 sm:items-center sm:justify-end sm:gap-2.5">
          {/* Search Input */}
          <div className="relative min-w-[220px] max-w-[360px] flex-1">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder={`ស្វែងរក${groupLabel}...`}
              className="h-12 w-full rounded-full border border-gray-200 bg-white py-2 pl-11 pr-10 text-lg font-normal text-gray-700 outline-none transition focus:border-primary-600 focus:ring-2 focus:ring-primary-100"
            />
            {search && (
              <button
                type="button"
                onClick={onClearSearch}
                className="absolute right-3 top-1/2 z-10 -translate-y-1/2 text-gray-400 transition hover:text-gray-700 cursor-pointer"
                aria-label="Clear search"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Page Size Select */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => onSizeOpenChange(!sizeOpen)}
              className={`flex h-12 min-w-[140px] items-center justify-between gap-2.5 rounded-full border bg-white px-4 text-lg font-normal transition ${
                sizeOpen
                  ? "border-primary-600 ring-2 ring-primary-100"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <span className="text-gray-700">{size} / ទំព័រ</span>
              <ChevronDown
                size={18}
                className={`text-gray-400 transition-transform duration-200 ${
                  sizeOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {sizeOpen && (
              <div className="absolute right-0 top-[52px] z-[110] w-[180px] rounded-2xl border border-gray-100 bg-white p-2 shadow-xl">
                <p className="px-3 pb-2 pt-1 text-base text-secondary-600">
                  ទំហំទំព័រ
                </p>
                {[10, 20, 50, 100].map((pageSize) => (
                  <button
                    key={pageSize}
                    type="button"
                    onClick={() => {
                      onSizeChange(pageSize);
                      onSizeOpenChange(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-lg font-normal transition ${
                      size === pageSize
                        ? "bg-primary-50 text-primary-800"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span>{pageSize} / ទំព័រ</span>
                    {size === pageSize && (
                      <Check size={18} className="text-primary-800" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => onSortOpenChange(!sortOpen)}
              className={`flex h-12 w-12 items-center justify-center rounded-full border transition ${
                sortOpen
                  ? "border-primary-800 bg-primary-50 text-primary-800"
                  : "border-gray-200 bg-white text-gray-600 hover:border-primary-800 hover:bg-primary-50 hover:text-primary-800"
              }`}
              title="តម្រៀប"
            >
              <ArrowUpDown size={18} />
            </button>

            {sortOpen && (
              <div className="absolute right-0 top-[52px] z-[110] w-[200px] rounded-2xl border border-gray-100 bg-white p-2 shadow-xl">
                <p className="px-3 pb-2 pt-1 text-base font-normal text-secondary-600">
                  តម្រៀប
                </p>
                {(Object.keys(CATALOG_SORT_LABELS) as SortMode[]).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      onSortChange(key);
                      onSortOpenChange(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-lg font-normal transition ${
                      sortMode === key
                        ? "bg-primary-50 text-primary-800"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span>{CATALOG_SORT_LABELS[key]}</span>
                    {sortMode === key && (
                      <Check size={18} className="text-primary-800" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Reset Filters Button */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onReset}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 active:scale-95 cursor-pointer"
              title="កំណត់ឡើងវិញ"
            >
              <RotateCcw size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Mobile Search Bar (Full Width Row) */}
      <div className="relative sm:hidden w-full">
        <Search
          size={18}
          className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={`ស្វែងរក${groupLabel}...`}
          className="h-12 w-full rounded-full border border-gray-200 bg-white py-2 pl-11 pr-10 text-lg font-normal text-gray-700 outline-none transition focus:border-primary-600 focus:ring-2 focus:ring-primary-100"
        />
        {search && (
          <button
            type="button"
            onClick={onClearSearch}
            className="absolute right-3 top-1/2 z-10 -translate-y-1/2 text-gray-400 transition hover:text-gray-700 cursor-pointer"
            aria-label="Clear search"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Mobile Reset Button */}
      {hasActiveFilters && (
        <div className="sm:hidden">
          <button
            type="button"
            onClick={onReset}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-red-200 bg-white px-5 text-lg font-normal text-red-600 transition hover:bg-red-50 active:scale-95"
          >
            <RotateCcw size={18} />
            <span>កំណត់ឡើងវិញ</span>
          </button>
        </div>
      )}
    </div>
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

function getOptionValueBadge(item: FilterCatalogOption) {
  if (
    [
      "MEAL_TIME",
      "FOOD_CATEGORY",
      "CUISINE",
      "SEASON",
      "EVENT",
      "COOKING_METHOD",
      "FOOD_STYLE",
      "TASTE",
      "TEXTURE",
    ].includes(item.groupCode || "")
  ) {
    return null;
  }

  if (
    item.numericValue !== null &&
    item.numericValue !== undefined &&
    String(item.numericValue).trim() !== ""
  ) {
    let unitLabel = item.unit || "";
    if (unitLabel === "MINUTE" || item.groupCode === "PREPARATION_TIME") {
      unitLabel = "នាទី";
    } else if (unitLabel === "KM" || item.groupCode === "DISTANCE") {
      unitLabel = "km";
    } else if (unitLabel === "LEVEL" || item.groupCode === "SPICE_LEVEL") {
      return `កម្រិត ${item.numericValue}`;
    }
    return `${item.numericValue} ${unitLabel}`.trim();
  }
  return null;
}

function CatalogTable({
  groupCode,
  groupLabel,
  items,
  onView,
  onEdit,
  onDelete,
  onRestore,
}: {
  groupCode: string;
  groupLabel: string;
  items: FilterCatalogOption[];
  onView: (item: FilterCatalogOption) => void;
  onEdit: (item: FilterCatalogOption) => void;
  onDelete: (item: FilterCatalogOption) => void;
  onRestore: (item: FilterCatalogOption) => void;
}) {
  const hasValueColumn = useMemo(() => {
    return ["PREPARATION_TIME", "DISTANCE", "SPICE_LEVEL"].includes(groupCode);
  }, [groupCode]);

  const hasDescriptionColumn = useMemo(() => {
    return groupCode !== "MEAL_TIME";
  }, [groupCode]);

  return (
    <div className="w-full min-w-0 max-w-full overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <table className="w-full min-w-[700px] table-auto border-collapse text-left">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/80 text-left text-xl font-medium text-primary-900">
            <th className="whitespace-nowrap px-4 py-4 font-medium">
              {groupLabel}
            </th>

            <th className="whitespace-nowrap px-4 py-4 font-medium">
              កូដ
            </th>

            {hasValueColumn && (
              <th className="whitespace-nowrap px-4 py-4 font-medium">
                តម្លៃ / ឯកតា
              </th>
            )}

            {hasDescriptionColumn && (
              <th className="whitespace-nowrap px-4 py-4 font-medium">
                ការពិពណ៌នា
              </th>
            )}

            <th className="whitespace-nowrap px-4 py-4 text-center font-medium">
              ស្ថានភាព
            </th>

            <th className="whitespace-nowrap px-4 py-4 text-center font-medium min-w-[120px]">
              សកម្មភាព
            </th>
          </tr>
        </thead>

        <tbody>
          {items.map((item) => {
            const valBadge = getOptionValueBadge(item);

            return (
              <tr
                key={item.uuid}
                className="border-b border-gray-100 bg-white transition-colors duration-150 last:border-b-0 hover:bg-gray-50/70"
              >
                {/* Name + Icon */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-primary-100 bg-primary-50 text-primary-800">
                      {getFilterGroupIcon(item.groupCode || groupCode)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-lg font-normal text-gray-800">
                        {item.localName || item.name}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Code */}
                <td className="whitespace-nowrap px-4 py-3">
                  <span className="inline-flex rounded-lg bg-gray-100 px-3 py-1 font-mono text-lg font-normal text-gray-700">
                    {item.code || "—"}
                  </span>
                </td>

                {/* Value / Unit */}
                {hasValueColumn && (
                  <td className="whitespace-nowrap px-4 py-3">
                    {valBadge ? (
                      <span className="inline-flex rounded-full bg-secondary-50 px-3.5 py-1 text-lg font-normal text-secondary-700 ring-1 ring-inset ring-secondary-100">
                        {valBadge}
                      </span>
                    ) : (
                      <span className="text-lg font-normal text-gray-400">—</span>
                    )}
                  </td>
                )}

                {/* Description */}
                {hasDescriptionColumn && (
                  <td className="max-w-[340px] px-4 py-3">
                    <p className="line-clamp-2 text-lg font-normal text-gray-500">
                      {item.description || "—"}
                    </p>
                  </td>
                )}

                {/* Status */}
                <td className="px-4 py-3 text-center">
                  <CatalogStatusBadge active={item.active} />
                </td>

             

                {/* Actions */}
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => onView(item)}
                      title="មើលព័ត៌មានលម្អិត"
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                    >
                      <Eye size={18} />
                    </button>

                    <button
                      type="button"
                      onClick={() => onEdit(item)}
                      title="កែប្រែ"
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-500 transition hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    >
                      <Pencil size={18} />
                    </button>

                    {item.active ? (
                      <button
                        type="button"
                        onClick={() => onDelete(item)}
                        title="បិទដំណើរការ"
                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 transition hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-100"
                      >
                        <MinusCircle size={18} />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onRestore(item)}
                        title="ស្ដារឡើងវិញ"
                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                      >
                        <RotateCcw size={18} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}

          {items.length === 0 && (
            <tr>
              <td
                colSpan={hasValueColumn ? 7 : 6}
                className="px-6 py-16 text-center"
              >
                <p className="text-xl font-medium text-gray-500">
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
  );
}


/* =========================================================
   COMPONENT 6: STATUS BADGE
   Suggested file: CatalogStatusBadge.tsx
========================================================= */

function CatalogStatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1 text-lg font-normal border ${
        active
          ? "border-emerald-100 bg-emerald-50 text-emerald-700"
          : "border-gray-200 bg-gray-50 text-gray-600"
      }`}
    >
      <span
        className={`h-2.5 w-2.5 shrink-0 rounded-full ${
          active ? "bg-emerald-500" : "bg-gray-400"
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
    <Pagination
      page={page}
      totalPages={totalPages}
      totalElements={totalElements}
      unit="ទិន្នន័យ"
      zeroIndexed={true}
      onPageChange={onPageChange}
      className="border-t border-gray-100"
    />
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
    <div className="fixed inset-0 z-[160] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-[3px]">
      <div className="w-full max-w-md rounded-3xl border border-gray-100 bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 text-amber-600">
            <MinusCircle size={28} />
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

        <p className="mt-5 text-2xl font-normal text-primary-800">
          បិទដំណើរការ {item.localName || item.name}?
        </p>

        <p className="mt-3 text-lg leading-8 font-normal text-gray-500">
          វានឹងប្តូរទៅជាអសកម្ម (Inactive) ហើយអាចស្ដារឡើងវិញបានគ្រប់ពេល។
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onClose}
            className="min-h-12 rounded-full border border-gray-200 px-4 text-lg font-normal text-gray-600 transition hover:bg-gray-50"
          >
            បោះបង់
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="min-h-12 rounded-full bg-amber-600 px-4 text-lg font-normal text-white transition hover:bg-amber-700"
          >
            បិទដំណើរការ
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
    <div className="rounded-2xl sm:rounded-3xl bg-white/20 px-3 py-2.5 sm:px-5 sm:py-4">
      <div className="flex items-center gap-1.5 sm:gap-2 text-lg sm:text-xl text-white/80">
        {icon}
        <span className="truncate">{label}</span>
      </div>

      <p className="mt-0.5 sm:mt-1 text-xl sm:text-2xl font-bold text-white tabular-nums">{value}</p>
    </div>
  );
}
