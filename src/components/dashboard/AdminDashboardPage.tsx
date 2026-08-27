"use client";

import { useCallback, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, Store, Users, Utensils } from "lucide-react";

import {
  DASHBOARD_OVERVIEW_POLLING_INTERVAL_MS,
  useGetDashboardCategoriesQuery,
  useGetDashboardItemsQuery,
  useGetDashboardLocationsQuery,
  useGetDashboardOverviewQuery,
  useGetDashboardStoresQuery,
} from "@/src/app/store/adminDashboardApi";
import { useGetFoodCategoriesQuery } from "@/src/app/store/foodCategoryApi";
import type { CustomSelectOption } from "@/src/components/ui/CustomSelect";
import {
  DEFAULT_DASHBOARD_FILTERS,
  DEFAULT_TABLE_PAGE_SIZE,
  dashboardFiltersToSearchParams,
  parseDashboardFilters,
  resolveDateRange,
} from "@/src/lib/dashboardFilters";
import { formatCount } from "./dashboard-theme";
import type {
  DashboardFilters,
  LocationSummary,
} from "@/src/types/adminDashboard";

import ActionItemsPanel from "./ActionItemsPanel";
import ActivityTrendChart from "./ActivityTrendChart";
import CategoryPerformanceChart from "./CategoryPerformanceChart";
import DashboardErrorState from "./DashboardErrorState";
import DashboardExportMenu from "./DashboardExportMenu";
import DashboardFilterBar from "./DashboardFilterBar";
import DashboardHeader from "./DashboardHeader";
import DashboardKpiGrid from "./DashboardKpiGrid";
import { KpiGridSkeleton } from "./DashboardLoadingSkeleton";
import LocationPerformanceChart from "./LocationPerformanceChart";
import PopularItemsTable from "./PopularItemsTable";
import TopStoresTable from "./TopStoresTable";

function uniqueSorted(values: (string | null | undefined)[]): string[] {
  return Array.from(
    new Set(values.filter((value): value is string => Boolean(value?.trim()))),
  ).sort((a, b) => a.localeCompare(b));
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters = useMemo<DashboardFilters>(
    () => parseDashboardFilters(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );

  const filterKey = searchParams.toString();

  const [pagination, setPagination] = useState({
    filterKey,
    storePage: 0,
    storeSize: DEFAULT_TABLE_PAGE_SIZE,
    itemPage: 0,
    itemSize: DEFAULT_TABLE_PAGE_SIZE,
  });

  // A filter change invalidates the page the user was on. Adjusting state
  // during render (rather than in an effect) keeps the very first query of
  // the new filter on page 0 instead of firing a throwaway request first.
  const paginationIsStale = pagination.filterKey !== filterKey;

  if (paginationIsStale) {
    setPagination((previous) => ({
      ...previous,
      filterKey,
      storePage: 0,
      itemPage: 0,
    }));
  }

  const storePage = paginationIsStale ? 0 : pagination.storePage;
  const itemPage = paginationIsStale ? 0 : pagination.itemPage;
  const storeSize = pagination.storeSize;
  const itemSize = pagination.itemSize;

  const setStorePage = useCallback(
    (page: number) => setPagination((previous) => ({ ...previous, storePage: page })),
    [],
  );

  const setItemPage = useCallback(
    (page: number) => setPagination((previous) => ({ ...previous, itemPage: page })),
    [],
  );

  const setStoreSize = useCallback(
    (size: number) =>
      setPagination((previous) => ({ ...previous, storeSize: size, storePage: 0 })),
    [],
  );

  const setItemSize = useCallback(
    (size: number) =>
      setPagination((previous) => ({ ...previous, itemSize: size, itemPage: 0 })),
    [],
  );

  const writeFilters = useCallback(
    (next: DashboardFilters) => {
      const params = dashboardFiltersToSearchParams(next).toString();
      router.replace(params ? `${pathname}?${params}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router],
  );

  const overview = useGetDashboardOverviewQuery(filters, {
    pollingInterval: DASHBOARD_OVERVIEW_POLLING_INTERVAL_MS,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const locations = useGetDashboardLocationsQuery(filters, {
    refetchOnFocus: true,
  });

  const categories = useGetDashboardCategoriesQuery(filters, {
    refetchOnFocus: true,
  });

  const stores = useGetDashboardStoresQuery(
    { ...filters, page: storePage, size: storeSize },
    { refetchOnFocus: true },
  );

  const items = useGetDashboardItemsQuery(
    { ...filters, page: itemPage, size: itemSize },
    { refetchOnFocus: true },
  );

  // Catalog categories drive the filter dropdown so the option list does not
  // collapse to the single category the dashboard is currently filtered by.
  const catalogCategories = useGetFoodCategoriesQuery({
    page: 0,
    size: 100,
    includeInactive: false,
  });

  const categoryOptions = useMemo<CustomSelectOption[]>(() => {
    const fromCatalog = (catalogCategories.data?.contents ?? []).map(
      (category) => ({
        value: category.code,
        label: category.name,
        description: category.code,
      }),
    );

    if (fromCatalog.length > 0) return fromCatalog;

    // Fallback: whatever the analytics response knows about.
    return (categories.data ?? []).map((category) => ({
      value: category.categoryCode,
      label: category.categoryName,
      description: category.categoryCode,
    }));
  }, [catalogCategories.data, categories.data]);

  const cityOptions = useMemo(
    () => uniqueSorted((locations.data ?? []).map((row) => row.city)),
    [locations.data],
  );

  const provinceOptions = useMemo(
    () => uniqueSorted((locations.data ?? []).map((row) => row.province)),
    [locations.data],
  );

  const isFetchingAny =
    overview.isFetching ||
    locations.isFetching ||
    categories.isFetching ||
    stores.isFetching ||
    items.isFetching;

  // Derived from the query itself — no effect, no extra render.
  const lastUpdatedLabel = useMemo(() => {
    if (!overview.fulfilledTimeStamp) return null;

    return new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(overview.fulfilledTimeStamp));
  }, [overview.fulfilledTimeStamp]);

  const refreshAll = useCallback(() => {
    void overview.refetch();
    void locations.refetch();
    void categories.refetch();
    void stores.refetch();
    void items.refetch();
  }, [overview, locations, categories, stores, items]);

  const applyLocation = useCallback(
    (location: LocationSummary) => {
      writeFilters({
        ...filters,
        city: location.city ?? undefined,
        province: location.city ? undefined : (location.province ?? undefined),
      });
    },
    [filters, writeFilters],
  );

  const fallbackRange = useMemo(
    () => resolveDateRange(filters),
    [filters],
  );

  const locationsData = useMemo(() => {
    if (locations.data && locations.data.length > 0) return locations.data;
    if (overview.data?.locationSummary && overview.data.locationSummary.length > 0)
      return overview.data.locationSummary;
    return [];
  }, [locations.data, overview.data?.locationSummary]);

  const categoriesData = useMemo(() => {
    if (categories.data && categories.data.length > 0) return categories.data;
    if (overview.data?.categorySummary && overview.data.categorySummary.length > 0)
      return overview.data.categorySummary;
    return [];
  }, [categories.data, overview.data?.categorySummary]);

  const isLocation404 =
    locations.isError &&
    (locations.error as { status?: number })?.status === 404;

  const isCategory404 =
    categories.isError &&
    (categories.error as { status?: number })?.status === 404;

  const showLocationError =
    locations.isError && !isLocation404 && locationsData.length === 0;

  const showCategoryError =
    categories.isError && !isCategory404 && categoriesData.length === 0;

  const activeLocationLabel = filters.city ?? filters.province ?? null;

  const headerSummary = useMemo(
    () => [
      {
        label: "អ្នកប្រើប្រាស់សរុប",
        value: formatCount(
          overview.data?.totalUsers ??
            (overview.data?.kpis?.activeUsers?.value as number) ??
            0,
        ),
        icon: <Users size={16} aria-hidden="true" />,
        tone: "blue" as const,
      },
      {
        label: "ហាងសកម្ម",
        value: formatCount(
          overview.data?.totalActiveStores ??
            (overview.data?.kpis?.activeStores?.value as number) ??
            0,
        ),
        icon: <Store size={16} aria-hidden="true" />,
        tone: "green" as const,
      },
      {
        label: "មុខម្ហូបសរុប",
        value: formatCount(
          overview.data?.totalMenuItems ??
            (overview.data?.kpis?.liveMenuItems?.value as number) ??
            0,
        ),
        icon: <Utensils size={16} aria-hidden="true" />,
        tone: "violet" as const,
      },
      {
        label: "ចំណុចត្រូវដោះស្រាយ",
        value: formatCount(
          (overview.data?.totalPendingStores ?? 0) +
            (overview.data?.totalSafetyBlocks ?? 0),
        ),
        icon: <AlertTriangle size={16} aria-hidden="true" />,
        tone: "amber" as const,
      },
    ],
    [overview.data],
  );

  const exportMenu = (
    <DashboardExportMenu filters={filters} disabled={overview.isLoading} />
  );

  return (
    <div className="space-y-5 pb-8">
      <DashboardHeader
        period={overview.data?.period ?? null}
        fallbackRange={fallbackRange}
        lastUpdatedLabel={lastUpdatedLabel}
        isFetching={isFetchingAny}
        onRefresh={refreshAll}
        summary={headerSummary}
      />

      <DashboardFilterBar
        filters={filters}
        onApply={writeFilters}
        onReset={() => writeFilters(DEFAULT_DASHBOARD_FILTERS)}
        categoryOptions={categoryOptions}
        cityOptions={cityOptions}
        provinceOptions={provinceOptions}
        isFetching={isFetchingAny}
        actions={exportMenu}
      />

      {overview.isError ? (
        <DashboardErrorState
          error={overview.error}
          onRetry={() => void overview.refetch()}
        />
      ) : overview.isLoading ? (
        <KpiGridSkeleton />
      ) : (
        <DashboardKpiGrid kpis={overview.data?.kpis ?? {}} />
      )}

      <ActivityTrendChart
        data={overview.data?.activityTrend ?? []}
        isLoading={overview.isLoading}
      />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        {showLocationError ? (
          <DashboardErrorState
            error={locations.error}
            title="មិនអាចផ្ទុកទិន្នន័យទីតាំងបានទេ"
            onRetry={() => void locations.refetch()}
            compact
          />
        ) : (
          <LocationPerformanceChart
            data={locationsData}
            isLoading={locations.isLoading && overview.isLoading}
            onSelectLocation={applyLocation}
            activeLocationLabel={activeLocationLabel}
          />
        )}

        {showCategoryError ? (
          <DashboardErrorState
            error={categories.error}
            title="មិនអាចផ្ទុកទិន្នន័យប្រភេទម្ហូបបានទេ"
            onRetry={() => void categories.refetch()}
            compact
          />
        ) : (
          <CategoryPerformanceChart
            data={categoriesData}
            isLoading={categories.isLoading && overview.isLoading}
          />
        )}
      </div>

      <ActionItemsPanel
        items={overview.data?.actionItems ?? []}
        isLoading={overview.isLoading}
      />

      <TopStoresTable
        page={stores.data}
        pageIndex={storePage}
        pageSize={storeSize}
        onPageChange={setStorePage}
        onPageSizeChange={setStoreSize}
        isLoading={stores.isLoading}
        isFetching={stores.isFetching}
        error={stores.isError ? stores.error : undefined}
        onRetry={() => void stores.refetch()}
      />

      <PopularItemsTable
        page={items.data}
        pageIndex={itemPage}
        pageSize={itemSize}
        onPageChange={setItemPage}
        onPageSizeChange={setItemSize}
        isLoading={items.isLoading}
        isFetching={items.isFetching}
        error={items.isError ? items.error : undefined}
        onRetry={() => void items.refetch()}
      />
    </div>
  );
}
