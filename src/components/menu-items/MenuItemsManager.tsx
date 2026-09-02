"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Loader2, Search, X } from "lucide-react";

import {
  useGetFoodsQuery,
  useGetMenuItemsQuery,
} from "@/src/app/store/menuItemApi";
import { getMenuItemApiErrorMessage } from "@/src/lib/menuItemApiError";
import type {
  CatalogFood,
  CatalogMenuItem,
  MenuItemsPageTab,
} from "@/src/types/menuItem";

import CanonicalFoodsTable from "./CanonicalFoodsTable";
import MenuItemsHeader from "./MenuItemsHeader";
import MenuItemsPagination from "./MenuItemsPagination";
import MenuItemsTable from "./MenuItemsTable";
import MenuItemsTableSkeleton from "./MenuItemsTableSkeleton";
import MenuItemsTabs from "./MenuItemsTabs";
import CreateCanonicalFoodModal from "./create/CreateCanonicalFoodModal";
import CreateStoreMenuItemModal from "./create/CreateStoreMenuItemModal";

const PAGE_SIZE = 10;

function searchText(value: unknown): string {
  return String(value ?? "").trim().toLowerCase();
}

function matchesFood(food: CatalogFood, query: string): boolean {
  if (!query) return true;

  return [
    food.canonicalName,
    food.localName,
    food.description,
    food.category?.name,
    food.category?.code,
    food.cuisine?.name,
    food.cuisine?.code,
  ].some((value) => searchText(value).includes(query));
}

function matchesMenuItem(item: CatalogMenuItem, query: string): boolean {
  if (!query) return true;

  return [
    item.name,
    item.localName,
    item.description,
    item.store?.storeName,
    item.store?.name,
    item.store?.city,
    item.food?.canonicalName,
    item.food?.localName,
    item.availabilityStatus,
    item.source,
  ].some((value) => searchText(value).includes(query));
}

export default function MenuItemsManager() {
  const [tab, setTab] = useState<MenuItemsPageTab>("CATALOG");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [foodModalOpen, setFoodModalOpen] = useState(false);
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [selectedFood, setSelectedFood] = useState<CatalogFood | null>(null);

  const {
    data: foodData,
    error: foodError,
    isLoading: foodsLoading,
    isFetching: foodsFetching,
    refetch: refetchFoods,
  } = useGetFoodsQuery({
    page: 0,
    size: 100,
    sort: "createdAt,desc",
  });

  const {
    data: menuData,
    error: menuError,
    isLoading: menuLoading,
    isFetching: menuFetching,
    refetch: refetchMenuItems,
  } = useGetMenuItemsQuery({
    page: 0,
    size: 100,
    sort: "createdAt,desc",
    rootCategoryCode: "FOOD",
  });

  const foods = foodData?.contents ?? [];
  const menuItems = menuData?.contents ?? [];

  const normalizedSearch = searchText(search);

  const filteredFoods = useMemo(
    () => foods.filter((food) => matchesFood(food, normalizedSearch)),
    [foods, normalizedSearch],
  );

  const filteredMenuItems = useMemo(
    () => menuItems.filter((item) => matchesMenuItem(item, normalizedSearch)),
    [menuItems, normalizedSearch],
  );

  const activeList = tab === "CATALOG" ? filteredFoods : filteredMenuItems;
  const totalPages = Math.max(Math.ceil(activeList.length / PAGE_SIZE), 1);
  const safePage = Math.min(page, totalPages - 1);
  const start = safePage * PAGE_SIZE;

  const displayedFoods = filteredFoods.slice(start, start + PAGE_SIZE);
  const displayedMenuItems = filteredMenuItems.slice(start, start + PAGE_SIZE);

  const availableCount = useMemo(
    () =>
      menuItems.filter((item) => item.availabilityStatus === "AVAILABLE").length,
    [menuItems],
  );

  const currentError = tab === "CATALOG" ? foodError : menuError;
  const currentLoading = tab === "CATALOG" ? foodsLoading : menuLoading;
  const currentFetching = tab === "CATALOG" ? foodsFetching : menuFetching;

  const changeTab = (next: MenuItemsPageTab) => {
    setTab(next);
    setPage(0);
    setSearch("");
  };

  const openPublish = (food?: CatalogFood | null) => {
    setSelectedFood(food ?? null);
    setPublishModalOpen(true);
  };

  return (
    <div className="space-y-5">
      <MenuItemsHeader
        foodCount={foodData?.totalElements ?? foods.length}
        menuItemCount={menuData?.totalElements ?? menuItems.length}
        availableCount={availableCount}
        onCreateFood={() => setFoodModalOpen(true)}
        onPublishMenuItem={() => openPublish(null)}
      />

      <section className="rounded-[26px] border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="overflow-x-auto pb-1">
            <MenuItemsTabs
              value={tab}
              foodCount={foodData?.totalElements ?? foods.length}
              menuItemCount={menuData?.totalElements ?? menuItems.length}
              onChange={changeTab}
            />
          </div>

          <div className="relative w-full xl:w-[390px]">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(0);
              }}
              placeholder={
                tab === "CATALOG"
                  ? "ស្វែងរក Food, category, cuisine..."
                  : "ស្វែងរក Menu Item, Store, Food..."
              }
              className="h-12 w-full rounded-2xl border border-gray-200 bg-gray-50 pl-11 pr-10 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-50"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setPage(0);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-[26px] border border-gray-100 bg-white shadow-sm">
        {currentLoading ? (
          <MenuItemsTableSkeleton rows={5} />
        ) : currentError ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center px-5 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500">
              <AlertTriangle size={28} />
            </div>
            <h3 className="mt-4 text-xl font-black text-gray-800">មិនអាចទាញយកទិន្នន័យបានទេ</h3>
            <p className="mt-2 max-w-xl whitespace-pre-wrap text-sm leading-6 text-gray-500">
              {getMenuItemApiErrorMessage(currentError)}
            </p>
            <button
              type="button"
              onClick={() => {
                if (tab === "CATALOG") void refetchFoods();
                else void refetchMenuItems();
              }}
              className="mt-4 h-11 rounded-xl bg-[#137A3D] px-5 text-sm font-black text-white"
            >
              សាកល្បងម្តងទៀត
            </button>
          </div>
        ) : (
          <>
            {tab === "CATALOG" ? (
              <CanonicalFoodsTable items={displayedFoods} onPublish={openPublish} />
            ) : (
              <MenuItemsTable items={displayedMenuItems} />
            )}

            <MenuItemsPagination
              page={safePage}
              totalPages={totalPages}
              totalElements={activeList.length}
              disabled={currentFetching}
              onPageChange={setPage}
            />
          </>
        )}
      </section>

      <CreateCanonicalFoodModal
        open={foodModalOpen}
        onClose={() => setFoodModalOpen(false)}
        onCreated={async () => {
          await refetchFoods();
          setTab("CATALOG");
          setPage(0);
        }}
      />

      <CreateStoreMenuItemModal
        open={publishModalOpen}
        initialFood={selectedFood}
        onClose={() => {
          setPublishModalOpen(false);
          setSelectedFood(null);
        }}
        onCreated={async () => {
          await Promise.all([refetchMenuItems(), refetchFoods()]);
          setTab("PUBLISHED");
          setPage(0);
        }}
      />
    </div>
  );
}
