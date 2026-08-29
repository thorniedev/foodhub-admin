"use client";

import { useCallback, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Layers, MapPin } from "lucide-react";

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
import type {
  DashboardFilters,
  LocationSummary,
} from "@/src/types/adminDashboard";

import { isEndpointUnavailable } from "@/src/lib/adminApiError";

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
import SectionCard from "./SectionCard";
import TopStoresTable from "./TopStoresTable";
import DashboardUnavailableState from "./DashboardUnavailableState";

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

  // A 404 used to be folded into the chart's "no data" state, which reported a
  // missing endpoint as an empty result. Surface it as its own state instead so
  // an outdated backend is visible rather than silently shown as zero activity.
  const locationUnavailable =
    locations.isError &&
    isEndpointUnavailable(locations.error) &&
    locationsData.length === 0;

  const categoryUnavailable =
    categories.isError &&
    isEndpointUnavailable(categories.error) &&
    categoriesData.length === 0;

  const showLocationError =
    locations.isError && !locationUnavailable && locationsData.length === 0;

  const showCategoryError =
    categories.isError && !categoryUnavailable && categoriesData.length === 0;

  const activeLocationLabel = filters.city ?? filters.province ?? null;

  const exportMenu = (
    <DashboardExportMenu filters={filters} disabled={overview.isLoading} />
  );

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 bg-muted/30 pb-12">
      <div className="order-1">
        <DashboardHeader
          period={overview.data?.period ?? null}
        fallbackRange={fallbackRange}
        lastUpdatedLabel={lastUpdatedLabel}
        isFetching={isFetchingAny}
          onRefresh={refreshAll}
        />
      </div>

      <div className="order-2">
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
      </div>

      <div className="order-4">
        <ActivityTrendChart
        data={overview.data?.activityTrend ?? []}
          isLoading={overview.isLoading}
        />
      </div>

      <div className="order-3 grid grid-cols-1 gap-5 xl:grid-cols-2">
        {locationUnavailable ? (
          <SectionCard
            title="សមិទ្ធកម្មតាមទីតាំង"
            icon={<MapPin size={18} aria-hidden="true" />}
            tone="amber"
          >
            <DashboardUnavailableState
              reportName="សមិទ្ធកម្មតាមទីតាំង"
              onRetry={() => void locations.refetch()}
              compact
            />
          </SectionCard>
        ) : showLocationError ? (
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

        {categoryUnavailable ? (
          <SectionCard
            title="សមិទ្ធកម្មតាមប្រភេទម្ហូប"
            icon={<Layers size={18} aria-hidden="true" />}
            tone="amber"
          >
            <DashboardUnavailableState
              reportName="សមិទ្ធកម្មតាមប្រភេទម្ហូប"
              onRetry={() => void categories.refetch()}
              compact
            />
          </SectionCard>
        ) : showCategoryError ? (
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

      <div className="order-5 rounded-xl border border-border/70 bg-card p-1 shadow-none">
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
