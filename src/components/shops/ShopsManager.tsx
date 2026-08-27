"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import {
  AlertCircle,
  AlertTriangle,
  ArrowUpDown,
  Check,
  CheckCircle2,
  ChevronDown,
  Filter,
  Loader2,
  RotateCcw,
  Search,
  Store,
  X,
} from "lucide-react";

import {
  shopApi,
  useDeleteShopMutation,
  useGetShopByUuidQuery,
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
import { getStoreLiveStatus, storeLogoCandidate } from "@/src/lib/shopFormat";
import CustomSelect from "../ui/CustomSelect";

import StoreMediaImage from "./detail/StoreMediaImage";
import DeleteShopConfirmModal from "./DeleteShopConfirmModal";
import ShopEditModal from "./ShopEditModal";
import ShopsHeader from "./ShopsHeader";
import ShopsPagination from "./ShopsPagination";
import ShopStatusModal from "./ShopStatusModal";
import ShopsTable from "./ShopsTable";
import ShopsTabs from "./ShopsTabs";

type StoreSort = "NAME_ASC" | "NAME_DESC" | "NEWEST" | "OLDEST";

const CITY_OPTIONS = [
  { value: "ALL", label: "រាជធានី-ខេត្តទាំងអស់" },
  { value: "Phnom Penh", label: "ភ្នំពេញ" },
  { value: "Banteay Meanchey", label: "បន្ទាយមានជ័យ" },
  { value: "Battambang", label: "បាត់ដំបង" },
  { value: "Kampong Cham", label: "កំពង់ចាម" },
  { value: "Kampong Chhnang", label: "កំពង់ឆ្នាំង" },
  { value: "Kampong Speu", label: "កំពង់ស្ពឺ" },
  { value: "Kampong Thom", label: "កំពង់ធំ" },
  { value: "Kampot", label: "កំពត" },
  { value: "Kandal", label: "កណ្ដាល" },
  { value: "Kep", label: "កែប" },
  { value: "Koh Kong", label: "កោះកុង" },
  { value: "Kratie", label: "ក្រចេះ" },
  { value: "Mondulkiri", label: "មណ្ឌលគិរី" },
  { value: "Oddar Meanchey", label: "ឧត្តរមានជ័យ" },
  { value: "Pailin", label: "ប៉ៃលិន" },
  { value: "Preah Sihanouk", label: "ព្រះសីហនុ" },
  { value: "Preah Vihear", label: "ព្រះវិហារ" },
  { value: "Prey Veng", label: "ព្រៃវែង" },
  { value: "Pursat", label: "ពោធិ៍សាត់" },
  { value: "Ratanakiri", label: "រតនគិរី" },
  { value: "Siem Reap", label: "សៀមរាប" },
  { value: "Stung Treng", label: "ស្ទឹងត្រែង" },
  { value: "Svay Rieng", label: "ស្វាយរៀង" },
  { value: "Takeo", label: "តាកែវ" },
  { value: "Tboung Khmum", label: "ត្បូងឃ្មុំ" },
];

const OPEN_OPTIONS = [
  { value: "ALL", label: "ស្ថានភាពហាងទាំងអស់" },
  { value: "OPEN", label: "កំពុងបើកដំណើរការ" },
  { value: "CLOSED_NOW", label: "បិទពេលនេះ" },
  { value: "TEMPORARILY_CLOSED", label: "បិទបណ្តោះអាសន្ន" },
  { value: "CLOSED", label: "បានបិទ" },
  { value: "PERMANENTLY_CLOSED", label: "បិទជាអចិន្ត្រៃយ៍" },
];

const SORT_OPTIONS: Array<{ value: StoreSort; label: string }> = [
  { value: "NEWEST", label: "ថ្មីបំផុត" },
  { value: "OLDEST", label: "ចាស់បំផុត" },
  { value: "NAME_ASC", label: "ឈ្មោះ (A → Z)" },
  { value: "NAME_DESC", label: "ឈ្មោះ (Z → A)" },
];

export default function ShopsManager() {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [sizeOpen, setSizeOpen] = useState(false);

  const [searchInput, setSearchInput] = useState("");
  const [serverQuery, setServerQuery] = useState("");
  const [suggestionQuery, setSuggestionQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionSelected, setSuggestionSelected] = useState(false);

  const [filter, setFilter] = useState<StoreReviewFilter>("ALL");
  const [cityFilter, setCityFilter] = useState<string>("ALL");
  const [openFilter, setOpenFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<StoreSort>("NEWEST");

  const [isPending, startTransition] = useTransition();
  const prefetchShops = shopApi.usePrefetch("getShops");

  const [editingUuid, setEditingUuid] = useState<string | null>(null);
  const [deletingStore, setDeletingStore] = useState<StoreType | null>(null);
  const [statusStore, setStatusStore] = useState<StoreType | null>(null);
  const [statusAction, setStatusAction] = useState<StoreStatusAction>("REVIEW");
  const [notice, setNotice] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => {
      setNotice(null);
    }, 4500);
    return () => clearTimeout(timer);
  }, [notice]);

  /* Main paginated list filtered by the active tab */
  const { data, error, isLoading, isFetching, refetch } = useGetShopsQuery({
    query: serverQuery || undefined,
    reviewStatus:
      filter === "APPROVED" || filter === "PENDING" || filter === "REJECTED"
        ? filter
        : undefined,
    accountStatus: filter === "APPROVED" ? "ACTIVE" : undefined,
    page,
    size,
  });

  const isSearching = Boolean(serverQuery);

  /* Background prefetch for instant tab switching with 0ms lag */
  const handlePrefetchTab = useCallback(
    (tabValue: StoreReviewFilter) => {
      if (isSearching) return;
      prefetchShops({
        reviewStatus:
          tabValue === "APPROVED" || tabValue === "PENDING" || tabValue === "REJECTED"
            ? tabValue
            : undefined,
        accountStatus: tabValue === "APPROVED" ? "ACTIVE" : undefined,
        page: 0,
        size,
      });
    },
    [isSearching, prefetchShops, size],
  );

  useEffect(() => {
    if (!isSearching) {
      prefetchShops({ reviewStatus: "APPROVED", accountStatus: "ACTIVE", page: 0, size });
      prefetchShops({ reviewStatus: "PENDING", page: 0, size });
      prefetchShops({ reviewStatus: "REJECTED", page: 0, size });
      prefetchShops({ page: 0, size });
    }
  }, [isSearching, prefetchShops, size]);

  const handleTabChange = useCallback((value: StoreReviewFilter) => {
    startTransition(() => {
      setFilter(value);
      setPage(0);
    });
  }, []);

  const { data: approvedData } = useGetShopsQuery(
    {
      reviewStatus: "APPROVED",
      accountStatus: "ACTIVE",
      page: 0,
      size: 1,
    },
    { skip: isSearching || filter === "APPROVED" },
  );

  const { data: pendingData } = useGetShopsQuery(
    {
      reviewStatus: "PENDING",
      page: 0,
      size: 100,
    },
    { skip: isSearching },
  );

  const { data: rejectedData } = useGetShopsQuery(
    {
      reviewStatus: "REJECTED",
      page: 0,
      size: 100,
    },
    { skip: isSearching },
  );

  const { data: suspendedData } = useGetShopsQuery(
    {
      accountStatus: "SUSPENDED",
      page: 0,
      size: 100,
    },
    { skip: isSearching },
  );

  const { data: archivedData } = useGetShopsQuery(
    {
      accountStatus: "ARCHIVED",
      page: 0,
      size: 100,
    },
    { skip: isSearching },
  );

  const { data: allData } = useGetShopsQuery(
    {
      page: 0,
      size: 1,
    },
    { skip: isSearching || filter === "ALL" },
  );

  const { data: suggestionData, isFetching: suggestionsLoading } =
    useGetShopsQuery(
      {
        query: suggestionQuery || undefined,
        page: 0,
        size: 8,
      },
      {
        skip: suggestionQuery.length < 2,
      },
    );

  const suggestions = suggestionData?.contents ?? [];

  const {
    data: editingStore,
    isFetching: editingStoreLoading,
    error: editingStoreError,
  } = useGetShopByUuidQuery(editingUuid ?? "", { skip: !editingUuid });

  const [updateShop, { isLoading: updating }] = useUpdateShopMutation();
  const [deleteShop, { isLoading: deleting }] = useDeleteShopMutation();

  useEffect(() => {
    const cleanValue = searchInput.trim();

    if (suggestionSelected) {
      return;
    }

    const timer = window.setTimeout(() => {
      if (cleanValue.length < 2) {
        setSuggestionQuery("");
        setShowSuggestions(false);
        setServerQuery("");
      } else {
        setSuggestionQuery(cleanValue);
        setShowSuggestions(true);
        setServerQuery(cleanValue);
      }
    }, 450);

    return () => window.clearTimeout(timer);
  }, [searchInput, suggestionSelected]);

  const rejectedUuids = useMemo(() => {
    const set = new Set<string>();
    rejectedData?.contents?.forEach((s) => s.uuid && set.add(s.uuid));
    return set;
  }, [rejectedData]);

  const pendingUuids = useMemo(() => {
    const set = new Set<string>();
    pendingData?.contents?.forEach((s) => s.uuid && set.add(s.uuid));
    return set;
  }, [pendingData]);

  const suspendedUuids = useMemo(() => {
    const set = new Set<string>();
    suspendedData?.contents?.forEach((s) => s.uuid && set.add(s.uuid));
    return set;
  }, [suspendedData]);

  const archivedUuids = useMemo(() => {
    const set = new Set<string>();
    archivedData?.contents?.forEach((s) => s.uuid && set.add(s.uuid));
    return set;
  }, [archivedData]);

  const rawStores = data?.contents ?? [];
  const stores = useMemo(() => {
    return rawStores.map((store) => {
      let reviewStatus = store.reviewStatus;
      if (filter === "REJECTED" || rejectedUuids.has(store.uuid)) {
        reviewStatus = "REJECTED";
      } else if (filter === "PENDING" || pendingUuids.has(store.uuid)) {
        reviewStatus = "PENDING";
      } else if (filter === "APPROVED") {
        reviewStatus = "APPROVED";
      } else if (!reviewStatus || reviewStatus === "UNKNOWN") {
        reviewStatus = "APPROVED";
      }

      let accountStatus = store.accountStatus;
      if (suspendedUuids.has(store.uuid)) {
        accountStatus = "SUSPENDED";
      } else if (archivedUuids.has(store.uuid)) {
        accountStatus = "ARCHIVED";
      } else if (filter === "APPROVED") {
        accountStatus = "ACTIVE";
      } else if (!accountStatus || accountStatus === "UNKNOWN") {
        accountStatus = "ACTIVE";
      }

      return {
        ...store,
        reviewStatus,
        accountStatus,
      };
    });
  }, [rawStores, filter, rejectedUuids, pendingUuids, suspendedUuids, archivedUuids]);

  /* Dynamic counts: Uses main query total for active tab and skips duplicate requests */
  const counts = {
    all: filter === "ALL" ? (data?.totalElements ?? 0) : (allData?.totalElements ?? 0),
    approved: filter === "APPROVED" ? (data?.totalElements ?? 0) : (approvedData?.totalElements ?? 0),
    pending: filter === "PENDING" ? (data?.totalElements ?? 0) : (pendingData?.totalElements ?? 0),
    rejected: filter === "REJECTED" ? (data?.totalElements ?? 0) : (rejectedData?.totalElements ?? 0),
  };

  const filteredStores = stores.filter((store) => {
    // City filter
    if (cityFilter !== "ALL") {
      const locationText = [store.city, store.province, store.addressLine].filter(Boolean).join(" ").toLowerCase();
      if (!locationText.includes(cityFilter.toLowerCase())) {
        return false;
      }
    }

    // Open/Close filter
    if (openFilter !== "ALL") {
      const live = getStoreLiveStatus(store);
      if (openFilter === "OPEN" && live.status !== "OPEN") {
        return false;
      }
      if (openFilter === "CLOSED_NOW" && live.status !== "CLOSED_NOW") {
        return false;
      }
      if (openFilter === "TEMPORARILY_CLOSED" && live.status !== "TEMPORARILY_CLOSED") {
        return false;
      }
      if (openFilter === "CLOSED" && live.status !== "CLOSED") {
        return false;
      }
      if (openFilter === "PERMANENTLY_CLOSED" && live.status !== "PERMANENTLY_CLOSED") {
        return false;
      }
    }

    return true;
  });

  const sortedStores = useMemo(() => {
    const list = [...filteredStores];

    switch (sortBy) {
      case "NAME_ASC":
        return list.sort((a, b) =>
          (a.storeName ?? "").localeCompare(b.storeName ?? "", undefined, {
            sensitivity: "base",
            numeric: true,
          }),
        );
      case "NAME_DESC":
        return list.sort((a, b) =>
          (b.storeName ?? "").localeCompare(a.storeName ?? "", undefined, {
            sensitivity: "base",
            numeric: true,
          }),
        );
      case "OLDEST": {
        const hasTimestamps = list.some((item) => Boolean(item.createdAt));
        if (hasTimestamps) {
          return list.sort((a, b) => {
            const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return timeA - timeB;
          });
        }
        return list.reverse();
      }
      case "NEWEST":
      default: {
        const hasTimestamps = list.some((item) => Boolean(item.createdAt));
        if (hasTimestamps) {
          return list.sort((a, b) => {
            const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return timeB - timeA;
          });
        }
        // Backend API returns sort: "createdAt,desc" by default, keep exact API order
        return list;
      }
    }
  }, [filteredStores, sortBy]);

  const hasActiveFilters = cityFilter !== "ALL" || openFilter !== "ALL";

  const handleResetFilters = () => {
    setCityFilter("ALL");
    setOpenFilter("ALL");
    setSortBy("NEWEST");
  };

  const handleSearch = () => {
    const cleanValue = searchInput.trim();
    setPage(0);
    setServerQuery(cleanValue);
    setSuggestionQuery("");
    setShowSuggestions(false);
  };

  const handleSelectSuggestion = (store: StoreType) => {
    setSuggestionSelected(true);
    setSearchInput(store.storeName);
    setServerQuery(store.storeName);
    setSuggestionQuery("");
    setShowSuggestions(false);
    setPage(0);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setServerQuery("");
    setSuggestionQuery("");
    setSuggestionSelected(false);
    setShowSuggestions(false);
    setPage(0);
  };

  const edit = async (values: UpdateStorePayload) => {
    if (!editingUuid) return;
    try {
      setNotice(null);
      await updateShop({ storeUuid: editingUuid, body: values }).unwrap();
      setEditingUuid(null);
      setNotice({ type: "success", text: "បានកែប្រែ Store ដោយជោគជ័យ។" });
    } catch (requestError) {
      throw requestError;
    }
  };

  const handleDelete = async () => {
    if (!deletingStore) return;
    try {
      setNotice(null);
      await deleteShop(deletingStore.uuid).unwrap();
      setDeletingStore(null);
      setNotice({ type: "success", text: "បានលុបហាងដោយជោគជ័យ។" });
    } catch (requestError) {
      setNotice({ type: "error", text: getShopApiErrorMessage(requestError) });
    }
  };

  return (
    <div className="space-y-5">
      <ShopsHeader
        total={counts.all}
        approved={counts.approved}
        pending={counts.pending}
        rejected={counts.rejected}
      />

      {/* 2-ROW TOOLBAR */}
      <div className="space-y-3">
        {/* ROW 1: Status Tabs (Left) + Search Input (Middle) + Page Size (Right) */}
        <div className="flex w-full flex-wrap items-center justify-between gap-3">
          <div className="shrink-0">
            <ShopsTabs
              value={filter}
              counts={counts}
              onChange={handleTabChange}
              onPrefetch={handlePrefetchTab}
            />
          </div>

          <div className="flex flex-1 items-center justify-end gap-3 min-w-[320px]">
            {/* Search Input */}
            <div className="relative flex-1 max-w-[440px]">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-gray-400"
              />
              <input
                value={searchInput}
                onChange={(event) => {
                  const value = event.target.value;
                  setSearchInput(value);
                  setSuggestionSelected(false);
                  setPage(0);
                  setShowSuggestions(value.trim().length >= 2);
                }}
                onFocus={() => {
                  if (searchInput.trim().length >= 2 && !suggestionSelected) {
                    setShowSuggestions(true);
                  }
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") handleSearch();
                  if (event.key === "Escape") setShowSuggestions(false);
                }}
                placeholder="ស្វែងរកហាង (ឈ្មោះ, ទីតាំង)..."
                className="h-12 w-full rounded-2xl border border-gray-200 bg-white py-2.5 pl-12 pr-10 text-lg text-gray-700 outline-none transition focus:border-primary-600 focus:ring-2 focus:ring-primary-100"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3.5 top-1/2 z-10 -translate-y-1/2 text-gray-400 transition hover:text-gray-700"
                  aria-label="Clear search"
                >
                  <X size={18} />
                </button>
              )}

              {showSuggestions && searchInput.trim().length >= 2 && (
                <div className="absolute left-0 top-[52px] z-[100] w-full overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl">
                  {suggestionsLoading ? (
                    <div className="flex items-center justify-center gap-2 px-5 py-6 text-lg text-gray-500">
                      <Loader2 size={20} className="animate-spin text-primary-800" />
                      កំពុងស្វែងរក...
                    </div>
                  ) : suggestions.length === 0 ? (
                    <div className="px-5 py-6 text-center">
                      <Store size={32} className="mx-auto text-amber-500" />
                      <p className="mt-1 text-lg font-semibold text-amber-600">មិនមានហាងដែលត្រូវគ្នា</p>
                    </div>
                  ) : (
                    <>
                      <div className="border-b border-gray-100 px-4 py-2.5 bg-gray-50">
                        <p className="text-base font-bold text-gray-500 uppercase">លទ្ធផលស្វែងរក</p>
                      </div>
                      <div className="max-h-[300px] overflow-y-auto p-1.5">
                        {suggestions.map((store) => {
                          const logoCandidate = storeLogoCandidate(store);

                          return (
                            <button
                              key={store.uuid}
                              type="button"
                              onMouseDown={(event) => event.preventDefault()}
                              onClick={() => handleSelectSuggestion(store)}
                              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition hover:bg-emerald-50"
                            >
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-primary-100 bg-primary-50 text-primary-800">
                                {logoCandidate ? (
                                  <StoreMediaImage
                                    mediaUuid={logoCandidate}
                                    alt={`${store.storeName} logo`}
                                    className="h-full w-full object-cover"
                                    fallbackIcon={<Store size={20} />}
                                  />
                                ) : (
                                  <Store size={20} />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-lg font-bold text-gray-800">{store.storeName}</p>
                                <p className="truncate text-base text-gray-400">
                                  {[store.addressLine, store.city].filter(Boolean).join(", ") || "No address"}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Page Size Select */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setSizeOpen((c) => !c)}
                className={`flex h-12 min-w-[135px] items-center justify-between gap-2.5 rounded-2xl border bg-white px-4 text-lg font-semibold transition ${
                  sizeOpen ? "border-primary-600 ring-2 ring-primary-100" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <span className="text-gray-700">{size} / ទំព័រ</span>
                <ChevronDown size={18} className={`text-gray-400 transition-transform duration-200 ${sizeOpen ? "rotate-180" : ""}`} />
              </button>
              {sizeOpen && (
                <div className="absolute right-0 top-[52px] z-[110] w-[180px] rounded-2xl border border-gray-100 bg-white p-1.5 shadow-xl">
                  <p className="px-3 py-1.5 text-base font-semibold text-gray-400">ចំនួនក្នុងទំព័រ</p>
                  {[10, 20, 50].map((value) => {
                    const selected = size === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => { setSize(value); setPage(0); setSizeOpen(false); }}
                        className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-lg font-semibold transition ${selected ? "bg-primary-50 text-primary-800" : "text-gray-700 hover:bg-gray-50"
                          }`}
                      >
                        <span>{value} / ទំព័រ</span>
                        {selected && <Check size={18} className="text-primary-800" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ROW 2: Filter Controls (City, Open/Close, Sort, Reset) */}
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-gray-100 bg-white p-3 shadow-xs">
          <div className="flex items-center gap-2 px-1 text-lg font-semibold text-gray-700 shrink-0">
            <Filter size={18} className="text-primary-800" />
            <span>តម្រងស្វែងរក:</span>
          </div>

          {/* City Filter */}
          <div className="min-w-[170px] flex-1 sm:flex-none">
            <CustomSelect
              value={cityFilter}
              onChange={(val) => { setCityFilter(val); setPage(0); }}
              options={CITY_OPTIONS}
              placeholder="ក្រុង/ខេត្ត"
            />
          </div>

          {/* Open/Close Filter */}
          <div className="min-w-[170px] flex-1 sm:flex-none">
            <CustomSelect
              value={openFilter}
              onChange={(val) => { setOpenFilter(val); setPage(0); }}
              options={OPEN_OPTIONS}
              placeholder="បើក/បិទ"
            />
          </div>

          {/* Sort By Filter */}
          <div className="min-w-[170px] flex-1 sm:flex-none ml-auto">
            <CustomSelect
              value={sortBy}
              onChange={(val) => setSortBy(val as StoreSort)}
              options={SORT_OPTIONS}
              placeholder="តម្រៀបតាម"
            />
          </div>

          {/* Reset Filters Button */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex h-12 items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 text-lg font-semibold text-amber-700 transition hover:bg-amber-100 active:scale-95 shrink-0"
              title="សម្អាតតម្រងទាំងអស់"
            >
              <RotateCcw size={18} />
              <span>សម្អាតតម្រង</span>
            </button>
          )}
        </div>
      </div>



      {/* FLOATING TOAST NOTIFICATION (MATCHING USER MANAGEMENT) */}
      {notice && (
        <div className="fixed top-6 right-6 z-[9999] pointer-events-none flex max-w-md animate-in fade-in slide-in-from-top-5 duration-300">
          <div
            className={`pointer-events-auto flex items-center gap-3 rounded-2xl border px-4 py-3.5 shadow-2xl backdrop-blur-md transition-all ${
              notice.type === "success"
                ? "border-emerald-200 bg-white/95 text-emerald-950 shadow-emerald-500/10"
                : "border-red-200 bg-white/95 text-red-950 shadow-red-500/10"
            }`}
          >
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                notice.type === "success"
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-red-50 text-red-600"
              }`}
            >
              {notice.type === "success" ? (
                <CheckCircle2 size={20} />
              ) : (
                <AlertCircle size={20} />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-lg font-semibold leading-relaxed">
                {notice.text}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setNotice(null)}
              className="ml-2 flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      <section className="relative overflow-hidden rounded-[24px] border border-gray-100 bg-white shadow-sm transition-all duration-300">
        {/* Subtle animated top loading indicator */}
        {(isFetching || isPending) && !isLoading && (
          <div className="absolute top-0 left-0 right-0 z-20 h-1 w-full overflow-hidden bg-primary-100/60">
            <div className="h-full w-full bg-primary-700 animate-pulse transition-all duration-300" />
          </div>
        )}

        {isLoading ? (
          <div className="flex min-h-[360px] items-center justify-center">
            <Loader2 size={30} className="animate-spin text-[#137A3D]" />
          </div>
        ) : error ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center">
            <AlertTriangle size={38} className="text-red-400" />
            <p className="mt-4 text-xl font-black text-gray-900">មិនអាចទាញយក Store បានទេ</p>
            <p className="mt-2 text-base text-gray-500">{getShopApiErrorMessage(error)}</p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="mt-5 rounded-xl bg-[#137A3D] px-4 py-2.5 text-lg text-white"
            >
              សាកល្បងម្តងទៀត
            </button>
          </div>
        ) : sortedStores.length === 0 ? (
          <div className="flex min-h-[340px] flex-col items-center justify-center">
            <Store size={60} className="text-[#F97316]" />
            <p className="mt-3 text-2xl text-[#F97316]">មិនមាន Store</p>
          </div>
        ) : (
          <div className={`transition-opacity duration-200 ${isPending || isFetching ? "opacity-75" : "opacity-100"}`}>
            <ShopsTable
              stores={sortedStores}
              disabled={updating || deleting || isFetching}
              onEdit={(store) => setEditingUuid(store.uuid)}
              onStatus={(store, action) => { setStatusStore(store); setStatusAction(action); }}
              onDelete={(store) => setDeletingStore(store)}
            />
          </div>
        )}

        {!isLoading && !error && (
          <ShopsPagination
            page={data?.pageNumber ?? page}
            totalPages={data?.totalPages ?? 0}
            totalElements={data?.totalElements ?? 0}
            disabled={isFetching || isPending}
            onPageChange={setPage}
          />
        )}
      </section>

      {editingUuid && !editingStore && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[3px]">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-2xl">
            {editingStoreError ? (
              <>
                <AlertTriangle size={32} className="mx-auto text-red-500" />
                <p className="mt-4 text-lg text-gray-700">{getShopApiErrorMessage(editingStoreError)}</p>
                <button
                  type="button"
                  onClick={() => setEditingUuid(null)}
                  className="mt-6 h-11 rounded-full bg-primary-800 px-6 text-lg font-medium text-white"
                >
                  បិទ
                </button>
              </>
            ) : (
              <>
                <Loader2 size={32} className="mx-auto animate-spin text-[#137A3D]" />
                <p className="mt-4 text-lg text-gray-500">កំពុងទាញយកព័ត៌មានហាង...</p>
              </>
            )}
          </div>
        </div>
      )}

      <ShopEditModal
        store={editingUuid ? (editingStore ?? null) : null}
        saving={updating || editingStoreLoading}
        onClose={() => { if (!updating) setEditingUuid(null); }}
        onSubmit={edit}
      />

      <ShopStatusModal
        store={statusStore}
        initialAction={statusAction}
        onClose={() => setStatusStore(null)}
        onChanged={async () => { await refetch(); }}
      />

      <DeleteShopConfirmModal
        store={deletingStore}
        open={Boolean(deletingStore)}
        loading={deleting}
        onClose={() => { if (!deleting) setDeletingStore(null); }}
        onConfirm={handleDelete}
      />
    </div>
  );
}
