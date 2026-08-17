"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Search,
  RefreshCw,
  Store,
  Utensils,
  User,
  Package,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

import {
  useAdminGlobalSearchQuery,
  useReindexSearchMutation,
} from "@/src/app/store/adminSearchApi";
import type { AdminEntityType, AdminSearchResultItem } from "@/src/types/adminSearch";

import { useMemo } from "react";
import { useGetShopsQuery } from "@/src/app/store/shop/shopApi";
import { useGetAdminUsersQuery } from "@/src/app/store/userProfileApi";
import { useGetManagedFoodsQuery } from "@/src/app/store/menuManagementApi";

export default function GlobalAdminSearch() {
  const [inputQuery, setInputQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<AdminEntityType | "ALL">("ALL");
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Debounce search query input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(inputQuery.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [inputQuery]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const typesFilter = selectedType !== "ALL" ? [selectedType] : undefined;

  const { data, isFetching } = useAdminGlobalSearchQuery(
    { query: debouncedQuery, types: typesFilter, page: 0, size: 12 },
    { skip: debouncedQuery.length < 2 },
  );

  const shouldSkipFallback = debouncedQuery.length < 2;

  const { data: fallbackShops, isFetching: fallbackShopsLoading } = useGetShopsQuery(
    { query: debouncedQuery, page: 0, size: 100 },
    { skip: shouldSkipFallback || (selectedType !== "ALL" && selectedType !== "STORE") },
  );

  const { data: fallbackUsers, isFetching: fallbackUsersLoading } = useGetAdminUsersQuery(
    { query: debouncedQuery, page: 0, size: 100 },
    { skip: shouldSkipFallback || (selectedType !== "ALL" && selectedType !== "USER") },
  );

  const { data: fallbackFoods, isFetching: fallbackFoodsLoading } = useGetManagedFoodsQuery(
    { query: debouncedQuery, page: 0, size: 100 },
    { skip: shouldSkipFallback || (selectedType !== "ALL" && selectedType !== "FOOD" && selectedType !== "MENU_ITEM") },
  );

  const primaryResults = data?.results ?? [];

  const fallbackResults = useMemo(() => {
    const list: AdminSearchResultItem[] = [];
    const q = debouncedQuery.toLowerCase();

    if (fallbackShops?.contents) {
      fallbackShops.contents.forEach((shop) => {
        const storeName = shop.storeName || "";
        const address = shop.addressLine || shop.city || "";
        const combinedText = `${storeName} ${address}`.toLowerCase();

        if (combinedText.includes(q)) {
          list.push({
            uuid: shop.uuid,
            type: "STORE",
            title: storeName || "Store",
            subtitle: address || undefined,
            status: shop.operatingStatus || shop.reviewStatus || undefined,
            targetUrl: `/shops/${shop.uuid}`,
          });
        }
      });
    }

    if (fallbackUsers?.contents) {
      fallbackUsers.contents.forEach((userItem) => {
        const u = userItem as unknown as Record<string, unknown>;
        const username = String(u.username || "");
        const fullName = String(u.fullName || u.name || "");
        const firstName = String(u.firstName || "");
        const lastName = String(u.lastName || "");
        const email = String(u.email || "");

        const combinedText = `${username} ${fullName} ${firstName} ${lastName} ${email}`.toLowerCase();

        if (combinedText.includes(q)) {
          const displayTitle =
            username ||
            fullName ||
            (firstName || lastName ? `${firstName} ${lastName}`.trim() : email) ||
            "User";

          list.push({
            uuid: String(u.uuid || u.id || ""),
            type: "USER",
            title: displayTitle,
            subtitle: email !== displayTitle && email ? email : undefined,
            status:
              typeof u.accountStatus === "string"
                ? u.accountStatus
                : typeof u.status === "string"
                  ? u.status
                  : undefined,
            targetUrl: `/users/${u.uuid || u.id}`,
          });
        }
      });
    }

    if (fallbackFoods?.content) {
      fallbackFoods.content.forEach((foodItem) => {
        const food = foodItem as unknown as Record<string, unknown>;
        const localName = String(food.localName || "");
        const canonicalName = String(food.canonicalName || "");
        const name = String(food.name || "");
        const description = String(food.description || "");
        const categoryName = String(food.categoryName || "");

        const combinedText = `${localName} ${canonicalName} ${name} ${description} ${categoryName}`.toLowerCase();

        if (combinedText.includes(q)) {
          const displayTitle = localName || canonicalName || name || "Food";
          const subtitle =
            description ||
            categoryName ||
            (canonicalName !== displayTitle ? canonicalName : "");

          list.push({
            uuid: String(food.uuid || food.id || ""),
            type: "FOOD",
            title: displayTitle,
            subtitle: subtitle || undefined,
            targetUrl: `/menu-items`,
          });
        }
      });
    }

    return list;
  }, [debouncedQuery, fallbackShops, fallbackUsers, fallbackFoods]);

  const rawResults = primaryResults.length > 0 ? primaryResults : fallbackResults;
  const filteredResults = (
    selectedType === "ALL"
      ? rawResults
      : rawResults.filter((r) => r.type === selectedType)
  ).slice(0, 15);

  const isSearchLoading =
    isFetching ||
    (primaryResults.length === 0 &&
      (fallbackShopsLoading || fallbackUsersLoading || fallbackFoodsLoading));

  const [reindexSearch, { isLoading: isReindexing }] = useReindexSearchMutation();

  const handleReindex = async () => {
    try {
      setNotice(null);
      const res = await reindexSearch().unwrap();
      setNotice({
        type: "success",
        text: res.message || " Search index has been rebuilt successfully!",
      });
    } catch (_err) {
      setNotice({
        type: "error",
        text: " Failed to trigger search re-indexing.",
      });
    } finally {
      setTimeout(() => setNotice(null), 4000);
    }
  };

  const getEntityIcon = (type: AdminEntityType) => {
    switch (type) {
      case "STORE":
        return <Store size={16} className="text-blue-600" />;
      case "FOOD":
        return <Utensils size={16} className="text-emerald-600" />;
      case "USER":
        return <User size={16} className="text-purple-600" />;
      case "MENU_ITEM":
        return <Package size={16} className="text-orange-600" />;
      default:
        return <Search size={16} className="text-gray-500" />;
    }
  };

  const getEntityRoute = (item: AdminSearchResultItem) => {
    if (item.targetUrl) return item.targetUrl;
    switch (item.type) {
      case "STORE":
        return `/shops/${item.uuid}`;
      case "FOOD":
        return `/menu-items`;
      case "USER":
        return `/users/${item.uuid}`;
      case "MENU_ITEM":
        return `/menu-items`;
      default:
        return "#";
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-xl">
      {/* SEARCH BAR INPUT & REINDEX BUTTON */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            placeholder="ស្វែងរកប្រព័ន្ធ (Stores, Foods, Users, Menu Items)..."
            value={inputQuery}
            onFocus={() => setIsOpen(true)}
            onChange={(e) => {
              setInputQuery(e.target.value);
              setIsOpen(true);
            }}
            className="w-full rounded-full border border-gray-200 py-2.5 pl-11 pr-10 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
          />

          {inputQuery && (
            <button
              type="button"
              onClick={() => {
                setInputQuery("");
                setDebouncedQuery("");
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* RE-INDEX CONTROL BUTTON */}
        <button
          type="button"
          onClick={handleReindex}
          disabled={isReindexing}
          title="Re-index Search Catalog (POST /api/v1/admin/search/reindex)"
          className="flex h-10 items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100 disabled:opacity-50 shrink-0"
        >
          <RefreshCw
            size={14}
            className={isReindexing ? "animate-spin text-emerald-700" : ""}
          />
          <span className="hidden sm:inline">
            {isReindexing ? "Reindexing..." : "Reindex"}
          </span>
        </button>
      </div>

      {/* FEEDBACK TOAST */}
      {notice && (
        <div
          className={`absolute left-0 top-12 z-50 flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold shadow-lg transition animate-in fade-in duration-200 ${
            notice.type === "success"
              ? "bg-emerald-900 text-white"
              : "bg-red-900 text-white"
          }`}
        >
          {notice.type === "success" ? (
            <CheckCircle2 size={16} className="text-emerald-400" />
          ) : (
            <AlertCircle size={16} className="text-red-400" />
          )}
          {notice.text}
        </div>
      )}

      {/* DROPDOWN OVERLAY RESULTS */}
      {isOpen && debouncedQuery.length >= 2 && (
        <div className="absolute left-0 right-0 top-14 z-50 max-h-[480px] overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl animate-in fade-in duration-150">
          {/* CATEGORY TABS */}
          <div className="flex items-center gap-1 border-b border-gray-100 bg-gray-50 px-3 py-2 text-xs">
            {(["ALL", "STORE", "FOOD", "USER", "MENU_ITEM"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setSelectedType(type)}
                className={`rounded-lg px-2.5 py-1 font-semibold transition ${
                  selectedType === type
                    ? "bg-emerald-700 text-white shadow-xs"
                    : "text-gray-600 hover:bg-gray-200/70"
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* RESULTS CONTENT */}
          <div className="max-h-[380px] overflow-y-auto p-2">
            {isSearchLoading ? (
              <div className="flex items-center justify-center gap-2 py-8 text-xs font-medium text-emerald-700">
                <Loader2 size={18} className="animate-spin text-emerald-600" />
                កំពុងស្វែងរកក្នុងប្រព័ន្ធ...
              </div>
            ) : filteredResults.length === 0 ? (
              <div className="py-8 text-center text-xs font-medium text-gray-500">
                រកមិនឃើញលទ្ធផល &quot;{debouncedQuery}&quot; ឡើយ។
              </div>
            ) : (
              <div className="space-y-1">
                {filteredResults.map((item) => (
                  <Link
                    key={`${item.type}-${item.uuid}`}
                    href={getEntityRoute(item)}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between rounded-xl p-2.5 transition hover:bg-emerald-50/70 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 group-hover:bg-white group-hover:shadow-xs">
                        {getEntityIcon(item.type)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-xs font-bold text-gray-800 group-hover:text-emerald-800">
                            {item.title}
                          </p>
                          <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] font-bold text-gray-600 uppercase">
                            {item.type}
                          </span>
                        </div>
                        {item.subtitle && (
                          <p className="truncate text-[11px] text-gray-500">
                            {item.subtitle}
                          </p>
                        )}
                      </div>
                    </div>

                    <ExternalLink
                      size={14}
                      className="text-gray-400 opacity-0 transition group-hover:opacity-100 group-hover:text-emerald-700 shrink-0 ml-2"
                    />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* FOOTER */}
          <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-4 py-2 text-[11px] text-gray-500">
            <span>បានរកឃើញលទ្ធផល: {filteredResults.length}</span>
            <span className="font-medium text-emerald-800">Admin Global Index Search</span>
          </div>
        </div>
      )}
    </div>
  );
}
