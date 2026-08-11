"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowUpDown,
  Check,
  ChevronDown,
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

type StoreSort = "NAME_ASC" | "NAME_DESC" | "NEWEST" | "OLDEST";

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
  const [sortBy, setSortBy] = useState<StoreSort>("NAME_ASC");
  const [sortOpen, setSortOpen] = useState(false);

  const [editing, setEditing] = useState<StoreType | null>(null);
  const [statusStore, setStatusStore] = useState<StoreType | null>(null);
  const [statusAction, setStatusAction] = useState<StoreStatusAction>("REVIEW");
  const [notice, setNotice] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const {
    data,
    error,
    isLoading,
    isFetching,
    refetch,
  } = useGetShopsQuery({
    query: serverQuery || undefined,
    page,
    size,
  });

  const {
    data: suggestionData,
    isFetching: suggestionsLoading,
  } = useGetShopsQuery(
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

  const [updateShop, { isLoading: updating }] = useUpdateShopMutation();

  useEffect(() => {
    const cleanValue = searchInput.trim();

    if (suggestionSelected) {
      return;
    }

    if (cleanValue.length < 2) {
      setSuggestionQuery("");
      setShowSuggestions(false);
      return;
    }

    const timer = window.setTimeout(() => {
      setSuggestionQuery(cleanValue);
      setShowSuggestions(true);
    }, 350);

    return () => window.clearTimeout(timer);
  }, [searchInput, suggestionSelected]);

  const stores = data?.contents ?? [];

  const counts = {
    all: stores.length,
    pending: stores.filter((store) => store.reviewStatus === "PENDING").length,
    approved: stores.filter((store) => store.reviewStatus === "APPROVED").length,
    rejected: stores.filter((store) => store.reviewStatus === "REJECTED").length,
  };

  const filteredStores =
    filter === "ALL"
      ? stores
      : stores.filter((store) => store.reviewStatus === filter);

  const sortedStores = [...filteredStores].sort((first, second) => {
    switch (sortBy) {
      case "NAME_ASC":
        return (first.storeName ?? "").localeCompare(second.storeName ?? "", undefined, {
          sensitivity: "base",
        });
      case "NAME_DESC":
        return (second.storeName ?? "").localeCompare(first.storeName ?? "", undefined, {
          sensitivity: "base",
        });
      case "NEWEST": {
        const firstTime = first.createdAt ? new Date(first.createdAt).getTime() : 0;
        const secondTime = second.createdAt ? new Date(second.createdAt).getTime() : 0;
        return secondTime - firstTime;
      }
      case "OLDEST": {
        const firstTime = first.createdAt ? new Date(first.createdAt).getTime() : 0;
        const secondTime = second.createdAt ? new Date(second.createdAt).getTime() : 0;
        return firstTime - secondTime;
      }
      default:
        return 0;
    }
  });

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
    if (!editing) return;

    try {
      setNotice(null);
      await updateShop({ storeUuid: editing.uuid, body: values }).unwrap();
      setEditing(null);
      setNotice({ type: "success", text: "បានកែប្រែ Store ដោយជោគជ័យ។" });
      await refetch();
    } catch (requestError) {
      setNotice({ type: "error", text: getShopApiErrorMessage(requestError) });
    }
  };

  const sortOptions: Array<{ value: StoreSort; label: string }> = [
    { value: "NAME_ASC", label: "A → Z" },
    { value: "NAME_DESC", label: "Z → A" },
    { value: "NEWEST", label: "ថ្មីបំផុត" },
    { value: "OLDEST", label: "ចាស់បំផុត" },
  ];

  return (
    <div className="space-y-5">
      <ShopsHeader
        total={data?.totalElements ?? 0}
        approved={counts.approved}
        pending={counts.pending}
      />

      <div className="flex w-full flex-nowrap items-center justify-between gap-4">
        <div className="shrink-0">
          <ShopsTabs
            value={filter}
            counts={counts}
            onChange={(value) => {
              setFilter(value);
              setPage(0);
            }}
          />
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <div className="relative">
            <Search
              size={17}
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
              placeholder="ស្វែងរកហាង..."
              className="h-11 w-[500px] rounded-2xl border border-gray-200 bg-white py-2 pl-11 pr-10 text-lg text-gray-700 outline-none transition focus:border-[#137A3D] focus:ring-2 focus:ring-[#137A3D]/10"
            />

            {searchInput && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 z-10 -translate-y-1/2 text-gray-400 transition hover:text-gray-700"
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}

            {showSuggestions && searchInput.trim().length >= 2 && (
              <div className="absolute left-0 top-[52px] z-[100] w-[500px] overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_18px_50px_rgba(0,0,0,0.13)]">
                {suggestionsLoading ? (
                  <div className="flex items-center justify-center gap-2 px-5 py-6 text-lg text-gray-500">
                    <Loader2 size={20} className="animate-spin text-[#137A3D]" />
                    កំពុងស្វែងរក...
                  </div>
                ) : suggestions.length === 0 ? (
                  <div className="px-5 py-6 text-center">
                    <Store size={32} className="mx-auto text-[#F97316]" />
                    <p className="mt-2 text-lg text-[#F97316]">
                      មិនមានហាងដែលត្រូវគ្នា
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="border-b border-gray-100 px-5 py-3">
                      <p className="text-lg uppercase tracking-wide text-[#F97316]">
                        លទ្ធផលស្វែងរក
                      </p>
                    </div>

                    <div className="max-h-[340px] overflow-y-auto p-2">
                      {suggestions.map((store) => (
                        <button
                          key={store.uuid}
                          type="button"
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => handleSelectSuggestion(store)}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-emerald-50"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-[#137A3D]">
                            <Store size={24} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-base font-black text-gray-800">
                              {store.storeName}
                            </p>
                            <p className="mt-1 truncate text-sm text-gray-400">
                              {[store.addressLine, store.city].filter(Boolean).join(", ") || "No address"}
                            </p>
                          </div>

                          <span className="shrink-0 rounded-full bg-gray-100 px-2 py-1 text-sm font-semibold text-gray-500">
                            {store.reviewStatus || "UNKNOWN"}
                          </span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setSizeOpen((current) => !current);
                setSortOpen(false);
              }}
              className={`flex h-11 min-w-[125px] items-center justify-between gap-3 rounded-2xl border bg-white px-4 text-sm font-semibold transition ${
                sizeOpen
                  ? "border-[#137A3D] ring-2 ring-[#137A3D]/10"
                  : "border-gray-200 hover:border-[#137A3D]/50"
              }`}
            >
              <span className="text-gray-700">{size} / ទំព័រ</span>
              <ChevronDown
                size={17}
                className={`text-gray-400 transition-transform duration-200 ${
                  sizeOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {sizeOpen && (
              <div className="absolute right-0 top-[52px] z-[100] w-[160px] rounded-2xl border border-gray-100 bg-white p-2 shadow-[0_15px_45px_rgba(0,0,0,0.12)]">
                <p className="px-3 pb-2 pt-1 text-lg text-[#F97316]">ចំនួនក្នុងទំព័រ</p>
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
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-base font-semibold transition ${
                        selected
                          ? "bg-emerald-50 text-[#137A3D]"
                          : "text-gray-600 hover:bg-gray-50 hover:text-[#137A3D]"
                      }`}
                    >
                      <span>{value} / ទំព័រ</span>
                      {selected && <Check size={16} className="text-[#137A3D]" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setSortOpen((current) => !current);
                setSizeOpen(false);
              }}
              className={`flex h-11 w-11 items-center justify-center rounded-2xl border transition ${
                sortOpen
                  ? "border-[#137A3D] bg-emerald-50 text-[#137A3D]"
                  : "border-gray-200 bg-white text-gray-600 hover:border-[#137A3D] hover:bg-emerald-50 hover:text-[#137A3D]"
              }`}
              aria-label="Sort stores"
              title="Sort stores"
            >
              <ArrowUpDown size={18} />
            </button>

            {sortOpen && (
              <div className="absolute right-0 top-[52px] z-[100] w-[190px] rounded-2xl border border-gray-100 bg-white p-2 shadow-[0_15px_45px_rgba(0,0,0,0.12)]">
                <p className="px-3 pb-2 pt-1 text-lg uppercase tracking-wide text-[#F97316]">
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
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-base font-semibold transition ${
                        selected
                          ? "bg-emerald-50 text-[#137A3D]"
                          : "text-gray-600 hover:bg-gray-50 hover:text-[#137A3D]"
                      }`}
                    >
                      <span>{option.label}</span>
                      {selected && <Check size={16} className="text-[#137A3D]" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {serverQuery && (
        <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-base text-emerald-700">
          ស្វែងរក: <b>“{serverQuery}”</b>
          <button
            type="button"
            onClick={handleClearSearch}
            className="ml-3 font-black underline"
          >
            សម្អាត
          </button>
        </div>
      )}

      {notice && (
        <div
          className={`rounded-2xl border px-4 py-3 text-base ${
            notice.type === "success"
              ? "border-emerald-100 bg-emerald-50 text-emerald-700"
              : "border-red-100 bg-red-50 text-red-600"
          }`}
        >
          {notice.text}
        </div>
      )}

      <section className="overflow-visible rounded-[24px] border border-gray-100 bg-white shadow-sm">
        {isLoading ? (
          <div className="flex min-h-[360px] items-center justify-center">
            <Loader2 size={30} className="animate-spin text-[#137A3D]" />
          </div>
        ) : error ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center">
            <AlertTriangle size={38} className="text-red-400" />
            <h3 className="mt-4 text-xl font-black">មិនអាចទាញយក Store បានទេ</h3>
            <p className="mt-2 text-base text-gray-500">
              {getShopApiErrorMessage(error)}
            </p>
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
            <Store size={42} className="text-[#F97316]" />
            <p className="mt-3 text-lg text-[#F97316]">មិនមាន Store</p>
          </div>
        ) : (
          <ShopsTable
            stores={sortedStores}
            disabled={updating || isFetching}
            onEdit={setEditing}
            onStatus={(store, action) => {
              setStatusStore(store);
              setStatusAction(action);
            }}
          />
        )}

        {!isLoading && !error && (
          <ShopsPagination
            page={data?.pageNumber ?? page}
            totalPages={data?.totalPages ?? 0}
            totalElements={data?.totalElements ?? 0}
            disabled={isFetching}
            onPageChange={setPage}
          />
        )}
      </section>

      <ShopEditModal
        store={editing}
        saving={updating}
        onClose={() => {
          if (!updating) setEditing(null);
        }}
        onSubmit={edit}
      />

      <ShopStatusModal
        store={statusStore}
        initialAction={statusAction}
        onClose={() => setStatusStore(null)}
        onChanged={async () => {
          await refetch();
        }}
      />
    </div>
  );
}
