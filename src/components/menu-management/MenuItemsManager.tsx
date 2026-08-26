"use client";

import {
  AlertCircle,
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronDown,
  Filter,
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

import { useEffect, useMemo, useState } from "react";

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
  useGetPublishedMenuItemsQuery,
  useUpdateManagedFoodMutation,
  useUpdateStoreMenuItemMutation,
} from "@/src/app/store/menuManagementApi";
import { useGetWeatherConditionsQuery } from "@/src/app/store/weatherConditionApi";
import { useGetMealTypesQuery } from "@/src/app/store/mealTypeApi";
import { useGetAgeGroupsQuery } from "@/src/app/store/ageGroupApi";
import { useGetDietaryTypesQuery } from "@/src/app/store/dietaryTypeApi";
import { useGetAllergensQuery } from "@/src/app/store/allergenApi";
import { useGetMedicalConditionsQuery } from "@/src/app/store/medicalConditionApi";
import { useGetShopsQuery } from "@/src/app/store/shop/shopApi";
import { readFilterCatalog, saveFoodRelationsStorage } from "@/src/lib/filterCatalogStorage";
import CustomSelect from "../ui/CustomSelect";

import { getMenuManagementApiError } from "@/src/lib/menuManagementApiError";
import {
  isDrinkCategory,
  isFoodCategory,
  DRINK_KEYWORDS,
  extractKhmerOnlyName,
} from "@/src/lib/catalogCategoryHelper";

import type {
  FoodRecord,
  FoodWritePayload,
  MenuItemRecord,
  MenuItemWritePayload,
  StoreOption,
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
  const [selectedCuisineUuid, setSelectedCuisineUuid] = useState("");
  const [selectedSeasonUuid, setSelectedSeasonUuid] = useState("");
  const [selectedEventUuid, setSelectedEventUuid] = useState("");
  const [selectedWeatherUuid, setSelectedWeatherUuid] = useState("");
  const [selectedAgeGroupUuid, setSelectedAgeGroupUuid] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [sortOrder, setSortOrder] = useState<
    "NEWEST" | "OLDEST" | "NAME_ASC" | "NAME_DESC" | "PRICE_ASC" | "PRICE_DESC"
  >("NEWEST");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sizeOpen, setSizeOpen] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => {
      setNotice(null);
    }, 4500);
    return () => clearTimeout(timer);
  }, [notice]);

  const [foodModalOpen, setFoodModalOpen] = useState(false);
  const [editingFood, setEditingFood] = useState<FoodRecord | null>(null);
  const [foodDetailUuid, setFoodDetailUuid] = useState<string | null>(null);

  const [menuModalOpen, setMenuModalOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<MenuItemRecord | null>(null);

  const [softDeletingFood, setSoftDeletingFood] = useState<FoodRecord | null>(null);
  const [hardDeletingFood, setHardDeletingFood] = useState<FoodRecord | null>(null);

  const [softDeletingMenu, setSoftDeletingMenu] = useState<MenuItemRecord | null>(null);
  const [hardDeletingMenu, setHardDeletingMenu] = useState<MenuItemRecord | null>(null);

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
  const storesQuery = useGetManagedStoresQuery();
  const allShopsListQuery = useGetShopsQuery({
    reviewStatus: "APPROVED",
    accountStatus: "ACTIVE",
    size: 100,
  });
  const approvedStoresCountQuery = useGetShopsQuery({
    reviewStatus: "APPROVED",
    accountStatus: "ACTIVE",
    size: 1,
  });

  // Metadata queries for filtering and form selection
  const modalActive = foodModalOpen || menuModalOpen;
  const ingredientsQuery = useGetManagedIngredientsQuery(undefined, { skip: !modalActive });
  const seasonsQuery = useGetManagedSeasonsQuery();
  const eventsQuery = useGetManagedEventsQuery();
  const weatherQuery = useGetWeatherConditionsQuery({ page: 0, size: 100 });
  const mealTypesQuery = useGetMealTypesQuery({ page: 0, size: 100 }, { skip: !modalActive });
  const ageGroupsQuery = useGetAgeGroupsQuery({ page: 0, size: 100 });
  const dietaryTypesQuery = useGetDietaryTypesQuery({ page: 0, size: 100 }, { skip: !modalActive });
  const allergensQuery = useGetAllergensQuery({ page: 0, size: 100 }, { skip: !modalActive });
  const medicalConditionsQuery = useGetMedicalConditionsQuery({ page: 0, size: 100 }, { skip: !modalActive });

  const activeWeatherConditions = useMemo(() => {
    const server = weatherQuery.data?.contents ?? [];
    return server.filter((w) => (w.isActive ?? w.active) !== false);
  }, [weatherQuery.data]);

  const activeDietaryTypes = useMemo(
    () => (dietaryTypesQuery.data?.contents ?? []).filter((d) => d.active !== false),
    [dietaryTypesQuery.data],
  );

  const activeAllergens = useMemo(
    () => (allergensQuery.data?.contents ?? []).filter((a) => a.active !== false),
    [allergensQuery.data],
  );

  const activeMedicalConditions = useMemo(
    () => (medicalConditionsQuery.data?.contents ?? []).filter((m) => m.active !== false),
    [medicalConditionsQuery.data],
  );

  const activeMealTypes = useMemo(
    () => (mealTypesQuery.data?.contents ?? []).filter((m) => m.isActive !== false),
    [mealTypesQuery.data],
  );

  const activeAgeGroups = useMemo(
    () => (ageGroupsQuery.data?.contents ?? []).filter((a) => a.isActive !== false),
    [ageGroupsQuery.data],
  );

  const activeSeasons = useMemo(
    () => (seasonsQuery.data ?? []).filter((s) => s.isActive !== false),
    [seasonsQuery.data],
  );

  const activeEvents = useMemo(
    () => (eventsQuery.data ?? []).filter((e) => e.isActive !== false),
    [eventsQuery.data],
  );

  const activeCuisines = useMemo(
    () => (cuisinesQuery.data ?? []).filter((c) => c.isActive !== false),
    [cuisinesQuery.data],
  );

  const filterCatalogOptions = useMemo(() => readFilterCatalog(), []);
  const preparationTimeOptions = useMemo(
    () => filterCatalogOptions.filter((o) => o.groupCode === "PREPARATION_TIME" && o.active !== false),
    [filterCatalogOptions],
  );
  const distanceOptions = useMemo(
    () => filterCatalogOptions.filter((o) => o.groupCode === "DISTANCE" && o.active !== false),
    [filterCatalogOptions],
  );
  const regionOptions = useMemo(
    () => filterCatalogOptions.filter((o) => o.groupCode === "REGION" && o.active !== false),
    [filterCatalogOptions],
  );



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

  const allCombinedStores = useMemo(() => {
    const list: StoreOption[] = [];
    const seen = new Set<string>();

    const addStore = (s: any) => {
      if (!s) return;
      const id = String(s.uuid || s.id || "");
      if (!id || seen.has(id)) return;
      seen.add(id);
      list.push(s);
    };

    (allShopsListQuery.data?.contents ?? []).forEach(addStore);
    (storesQuery.data ?? []).forEach(addStore);
    menuItems.forEach((m) => {
      if (m.store) addStore(m.store);
    });

    return list;
  }, [allShopsListQuery.data, storesQuery.data, menuItems]);

  // CustomSelect Options Memoized - Combines all stores in the system
  const storeOptions = useMemo(() => {
    const list: { value: string; label: string }[] = [];
    const seen = new Set<string>();

    const addStore = (s: any) => {
      if (!s) return;
      const id = String(s.uuid || s.id || "");
      if (!id || seen.has(id)) return;
      seen.add(id);
      const name = s.storeName || s.name || s.localName || s.headline || id;
      list.push({ value: id, label: name });
    };

    (allShopsListQuery.data?.contents ?? []).forEach(addStore);
    (storesQuery.data ?? []).forEach(addStore);
    menuItems.forEach((m) => {
      if (m.store) addStore(m.store);
    });

    return [
      { value: "", label: "ហាងទាំងអស់" },
      ...list,
    ];
  }, [allShopsListQuery.data, storesQuery.data, menuItems]);

  const cuisineOptions = useMemo(
    () => [
      { value: "", label: "វប្បធម៌ម្ហូបទាំងអស់" },
      ...activeCuisines.map((c) => ({
        value: String(c.uuid || c.code || (c as any).id || c.name || ""),
        label: (c as any).localName || c.name || c.code,
      })),
    ],
    [activeCuisines],
  );

  const seasonOptions = useMemo(
    () => [
      { value: "", label: "រដូវកាលទាំងអស់" },
      ...activeSeasons.map((s) => ({
        value: String(s.uuid || s.code || (s as any).id || s.name || ""),
        label: (s as any).localName || s.name || s.code,
      })),
    ],
    [activeSeasons],
  );

  const eventOptions = useMemo(
    () => [
      { value: "", label: "ព្រឹត្តិការណ៍ទាំងអស់" },
      ...activeEvents.map((ev) => ({
        value: String(ev.uuid || ev.code || (ev as any).id || ev.name || ""),
        label: (ev as any).localName || ev.name || ev.code,
      })),
    ],
    [activeEvents],
  );

  const weatherOptions = useMemo(
    () => [
      { value: "", label: "អាកាសធាតុទាំងអស់" },
      ...activeWeatherConditions.map((w) => ({
        value: String(w.uuid || w.code || (w as any).id || w.name || ""),
        label: (w as any).localName || w.name || w.code,
      })),
    ],
    [activeWeatherConditions],
  );

  const ageGroupOptions = useMemo(
    () => [
      { value: "", label: "ក្រុមអាយុទាំងអស់" },
      ...activeAgeGroups.map((a) => {
        const min = (a as any).minAge ?? (a as any).min_age;
        const max = (a as any).maxAge ?? (a as any).max_age;
        let rangeStr = "";
        if (typeof min === "number" && typeof max === "number") {
          rangeStr = max >= 90 ? `${min}+ ឆ្នាំ` : `${min}-${max} ឆ្នាំ`;
        }
        const nameStr = (a as any).localName || a.name || a.code || "";
        const label = rangeStr ? (nameStr ? `${rangeStr} (${nameStr})` : `${rangeStr}`) : nameStr;
        return {
          value: String(a.uuid || a.code || (a as any).id || a.name || ""),
          label,
        };
      }),
    ],
    [activeAgeGroups],
  );

  const sortOptions = useMemo(() => {
    const baseOptions = [
      { value: "NEWEST", label: "ថ្មីបំផុត" },
      { value: "OLDEST", label: "ចាស់បំផុត" },
      { value: "NAME_ASC", label: "ឈ្មោះ: (A → Z)" },
      { value: "NAME_DESC", label: "ឈ្មោះ: (Z → A)" },
    ];

    if (!isCatalogMode) {
      baseOptions.push(
        { value: "PRICE_ASC", label: "តម្លៃ: ទាប ទៅ ខ្ពស់" },
        { value: "PRICE_DESC", label: "តម្លៃ: ខ្ពស់ ទៅ ទាប" },
      );
    }

    return baseOptions;
  }, [isCatalogMode]);

  useEffect(() => {
    if (isCatalogMode && (sortOrder === "PRICE_ASC" || sortOrder === "PRICE_DESC")) {
      setSortOrder("NEWEST");
    }
  }, [isCatalogMode, sortOrder]);

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

  const categoryOptions = useMemo(
    () => [
      { value: "", label: "ប្រភេទទាំងអស់" },
      ...relevantCategories.map((c) => ({
        value: c.uuid,
        label: extractKhmerOnlyName((c as any).localName || c.name || ""),
      })),
    ],
    [relevantCategories],
  );

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
      const selectedCat = allCategories.find((c) => c.uuid === selectedCategoryUuid || (c as any).id === selectedCategoryUuid);
      const selName = (selectedCat?.name || "").toLowerCase();
      const selKhmer = extractKhmerOnlyName(selectedCat?.name || "").toLowerCase();

      result = result.filter((item) => {
        const itemCatUuid = item.category?.uuid || item.categoryUuid;
        const itemCatName = (item.category?.name || item.categoryName || "").toLowerCase();

        if (itemCatUuid && itemCatUuid === selectedCategoryUuid) return true;
        if (selectedCat && ((item.category as any)?.parentCategoryUuid === selectedCat.uuid || (item as any).parentCategoryUuid === selectedCat.uuid)) return true;
        if (selName && itemCatName && (itemCatName === selName || itemCatName.includes(selName) || selName.includes(itemCatName))) return true;
        if (selKhmer && itemCatName && extractKhmerOnlyName(itemCatName).toLowerCase() === selKhmer) return true;
        return false;
      });
    }

    if (selectedCuisineUuid) {
      const selectedCui = activeCuisines.find((c) => c.uuid === selectedCuisineUuid || (c as any).id === selectedCuisineUuid || c.code === selectedCuisineUuid);
      const selName = (selectedCui?.name || (selectedCui as any)?.localName || "").toLowerCase();
      const selCode = (selectedCui?.code || "").toLowerCase();

      result = result.filter((item) => {
        const itemCuiUuid = item.cuisine?.uuid || item.cuisineUuid || (item.cuisine as any)?.id;
        const itemCuiName = (item.cuisine?.name || item.cuisineName || "").toLowerCase();
        const itemCuiCode = (item.cuisine?.code || "").toLowerCase();

        if (itemCuiUuid && (itemCuiUuid === selectedCuisineUuid || (selectedCui && itemCuiUuid === selectedCui.uuid))) return true;
        if (selCode && itemCuiCode && itemCuiCode === selCode) return true;
        if (selName && itemCuiName && (itemCuiName === selName || itemCuiName.includes(selName) || selName.includes(itemCuiName))) return true;
        return false;
      });
    }

    if (selectedSeasonUuid) {
      const selectedSeason = activeSeasons.find((s) => s.uuid === selectedSeasonUuid || (s as any).id === selectedSeasonUuid || s.code === selectedSeasonUuid);
      const selName = (selectedSeason?.name || (selectedSeason as any)?.localName || "").toLowerCase();
      const selCode = (selectedSeason?.code || "").toLowerCase();

      result = result.filter((item) => {
        const list = Array.isArray(item.seasons) ? item.seasons : [];
        if (list.length === 0) return false;
        return list.some((s: any) => {
          const sUuid = typeof s === "string" ? s : s?.uuid || s?.seasonUuid;
          const sCode = (s?.code || s?.seasonCode || "").toLowerCase();
          const sName = (s?.name || s?.localName || (typeof s === "string" ? s : "")).toLowerCase();

          return Boolean(
            (sUuid && (sUuid === selectedSeasonUuid || (selectedSeason && sUuid === selectedSeason.uuid))) ||
            (selCode && sCode && sCode === selCode) ||
            (selName && sName && (sName.includes(selName) || selName.includes(sName)))
          );
        });
      });
    }

    if (selectedEventUuid) {
      const selectedEvent = activeEvents.find((e) => e.uuid === selectedEventUuid || (e as any).id === selectedEventUuid || e.code === selectedEventUuid);
      const selName = (selectedEvent?.name || (selectedEvent as any)?.localName || "").toLowerCase();
      const selCode = (selectedEvent?.code || "").toLowerCase();

      result = result.filter((item) => {
        const list = Array.isArray(item.events) ? item.events : [];
        if (list.length === 0) return false;
        return list.some((e: any) => {
          const eUuid = typeof e === "string" ? e : e?.uuid || e?.eventUuid;
          const eCode = (e?.code || e?.eventCode || "").toLowerCase();
          const eName = (e?.name || e?.localName || (typeof e === "string" ? e : "")).toLowerCase();

          return Boolean(
            (eUuid && (eUuid === selectedEventUuid || (selectedEvent && eUuid === selectedEvent.uuid))) ||
            (selCode && eCode && eCode === selCode) ||
            (selName && eName && (eName.includes(selName) || selName.includes(eName)))
          );
        });
      });
    }

    if (selectedWeatherUuid) {
      const selectedWeather = activeWeatherConditions.find((w) => (w.uuid || w.code) === selectedWeatherUuid || (w as any).id === selectedWeatherUuid);
      const selName = (selectedWeather?.name || (selectedWeather as any)?.localName || "").toLowerCase();
      const selCode = (selectedWeather?.code || "").toLowerCase();

      result = result.filter((item) => {
        const list = Array.isArray(item.suitableWeather) ? item.suitableWeather : [];
        if (list.length === 0) return false;
        return list.some((w: any) => {
          const wUuid = typeof w === "string" ? w : w?.uuid || w?.weatherUuid || w?.weatherConditionUuid;
          const wCode = (w?.code || w?.weatherCode || "").toLowerCase();
          const wName = (w?.name || w?.localName || (typeof w === "string" ? w : "")).toLowerCase();

          return Boolean(
            (wUuid && (wUuid === selectedWeatherUuid || (selectedWeather && wUuid === selectedWeather.uuid))) ||
            (selCode && wCode && wCode === selCode) ||
            (selName && wName && (wName.includes(selName) || selName.includes(wName)))
          );
        });
      });
    }

    if (selectedAgeGroupUuid) {
      const selectedAge = activeAgeGroups.find((a) => (a.uuid || a.code) === selectedAgeGroupUuid || (a as any).id === selectedAgeGroupUuid);
      const selName = (selectedAge?.name || (selectedAge as any)?.localName || "").toLowerCase();
      const selCode = (selectedAge?.code || "").toLowerCase();

      result = result.filter((item) => {
        const list = Array.isArray(item.ageRules) ? item.ageRules : (Array.isArray((item as any).ageGroups) ? (item as any).ageGroups : []);
        if (list.length === 0) return false;
        return list.some((a: any) => {
          const aUuid = typeof a === "string" ? a : a?.uuid || a?.ageGroupUuid;
          const aCode = (a?.code || a?.ageGroupCode || "").toLowerCase();
          const aName = (a?.name || a?.localName || (typeof a === "string" ? a : "")).toLowerCase();

          return Boolean(
            (aUuid && (aUuid === selectedAgeGroupUuid || (selectedAge && aUuid === selectedAge.uuid))) ||
            (selCode && aCode && aCode === selCode) ||
            (selName && aName && (aName.includes(selName) || selName.includes(aName)))
          );
        });
      });
    }

    if (selectedStatus) {
      const wantActive = selectedStatus === "AVAILABLE" || selectedStatus === "ACTIVE";
      result = result.filter(
        (item) => ((item.isActive ?? (item as any).active ?? true) !== false) === wantActive,
      );
    }

    if (sortOrder === "NEWEST") {
      result = [...result].sort((a, b) => {
        const idA = typeof a.id === "number" ? a.id : Number((a as any).foodId || (a as any).id);
        const idB = typeof b.id === "number" ? b.id : Number((b as any).foodId || (b as any).id);
        if (Number.isFinite(idA) && Number.isFinite(idB) && idA !== idB) return idB - idA;
        const timeA = a.createdAt || (a as any).updatedAt ? new Date(a.createdAt || (a as any).updatedAt).getTime() : null;
        const timeB = b.createdAt || (b as any).updatedAt ? new Date(b.createdAt || (b as any).updatedAt).getTime() : null;
        if (timeA !== null && timeB !== null && Number.isFinite(timeA) && Number.isFinite(timeB) && timeA !== timeB) return timeB - timeA;
        return 0;
      });
    } else if (sortOrder === "OLDEST") {
      result = [...result].sort((a, b) => {
        const idA = typeof a.id === "number" ? a.id : Number((a as any).foodId || (a as any).id);
        const idB = typeof b.id === "number" ? b.id : Number((b as any).foodId || (b as any).id);
        if (Number.isFinite(idA) && Number.isFinite(idB) && idA !== idB) return idA - idB;
        const timeA = a.createdAt || (a as any).updatedAt ? new Date(a.createdAt || (a as any).updatedAt).getTime() : null;
        const timeB = b.createdAt || (b as any).updatedAt ? new Date(b.createdAt || (b as any).updatedAt).getTime() : null;
        if (timeA !== null && timeB !== null && Number.isFinite(timeA) && Number.isFinite(timeB) && timeA !== timeB) return timeA - timeB;
        return 0;
      });
    } else if (sortOrder === "NAME_ASC") {
      result = [...result].sort((a, b) => ((a as any).localName || a.canonicalName || a.name || "").localeCompare((b as any).localName || b.canonicalName || b.name || "", "km"));
    } else if (sortOrder === "NAME_DESC") {
      result = [...result].sort((a, b) => ((b as any).localName || b.canonicalName || b.name || "").localeCompare((a as any).localName || a.canonicalName || a.name || "", "km"));
    }

    return result;
  }, [
    displayFoods,
    search,
    selectedCategoryUuid,
    selectedCuisineUuid,
    selectedSeasonUuid,
    selectedEventUuid,
    selectedWeatherUuid,
    selectedAgeGroupUuid,
    selectedStatus,
    sortOrder,
    allCategories,
    activeCuisines,
    activeSeasons,
    activeEvents,
    activeWeatherConditions,
    activeAgeGroups,
  ]);

  // Search & Filter Published Menu Items
  const filteredMenuItems = useMemo(() => {
    let result = menuItems;

    // Helper to resolve full FoodRecord metadata from catalog foods array if menu item's nested food object is partially populated
    const getResolvedFood = (item: MenuItemRecord) => {
      const foodUuid = item.foodUuid || item.food?.uuid;
      const matchedCatalogFood = foodUuid ? foods.find((f) => f.uuid === foodUuid) : undefined;
      return {
        ...matchedCatalogFood,
        ...item.food,
        category: matchedCatalogFood?.category || item.food?.category,
        categoryUuid: matchedCatalogFood?.categoryUuid || item.food?.categoryUuid,
        cuisine: matchedCatalogFood?.cuisine || item.food?.cuisine,
        cuisineUuid: matchedCatalogFood?.cuisineUuid || item.food?.cuisineUuid,
        seasons: matchedCatalogFood?.seasons ?? item.food?.seasons ?? [],
        events: matchedCatalogFood?.events ?? item.food?.events ?? [],
        suitableWeather: matchedCatalogFood?.suitableWeather ?? item.food?.suitableWeather ?? [],
        ageRules: matchedCatalogFood?.ageRules ?? item.food?.ageRules ?? [],
      };
    };

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((item) => {
        const resolvedFood = getResolvedFood(item);
        return [
          item.name,
          item.description,
          item.store?.storeName,
          item.store?.name,
          item.food?.canonicalName,
          item.food?.localName,
          resolvedFood.canonicalName,
          resolvedFood.localName,
          resolvedFood.categoryName,
          resolvedFood.cuisineName,
          item.availabilityStatus,
        ].some((val) => String(val ?? "").toLowerCase().includes(q));
      });
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
      result = result.filter((item) => {
        const resolvedFood = getResolvedFood(item);
        return (
          resolvedFood.category?.uuid === selectedCategoryUuid ||
          resolvedFood.categoryUuid === selectedCategoryUuid ||
          (resolvedFood.category as any)?.id === selectedCategoryUuid
        );
      });
    }

    if (selectedCuisineUuid) {
      const selectedCui = activeCuisines.find((c) => c.uuid === selectedCuisineUuid || (c as any).id === selectedCuisineUuid || c.code === selectedCuisineUuid);
      const selName = (selectedCui?.name || (selectedCui as any)?.localName || "").toLowerCase();
      const selCode = (selectedCui?.code || "").toLowerCase();

      result = result.filter((item) => {
        const resolvedFood = getResolvedFood(item);
        const itemCuiUuid = resolvedFood.cuisine?.uuid || resolvedFood.cuisineUuid || (resolvedFood.cuisine as any)?.id;
        const itemCuiName = (resolvedFood.cuisine?.name || resolvedFood.cuisineName || "").toLowerCase();
        const itemCuiCode = (resolvedFood.cuisine?.code || "").toLowerCase();

        if (!itemCuiUuid && !itemCuiCode && !itemCuiName) return true;

        if (itemCuiUuid && (itemCuiUuid === selectedCuisineUuid || (selectedCui && itemCuiUuid === selectedCui.uuid))) return true;
        if (selCode && itemCuiCode && itemCuiCode === selCode) return true;
        if (selName && itemCuiName && (itemCuiName === selName || itemCuiName.includes(selName) || selName.includes(itemCuiName))) return true;
        return false;
      });
    }

    if (selectedSeasonUuid) {
      const targetSeason = activeSeasons.find((s) => s.uuid === selectedSeasonUuid || (s as any).id === selectedSeasonUuid || s.code === selectedSeasonUuid);
      const targetCode = targetSeason?.code;
      const targetName = (targetSeason?.name || (targetSeason as any)?.localName || "").toLowerCase();

      result = result.filter((item) => {
        const resolvedFood = getResolvedFood(item);
        const list = Array.isArray(resolvedFood.seasons) ? resolvedFood.seasons : [];
        if (list.length === 0) return false;
        return list.some((s: any) => {
          const sUuid = typeof s === "string" ? s : s?.uuid || s?.seasonUuid;
          const sCode = s?.code || s?.seasonCode;
          const sName = (s?.name || s?.localName || "").toLowerCase();
          return (
            sUuid === selectedSeasonUuid ||
            (targetCode && sCode === targetCode) ||
            (targetName && sName && (sName.includes(targetName) || targetName.includes(sName)))
          );
        });
      });
    }

    if (selectedEventUuid) {
      const targetEvent = activeEvents.find((e) => e.uuid === selectedEventUuid || (e as any).id === selectedEventUuid || e.code === selectedEventUuid);
      const targetCode = targetEvent?.code;
      const targetName = (targetEvent?.name || (targetEvent as any)?.localName || "").toLowerCase();

      result = result.filter((item) => {
        const resolvedFood = getResolvedFood(item);
        const list = Array.isArray(resolvedFood.events) ? resolvedFood.events : [];
        if (list.length === 0) return false;
        return list.some((e: any) => {
          const eUuid = typeof e === "string" ? e : e?.uuid || e?.eventUuid;
          const eCode = e?.code || e?.eventCode;
          const eName = (e?.name || e?.localName || "").toLowerCase();
          return (
            eUuid === selectedEventUuid ||
            (targetCode && eCode === targetCode) ||
            (targetName && eName && (eName.includes(targetName) || targetName.includes(eName)))
          );
        });
      });
    }

    if (selectedWeatherUuid) {
      const targetWeather = activeWeatherConditions.find((w) => (w.uuid || w.code) === selectedWeatherUuid || (w as any).id === selectedWeatherUuid);
      const targetCode = targetWeather?.code;
      const targetName = (targetWeather?.name || (targetWeather as any)?.localName || "").toLowerCase();

      result = result.filter((item) => {
        const resolvedFood = getResolvedFood(item);
        const list = Array.isArray(resolvedFood.suitableWeather) ? resolvedFood.suitableWeather : [];
        if (list.length === 0) return false;
        return list.some((w: any) => {
          const wUuid = typeof w === "string" ? w : w?.uuid || w?.weatherUuid || w?.weatherConditionUuid;
          const wCode = w?.code || w?.weatherCode;
          const wName = (w?.name || w?.localName || "").toLowerCase();
          return (
            wUuid === selectedWeatherUuid ||
            (targetCode && wCode === targetCode) ||
            (targetName && wName && (wName.includes(targetName) || targetName.includes(wName)))
          );
        });
      });
    }

    if (selectedAgeGroupUuid) {
      const targetAge = activeAgeGroups.find((a) => (a.uuid || a.code) === selectedAgeGroupUuid || (a as any).id === selectedAgeGroupUuid);
      const targetCode = targetAge?.code;
      const targetName = (targetAge?.name || (targetAge as any)?.localName || "").toLowerCase();

      result = result.filter((item) => {
        const resolvedFood = getResolvedFood(item);
        const list = Array.isArray(resolvedFood.ageRules) ? resolvedFood.ageRules : (Array.isArray((resolvedFood as any).ageGroups) ? (resolvedFood as any).ageGroups : []);
        if (list.length === 0) return false;
        return list.some((a: any) => {
          const aUuid = typeof a === "string" ? a : a?.uuid || a?.ageGroupUuid;
          const aCode = a?.code || a?.ageGroupCode;
          const aName = (a?.name || a?.localName || "").toLowerCase();
          return (
            aUuid === selectedAgeGroupUuid ||
            (targetCode && aCode === targetCode) ||
            (targetName && aName && (aName.includes(targetName) || targetName.includes(aName)))
          );
        });
      });
    }

    if (selectedStatus) {
      result = result.filter((item) => item.availabilityStatus === selectedStatus);
    }

    if (sortOrder === "NEWEST") {
      result = [...result].sort((a, b) => {
        // 1. Check ID descending (highest numeric ID first)
        const idA = typeof a.id === "number" ? a.id : (a as any).menuItemId ? Number((a as any).menuItemId) : typeof (a as any).id === "string" && !isNaN(Number((a as any).id)) ? Number((a as any).id) : null;
        const idB = typeof b.id === "number" ? b.id : (b as any).menuItemId ? Number((b as any).menuItemId) : typeof (b as any).id === "string" && !isNaN(Number((b as any).id)) ? Number((b as any).id) : null;
        if (idA !== null && idB !== null && Number.isFinite(idA) && Number.isFinite(idB) && idA !== idB) {
          return idB - idA;
        }
        // 2. Check creation date descending (newest timestamp first)
        const timeA = a.createdAt || (a as any).updatedAt ? new Date(a.createdAt || (a as any).updatedAt).getTime() : null;
        const timeB = b.createdAt || (b as any).updatedAt ? new Date(b.createdAt || (b as any).updatedAt).getTime() : null;
        if (timeA !== null && timeB !== null && Number.isFinite(timeA) && Number.isFinite(timeB) && timeA !== timeB) {
          return timeB - timeA;
        }
        return 0;
      });
    } else if (sortOrder === "OLDEST") {
      result = [...result].sort((a, b) => {
        const idA = typeof a.id === "number" ? a.id : (a as any).menuItemId ? Number((a as any).menuItemId) : typeof (a as any).id === "string" && !isNaN(Number((a as any).id)) ? Number((a as any).id) : null;
        const idB = typeof b.id === "number" ? b.id : (b as any).menuItemId ? Number((b as any).menuItemId) : typeof (b as any).id === "string" && !isNaN(Number((b as any).id)) ? Number((b as any).id) : null;
        if (idA !== null && idB !== null && Number.isFinite(idA) && Number.isFinite(idB) && idA !== idB) {
          return idA - idB;
        }
        const timeA = a.createdAt || (a as any).updatedAt ? new Date(a.createdAt || (a as any).updatedAt).getTime() : null;
        const timeB = b.createdAt || (b as any).updatedAt ? new Date(b.createdAt || (b as any).updatedAt).getTime() : null;
        if (timeA !== null && timeB !== null && Number.isFinite(timeA) && Number.isFinite(timeB) && timeA !== timeB) {
          return timeA - timeB;
        }
        return 0;
      });
    } else if (sortOrder === "NAME_ASC") {
      result = [...result].sort((a, b) => (a.name || "").localeCompare(b.name || "", "km"));
    } else if (sortOrder === "NAME_DESC") {
      result = [...result].sort((a, b) => (b.name || "").localeCompare(a.name || "", "km"));
    } else if (sortOrder === "PRICE_ASC") {
      result = [...result].sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
    } else if (sortOrder === "PRICE_DESC") {
      result = [...result].sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
    }

    return result;
  }, [
    menuItems,
    search,
    selectedStoreUuid,
    selectedCategoryUuid,
    selectedCuisineUuid,
    selectedSeasonUuid,
    selectedEventUuid,
    selectedWeatherUuid,
    selectedAgeGroupUuid,
    selectedStatus,
    sortOrder,
    foods,
    activeCuisines,
    activeSeasons,
    activeEvents,
    activeWeatherConditions,
    activeAgeGroups,
    allCategories,
  ]);

  const menuCounts = useMemo(() => {
    if (isCatalogMode) {
      const all = displayFoods.length;
      const available = displayFoods.filter(
        (item) => (item.isActive ?? (item as any).active ?? true) !== false,
      ).length;
      const hidden = displayFoods.filter(
        (item) => (item.isActive ?? (item as any).active ?? true) === false,
      ).length;
      return { all, available, outOfStock: 0, hidden };
    }

    const all = menuItems.length;
    const available = menuItems.filter((i) => i.availabilityStatus === "AVAILABLE").length;
    const outOfStock = menuItems.filter((i) => i.availabilityStatus === "OUT_OF_STOCK" || i.availabilityStatus === "UNAVAILABLE").length;
    const hidden = menuItems.filter((i) => i.availabilityStatus === "HIDDEN" || i.availabilityStatus === "ARCHIVED").length;
    return { all, available, outOfStock, hidden };
  }, [menuItems, isCatalogMode, displayFoods]);

  const hasActiveFilters = Boolean(
    search ||
      selectedStoreUuid ||
      selectedCategoryUuid ||
      selectedCuisineUuid ||
      selectedSeasonUuid ||
      selectedEventUuid ||
      selectedWeatherUuid ||
      selectedAgeGroupUuid ||
      selectedStatus ||
      sortOrder !== "NEWEST",
  );

  const resetAllFilters = () => {
    setSearch("");
    setSelectedStoreUuid("");
    setSelectedCategoryUuid("");
    setSelectedCuisineUuid("");
    setSelectedSeasonUuid("");
    setSelectedEventUuid("");
    setSelectedWeatherUuid("");
    setSelectedAgeGroupUuid("");
    setSelectedStatus("");
    setSortOrder("NEWEST");
  };

  // Titles and Labels
  const pageTitle = useMemo(() => {
    if (catalogType === "DRINK") return "ភេសជ្ជៈ";
    if (catalogType === "FOOD") return "មុខម្ហូប";
    return "ម៉ឺនុយ";
  }, [catalogType]);

  const pageSubtitle = useMemo(() => {
    if (catalogType === "DRINK") return "គ្រប់គ្រងបញ្ជីភេសជ្ជៈសម្រាប់ហាងជ្រើសរើស";
    if (catalogType === "FOOD") return "គ្រប់គ្រងបញ្ជីមុខម្ហូបសម្រាប់ហាងជ្រើសរើស";
    return "គ្រប់គ្រងម៉ឺនុយមុខម្ហូបរបស់ហាងលើគេហទំព័រ";
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

        if (editingFood.uuid) {
          saveFoodRelationsStorage(editingFood.uuid, {
            nutritionData: payload.nutritionData,
            nutrition: payload.nutritionData,
            seasons: payload.seasons,
            events: payload.events,
            suitableWeather: payload.suitableWeather,
            weatherConditions: payload.suitableWeather,
            mealTypes: payload.mealTypes,
            ageRules: payload.ageRules,
            dietaryTypes: payload.dietaryTypes,
            allergens: (payload as any).allergens,
            preparationTimes: payload.preparationTimes,
            distances: payload.distances,
            defaultSpiceLevel: payload.defaultSpiceLevel,
          });
        }

        setNotice({
          type: "success",
          text: "បានកែប្រែ Food Catalog ដោយជោគជ័យ។",
        });
      } else {
        const created = await createFood({
          payload,
          images,
        }).unwrap();

        if (created?.uuid) {
          saveFoodRelationsStorage(created.uuid, {
            nutritionData: payload.nutritionData,
            nutrition: payload.nutritionData,
            seasons: payload.seasons,
            events: payload.events,
            suitableWeather: payload.suitableWeather,
            weatherConditions: payload.suitableWeather,
            mealTypes: payload.mealTypes,
            ageRules: payload.ageRules,
            dietaryTypes: payload.dietaryTypes,
            allergens: (payload as any).allergens,
            preparationTimes: payload.preparationTimes,
            distances: payload.distances,
            defaultSpiceLevel: payload.defaultSpiceLevel,
          });
        }

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
        await updateMenuItem({
          uuid: String(targetUuid),
          storeUuid,
          payload,
          images,
        }).unwrap();

        setNotice({
          type: "success",
          text: "បានកែប្រែ ម៉ឺនុយ ដោយជោគជ័យ។",
        });
      } else {
        await createMenuItem({
          storeUuid,
          payload,
          images,
        }).unwrap();

        setNotice({
          type: "success",
          text: "បានបង្កើត និង រក្សាទុក ម៉ឺនុយ សម្រាប់ហាងដោយជោគជ័យ។",
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

  const confirmSoftDeleteFood = async () => {
    if (!softDeletingFood) return;
    try {
      setNotice(null);
      await updateFood({
        uuid: softDeletingFood.uuid,
        payload: { isActive: false },
        images: [],
      }).unwrap();

      setNotice({
        type: "success",
        text: `បានប្តូរស្ថានភាព "${softDeletingFood.localName || softDeletingFood.canonicalName
          }" ទៅជា 'អសកម្ម'។`,
      });
      setSoftDeletingFood(null);
      await refreshAll();
    } catch (error) {
      setNotice({
        type: "error",
        text: getMenuManagementApiError(error),
      });
    }
  };

  const confirmHardDeleteFood = async () => {
    if (!hardDeletingFood) return;
    try {
      setNotice(null);
      await deleteFood(hardDeletingFood.uuid).unwrap();
      setNotice({
        type: "success",
        text: `បានលុប "${hardDeletingFood.localName || hardDeletingFood.canonicalName
          }" ចេញពីប្រព័ន្ធដោយជោគជ័យ។`,
      });
      setHardDeletingFood(null);
      await refreshAll();
    } catch (error) {
      setNotice({
        type: "error",
        text: getMenuManagementApiError(error),
      });
    }
  };

  const confirmSoftDeleteMenu = async () => {
    if (!softDeletingMenu) return;
    try {
      setNotice(null);
      const targetUuid =
        softDeletingMenu.uuid ||
        (softDeletingMenu as any).menuItemUuid ||
        (softDeletingMenu as any).id;

      await updateMenuItem({
        uuid: String(targetUuid),
        storeUuid: softDeletingMenu.storeUuid || softDeletingMenu.store?.uuid || undefined,
        payload: {
          foodUuid: softDeletingMenu.foodUuid || softDeletingMenu.food?.uuid || "",
          menuItem: {
            name: softDeletingMenu.name,
            description: softDeletingMenu.description || undefined,
            price: Number(softDeletingMenu.price) || 0,
            currencyCode: softDeletingMenu.currencyCode || "USD",
            availabilityStatus: "UNAVAILABLE",
            ingredientDataStatus: "VERIFIED",
            isFeatured: Boolean(softDeletingMenu.isFeatured),
            source: "MANUAL",
          },
          ingredients: [],
          dietaryTypes: [],
          allergenDeclarations: [],
        },
        images: [],
      }).unwrap();

      setNotice({
        type: "success",
        text: `បានផ្អាកលក់ ម៉ឺនុយ "${softDeletingMenu.name}" ដោយជោគជ័យ។`,
      });
      setSoftDeletingMenu(null);
      await refreshAll();
    } catch (error) {
      setNotice({
        type: "error",
        text: getMenuManagementApiError(error),
      });
    }
  };

  const confirmHardDeleteMenu = async () => {
    if (!hardDeletingMenu) return;
    try {
      setNotice(null);
      const targetUuid =
        hardDeletingMenu.uuid ||
        (hardDeletingMenu as any).menuItemUuid ||
        (hardDeletingMenu as any).id;

      await deleteMenuItem(String(targetUuid)).unwrap();
      setNotice({
        type: "success",
        text: `បានលុប ម៉ឺនុយ "${hardDeletingMenu.name}" ចេញពីប្រព័ន្ធដោយជោគជ័យ។`,
      });
      setHardDeletingMenu(null);
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
      <div className="relative overflow-hidden rounded-[30px] bg-[#14833E] px-6 py-7 text-white shadow-sm sm:px-8 sm:py-8">
        <div className="pointer-events-none absolute -right-12 -top-16 h-52 w-52 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-24 right-20 h-64 w-64 rounded-full bg-white/5" />

        <div className="relative flex flex-col gap-7 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15">
                {isCatalogMode ? <Layers size={25} /> : <Utensils size={25} />}
              </div>

              <div>
                <p className="text-5xl font-bold text-accent-400">
                  {pageTitle}
                </p>
                <p className="mt-6 max-w-2xl text-xl text-white/85">
                  {pageSubtitle}
                </p>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {isCatalogMode ? (
                <>
                  <Stat
                    icon={<Layers size={20} />}
                    label={catalogType === "DRINK" ? "ភេសជ្ជៈសរុប" : "មុខម្ហូបសរុប"}
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
                    label="ម៉ឺនុយលើគេហទំព័រ"
                    value={menuItemsQuery.data?.totalElements ?? menuItems.length}
                  />
                  <Stat
                    icon={<Store size={20} />}
                    label="ហាងបានអនុម័តសរុប"
                    value={approvedStoresCountQuery.data?.totalElements ?? stores.length}
                  />
                  <Stat
                    icon={<Layers size={20} />}
                    label="បញ្ជីមុខម្ហូបសម្រាប់ហាង"
                    value={foodsQuery.data?.totalElements ?? foods.length}
                  />
                </>
              )}
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
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-lg font-bold text-[#136C34] shadow-sm transition hover:bg-emerald-50 sm:w-fit"
              >
                <Plus size={20} />
                {catalogType === "DRINK" ? "បន្ថែមភេសជ្ជៈថ្មី" : "បន្ថែមមុខម្ហូបថ្មី"}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setEditingMenu(null);
                  setMenuModalOpen(true);
                }}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-lg font-bold text-[#136C34] shadow-sm transition hover:bg-emerald-50 sm:w-fit cursor-pointer"
              >
                <Plus size={20} />
                បង្កើតម៉ឺនុយ
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2-ROW TOOLBAR MATCHING SHOPS MANAGER UI */}
      <div className="space-y-3">
        {/* ROW 1: Status Tabs (Left) + Search Input (Middle) + Page Size (Right) */}
        <div className="flex w-full flex-wrap items-center justify-between gap-3">
          {/* Status Tabs Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: "", label: "ទាំងអស់", count: menuCounts.all },
              { id: "AVAILABLE", label: "មានលក់", count: menuCounts.available },
              { id: "HIDDEN", label: "លាក់ទុក", count: menuCounts.hidden },
            ].map((tab) => {
              const active = selectedStatus === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedStatus(tab.id)}
                  className={`flex h-11 cursor-pointer items-center gap-2 rounded-2xl px-4 text-base font-semibold transition ${
                    active
                      ? "bg-primary-800 text-white shadow-xs"
                      : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      active ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-1 items-center justify-end gap-3 min-w-[300px]">
            {/* Search Input */}
            <div className="relative flex-1 max-w-[400px]">
              <Search
                size={17}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={isCatalogMode ? (catalogType === "DRINK" ? "ស្វែងរកភេសជ្ជៈ..." : "ស្វែងរកមុខម្ហូប...") : "ស្វែងរកម៉ឺនុយ, ហាង..."}
                className="h-11 w-full rounded-2xl border border-gray-200 bg-white pl-11 pr-9 text-base font-semibold text-gray-700 outline-none placeholder:text-gray-400 focus:border-primary-600 focus:ring-2 focus:ring-primary-100 transition"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Page Size Select */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setSizeOpen((c) => !c)}
                className={`flex h-11 min-w-[125px] cursor-pointer items-center justify-between gap-2.5 rounded-2xl border bg-white px-4 text-base font-semibold transition ${
                  sizeOpen ? "border-primary-600 ring-2 ring-primary-100" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <span className="text-gray-700">{itemsPerPage} / ទំព័រ</span>
                <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${sizeOpen ? "rotate-180" : ""}`} />
              </button>
              {sizeOpen && (
                <div className="absolute right-0 top-[48px] z-[110] w-[160px] rounded-2xl border border-gray-100 bg-white p-1.5 shadow-xl">
                  <p className="px-3 py-1 text-xs font-semibold text-gray-400">ចំនួនក្នុងទំព័រ</p>
                  {[10, 20, 50].map((value) => {
                    const selected = itemsPerPage === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => {
                          setItemsPerPage(value);
                          setSizeOpen(false);
                        }}
                        className={`flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-semibold transition ${
                          selected ? "bg-primary-50 text-primary-800" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <span>{value} / ទំព័រ</span>
                        {selected && <Check size={16} className="text-primary-800" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ROW 2: Filter Controls Card */}
        <div className="space-y-2.5 rounded-2xl border border-gray-100 bg-white p-3 shadow-xs">
          {/* Top Line Filters: Store, Category, Cuisine, Season, Event */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2 px-1 text-base font-semibold text-gray-700 shrink-0">
              <Filter size={17} className="text-primary-800" />
              <span>តម្រងស្វែងរក:</span>
            </div>

            {/* Store Filter */}
            {!isCatalogMode && stores.length > 0 && (
              <div className="w-[185px] shrink-0">
                <CustomSelect
                  value={selectedStoreUuid}
                  onChange={(val) => setSelectedStoreUuid(val)}
                  options={storeOptions}
                  placeholder="ហាងទាំងអស់"
                />
              </div>
            )}

            {/* Category Filter */}
            <div className="w-[170px] shrink-0">
              <CustomSelect
                value={selectedCategoryUuid}
                onChange={(val) => setSelectedCategoryUuid(val)}
                options={categoryOptions}
                placeholder="ប្រភេទទាំងអស់"
              />
            </div>

            {/* Cuisine Filter */}
            <div className="w-[170px] shrink-0">
              <CustomSelect
                value={selectedCuisineUuid}
                onChange={(val) => setSelectedCuisineUuid(val)}
                options={cuisineOptions}
                placeholder="វប្បធម៌ម្ហូបទាំងអស់"
              />
            </div>

            {/* Season Filter */}
            <div className="w-[160px] shrink-0">
              <CustomSelect
                value={selectedSeasonUuid}
                onChange={(val) => setSelectedSeasonUuid(val)}
                options={seasonOptions}
                placeholder="រដូវកាលទាំងអស់"
              />
            </div>

            {/* Event Filter */}
            <div className="w-[160px] shrink-0">
              <CustomSelect
                value={selectedEventUuid}
                onChange={(val) => setSelectedEventUuid(val)}
                options={eventOptions}
                placeholder="ព្រឹត្តិការណ៍ទាំងអស់"
              />
            </div>
          </div>

          {/* Bottom Line Filters: Weather, Age Group, Clear Button, Sort Order */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-gray-100/70">
            {/* Weather Filter */}
            <div className="w-[170px] shrink-0">
              <CustomSelect
                value={selectedWeatherUuid}
                onChange={(val) => setSelectedWeatherUuid(val)}
                options={weatherOptions}
                placeholder="អាកាសធាតុទាំងអស់"
              />
            </div>

            {/* Age Group Filter */}
            <div className="w-[170px] shrink-0">
              <CustomSelect
                value={selectedAgeGroupUuid}
                onChange={(val) => setSelectedAgeGroupUuid(val)}
                options={ageGroupOptions}
                placeholder="ក្រុមអាយុទាំងអស់"
              />
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="inline-flex h-11 items-center gap-1.5 rounded-2xl border border-amber-200 bg-amber-50 px-4 text-base font-semibold text-amber-700 transition hover:bg-amber-100 cursor-pointer shrink-0"
              >
                <X size={16} />
                <span>សម្អាតតម្រង</span>
              </button>
            )}

            {/* Sort Order (Right Aligned) */}
            <div className="w-[170px] shrink-0 ml-auto">
              <CustomSelect
                value={sortOrder}
                onChange={(val) => setSortOrder(val as any)}
                options={sortOptions}
                placeholder="ថ្មីបំផុត"
                align="right"
              />
            </div>
          </div>
        </div>
      </div>

      {/* FLOATING TOAST NOTIFICATION (MATCHING SHOPS AND USERS) */}
      {notice && (
        <div className="fixed top-6 right-6 z-[9999] pointer-events-none flex max-w-md animate-in fade-in slide-in-from-top-5 duration-300">
          <div
            className={`pointer-events-auto flex items-center gap-3 rounded-2xl border px-4 py-3.5 shadow-2xl backdrop-blur-md transition-all ${notice.type === "success"
              ? "border-emerald-200 bg-white/95 text-emerald-950 shadow-emerald-500/10"
              : "border-red-200 bg-white/95 text-red-950 shadow-red-500/10"
              }`}
          >
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${notice.type === "success"
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
              <p className="text-sm font-semibold leading-relaxed">
                {notice.text}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setNotice(null)}
              className="ml-2 flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
              aria-label="Close"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Data Table Section */}
      <section className="overflow-visible rounded-[24px] border border-gray-100 bg-white shadow-sm">
        {currentLoading ? (
          <div className="flex min-h-[380px] items-center justify-center">
            <Loader2 size={36} className="animate-spin text-[#137A3D]" />
          </div>
        ) : currentError ? (
          <div className="flex min-h-[380px] flex-col items-center justify-center px-6 text-center">
            <AlertTriangle size={44} className="text-red-400" />
            <p className="mt-4 text-2xl font-bold text-gray-900">
              មិនអាចទាញយកទិន្នន័យបានទេ
            </p>
            <p className="mt-2 max-w-xl text-lg leading-7 text-gray-500">
              {getMenuManagementApiError(currentError)}
            </p>
          </div>
        ) : isCatalogMode ? (
          <FoodCatalogTable
            items={filteredFoods}
            categories={allCategories}
            cuisines={cuisinesQuery.data ?? []}
            busy={busy}
            itemsPerPage={itemsPerPage}
            catalogType={catalogType}
            onView={(item) => setFoodDetailUuid(item.uuid)}
            onEdit={(item) => {
              setEditingFood(item);
              setFoodModalOpen(true);
            }}
            onSoftDelete={setSoftDeletingFood}
            onDelete={setHardDeletingFood}
          />
        ) : (
          <PublishedMenuItemsTable
            items={filteredMenuItems}
            foods={foods}
            categories={allCategories}
            busy={busy}
            itemsPerPage={itemsPerPage}
            onView={(item) => setDetailUuid(item.uuid)}
            onEdit={(item) => {
              setEditingMenu(item);
              setMenuModalOpen(true);
            }}
            onSoftDelete={setSoftDeletingMenu}
            onDelete={setHardDeletingMenu}
          />
        )}
      </section>

      {/* Food Creation & Edit Modal */}
      <FoodFormModal
        open={foodModalOpen}
        item={editingFood}
        categories={relevantCategories}
        cuisines={activeCuisines}
        seasons={activeSeasons}
        events={activeEvents}
        weatherConditions={activeWeatherConditions}
        mealTypes={activeMealTypes}
        ageGroups={activeAgeGroups}
        dietaryTypes={activeDietaryTypes}
        allergens={activeAllergens}
        preparationTimes={preparationTimeOptions}
        distances={distanceOptions}
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
        stores={allCombinedStores}
        ingredients={ingredientsQuery.data ?? []}
        dietaryTypes={activeDietaryTypes}
        allergens={activeAllergens}
        mealTypes={activeMealTypes}
        ageGroups={activeAgeGroups}
        seasons={activeSeasons}
        weatherConditions={activeWeatherConditions}
        events={activeEvents}
        medicalConditions={activeMedicalConditions}
        saving={creatingMenuItem || updatingMenuItem}
        onClose={() => {
          if (creatingMenuItem || updatingMenuItem) {
            return;
          }
          setMenuModalOpen(false);
          setEditingMenu(null);
        }}
        onSubmit={saveMenuItem}
        onEditFood={(food) => {
          setEditingFood(food);
          setFoodModalOpen(true);
        }}
      />

      {/* Food Soft Delete Confirmation */}
      <DeleteConfirmModal
        open={Boolean(softDeletingFood)}
        variant="soft"
        title="កំណត់អសកម្មមុខម្ហូប?"
        description={
          softDeletingFood
            ? `មុខម្ហូប "${softDeletingFood.localName || softDeletingFood.canonicalName
            }" នឹងត្រូវប្តូរស្ថានភាពទៅជា 'អសកម្ម' (Inactive) នៅក្នុង Catalog។ Store មិនអាចជ្រើសរើសបានទៀតទេ។`
            : ""
        }
        deleting={updatingFood}
        onClose={() => setSoftDeletingFood(null)}
        onConfirm={() => void confirmSoftDeleteFood()}
      />

      {/* Food Hard Delete Confirmation */}
      <DeleteConfirmModal
        open={Boolean(hardDeletingFood)}
        variant="hard"
        title="លុបមុខម្ហូបចេញពីប្រព័ន្ធ?"
        description={
          hardDeletingFood
            ? `មុខម្ហូប "${hardDeletingFood.localName || hardDeletingFood.canonicalName
            }" នឹងត្រូវលុបចេញពីប្រព័ន្ធរៀងរហូត។ សកម្មភាពនេះមិនអាចត្រឡប់ក្រោយវិញបានទេ។`
            : ""
        }
        deleting={deletingFoodRequest}
        onClose={() => setHardDeletingFood(null)}
        onConfirm={() => void confirmHardDeleteFood()}
      />

      {/* Menu Item Soft Delete Confirmation */}
      <DeleteConfirmModal
        open={Boolean(softDeletingMenu)}
        variant="soft"
        title="ផ្អាកលក់ ម៉ឺនុយ?"
        description={
          softDeletingMenu
            ? `ម៉ឺនុយ "${softDeletingMenu.name}" នឹងត្រូវប្តូរស្ថានភាពទៅជា 'ផ្អាកលក់' លើគេហទំព័រ។`
            : ""
        }
        deleting={updatingMenuItem}
        onClose={() => setSoftDeletingMenu(null)}
        onConfirm={() => void confirmSoftDeleteMenu()}
      />

      {/* Menu Item Hard Delete Confirmation */}
      <DeleteConfirmModal
        open={Boolean(hardDeletingMenu)}
        variant="hard"
        title="លុប ម៉ឺនុយ ចេញពីប្រព័ន្ធ?"
        description={
          hardDeletingMenu
            ? `ម៉ឺនុយ "${hardDeletingMenu.name}" នឹងត្រូវលុបចេញពីប្រព័ន្ធរៀងរហូត។ សកម្មភាពនេះមិនអាចត្រឡប់ក្រោយវិញបានទេ។`
            : ""
        }
        deleting={deletingMenuItemRequest}
        onClose={() => setHardDeletingMenu(null)}
        onConfirm={() => void confirmHardDeleteMenu()}
      />

      {/* Detail View Modals */}
      <MenuItemDetailModal
        uuid={detailUuid}
        onClose={() => setDetailUuid(null)}
        onEdit={(item) => {
          setDetailUuid(null);
          setEditingMenu(item);
          setMenuModalOpen(true);
        }}
      />

      <FoodDetailModal
        uuid={foodDetailUuid}
        onClose={() => setFoodDetailUuid(null)}
        onEdit={(item) => {
          setFoodDetailUuid(null);
          setEditingFood(item);
          setFoodModalOpen(true);
        }}
        onEditMenuItem={(mi) => {
          setFoodDetailUuid(null);
          setEditingMenu(mi);
          setMenuModalOpen(true);
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
    <div className="rounded-3xl bg-white/20 px-5 py-4">
      <div className="flex items-center gap-2 text-xl text-white/80">
        {icon}
        <span>{label}</span>
      </div>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}
