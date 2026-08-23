"use client";

import {
  AlertTriangle,
  Globe2,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Store,
  Utensils,
  X,
  Layers,
} from "lucide-react";

import { useMemo, useState } from "react";

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
import { useGetShopsQuery } from "@/src/app/store/shop/shopApi";

import { getMenuManagementApiError } from "@/src/lib/menuManagementApiError";
import { isDrinkCategory, isFoodCategory, DRINK_KEYWORDS, extractKhmerOnlyName } from "@/src/lib/catalogCategoryHelper";

import type {
  FoodRecord,
  FoodWritePayload,
  MenuItemRecord,
  MenuItemWritePayload,
} from "@/src/types/menu-management";

import DeleteConfirmModal from "./DeleteConfirmModal";
import FoodCatalogTable from "./FoodCatalogTable";
import FoodDetailModal from "./FoodDetailModal";
import FoodFormModal from "./FoodFormModal";
import MenuItemDetailModal from "./MenuItemDetailModal";
import PublishMenuItemModal from "./PublishMenuItemModal";
import PublishedMenuItemsTable from "./PublishedMenuItemsTable";

type Notice = {
  type: "success" | "error";
  text: string;
} | null;

export default function MenuItemsManager({
  initialTab = "WEBSITE",
  catalogType = "ALL",
}: {
  initialTab?: "FOODS" | "WEBSITE";
  catalogType?: "FOOD" | "DRINK" | "ALL";
}) {
  const isCatalogMode = catalogType === "FOOD" || catalogType === "DRINK";
  const [search, setSearch] = useState("");
  const [selectedStoreUuid, setSelectedStoreUuid] = useState("");
  const [selectedCategoryUuid, setSelectedCategoryUuid] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [sortOrder, setSortOrder] = useState<"NEWEST" | "PRICE_ASC" | "PRICE_DESC">("NEWEST");
  const [notice, setNotice] = useState<Notice>(null);

  const [foodModalOpen, setFoodModalOpen] = useState(false);
  const [editingFood, setEditingFood] = useState<FoodRecord | null>(null);
  const [foodDetailUuid, setFoodDetailUuid] = useState<string | null>(null);

  const [menuModalOpen, setMenuModalOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<MenuItemRecord | null>(null);

  const [deletingFood, setDeletingFood] = useState<FoodRecord | null>(null);
  const [deletingMenu, setDeletingMenu] = useState<MenuItemRecord | null>(null);

  const [detailUuid, setDetailUuid] = useState<string | null>(null);

  const foodsQuery = useGetManagedFoodsQuery({
    page: 0,
    size: 500,
    sort: "createdAt,desc",
  });

  const menuItemsQuery = useGetPublishedMenuItemsQuery({
    page: 0,
    size: 500,
    sort: "createdAt,desc",
  });

  const categoriesQuery = useGetManagedFoodCategoriesQuery();
  const cuisinesQuery = useGetManagedCuisinesQuery();
  const ingredientsQuery = useGetManagedIngredientsQuery();
  const storesQuery = useGetManagedStoresQuery();
  // Real server-side total of approved+active stores, not the length of a
  // single size-100-capped page — mirrors ShopsManager's total-count pattern.
  const approvedStoresCountQuery = useGetShopsQuery({
    reviewStatus: "APPROVED",
    size: 1,
  });
  const seasonsQuery = useGetManagedSeasonsQuery();
  const eventsQuery = useGetManagedEventsQuery();
  const weatherQuery = useGetManagedWeatherConditionsQuery();
  const mealTypesQuery = useGetMealTypesQuery({ page: 0, size: 100 });
  const ageGroupsQuery = useGetAgeGroupsQuery({ page: 0, size: 100 });
  const dietaryTypesQuery = useGetDietaryTypesQuery({ page: 0, size: 100 });
  const allergensQuery = useGetAllergensQuery({ page: 0, size: 100 });

  const [createFood, { isLoading: creatingFood }] = useCreateManagedFoodMutation();
  const [updateFood, { isLoading: updatingFood }] = useUpdateManagedFoodMutation();
  const [deleteFood, { isLoading: deletingFoodRequest }] = useDeleteManagedFoodMutation();

  const [createMenuItem, { isLoading: creatingMenuItem }] = useCreateStoreMenuItemMutation();
  const [updateMenuItem, { isLoading: updatingMenuItem }] = useUpdateStoreMenuItemMutation();
  const [deleteMenuItem, { isLoading: deletingMenuItemRequest }] = useDeleteStoreMenuItemMutation();

  const foods = foodsQuery.data?.content ?? [];
  const menuItems = menuItemsQuery.data?.content ?? [];
  const stores = storesQuery.data ?? [];
  const allCategories = categoriesQuery.data ?? [];

  // Filter categories relevant to the current catalog mode (only active ones)
  const relevantCategories = useMemo(() => {
    if (catalogType === "DRINK") {
      return allCategories.filter(
        (c) => c.isActive !== false && isDrinkCategory(c, allCategories) && Boolean(c.parentCategoryUuid),
      );
    }
    if (catalogType === "FOOD") {
      return allCategories.filter(
        (c) => c.isActive !== false && isFoodCategory(c, allCategories) && Boolean(c.parentCategoryUuid),
      );
    }
    return allCategories.filter((c) => c.isActive !== false && Boolean(c.parentCategoryUuid));
  }, [allCategories, catalogType]);

  // Catalog Foods filtered by FOOD vs DRINK mode
  const displayFoods = useMemo(() => {
    if (catalogType === "DRINK") {
      return foods.filter((item) => {
        const cat = allCategories.find(
          (c) =>
            c.uuid === item.categoryUuid ||
            c.uuid === item.category?.uuid ||
            c.name === item.category?.name ||
            c.name === item.categoryName,
        );
        if (cat) return isDrinkCategory(cat, allCategories);
        const catName = (item.category?.name ?? item.categoryName ?? "").toLowerCase();
        const itemName = `${item.canonicalName ?? ""} ${item.localName ?? ""}`.toLowerCase();
        return DRINK_KEYWORDS.some((kw) => catName.includes(kw) || itemName.includes(kw));
      });
    }

    if (catalogType === "FOOD") {
      return foods.filter((item) => {
        const cat = allCategories.find(
          (c) =>
            c.uuid === item.categoryUuid ||
            c.uuid === item.category?.uuid ||
            c.name === item.category?.name ||
            c.name === item.categoryName,
        );
        if (cat) return isFoodCategory(cat, allCategories);
        const catName = (item.category?.name ?? item.categoryName ?? "").toLowerCase();
        const itemName = `${item.canonicalName ?? ""} ${item.localName ?? ""}`.toLowerCase();
        return !DRINK_KEYWORDS.some((kw) => catName.includes(kw) || itemName.includes(kw));
      });
    }

    return foods;
  }, [foods, catalogType, allCategories]);

  // Search & Filter Foods Catalog
  const filteredFoods = useMemo(() => {
    let result = displayFoods;

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((item) => {
        const cat = allCategories.find(
          (c) => c.uuid === item.categoryUuid || c.uuid === item.category?.uuid,
        );
        const cui = (cuisinesQuery.data ?? []).find(
          (c) => c.uuid === item.cuisineUuid || c.uuid === item.cuisine?.uuid,
        );
        return [
          item.canonicalName,
          item.localName,
          item.description,
          cat?.name,
          (cat as any)?.localName,
          cui?.name,
          (cui as any)?.localName,
          item.category?.name,
          item.categoryName,
          item.cuisine?.name,
          item.cuisineName,
        ].some((val) => String(val ?? "").toLowerCase().includes(q));
      });
    }

    if (selectedCategoryUuid) {
      result = result.filter(
        (item) =>
          item.category?.uuid === selectedCategoryUuid ||
          item.categoryUuid === selectedCategoryUuid,
      );
    }

    if (selectedStatus) {
      const wantActive = selectedStatus === "ACTIVE";
      result = result.filter(
        (item) => (item.isActive ?? (item as any).active ?? true) === wantActive,
      );
    }

    return result;
  }, [displayFoods, search, selectedCategoryUuid, selectedStatus, allCategories, cuisinesQuery.data]);

  // Search & Filter Published Menu Items
  const filteredMenuItems = useMemo(() => {
    let result = menuItems;

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((item) =>
        [
          item.name,
          item.description,
          item.store?.storeName,
          item.store?.name,
          item.food?.canonicalName,
          item.food?.localName,
          item.availabilityStatus,
        ].some((val) => String(val ?? "").toLowerCase().includes(q)),
      );
    }

    if (selectedStoreUuid) {
      result = result.filter(
        (item) =>
          item.store?.uuid === selectedStoreUuid ||
          item.storeUuid === selectedStoreUuid ||
          (item as any).store?.id === selectedStoreUuid,
      );
    }

    if (selectedCategoryUuid) {
      result = result.filter(
        (item) =>
          item.food?.category?.uuid === selectedCategoryUuid ||
          item.food?.categoryUuid === selectedCategoryUuid ||
          (item.food?.category as any)?.id === selectedCategoryUuid,
      );
    }

    if (selectedStatus) {
      result = result.filter((item) => item.availabilityStatus === selectedStatus);
    }

    if (sortOrder === "PRICE_ASC") {
      result = [...result].sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
    } else if (sortOrder === "PRICE_DESC") {
      result = [...result].sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
    }

    return result;
  }, [menuItems, search, selectedStoreUuid, selectedCategoryUuid, selectedStatus, sortOrder]);

  const hasActiveFilters = Boolean(
    search || selectedStoreUuid || selectedCategoryUuid || selectedStatus || sortOrder !== "NEWEST",
  );

  const resetAllFilters = () => {
    setSearch("");
    setSelectedStoreUuid("");
    setSelectedCategoryUuid("");
    setSelectedStatus("");
    setSortOrder("NEWEST");
  };

  // Titles and Labels
  const pageTitle = useMemo(() => {
    if (catalogType === "DRINK") return "ភេសជ្ជៈ";
    if (catalogType === "FOOD") return "ម្ហូប";
    return "មីនុយ";
  }, [catalogType]);

  const pageSubtitle = useMemo(() => {
    if (catalogType === "DRINK") return "គ្រប់គ្រងបញ្ជីភេសជ្ជៈក្នុង Catalog សម្រាប់ Store ជ្រើសរើស";
    if (catalogType === "FOOD") return "គ្រប់គ្រងបញ្ជីមុខម្ហូបក្នុង Catalog សម្រាប់ Store ជ្រើសរើស";
    return "គ្រប់គ្រងមុខម្ហូបរបស់ហាង (Store Menu Items) លើ Website";
  }, [catalogType]);

  const busy =
    creatingFood ||
    updatingFood ||
    deletingFoodRequest ||
    creatingMenuItem ||
    updatingMenuItem ||
    deletingMenuItemRequest;

  const currentLoading = isCatalogMode ? foodsQuery.isLoading : menuItemsQuery.isLoading;
  const currentError = isCatalogMode ? foodsQuery.error : menuItemsQuery.error;

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

      const targetUuid =
        editingMenu?.uuid ||
        (editingMenu as any)?.menuItemUuid ||
        (editingMenu as any)?.id;

      if (targetUuid && String(targetUuid) !== "undefined") {
        try {
          await updateMenuItem({
            uuid: String(targetUuid),
            payload,
            images,
          }).unwrap();

          setNotice({
            type: "success",
            text: "បានកែប្រែ Menu Item ដោយជោគជ័យ។",
          });
        } catch (updateErr: any) {
          if (
            updateErr?.status === 404 ||
            updateErr?.data?.status === 404 ||
            updateErr?.status === 400
          ) {
            await createMenuItem({
              storeUuid,
              payload,
              images,
            }).unwrap();

            setNotice({
              type: "success",
              text: "បាន Publish Menu Item ទៅ Store ដោយជោគជ័យ។",
            });
          } else {
            throw updateErr;
          }
        }
      } else {
        await createMenuItem({
          storeUuid,
          payload,
          images,
        }).unwrap();

        setNotice({
          type: "success",
          text: "បានបង្កើត និង Publish Menu Item សម្រាប់ Store ដោយជោគជ័យ។",
        });
      }

      setMenuModalOpen(false);
      setEditingMenu(null);
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
      setNotice(null);
      await deleteFood(deletingFood.uuid).unwrap();
      setNotice({
        type: "success",
        text: `បានប្តូរស្ថានភាព "${
          deletingFood.localName || deletingFood.canonicalName
        }" ទៅជា 'អសកម្ម' (Inactive)។`,
      });
      setDeletingFood(null);
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
      setNotice(null);
      const targetUuid =
        deletingMenu.uuid ||
        (deletingMenu as any).menuItemUuid ||
        (deletingMenu as any).id;

      await deleteMenuItem(String(targetUuid)).unwrap();
      setNotice({
        type: "success",
        text: `បានលុប Menu Item "${deletingMenu.name}" ដោយជោគជ័យ។`,
      });
      setDeletingMenu(null);
      await refreshAll();
    } catch (error) {
      setNotice({
        type: "error",
        text: getMenuManagementApiError(error),
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="relative overflow-hidden rounded-[28px] bg-linear-to-r from-[#137A3D] via-[#15803d] to-[#166534] p-6 text-white shadow-xl sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md ring-1 ring-white/20 shadow-inner">
              {isCatalogMode ? <Layers size={32} /> : <Utensils size={32} />}
            </div>

            <div>
              <h1 className="text-3xl font-black tracking-tight">{pageTitle}</h1>
              <p className="mt-1 text-sm font-medium text-emerald-100/90">{pageSubtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isCatalogMode ? (
              <button
                type="button"
                onClick={() => {
                  setEditingFood(null);
                  setFoodModalOpen(true);
                }}
                className="inline-flex h-12 items-center gap-2 rounded-2xl bg-white px-5 text-sm font-black text-[#137A3D] shadow-md hover:bg-emerald-50 transition active:scale-95"
              >
                <Plus size={18} />
                {catalogType === "DRINK" ? "បន្ថែមភេសជ្ជៈថ្មី" : "បន្ថែមមុខម្ហូបថ្មី"}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setEditingMenu(null);
                  setMenuModalOpen(true);
                }}
                className="inline-flex h-12 items-center gap-2 rounded-2xl bg-white px-5 text-sm font-black text-[#137A3D] shadow-md hover:bg-emerald-50 transition active:scale-95"
              >
                <Plus size={18} />
                បង្កើត Menu Item
              </button>
            )}
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {isCatalogMode ? (
            <>
              <Stat
                icon={<Layers size={20} />}
                label={catalogType === "DRINK" ? "ភេសជ្ជៈក្នុង Catalog" : "មុខម្ហូបក្នុង Catalog"}
                value={displayFoods.length}
              />
              <Stat
                icon={<Store size={20} />}
                label="ប្រភេទសរុប"
                value={relevantCategories.length}
              />
            </>
          ) : (
            <>
              <Stat
                icon={<Globe2 size={20} />}
                label="Menu Items លើ Website"
                value={menuItemsQuery.data?.totalElements ?? menuItems.length}
              />
              <Stat
                icon={<Store size={20} />}
                label="ហាងសរុប (Approved)"
                value={approvedStoresCountQuery.data?.totalElements ?? stores.length}
              />
              <Stat
                icon={<Layers size={20} />}
                label="Food Catalog សម្រាប់ Store"
                value={foodsQuery.data?.totalElements ?? foods.length}
              />
            </>
          )}
        </div>
      </div>

      {/* Clean, Horizontal Inline Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          {/* Search Box */}
          <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
            <Search
              size={17}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isCatalogMode ? "ស្វែងរកមុខម្ហូប..." : "ស្វែងរកតាមឈ្មោះ, ហាង..."}
              className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50/50 pl-10 pr-4 text-sm font-medium outline-none focus:border-[#137A3D] focus:bg-white focus:ring-3 focus:ring-emerald-50 transition"
            />
          </div>

          {/* Store Filter (For Menu Items Page Only) */}
          {!isCatalogMode && stores.length > 0 && (
            <select
              value={selectedStoreUuid}
              onChange={(e) => setSelectedStoreUuid(e.target.value)}
              className="h-10 rounded-xl border border-gray-200 bg-gray-50/50 px-3 text-xs font-bold text-gray-700 outline-none focus:border-[#137A3D] focus:bg-white focus:ring-3 focus:ring-emerald-50 transition"
            >
              <option value="">ហាងទាំងអស់</option>
              {stores.map((s) => (
                <option key={s.uuid} value={s.uuid}>
                  {s.storeName || s.name || s.localName || s.uuid}
                </option>
              ))}
            </select>
          )}

          {/* Category Filter */}
          <select
            value={selectedCategoryUuid}
            onChange={(e) => setSelectedCategoryUuid(e.target.value)}
            className="h-10 rounded-xl border border-gray-200 bg-gray-50/50 px-3 text-xs font-bold text-gray-700 outline-none focus:border-[#137A3D] focus:bg-white focus:ring-3 focus:ring-emerald-50 transition"
          >
            <option value="">ប្រភេទទាំងអស់</option>
            {relevantCategories.map((c) => (
              <option key={c.uuid} value={c.uuid}>
                {extractKhmerOnlyName(c.name)}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-10 rounded-xl border border-gray-200 bg-gray-50/50 px-3 text-xs font-bold text-gray-700 outline-none focus:border-[#137A3D] focus:bg-white focus:ring-3 focus:ring-emerald-50 transition"
          >
            <option value="">ស្ថានភាពទាំងអស់</option>
            {isCatalogMode ? (
              <>
                <option value="ACTIVE">សកម្ម (Active)</option>
                <option value="INACTIVE">អសកម្ម (Inactive)</option>
              </>
            ) : (
              <>
                <option value="AVAILABLE">មានលក់ (Available)</option>
                <option value="OUT_OF_STOCK">អស់ (Out of Stock)</option>
                <option value="ARCHIVED">ផ្អាកលក់ (Archived)</option>
              </>
            )}
          </select>

          {/* Sort Order (For Menu Items) */}
          {!isCatalogMode && (
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="h-10 rounded-xl border border-gray-200 bg-gray-50/50 px-3 text-xs font-bold text-gray-700 outline-none focus:border-[#137A3D] focus:bg-white focus:ring-3 focus:ring-emerald-50 transition"
            >
              <option value="NEWEST">ថ្មីបំផុត</option>
              <option value="PRICE_ASC">តម្លៃ: ទាប ទៅ ខ្ពស់</option>
              <option value="PRICE_DESC">តម្លៃ: ខ្ពស់ ទៅ ទាប</option>
            </select>
          )}

          {/* Reset Filters Button */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetAllFilters}
              className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-gray-100 px-3 text-xs font-bold text-gray-600 hover:bg-gray-200 transition active:scale-95"
            >
              <X size={14} />
              កំណត់ឡើងវិញ
            </button>
          )}
        </div>

        {/* Refresh Button */}
        <button
          type="button"
          disabled={foodsQuery.isFetching || menuItemsQuery.isFetching}
          onClick={() => void refreshAll()}
          title="Refresh Data"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition active:scale-95"
        >
          <RefreshCw
            size={16}
            className={foodsQuery.isFetching || menuItemsQuery.isFetching ? "animate-spin" : ""}
          />
        </button>
      </div>

      {/* Alert Notice Banner */}
      {notice && (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm font-medium ${
            notice.type === "success"
              ? "border-emerald-100 bg-emerald-50 text-emerald-700"
              : "border-red-100 bg-red-50 text-red-600"
          }`}
        >
          {notice.text}
        </div>
      )}

      {/* Data Table Section */}
      <section className="overflow-hidden rounded-[26px] border border-gray-100 bg-white shadow-sm">
        {currentLoading ? (
          <div className="flex min-h-[360px] items-center justify-center">
            <Loader2 size={30} className="animate-spin text-[#137A3D]" />
          </div>
        ) : currentError ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center">
            <AlertTriangle size={38} className="text-red-400" />
            <h3 className="mt-3 text-xl font-black text-gray-900">
              មិនអាចទាញយកទិន្នន័យបានទេ
            </h3>
            <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500">
              {getMenuManagementApiError(currentError)}
            </p>
          </div>
        ) : isCatalogMode ? (
          <FoodCatalogTable
            items={filteredFoods}
            categories={allCategories}
            cuisines={cuisinesQuery.data ?? []}
            busy={busy}
            onView={(item) => setFoodDetailUuid(item.uuid)}
            onEdit={(item) => {
              setEditingFood(item);
              setFoodModalOpen(true);
            }}
            onDelete={setDeletingFood}
          />
        ) : (
          <PublishedMenuItemsTable
            items={filteredMenuItems}
            foods={foods}
            busy={busy}
            onView={(item) => setDetailUuid(item.uuid)}
            onEdit={(item) => {
              setEditingMenu(item);
              setMenuModalOpen(true);
            }}
            onDelete={setDeletingMenu}
          />
        )}
      </section>

      {/* Food Creation & Edit Modal */}
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
        catalogType={catalogType}
        onClose={() => {
          if (creatingFood || updatingFood) return;
          setFoodModalOpen(false);
          setEditingFood(null);
        }}
        onSubmit={saveFood}
      />

      {/* Menu Item Publish Modal */}
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

      {/* Delete / Deactivate Confirmations */}
      <DeleteConfirmModal
        open={Boolean(deletingFood)}
        title="បិទដំណើរការ Food Catalog (Deactivate)?"
        description={
          deletingFood
            ? `Food "${
                deletingFood.localName || deletingFood.canonicalName
              }" នឹងត្រូវប្តូរស្ថានភាពទៅជា 'អសកម្ម' (Inactive)។`
            : ""
        }
        deleting={deletingFoodRequest}
        onClose={() => setDeletingFood(null)}
        onConfirm={() => void confirmDeleteFood()}
      />

      <DeleteConfirmModal
        open={Boolean(deletingMenu)}
        title="លុប Menu Item?"
        description={deletingMenu ? `Menu Item: ${deletingMenu.name}.` : ""}
        deleting={deletingMenuItemRequest}
        onClose={() => setDeletingMenu(null)}
        onConfirm={() => void confirmDeleteMenu()}
      />

      {/* Detail View Modals */}
      <MenuItemDetailModal
        uuid={detailUuid}
        onClose={() => setDetailUuid(null)}
      />

      <FoodDetailModal
        uuid={foodDetailUuid}
        onClose={() => setFoodDetailUuid(null)}
        onEdit={(item) => {
          setFoodDetailUuid(null);
          setEditingFood(item);
          setFoodModalOpen(true);
        }}
      />
    </div>
  );
}

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
    <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10 backdrop-blur-xs">
      <div className="flex items-center gap-2 text-white/80">
        {icon}
        <span className="text-sm font-bold">{label}</span>
      </div>
      <p className="mt-2 text-3xl font-black">{value}</p>
    </div>
  );
}
