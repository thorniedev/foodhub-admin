"use client";

import {
  AlertTriangle,
  Globe2,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Sliders,
  Store,
  Utensils,
} from "lucide-react";

import { useMemo, useState } from "react";

import { useSearchAdvancedMenuItemsMutation } from "@/src/app/store/discoveryApi";
import type { AdvancedMenuItemSearchRequest } from "@/src/types/discovery";

import {
  useCreateManagedFoodMutation,
  useCreateStoreMenuItemMutation,
  useDeleteManagedFoodMutation,
  useDeleteStoreMenuItemMutation,
  useGetManagedCuisinesQuery,
  useGetManagedEventsQuery,
  useGetManagedFoodCategoriesQuery,
  useGetManagedFoodsQuery,
  useGetManagedIngredientsQuery,
  useGetManagedSeasonsQuery,
  useGetManagedStoresQuery,
  useGetManagedWeatherConditionsQuery,
  useGetPublishedMenuItemsQuery,
  useUpdateManagedFoodMutation,
  useUpdateStoreMenuItemMutation,
} from "@/src/app/store/menuManagementApi";
import { useGetMealTypesQuery } from "@/src/app/store/mealTypeApi";
import { useGetAgeGroupsQuery } from "@/src/app/store/ageGroupApi";
import { useGetDietaryTypesQuery } from "@/src/app/store/dietaryTypeApi";
import { useGetAllergensQuery } from "@/src/app/store/allergenApi";

import { getMenuManagementApiError } from "@/src/lib/menuManagementApiError";

import type {
  FoodRecord,
  FoodWritePayload,
  MenuItemRecord,
  MenuItemWritePayload,
} from "@/src/types/menu-management";

import DeleteConfirmModal from "./DeleteConfirmModal";
import FoodCatalogTable from "./FoodCatalogTable";
import FoodFormModal from "./FoodFormModal";
import MenuItemDetailModal from "./MenuItemDetailModal";
import PublishMenuItemModal from "./PublishMenuItemModal";
import PublishedMenuItemsTable from "./PublishedMenuItemsTable";
import AdvancedFilterModal from "./AdvancedFilterModal";

type Tab = "FOODS" | "WEBSITE";

type Notice = {
  type: "success" | "error";
  text: string;
} | null;

function matchesFood(item: FoodRecord, search: string) {
  const query = search.trim().toLowerCase();

  if (!query) return true;

  return [
    item.canonicalName,
    item.localName,
    item.description,
    item.category?.name,
    item.categoryName,
    item.cuisine?.name,
    item.cuisineName,
  ].some((value) =>
    String(value ?? "")
      .toLowerCase()
      .includes(query),
  );
}

function matchesMenuItem(item: MenuItemRecord, search: string) {
  const query = search.trim().toLowerCase();

  if (!query) return true;

  return [
    item.name,
    item.description,
    item.store?.storeName,
    item.store?.name,
    item.food?.canonicalName,
    item.food?.localName,
    item.availabilityStatus,
  ].some((value) =>
    String(value ?? "")
      .toLowerCase()
      .includes(query),
  );
}

export default function MenuItemsManager() {
  const [tab, setTab] = useState<Tab>("FOODS");
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState<Notice>(null);

  const [foodModalOpen, setFoodModalOpen] = useState(false);
  const [editingFood, setEditingFood] = useState<FoodRecord | null>(null);

  const [menuModalOpen, setMenuModalOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<MenuItemRecord | null>(null);

  const [deletingFood, setDeletingFood] = useState<FoodRecord | null>(null);
  const [deletingMenu, setDeletingMenu] = useState<MenuItemRecord | null>(null);

  const [detailUuid, setDetailUuid] = useState<string | null>(null);

  const foodsQuery = useGetManagedFoodsQuery({
    page: 0,
    size: 100,
    sort: "createdAt,desc",
  });

  const menuItemsQuery = useGetPublishedMenuItemsQuery({
    page: 0,
    size: 100,
    sort: "createdAt,desc",
  });

  const categoriesQuery = useGetManagedFoodCategoriesQuery();
  const cuisinesQuery = useGetManagedCuisinesQuery();
  const ingredientsQuery = useGetManagedIngredientsQuery();
  const storesQuery = useGetManagedStoresQuery();
  const seasonsQuery = useGetManagedSeasonsQuery();
  const eventsQuery = useGetManagedEventsQuery();
  const weatherQuery = useGetManagedWeatherConditionsQuery();
  const mealTypesQuery = useGetMealTypesQuery({ page: 0, size: 100 });
  const ageGroupsQuery = useGetAgeGroupsQuery({ page: 0, size: 100 });
  const dietaryTypesQuery = useGetDietaryTypesQuery({ page: 0, size: 100 });
  const allergensQuery = useGetAllergensQuery({ page: 0, size: 100 });

  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedMenuItemSearchRequest>({});
  const [isAdvancedFilterActive, setIsAdvancedFilterActive] = useState(false);

  const [searchAdvancedItems, { data: discoveryData, isLoading: discoveryLoading }] =
    useSearchAdvancedMenuItemsMutation();

  const [createFood, { isLoading: creatingFood }] =
    useCreateManagedFoodMutation();

  const [updateFood, { isLoading: updatingFood }] =
    useUpdateManagedFoodMutation();

  const [deleteFood, { isLoading: deletingFoodRequest }] =
    useDeleteManagedFoodMutation();

  const [createMenuItem, { isLoading: creatingMenuItem }] =
    useCreateStoreMenuItemMutation();

  const [updateMenuItem, { isLoading: updatingMenuItem }] =
    useUpdateStoreMenuItemMutation();

  const [deleteMenuItem, { isLoading: deletingMenuItemRequest }] =
    useDeleteStoreMenuItemMutation();

  const foods = foodsQuery.data?.content ?? [];
  const menuItems = menuItemsQuery.data?.content ?? [];

  const filteredFoods = useMemo(
    () => foods.filter((item) => matchesFood(item, search)),
    [foods, search],
  );

  const filteredMenuItems = useMemo(
    () => menuItems.filter((item) => matchesMenuItem(item, search)),
    [menuItems, search],
  );

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (advancedFilters.query) count++;
    if (advancedFilters.categoryUuids?.length) count += advancedFilters.categoryUuids.length;
    if (advancedFilters.cuisineUuids?.length) count += advancedFilters.cuisineUuids.length;
    if (advancedFilters.mealTypeUuids?.length) count += advancedFilters.mealTypeUuids.length;
    if (advancedFilters.dietaryTypeUuids?.length) count += advancedFilters.dietaryTypeUuids.length;
    if (advancedFilters.excludeAllergenUuids?.length) count += advancedFilters.excludeAllergenUuids.length;
    if (advancedFilters.seasonUuids?.length) count += advancedFilters.seasonUuids.length;
    if (advancedFilters.eventUuids?.length) count += advancedFilters.eventUuids.length;
    if (advancedFilters.minimumPrice !== undefined || advancedFilters.maximumPrice !== undefined) count++;
    if (advancedFilters.minimumSpiceLevel !== undefined || advancedFilters.maximumSpiceLevel !== undefined) count++;
    if (advancedFilters.openNow) count++;
    if (advancedFilters.featuredOnly) count++;
    if (advancedFilters.hasImage) count++;
    return count;
  }, [advancedFilters]);

  const handleApplyAdvancedFilters = async (filters: AdvancedMenuItemSearchRequest) => {
    setAdvancedFilters(filters);
    setIsAdvancedFilterActive(true);
    setTab("WEBSITE");
    try {
      await searchAdvancedItems({
        params: { page: 0, size: 20, sort: filters.sort ?? "FOODHUB_RATING_DESC" },
        body: filters,
      }).unwrap();
    } catch (err) {
      console.error("[ADVANCED DISCOVERY SEARCH ERROR]", err);
    }
  };

  const handleResetAdvancedFilters = () => {
    setAdvancedFilters({});
    setIsAdvancedFilterActive(false);
  };

  const busy =
    creatingFood ||
    updatingFood ||
    deletingFoodRequest ||
    creatingMenuItem ||
    updatingMenuItem ||
    deletingMenuItemRequest;

  const currentLoading =
    tab === "FOODS" ? foodsQuery.isLoading : menuItemsQuery.isLoading;

  const currentError =
    tab === "FOODS" ? foodsQuery.error : menuItemsQuery.error;

  const refreshAll = async () => {
    await Promise.all([foodsQuery.refetch(), menuItemsQuery.refetch()]);
  };

  const saveFood = async (payload: FoodWritePayload, images: File[]) => {
    try {
      setNotice(null);

      if (editingFood) {
        await updateFood({
          uuid: editingFood.uuid,
          payload,
          images,
        }).unwrap();

        setNotice({
          type: "success",
          text: "បានកែប្រែ Food Catalog ដោយជោគជ័យ។",
        });
      } else {
        await createFood({
          payload,
          images,
        }).unwrap();

        setNotice({
          type: "success",
          text: "បានបង្កើត Food Catalog។ Store អាចជ្រើស Food នេះបាន។",
        });
      }

      setFoodModalOpen(false);
      setEditingFood(null);

      await refreshAll();
    } catch (error) {
      const message = getMenuManagementApiError(error);

      setNotice({
        type: "error",
        text: message,
      });

      throw new Error(message);
    }
  };

  const saveMenuItem = async (
    storeUuid: string,
    payload: MenuItemWritePayload,
    images: File[],
  ) => {
    try {
      setNotice(null);

      if (editingMenu) {
        await updateMenuItem({
          uuid: editingMenu.uuid,
          payload,
          images,
        }).unwrap();

        setNotice({
          type: "success",
          text: "បានកែប្រែ Menu Item ដោយជោគជ័យ។",
        });
      } else {
        await createMenuItem({
          storeUuid,
          payload,
          images,
        }).unwrap();

        setNotice({
          type: "success",
          text: "បាន Publish Menu Item។ វានឹងចូល Public Menu Item API របស់ វែបសាយ។",
        });
      }

      setMenuModalOpen(false);
      setEditingMenu(null);
      setTab("WEBSITE");

      await refreshAll();
    } catch (error) {
      const message = getMenuManagementApiError(error);

      setNotice({
        type: "error",
        text: message,
      });

      throw new Error(message);
    }
  };

  const confirmDeleteFood = async () => {
    if (!deletingFood) return;

    try {
      await deleteFood(deletingFood.uuid).unwrap();

      setDeletingFood(null);

      setNotice({
        type: "success",
        text: "បានប្តូរ Food Catalog ទៅជា 'អសកម្ម' (Inactive) ដោយជោគជ័យ។",
      });

      await refreshAll();
    } catch (error) {
      setNotice({
        type: "error",
        text: getMenuManagementApiError(error),
      });
    }
  };

  const confirmDeleteMenu = async () => {
    if (!deletingMenu) return;

    try {
      await deleteMenuItem(deletingMenu.uuid).unwrap();

      setDeletingMenu(null);

      setNotice({
        type: "success",
        text: "បានលុប Menu Item។",
      });

      await refreshAll();
    } catch (error) {
      setNotice({
        type: "error",
        text: getMenuManagementApiError(error),
      });
    }
  };

  return (
    <div className="w-full min-w-0 max-w-full space-y-5">
      {/* =====================================================
          HEADER
          Same visual concept as UsersHeader / ShopsHeader
      ====================================================== */}
      <section className="relative overflow-hidden rounded-[30px] bg-[#14833E] px-6 py-7 text-white shadow-sm sm:px-8 sm:py-8">
        <div className="pointer-events-none absolute -right-12 -top-16 h-52 w-52 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-24 right-20 h-64 w-64 rounded-full bg-white/5" />

        <div className="relative flex flex-col gap-7 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15">
                <Utensils size={25} />
              </div>

              <div className="min-w-0">
                <p className="text-5xl font-bold text-accent-400">
                  ប្រភេទអាហារ
                </p>

                <p className="mt-6 max-w-3xl text-xl leading-7 text-white/85">
                  Food Catalog សម្រាប់ហាង និង <br className="md:block max-md:hidden" /> Menu Items សម្រាប់ វែបសាយ
                </p>
              </div>
            </div>

            {/* Statistics */}
            <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Stat
                icon={<Store size={20} />}
                label="Food Catalog សម្រាប់ហាង"
                value={foods.length}
              />

              <Stat
                icon={<Globe2 size={20} />}
                label="Menu Items លើ វែបសាយ"
                value={menuItems.length}
              />
            </div>
          </div>

          {/* Header actions */}
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <button
              type="button"
              onClick={() => {
                setEditingFood(null);
                setFoodModalOpen(true);
              }}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-white px-5 text-lg font-bold text-primary-800 shadow-sm transition hover:bg-primary-50 focus:outline-none focus:ring-4 focus:ring-white/20 sm:w-auto"
            >
              <Plus size={20} />
              បន្ថែមមីនុយ
            </button>

            <button
              type="button"
              onClick={() => {
                setEditingMenu(null);
                setMenuModalOpen(true);
              }}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-white/25 bg-white/15 px-5 text-lg font-bold text-white transition hover:bg-white/20 focus:outline-none focus:ring-4 focus:ring-white/20 sm:w-auto"
            >
              <Globe2 size={20} />
              Publish ទៅ វែបសាយ
            </button>
          </div>
        </div>
      </section>

      {/* =====================================================
          TABS + SEARCH + REFRESH
          Same compact toolbar concept as UsersManager
      ====================================================== */}
      <div className="flex w-full flex-nowrap items-center justify-between gap-4 overflow-x-auto pb-1">
        <div className="flex shrink-0 items-center gap-2">
          <TabButton active={tab === "FOODS"} onClick={() => setTab("FOODS")}>
            <Store size={19} />
            សម្រាប់ហាង
            <Count active={tab === "FOODS"}>{foods.length}</Count>
          </TabButton>

          <TabButton
            active={tab === "WEBSITE"}
            onClick={() => setTab("WEBSITE")}
          >
            <Globe2 size={19} />
            វែបសាយ
            <Count active={tab === "WEBSITE"}>{menuItems.length}</Count>
          </TabButton>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <div className="relative">
            <Search
              size={19}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="ស្វែងរក..."
              className="h-11 w-[360px] rounded-2xl border border-gray-200 bg-white pl-11 pr-4 text-lg text-gray-700 outline-none transition placeholder:text-gray-400 hover:border-gray-300 focus:border-primary-600 focus:ring-2 focus:ring-primary-100"
            />
          </div>

          <button
            type="button"
            onClick={() => setFilterModalOpen(true)}
            className={`flex h-12 items-center gap-2 rounded-2xl border px-4 text-xs font-bold transition shadow-xs ${isAdvancedFilterActive
                ? "border-emerald-600 bg-emerald-700 text-white"
                : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
              }`}
          >
            <Sliders size={16} />
            <span>តម្រងកម្រិតខ្ពស់</span>
            {activeFilterCount > 0 && (
              <span className="rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-extrabold text-white">
                {activeFilterCount}
              </span>
            )}
          </button>

          <button
            type="button"
            disabled={foodsQuery.isFetching || menuItemsQuery.isFetching || discoveryLoading}
            onClick={() => void refreshAll()}
            aria-label="Refresh"
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-500 transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={19}
              className={
                foodsQuery.isFetching || menuItemsQuery.isFetching || discoveryLoading
                  ? "animate-spin"
                  : ""
              }
            />
          </button>
        </div>
      </div>

      {/* =====================================================
          NOTICE
      ====================================================== */}
      {notice && (
        <div
          className={`rounded-2xl border px-5 py-4 text-lg leading-7 ${notice.type === "success"
              ? "border-primary-100 bg-primary-50 text-primary-700"
              : "border-red-100 bg-red-50 text-red-600"
            }`}
        >
          {notice.text}
        </div>
      )}

      {/* =====================================================
          TABLE / CONTENT AREA
      ====================================================== */}
      <section className="w-full min-w-0 max-w-full overflow-hidden rounded-[24px] border border-gray-100 bg-white shadow-sm">
        {currentLoading ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center">
            <Loader2 size={32} className="animate-spin text-primary-800" />

            <p className="mt-3 text-lg font-medium text-gray-500">
              កំពុងទាញយកទិន្នន័យ...
            </p>
          </div>
        ) : currentError ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
              <AlertTriangle size={28} />
            </div>

            <p className="mt-4 text-2xl font-semibold text-primary-800">
              មិនអាចទាញយកទិន្នន័យបានទេ
            </p>

            <p className="mt-2 max-w-xl text-lg leading-8 text-gray-500">
              {getMenuManagementApiError(currentError)}
            </p>

            <button
              type="button"
              onClick={() => void refreshAll()}
              className="mt-5 inline-flex min-h-12 items-center justify-center rounded-full bg-primary-800 px-6 text-lg font-medium text-white transition hover:bg-primary-900 focus:outline-none focus:ring-4 focus:ring-primary-200"
            >
              សាកល្បងម្តងទៀត
            </button>
          </div>
        ) : tab === "FOODS" ? (
          <FoodCatalogTable
            items={filteredFoods}
            busy={busy}
            onEdit={(item) => {
              setEditingFood(item);
              setFoodModalOpen(true);
            }}
            onDelete={setDeletingFood}
          />
        ) : (
          <PublishedMenuItemsTable
            items={isAdvancedFilterActive ? (discoveryData?.contents ?? []) : filteredMenuItems}
            busy={busy || discoveryLoading}
            onView={(item) => setDetailUuid(item.uuid || (item as any).menuItemUuid)}
            onEdit={(item) => {
              setEditingMenu(item);
              setMenuModalOpen(true);
            }}
            onDelete={setDeletingMenu}
          />
        )}
      </section>

      {/* =====================================================
          FOOD CREATE / EDIT MODAL
      ====================================================== */}
      <FoodFormModal
        open={foodModalOpen}
        item={editingFood}
        categories={categoriesQuery.data ?? []}
        cuisines={cuisinesQuery.data ?? []}
        seasons={seasonsQuery.data ?? []}
        events={eventsQuery.data ?? []}
        weatherConditions={weatherQuery.data ?? []}
        mealTypes={mealTypesQuery.data?.contents ?? []}
        ageGroups={ageGroupsQuery.data?.contents ?? []}
        dietaryTypes={dietaryTypesQuery.data?.contents ?? []}
        saving={creatingFood || updatingFood}
        onClose={() => {
          if (creatingFood || updatingFood) {
            return;
          }

          setFoodModalOpen(false);
          setEditingFood(null);
        }}
        onSubmit={saveFood}
      />

      {/* =====================================================
          PUBLISH / EDIT MENU ITEM MODAL
      ====================================================== */}
      <PublishMenuItemModal
        open={menuModalOpen}
        item={editingMenu}
        foods={foods}
        stores={storesQuery.data ?? []}
        ingredients={ingredientsQuery.data ?? []}
        dietaryTypes={dietaryTypesQuery.data?.contents ?? []}
        allergens={allergensQuery.data?.contents ?? []}
        saving={creatingMenuItem || updatingMenuItem}
        onClose={() => {
          if (creatingMenuItem || updatingMenuItem) {
            return;
          }

          setMenuModalOpen(false);
          setEditingMenu(null);
        }}
        onSubmit={saveMenuItem}
      />

      {/* =====================================================
          DELETE FOOD CONFIRMATION
      ====================================================== */}
      <DeleteConfirmModal
        open={Boolean(deletingFood)}
        title="បិទដំណើរការ Food Catalog (Deactivate)?"
        description={
          deletingFood
            ? `Food "${deletingFood.localName || deletingFood.canonicalName
            }" នឹងត្រូវប្តូរស្ថានភាពទៅជា 'អសកម្ម' (Inactive)។`
            : ""
        }
        deleting={deletingFoodRequest}
        onClose={() => setDeletingFood(null)}
        onConfirm={() => void confirmDeleteFood()}
      />

      {/* =====================================================
          DELETE MENU ITEM CONFIRMATION
      ====================================================== */}
      <DeleteConfirmModal
        open={Boolean(deletingMenu)}
        title="លុប Menu Item?"
        description={deletingMenu ? `Menu Item: ${deletingMenu.name}.` : ""}
        deleting={deletingMenuItemRequest}
        onClose={() => setDeletingMenu(null)}
        onConfirm={() => void confirmDeleteMenu()}
      />

      {/* =====================================================
          MENU ITEM DETAIL MODAL
      ====================================================== */}
      <MenuItemDetailModal
        uuid={detailUuid}
        onClose={() => setDetailUuid(null)}
      />

      <AdvancedFilterModal
        isOpen={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        onApply={handleApplyAdvancedFilters}
        onReset={handleResetAdvancedFilters}
        currentFilters={advancedFilters}
        activeFilterCount={activeFilterCount}
      />
    </div>
  );
}

/* =========================================================
   HEADER STAT
   Same card style as Users / Shops header stats
========================================================= */

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-3xl bg-white/20 px-5 py-4">
      <div className="flex items-center gap-2 text-xl text-white/80">
        {icon}
        <span>{label}</span>
      </div>

      <p className="mt-1 text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

/* =========================================================
   TAB BUTTON
========================================================= */

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-lg font-medium transition ${active
          ? "bg-primary-800 text-white"
          : "bg-white text-gray-500 hover:bg-primary-50 hover:text-primary-800"
        }`}
    >
      {children}
    </button>
  );
}

/* =========================================================
   TAB COUNT
========================================================= */

function Count({
  active,
  children,
}: {
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`flex h-7 min-w-7 items-center justify-center rounded-full px-1.5 text-lg font-medium ${active ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
        }`}
    >
      {children}
    </span>
  );
}
