"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Search,
  Store,
  Utensils,
  User,
  Package,
  X,
  Loader2,
  ExternalLink,
} from "lucide-react";

import {
  useAdminGlobalSearchQuery,
} from "@/src/app/store/adminSearchApi";
import type { AdminEntityType, AdminSearchResultItem } from "@/src/types/adminSearch";

import { useMemo } from "react";
import { useGetShopsQuery } from "@/src/app/store/shop/shopApi";
import { useGetAdminUsersQuery } from "@/src/app/store/userProfileApi";
import {
  useGetManagedFoodsQuery,
  useGetPublishedMenuItemsQuery,
} from "@/src/app/store/menuManagementApi";
import { readLocalMenuItems } from "@/src/lib/filterCatalogStorage";

export default function GlobalAdminSearch() {
  const [inputQuery, setInputQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<AdminEntityType | "ALL">("ALL");

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
    { skip: shouldSkipFallback || (selectedType !== "ALL" && selectedType !== "FOOD") },
  );

  const { data: fallbackMenuItemsData, isFetching: fallbackMenuItemsLoading } = useGetPublishedMenuItemsQuery(
    { query: debouncedQuery, page: 0, size: 100 },
    { skip: shouldSkipFallback || (selectedType !== "ALL" && selectedType !== "MENU_ITEM") },
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
            targetUrl: `/menu-items?search=${encodeURIComponent(displayTitle)}`,
          });
        }
      });
    }

    // Published Store Menu Items (Server + LocalStorage)
    const combinedMenuItems = [
      ...(fallbackMenuItemsData?.content ?? []),
      ...readLocalMenuItems(),
    ];
    const seenMenuUuids = new Set<string>();

    combinedMenuItems.forEach((menuItem) => {
      const itemUuid = String(menuItem.uuid || (menuItem as any).id || "");
      if (!itemUuid || seenMenuUuids.has(itemUuid)) return;
      seenMenuUuids.add(itemUuid);

      const name = String(menuItem.name || "");
      const desc = String(menuItem.description || "");
      const storeName = String(
        menuItem.store?.storeName ||
          menuItem.store?.name ||
          (menuItem as any).storeName ||
          "",
      );
      const foodCanonical = String(menuItem.food?.canonicalName || "");
      const foodLocal = String(menuItem.food?.localName || "");

      const combinedText = `${name} ${desc} ${storeName} ${foodCanonical} ${foodLocal}`.toLowerCase();

      if (combinedText.includes(q)) {
        const subtitle = storeName
          ? `ហាង: ${storeName} • $${Number(menuItem.price ?? 0).toFixed(2)}`
          : `$${Number(menuItem.price ?? 0).toFixed(2)}`;

        const targetStoreUuid = menuItem.storeUuid || menuItem.store?.uuid;

        list.push({
          uuid: itemUuid,
          type: "MENU_ITEM",
          title: name || foodLocal || foodCanonical || "Menu Item",
          subtitle,
          status: menuItem.availabilityStatus,
          targetUrl: targetStoreUuid
            ? `/shops/${targetStoreUuid}`
            : `/menu-items?search=${encodeURIComponent(name)}`,
        });
      }
    });

    return list;
  }, [
    debouncedQuery,
    fallbackShops,
    fallbackUsers,
    fallbackFoods,
    fallbackMenuItemsData,
  ]);

  const rawResults = primaryResults.length > 0 ? primaryResults : fallbackResults;
  const filteredResults = (
    selectedType === "ALL"
      ? rawResults
      : rawResults.filter((r) => r.type === selectedType)
  ).slice(0, 15);

  const isSearchLoading =
    isFetching ||
    (primaryResults.length === 0 &&
      (fallbackShopsLoading ||
        fallbackUsersLoading ||
        fallbackFoodsLoading ||
        fallbackMenuItemsLoading));



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
    <div ref={containerRef} className="relative w-full max-w-3xl">
      <div className="relative">
        <Search
          size={18}
          className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />

        <input
          type="text"
          placeholder="ស្វែងរកប្រព័ន្ធ (Stores, Foods, Users)..."
          value={inputQuery}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setInputQuery(e.target.value);
            setIsOpen(true);
          }}
          className="h-11 sm:h-12 w-full rounded-full border border-gray-200 bg-gray-50/50 sm:bg-white py-2 pl-10 sm:pl-11 pr-9 sm:pr-10 text-base sm:text-lg outline-none transition focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
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
                className={`rounded-lg px-2.5 py-1 font-semibold transition ${selectedType === type
                    ? "bg-emerald-700 text-white shadow-xs"
                    : "text-gray-600 hover:bg-gray-200/70"
                  }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* RESULTS CONTENT */}
          <div className="max-h-[380px] overflow-y-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden p-2">
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
