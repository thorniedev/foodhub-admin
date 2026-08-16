"use client";

import {
  useMemo,
  useState,
} from "react";

import {
  AlertTriangle,
  Loader2,
  Search,
  X,
} from "lucide-react";

import {
  useGetFoodsQuery,
  useGetMenuItemsQuery,
} from "@/src/app/store/menuItemApi";

import {
  getMenuItemApiErrorMessage,
} from "@/src/lib/menuItemApiError";

import type {
  CatalogFood,
  CatalogMenuItem,
  MenuItemsPageTab,
} from "@/src/types/menuItem";

import CanonicalFoodsTable from "./CanonicalFoodsTable";
import MenuItemsHeader from "./MenuItemsHeader";
import MenuItemsPagination from "./MenuItemsPagination";
import MenuItemsTable from "./MenuItemsTable";
import MenuItemsTabs from "./MenuItemsTabs";
import CreateCanonicalFoodModal from "./create/CreateCanonicalFoodModal";
import CreateStoreMenuItemModal from "./create/CreateStoreMenuItemModal";

const PAGE_SIZE = 10;

function searchText(
  value: unknown,
): string {
  return String(
    value ?? "",
  )
    .trim()
    .toLowerCase();
}

function matchesFood(
  food: CatalogFood,
  query: string,
): boolean {
  if (!query) {
    return true;
  }

  return [
    food.canonicalName,
    food.localName,
    food.description,
    food.category?.name,
    food.category?.code,
    food.cuisine?.name,
    food.cuisine?.code,
  ].some((value) =>
    searchText(value).includes(
      query,
    ),
  );
}

function matchesMenuItem(
  item: CatalogMenuItem,
  query: string,
): boolean {
  if (!query) {
    return true;
  }

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
  ].some((value) =>
    searchText(value).includes(
      query,
    ),
  );
}

export default function MenuItemsManager() {
  const [tab, setTab] =
    useState<MenuItemsPageTab>(
      "CATALOG",
    );

  const [search, setSearch] =
    useState("");

  const [page, setPage] =
    useState(0);

  const [
    foodModalOpen,
    setFoodModalOpen,
  ] = useState(false);

  const [
    publishModalOpen,
    setPublishModalOpen,
  ] = useState(false);

  const [
    selectedFood,
    setSelectedFood,
  ] =
    useState<CatalogFood | null>(
      null,
    );

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

  const foods =
    foodData?.contents ?? [];

  const menuItems =
    menuData?.contents ?? [];

  const normalizedSearch =
    searchText(search);

  const filteredFoods =
    useMemo(
      () =>
        foods.filter((food) =>
          matchesFood(
            food,
            normalizedSearch,
          ),
        ),
      [
        foods,
        normalizedSearch,
      ],
    );

  const filteredMenuItems =
    useMemo(
      () =>
        menuItems.filter((item) =>
          matchesMenuItem(
            item,
            normalizedSearch,
          ),
        ),
      [
        menuItems,
        normalizedSearch,
      ],
    );

  const activeList =
    tab === "CATALOG"
      ? filteredFoods
      : filteredMenuItems;

  const totalPages =
    Math.max(
      Math.ceil(
        activeList.length /
          PAGE_SIZE,
      ),
      1,
    );

  const safePage =
    Math.min(
      page,
      totalPages - 1,
    );

  const start =
    safePage * PAGE_SIZE;

  const displayedFoods =
    filteredFoods.slice(
      start,
      start + PAGE_SIZE,
    );

  const displayedMenuItems =
    filteredMenuItems.slice(
      start,
      start + PAGE_SIZE,
    );

  const availableCount =
    useMemo(
      () =>
        menuItems.filter(
          (item) =>
            item.availabilityStatus ===
            "AVAILABLE",
        ).length,
      [menuItems],
    );

  const currentError =
    tab === "CATALOG"
      ? foodError
      : menuError;

  const currentLoading =
    tab === "CATALOG"
      ? foodsLoading
      : menuLoading;

  const currentFetching =
    tab === "CATALOG"
      ? foodsFetching
      : menuFetching;

  const changeTab = (
    next: MenuItemsPageTab,
  ) => {
    setTab(next);
    setPage(0);
    setSearch("");
  };

  const openPublish = (
    food?: CatalogFood | null,
  ) => {
    setSelectedFood(
      food ?? null,
    );
    setPublishModalOpen(true);
  };

  return (
    <div className="w-full min-w-0 max-w-full space-y-5">
      {/* =================================================
          HEADER — same concept as UsersHeader
      ================================================== */}
      <MenuItemsHeader
        foodCount={
          foodData?.totalElements ??
          foods.length
        }
        menuItemCount={
          menuData?.totalElements ??
          menuItems.length
        }
        availableCount={
          availableCount
        }
        onCreateFood={() =>
          setFoodModalOpen(true)
        }
        onPublishMenuItem={() =>
          openPublish(null)
        }
      />

      {/* =================================================
          TABS + SEARCH — same layout concept as UsersManager
      ================================================== */}
      <div className="flex w-full flex-nowrap items-center justify-between gap-4 overflow-x-auto pb-1">
        <div className="shrink-0">
          <MenuItemsTabs
            value={tab}
            foodCount={
              foodData?.totalElements ??
              foods.length
            }
            menuItemCount={
              menuData?.totalElements ??
              menuItems.length
            }
            onChange={
              changeTab
            }
          />
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <div className="relative">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-gray-400"
            />

            <input
              value={search}
              onChange={(event) => {
                setSearch(
                  event.target.value,
                );
                setPage(0);
              }}
              placeholder={
                tab === "CATALOG"
                  ? "ស្វែងរក Food, category, cuisine..."
                  : "ស្វែងរក Menu Item, Store, Food..."
              }
              className="h-11 w-[430px] rounded-2xl border border-gray-200 bg-white py-2 pl-11 pr-10 text-lg text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-primary-600 focus:ring-2 focus:ring-primary-100"
            />

            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setPage(0);
                }}
                className="absolute right-3 top-1/2 z-10 -translate-y-1/2 text-gray-400 transition hover:text-gray-700"
                aria-label="Clear search"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* =================================================
          TABLE / STATE AREA
      ================================================== */}
      <section className="w-full min-w-0 max-w-full overflow-visible rounded-[24px] border border-gray-100 bg-white shadow-sm">
        {currentLoading ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center">
            <Loader2
              size={32}
              className="animate-spin text-primary-800"
            />

            <p className="mt-3 text-lg font-medium text-gray-500">
              កំពុងទាញយកទិន្នន័យ...
            </p>
          </div>
        ) : currentError ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
              <AlertTriangle
                size={28}
              />
            </div>

            <p className="mt-4 text-2xl font-semibold text-primary-800">
              មិនអាចទាញយកទិន្នន័យបានទេ
            </p>

            <p className="mt-2 max-w-xl whitespace-pre-wrap text-lg leading-8 text-gray-500">
              {getMenuItemApiErrorMessage(
                currentError,
              )}
            </p>

            <button
              type="button"
              onClick={() => {
                if (
                  tab ===
                  "CATALOG"
                ) {
                  void refetchFoods();
                } else {
                  void refetchMenuItems();
                }
              }}
              className="mt-5 inline-flex min-h-12 items-center justify-center rounded-full bg-primary-800 px-6 text-lg font-medium text-white transition hover:bg-primary-900 focus:outline-none focus:ring-4 focus:ring-primary-200"
            >
              សាកល្បងម្តងទៀត
            </button>
          </div>
        ) : (
          <>
            {tab === "CATALOG" ? (
              <CanonicalFoodsTable
                items={
                  displayedFoods
                }
                onPublish={
                  openPublish
                }
              />
            ) : (
              <MenuItemsTable
                items={
                  displayedMenuItems
                }
              />
            )}

            <MenuItemsPagination
              page={safePage}
              totalPages={
                totalPages
              }
              totalElements={
                activeList.length
              }
              disabled={
                currentFetching
              }
              onPageChange={
                setPage
              }
            />
          </>
        )}
      </section>

      {/* =================================================
          CREATE FOOD MODAL
      ================================================== */}
      <CreateCanonicalFoodModal
        open={foodModalOpen}
        onClose={() =>
          setFoodModalOpen(false)
        }
        onCreated={async () => {
          await refetchFoods();
          setTab("CATALOG");
          setPage(0);
        }}
      />

      {/* =================================================
          PUBLISH STORE MENU ITEM MODAL
      ================================================== */}
      <CreateStoreMenuItemModal
        open={publishModalOpen}
        initialFood={
          selectedFood
        }
        onClose={() => {
          setPublishModalOpen(
            false,
          );
          setSelectedFood(
            null,
          );
        }}
        onCreated={async () => {
          await Promise.all([
            refetchMenuItems(),
            refetchFoods(),
          ]);
          setTab("PUBLISHED");
          setPage(0);
        }}
      />
    </div>
  );
}
