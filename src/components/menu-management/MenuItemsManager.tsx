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
import {
  mergeWeatherConditions,
  readLocalWeatherCache,
} from "@/src/lib/weatherConditionStorage";
import { useGetMealTypesQuery } from "@/src/app/store/mealTypeApi";
import { useGetAgeGroupsQuery } from "@/src/app/store/ageGroupApi";
import { useGetDietaryTypesQuery } from "@/src/app/store/dietaryTypeApi";
import { useGetAllergensQuery } from "@/src/app/store/allergenApi";
import { useGetMedicalConditionsQuery } from "@/src/app/store/medicalConditionApi";
import { useGetShopsQuery } from "@/src/app/store/shop/shopApi";
import { readFilterCatalog } from "@/src/lib/filterCatalogStorage";
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
  const allShopsListQuery = useGetShopsQuery({ size: 1000 });
  const approvedStoresCountQuery = useGetShopsQuery({
    reviewStatus: "APPROVED",
    size: 1,
  });

  // Metadata queries for filtering and form selection
  const modalActive = foodModalOpen || menuModalOpen;
  const ingredientsQuery = useGetManagedIngredientsQuery(undefined, { skip: !modalActive });
  const seasonsQuery = useGetManagedSeasonsQuery();
  const eventsQuery = useGetManagedEventsQuery();
  const weatherQuery = useGetWeatherConditionsQuery({ page: 0, size: 100 });
  const mealTypesQuery = useGetMealTypesQuery({ page: 0, size: 100 }, { skip: !foodModalOpen });
  const ageGroupsQuery = useGetAgeGroupsQuery({ page: 0, size: 100 });
  const dietaryTypesQuery = useGetDietaryTypesQuery({ page: 0, size: 100 }, { skip: !foodModalOpen });
  const allergensQuery = useGetAllergensQuery({ page: 0, size: 100 }, { skip: !foodModalOpen });
  const medicalConditionsQuery = useGetMedicalConditionsQuery({ page: 0, size: 100 }, { skip: !foodModalOpen });

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
        value: c.uuid,
        label: c.name || (c as any).localName || c.code,
      })),
    ],
    [activeCuisines],
  );

  const seasonOptions = useMemo(
    () => [
      { value: "", label: "រដូវកាលទាំងអស់" },
      ...activeSeasons.map((s) => ({
        value: s.uuid,
        label: s.name || (s as any).localName || s.code,
      })),
    ],
    [activeSeasons],
  );

  const eventOptions = useMemo(
    () => [
      { value: "", label: "ព្រឹត្តិការណ៍ទាំងអស់" },
      ...activeEvents.map((ev) => ({
        value: ev.uuid,
        label: ev.name || (ev as any).localName || ev.code,
      })),
    ],
    [activeEvents],
  );

  const weatherOptions = useMemo(
    () => [
      { value: "", label: "អាកាសធាតុទាំងអស់" },
      ...activeWeatherConditions.map((w) => ({
        value: w.uuid || w.code,
        label: w.name || (w as any).localName || w.code,
      })),
    ],
    [activeWeatherConditions],
  );

  const ageGroupOptions = useMemo(
    () => [
      { value: "", label: "ក្រុមអាយុទាំងអស់" },
      ...activeAgeGroups.map((a) => ({
        value: a.uuid || a.code,
        label: a.name || (a as any).localName || a.code,
      })),
    ],
    [activeAgeGroups],
  );

  const sortOptions = useMemo(
    () => [
      { value: "NEWEST", label: "ថ្មីបំផុត" },
      { value: "OLDEST", label: "ចាស់បំផុត" },
      { value: "NAME_ASC", label: "ឈ្មោះ: (A → Z)" },
      { value: "NAME_DESC", label: "ឈ្មោះ: (Z → A)" },
      { value: "PRICE_ASC", label: "តម្លៃ: ទាប ទៅ ខ្ពស់" },
      { value: "PRICE_DESC", label: "តម្លៃ: ខ្ពស់ ទៅ ទាប" },
    ],
    [],
  );

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
        label: extractKhmerOnlyName(c.name),
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

    // Always sort Foods newest first by ID descending then date descending
    return [...result].sort((a, b) => {
      const idA = typeof a.id === "number" ? a.id : Number((a as any).foodId || (a as any).id);
      const idB = typeof b.id === "number" ? b.id : Number((b as any).foodId || (b as any).id);
      if (Number.isFinite(idA) && Number.isFinite(idB) && idA !== idB) return idB - idA;
      const timeA = a.createdAt || (a as any).updatedAt ? new Date(a.createdAt || (a as any).updatedAt).getTime() : null;
      const timeB = b.createdAt || (b as any).updatedAt ? new Date(b.createdAt || (b as any).updatedAt).getTime() : null;
      if (timeA !== null && timeB !== null && Number.isFinite(timeA) && Number.isFinite(timeB) && timeA !== timeB) return timeB - timeA;
      return 0;
    });
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

    if (selectedCuisineUuid) {
      result = result.filter(
        (item) =>
          item.food?.cuisine?.uuid === selectedCuisineUuid ||
          item.food?.cuisineUuid === selectedCuisineUuid ||
          (item.food?.cuisine as any)?.id === selectedCuisineUuid,
      );
    }

    if (selectedSeasonUuid) {
      result = result.filter((item) =>
        item.food?.seasons?.some(
          (s: any) =>
            s.uuid === selectedSeasonUuid ||
            s === selectedSeasonUuid ||
            s.seasonUuid === selectedSeasonUuid,
        ),
      );
    }

    if (selectedEventUuid) {
      result = result.filter((item) =>
        item.food?.events?.some(
          (e: any) =>
            e.uuid === selectedEventUuid ||
            e === selectedEventUuid ||
            e.eventUuid === selectedEventUuid,
        ),
      );
    }

    if (selectedWeatherUuid) {
      result = result.filter((item) =>
        item.food?.suitableWeather?.some(
          (w: any) =>
            w.uuid === selectedWeatherUuid ||
            w === selectedWeatherUuid ||
            w.weatherUuid === selectedWeatherUuid ||
            w.code === selectedWeatherUuid,
        ),
      );
    }

    if (selectedAgeGroupUuid) {
      result = result.filter((item) =>
        item.food?.ageRules?.some(
          (a: any) =>
            a.uuid === selectedAgeGroupUuid ||
            a === selectedAgeGroupUuid ||
            a.ageGroupUuid === selectedAgeGroupUuid ||
            a.code === selectedAgeGroupUuid,
        ),
      );
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
  ]);

  const menuCounts = useMemo(() => {
    const all = menuItems.length;
    const available = menuItems.filter((i) => i.availabilityStatus === "AVAILABLE").length;
    const outOfStock = menuItems.filter((i) => i.availabilityStatus === "OUT_OF_STOCK" || i.availabilityStatus === "UNAVAILABLE").length;
    const hidden = menuItems.filter((i) => i.availabilityStatus === "HIDDEN" || i.availabilityStatus === "ARCHIVED").length;
    return { all, available, outOfStock, hidden };
  }, [menuItems]);

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
    if (catalogType === "FOOD") return "ម្ហូប";
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
            text: "បានកែប្រែ ម៉ឺនុយ ដោយជោគជ័យ។",
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
              text: "បាន រក្សាទុក ម៉ឺនុយ ទៅហាងដោយជោគជ័យ។",
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
            {!isCatalogMode && (
              <div className="w-[170px] shrink-0 ml-auto">
                <CustomSelect
                  value={sortOrder}
                  onChange={(val) => setSortOrder(val as any)}
                  options={sortOptions}
                  placeholder="ថ្មីបំផុត"
                  align="right"
                />
              </div>
            )}
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
        regions={regionOptions}
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
        dietaryTypes={activeDietaryTypes}
        allergens={activeAllergens}
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
