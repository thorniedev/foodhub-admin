"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import StoreMediaImage from "@/src/components/shops/detail/StoreMediaImage";
import UserAvatar from "@/src/components/users/UserAvatar";
import { storeLogoCandidate, storeCoverCandidate } from "@/src/lib/shopFormat";

export default function GlobalAdminSearch() {
  const router = useRouter();
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
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
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
          const logoCandidate =
            storeLogoCandidate(shop) ||
            storeCoverCandidate(shop) ||
            shop.logoUrl ||
            shop.coverImageUrl ||
            (shop as any).logo ||
            (shop as any).cover ||
            null;

          list.push({
            uuid: shop.uuid,
            type: "STORE",
            title: storeName || "Store",
            subtitle: address || undefined,
            imageUrl: logoCandidate || null,
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

          const userImageCandidate =
            (typeof u.avatarMediaUuid === "string" && u.avatarMediaUuid) ||
            (typeof u.avatarUrl === "string" && u.avatarUrl) ||
            (typeof u.profileImageUrl === "string" && u.profileImageUrl) ||
            (typeof u.imageUrl === "string" && u.imageUrl) ||
            (typeof u.avatar === "string" && u.avatar) ||
            (typeof u.profilePicture === "string" && u.profilePicture) ||
            (typeof u.photoUrl === "string" && u.photoUrl) ||
            (typeof u.picture === "string" && u.picture) ||
            (typeof u.image === "string" && u.image) ||
            (typeof (u.defaultProfile as any)?.avatarMediaUuid === "string" && (u.defaultProfile as any).avatarMediaUuid) ||
            (typeof (u.defaultProfile as any)?.avatarUrl === "string" && (u.defaultProfile as any).avatarUrl) ||
            (typeof (u.profiles as any)?.[0]?.avatarMediaUuid === "string" && (u.profiles as any)[0].avatarMediaUuid) ||
            (typeof (u.profiles as any)?.[0]?.avatarUrl === "string" && (u.profiles as any)[0].avatarUrl) ||
            null;

          list.push({
            uuid: String(u.uuid || u.id || ""),
            type: "USER",
            title: displayTitle,
            subtitle: email !== displayTitle && email ? email : undefined,
            imageUrl: userImageCandidate || null,
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

          const foodImageCandidate =
            (Array.isArray(food.primaryMediaUrls) && typeof food.primaryMediaUrls[0] === "string" && food.primaryMediaUrls[0]) ||
            (typeof food.thumbnail === "string" && food.thumbnail) ||
            (typeof food.imageUrl === "string" && food.imageUrl) ||
            (typeof food.primaryMediaUrl === "string" && food.primaryMediaUrl) ||
            (Array.isArray(food.images) && typeof food.images[0] === "string" && food.images[0]) ||
            (typeof food.primaryMediaUuid === "string" && food.primaryMediaUuid) ||
            (typeof food.thumbnailMediaUuid === "string" && food.thumbnailMediaUuid) ||
            (Array.isArray(food.primaryMediaUuids) && typeof food.primaryMediaUuids[0] === "string" && food.primaryMediaUuids[0]) ||
            (typeof (food.media as any)?.[0]?.url === "string" && (food.media as any)[0].url) ||
            (typeof (food.media as any)?.[0]?.accessUrl === "string" && (food.media as any)[0].accessUrl) ||
            null;

          list.push({
            uuid: String(food.uuid || food.id || ""),
            type: "FOOD",
            title: displayTitle,
            subtitle: subtitle || undefined,
            imageUrl: foodImageCandidate || null,
            targetUrl: `/menu-items?search=${encodeURIComponent(displayTitle)}`,
          });
        }
      });
    }

    // Published Store Menu Items
    const combinedMenuItems = [
      ...(fallbackMenuItemsData?.content ?? []),
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

        const menuItemImageCandidate =
          menuItem.thumbnail ||
          menuItem.imageUrl ||
          menuItem.primaryMediaUrls?.[0] ||
          (menuItem as any).primaryMediaUrl ||
          menuItem.images?.[0] ||
          menuItem.primaryMediaUuid ||
          menuItem.thumbnailMediaUuid ||
          menuItem.food?.thumbnail ||
          menuItem.food?.imageUrl ||
          menuItem.food?.primaryMediaUrls?.[0] ||
          (menuItem.food as any)?.primaryMediaUrl ||
          menuItem.food?.primaryMediaUuid ||
          null;

        list.push({
          uuid: itemUuid,
          type: "MENU_ITEM",
          title: name || foodLocal || foodCanonical || "Menu Item",
          subtitle,
          imageUrl: menuItemImageCandidate || null,
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
        return <Store size={22} className="text-blue-600" />;
      case "FOOD":
        return <Utensils size={22} className="text-emerald-600" />;
      case "USER":
        return <User size={22} className="text-purple-600" />;
      case "MENU_ITEM":
        return <Package size={22} className="text-orange-600" />;
      default:
        return <Search size={22} className="text-gray-500" />;
    }
  };

  const getEntityRoute = (item: AdminSearchResultItem) => {
    if (item.targetUrl) return item.targetUrl;
    switch (item.type) {
      case "STORE":
        return `/shops/${item.uuid}`;
      case "FOOD":
        return `/food-catalog/foods`;
      case "USER":
        return `/users/${item.uuid}`;
      case "MENU_ITEM":
        return `/menu-items/${item.uuid}`;
      default:
        return "#";
    }
  };

  const handleNavigate = (item: AdminSearchResultItem, event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    const route = getEntityRoute(item);
    setIsOpen(false);
    setInputQuery("");
    setDebouncedQuery("");
    if (route && route !== "#") {
      router.push(route);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-3xl">
      <div className="relative">
        <Search
          size={20}
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
          className="h-11 sm:h-12 w-full rounded-full border border-gray-200 bg-gray-50/50 sm:bg-white py-2 pl-10 sm:pl-12 pr-10 sm:pr-11 text-lg outline-none transition focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 placeholder:truncate"
        />

        {inputQuery && (
          <button
            type="button"
            onClick={() => {
              setInputQuery("");
              setDebouncedQuery("");
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 cursor-pointer transition"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* DROPDOWN OVERLAY RESULTS */}
      {isOpen && debouncedQuery.length >= 2 && (
        <>
          {/* Mobile Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px] sm:hidden"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          <div className="fixed inset-x-2.5 top-[70px] sm:absolute sm:inset-x-0 sm:top-14 z-50 max-h-[calc(100vh-85px)] sm:max-h-[580px] overflow-hidden rounded-2xl sm:rounded-3xl border border-gray-100 bg-white shadow-2xl animate-in fade-in duration-150">
            {/* CATEGORY TABS */}
            <div className="flex items-center gap-1.5 border-b border-gray-100 bg-gray-50 px-3 sm:px-4 py-2 sm:py-2.5 overflow-x-auto no-scrollbar scroll-smooth">
              {(["ALL", "STORE", "FOOD", "USER", "MENU_ITEM"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSelectedType(type)}
                  className={`shrink-0 rounded-xl px-3 sm:px-3.5 py-1.5 text-lg font-medium transition cursor-pointer ${
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
            <div className="max-h-[calc(100vh-220px)] sm:max-h-[460px] overflow-y-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden p-2 sm:p-3">
              {isSearchLoading ? (
                <div className="flex items-center justify-center gap-3 py-10 text-lg font-normal text-emerald-700">
                  <Loader2 size={24} className="animate-spin text-emerald-600" />
                  <span>កំពុងស្វែងរកក្នុងប្រព័ន្ធ...</span>
                </div>
              ) : filteredResults.length === 0 ? (
                <div className="py-10 text-center text-lg font-normal text-gray-500">
                  រកមិនឃើញលទ្ធផល &quot;{debouncedQuery}&quot; ឡើយ។
                </div>
              ) : (
                <div className="space-y-1 sm:space-y-1.5">
                  {filteredResults.map((item) => (
                    <Link
                      key={`${item.type}-${item.uuid}`}
                      href={getEntityRoute(item)}
                      onClick={(e) => handleNavigate(item, e)}
                      className="flex items-center justify-between rounded-xl sm:rounded-2xl p-2.5 sm:p-3 transition hover:bg-emerald-50/70 group cursor-pointer"
                    >
                      <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 flex-1">
                        <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl sm:rounded-2xl border border-gray-100 bg-gray-100 group-hover:border-gray-200 group-hover:bg-white group-hover:shadow-xs">
                          {item.type === "USER" && (item.imageUrl || item.uuid) ? (
                            <UserAvatar
                              name={item.title}
                              userUuid={item.uuid}
                              imageUrl={item.imageUrl}
                              containerClassName="h-full w-full flex items-center justify-center text-sm font-semibold text-purple-700 bg-purple-50"
                              textClassName="text-sm font-semibold text-purple-700"
                              className="h-full w-full object-cover"
                            />
                          ) : item.imageUrl ? (
                            <StoreMediaImage
                              mediaUuid={item.imageUrl}
                              alt={item.title}
                              className="h-full w-full object-cover"
                              fallbackIcon={getEntityIcon(item.type)}
                            />
                          ) : (
                            getEntityIcon(item.type)
                          )}
                        </div>
                        <div className="min-w-0 flex-1 pr-1.5 sm:pr-2">
                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2.5">
                            <p className="truncate text-xl font-medium text-gray-800 group-hover:text-emerald-800 max-w-full">
                              {item.title}
                            </p>
                            <span className="rounded-lg bg-gray-100 px-2 sm:px-2.5 py-0.5 text-lg font-normal text-gray-600 uppercase shrink-0">
                              {item.type}
                            </span>
                          </div>
                          {item.subtitle && (
                            <p className="mt-0.5 truncate text-lg font-normal text-gray-500">
                              {item.subtitle}
                            </p>
                          )}
                        </div>
                      </div>

                      <ExternalLink
                        size={20}
                        className="text-gray-400 opacity-50 sm:opacity-0 transition sm:group-hover:opacity-100 sm:group-hover:text-emerald-700 shrink-0 ml-1.5 sm:ml-3"
                      />
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* FOOTER */}
            <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-1 sm:gap-2 border-t border-gray-100 bg-gray-50 px-4 sm:px-5 py-2.5 sm:py-3 text-lg font-normal text-gray-600">
              <span>បានរកឃើញលទ្ធផល: {filteredResults.length}</span>
              <span className="font-medium text-emerald-800 hidden xs:inline">Admin Global Index Search</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
