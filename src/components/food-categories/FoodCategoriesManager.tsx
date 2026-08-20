"use client";

import { useMemo, useState } from "react";
import {
  ArrowUpDown,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Coffee,
  ImageIcon,
  Layers,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  Utensils,
  X,
} from "lucide-react";

import {
  useGetManagedFoodsQuery,
  useCreateManagedFoodMutation,
  useUpdateManagedFoodMutation,
  useDeleteManagedFoodMutation,
  useGetManagedFoodCategoriesQuery,
  useGetManagedCuisinesQuery,
  useGetManagedSeasonsQuery,
  useGetManagedEventsQuery,
  useGetManagedWeatherConditionsQuery,
} from "@/src/app/store/menuManagementApi";

import { useGetMealTypesQuery } from "@/src/app/store/mealTypeApi";
import { useGetAgeGroupsQuery } from "@/src/app/store/ageGroupApi";
import { useGetDietaryTypesQuery } from "@/src/app/store/dietaryTypeApi";

import { resolveFoodHubCatalogImageUrl } from "@/src/lib/resolveFoodHubImageUrl";
import { getMenuManagementApiError } from "@/src/lib/menuManagementApiError";
import type { FoodRecord, FoodWritePayload } from "@/src/types/menu-management";

import FoodFormModal from "../menu-management/FoodFormModal";
import HardDeleteFoodConfirmModal from "../menu-management/HardDeleteFoodConfirmModal";

type FoodFilterTab = "ALL" | "FOOD" | "DRINK";
type SortMode = "A_Z" | "Z_A" | "NEWEST" | "OLDEST";

function foodName(item: FoodRecord): string {
  return item.localName || item.canonicalName || item.name || "—";
}

function categoryName(item: FoodRecord): string {
  return item.category?.name || item.categoryName || "—";
}

function cuisineName(item: FoodRecord): string {
  return item.cuisine?.name || item.cuisineName || "—";
}

function imageUrl(item: FoodRecord): string | null {
  const raw =
    item.thumbnail ||
    item.imageUrl ||
    (item as any).primaryMediaUuid ||
    item.primaryMediaUrls?.[0] ||
    item.primaryMediaUuids?.[0] ||
    item.images?.[0] ||
    item.gallery?.[0] ||
    null;

  return resolveFoodHubCatalogImageUrl(raw);
}

const FOOD_SUBCATEGORIES = [
  {
    key: "khmerFood",
    label: "ម្ហូបខ្មែរ",
    keywords: ["khmer", "ខ្មែរ", "traditional"],
  },
  { key: "rice", label: "ម្ហូបបាយ", keywords: ["rice", "បាយ"] },
  {
    key: "noodles",
    label: "មី និងគុយទាវ",
    keywords: ["noodle", "kuyteav", "គុយទាវ", "មី", "នំបញ្ចុក"],
  },
  {
    key: "soup",
    label: "សម្ល និងស៊ុប",
    keywords: ["soup", "សម្ល", "ស៊ុប", "ស្ងោរ"],
  },
  { key: "grilled", label: "ម្ហូបអាំង", keywords: ["grill", "អាំង", "bbq"] },
  {
    key: "fried",
    label: "ម្ហូបចៀន",
    keywords: ["fry", "fried", "ចៀន", "បំពង"],
  },
  { key: "stirFried", label: "ម្ហូបឆា", keywords: ["stir", "stir-fry", "ឆា"] },
  {
    key: "seafood",
    label: "គ្រឿងសមុទ្រ",
    keywords: ["seafood", "សមុទ្រ", "បង្គា", "ក្តាម", "មឹក", "ត្រី"],
  },
  {
    key: "meat",
    label: "ម្ហូបសាច់",
    keywords: ["meat", "សាច់", "គោ", "ជ្រូក", "មាន់"],
  },
  {
    key: "vegetarian",
    label: "ម្ហូបបួស",
    keywords: ["vegetarian", "vegan", "បួស"],
  },
  {
    key: "fastFood",
    label: "អាហាររហ័ស",
    keywords: ["fast food", "fast", "burger", "pizza", "អាហាររហ័ស"],
  },
  {
    key: "snack",
    label: "អាហារសម្រន់",
    keywords: ["snack", "street bites", "សម្រន់", "គ្រឿងក្លែម", "street"],
  },
  { key: "dessert", label: "បង្អែម", keywords: ["dessert", "sweet", "បង្អែម"] },
  {
    key: "bakery",
    label: "នំ និងផលិតផលដុត",
    keywords: ["bakery", "pastry", "bread", "cake", "នំ", "ដុត"],
  },
  {
    key: "breakfast",
    label: "អាហារពេលព្រឹក",
    keywords: ["breakfast", "ពេលព្រឹក"],
  },
  { key: "salad", label: "សាឡាត់", keywords: ["salad", "សាឡាត់"] },
];

const DRINK_SUBCATEGORIES = [
  { key: "water", label: "ទឹក", keywords: ["water", "ទឹក", "បរិសុទ្ធ"] },
  {
    key: "cannedDrink",
    label: "ភេសជ្ជៈកំប៉ុង",
    keywords: ["canned", "can", "soda", "កំប៉ុង", "សូដា"],
  },
  {
    key: "freshJuice",
    label: "ទឹកផ្លែឈើស្រស់",
    keywords: ["juice", "fresh juice", "cane", "ផ្លែឈើ", "ទឹកអំពៅ"],
  },
  {
    key: "smoothie",
    label: "ស្មូតធី",
    keywords: ["smoothie", "shake", "ស្មូតធី"],
  },
  { key: "coffee", label: "កាហ្វេ", keywords: ["coffee", "កាហ្វេ"] },
  { key: "tea", label: "តែ", keywords: ["tea", "តែ"] },
  { key: "milk", label: "ទឹកដោះគោ", keywords: ["milk", "ទឹកដោះគោ"] },
  {
    key: "milkTea",
    label: "តែទឹកដោះគោ",
    keywords: ["milk tea", "boba", "bubble tea", "តែទឹកដោះគោ"],
  },
  {
    key: "chocolateDrink",
    label: "ភេសជ្ជៈសូកូឡា",
    keywords: ["chocolate", "cocoa", "សូកូឡា"],
  },
  {
    key: "energyDrink",
    label: "ភេសជ្ជៈប៉ូវកម្លាំង",
    keywords: ["energy", "energy drink", "ប៉ូវកម្លាំង"],
  },
  {
    key: "herbalDrink",
    label: "ភេសជ្ជៈរុក្ខជាតិ",
    keywords: ["herbal", "herbal drink", "រុក្ខជាតិ"],
  },
  {
    key: "traditionalKhmerDrink",
    label: "ភេសជ្ជៈប្រពៃណីខ្មែរ",
    keywords: ["traditional khmer drink", "ប្រពៃណី", "ខ្មែរ"],
  },
];

function isDrinkCategory(
  catName: string,
  catCode?: string,
  item?: FoodRecord,
): boolean {
  const code = (catCode || "").toLowerCase();
  const n = (catName || "").toLowerCase();
  const itemName = (
    item ? item.localName || item.canonicalName || item.name || "" : ""
  ).toLowerCase();
  const rootCode = (
    item
      ? (item.category as any)?.rootCategoryCode ||
        (item as any)?.rootCategoryCode ||
        ""
      : ""
  ).toLowerCase();
  const parentName = (
    item ? (item.category as any)?.parentCategoryName || "" : ""
  ).toLowerCase();

  // Root or parent indicator
  if (
    rootCode.includes("drink") ||
    rootCode.includes("beverage") ||
    parentName.includes("ភេសជ្ជៈ") ||
    parentName.includes("drink")
  ) {
    return true;
  }

  // Category code indicator
  if (
    code.includes("drink") ||
    code.includes("beverage") ||
    code.includes("coffee") ||
    code.includes("tea") ||
    code.includes("juice") ||
    code.includes("smoothie") ||
    code.includes("shake") ||
    code.includes("milk") ||
    code.includes("soda") ||
    code.includes("canned") ||
    code.includes("cocktail") ||
    code.includes("mocktail") ||
    code.includes("water")
  ) {
    return true;
  }

  // Category name indicator
  if (
    n.includes("ភេសជ្ជៈ") ||
    n.includes("កាហ្វេ") ||
    n.includes("តែ") ||
    n.includes("ទឹកផ្លែឈើ") ||
    n.includes("ស្មូតធី") ||
    n.includes("ទឹកដោះគោ") ||
    n.includes("សូកូឡា") ||
    n.includes("ក្រឡុក") ||
    n.includes("កំប៉ុង") ||
    n.includes("drink") ||
    n.includes("beverage") ||
    n.includes("coffee") ||
    n.includes("tea") ||
    n.includes("smoothie") ||
    n.includes("juice") ||
    n.includes("milk") ||
    n.includes("boba") ||
    n.includes("latte")
  ) {
    return true;
  }

  // Food item name indicator if category is generic
  if (itemName) {
    return (
      itemName.includes("កាហ្វេ") ||
      itemName.includes("coffee") ||
      itemName.includes("frappe") ||
      itemName.includes("espresso") ||
      itemName.includes("latte") ||
      itemName.includes("cappuccino") ||
      itemName.includes("macchiato") ||
      itemName.includes("americano") ||
      itemName.includes("matcha") ||
      itemName.includes("smoothie") ||
      itemName.includes("ស្មូតធី") ||
      itemName.includes("ទឹកក្រឡុក") ||
      itemName.includes("ទឹកអំពៅ") ||
      itemName.includes("តែទឹកដោះគោ") ||
      itemName.includes("តែបៃតង") ||
      itemName.includes("តែក្រូចឆ្មា") ||
      itemName.includes("milk tea") ||
      itemName.includes("bubble tea") ||
      itemName.includes("juice") ||
      itemName.includes("soda") ||
      itemName.includes("coca") ||
      itemName.includes("pepsi") ||
      itemName.includes("red bull") ||
      itemName.includes("sting") ||
      itemName.includes("ទឹកបរិសុទ្ធ")
    );
  }

  return false;
}

function matchesSubCategory(
  item: FoodRecord,
  subcatKey: string,
  isDrinkMode: boolean,
): boolean {
  if (!subcatKey || subcatKey === "ALL") return true;
  const list = isDrinkMode ? DRINK_SUBCATEGORIES : FOOD_SUBCATEGORIES;
  const subcat = list.find((s) => s.key === subcatKey);
  if (!subcat) return true;

  const cat = categoryName(item).toLowerCase();
  const code = (item.category?.code || "").toLowerCase();
  const canonical = (item.canonicalName || "").toLowerCase();
  const name = (item.localName || item.name || "").toLowerCase();

  return (
    cat === subcat.label.toLowerCase() ||
    subcat.keywords.some((kw) => {
      const k = kw.toLowerCase();
      return (
        cat.includes(k) ||
        code.includes(k) ||
        canonical.includes(k) ||
        name.includes(k)
      );
    })
  );
}

function getSubCategoryLabel(item: FoodRecord): string {
  const cat = categoryName(item);
  const code = (item.category?.code || "").toLowerCase();
  const canonical = (item.canonicalName || "").toLowerCase();
  const name = (item.localName || item.name || "").toLowerCase();
  const isDrink = isDrinkCategory(cat, code, item);

  const list = isDrink ? DRINK_SUBCATEGORIES : FOOD_SUBCATEGORIES;
  const found = list.find((s) => {
    return (
      cat.toLowerCase() === s.label.toLowerCase() ||
      s.keywords.some((kw) => {
        const k = kw.toLowerCase();
        return (
          cat.toLowerCase().includes(k) ||
          code.includes(k) ||
          canonical.includes(k) ||
          name.includes(k)
        );
      })
    );
  });

  return found?.label || cat;
}

interface FoodCategoriesManagerProps {
  filterMode?: "ALL" | "FOOD" | "DRINK";
}

export default function FoodCategoriesManager({
  filterMode = "ALL",
}: FoodCategoriesManagerProps) {
  const [selectedTab, setSelectedTab] = useState<FoodFilterTab>(filterMode);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Sorting & Pagination State
  const [sortMode, setSortMode] = useState<SortMode>("NEWEST");
  const [sortOpen, setSortOpen] = useState(false);
  const [size, setSize] = useState(20);
  const [sizeOpen, setSizeOpen] = useState(false);
  const [page, setPage] = useState(0);

  // Modals state
  const [foodModalOpen, setFoodModalOpen] = useState(false);
  const [editingFood, setEditingFood] = useState<FoodRecord | null>(null);
  const [deletingFood, setDeletingFood] = useState<FoodRecord | null>(null);

  // Queries
  const foodsQuery = useGetManagedFoodsQuery({ size: 200 });
  const categoriesQuery = useGetManagedFoodCategoriesQuery();
  const cuisinesQuery = useGetManagedCuisinesQuery();
  const seasonsQuery = useGetManagedSeasonsQuery();
  const eventsQuery = useGetManagedEventsQuery();
  const weatherQuery = useGetManagedWeatherConditionsQuery();
  const mealTypesQuery = useGetMealTypesQuery({ page: 0, size: 100 });
  const ageGroupsQuery = useGetAgeGroupsQuery({ page: 0, size: 100 });
  const dietaryTypesQuery = useGetDietaryTypesQuery({ page: 0, size: 100 });

  // Mutations
  const [createFood, { isLoading: creatingFood }] =
    useCreateManagedFoodMutation();
  const [updateFood, { isLoading: updatingFood }] =
    useUpdateManagedFoodMutation();
  const [deleteFood, { isLoading: deletingFoodRequest }] =
    useDeleteManagedFoodMutation();

  const foods = useMemo(
    () => foodsQuery.data?.content ?? [],
    [foodsQuery.data],
  );
  const categories = categoriesQuery.data ?? [];

  const activeFoods = useMemo(
    () => foods.filter((item) => item.isActive !== false),
    [foods],
  );

  // Filter Foods by Tab, Subcategory, & Search
  const filteredFoods = useMemo(() => {
    let list = activeFoods;
    const isDrinkMode = selectedTab === "DRINK";

    if (selectedTab === "FOOD") {
      list = list.filter((item) => {
        const cat = categoryName(item);
        const code = item.category?.code || "";
        return !isDrinkCategory(cat, code, item);
      });
    } else if (selectedTab === "DRINK") {
      list = list.filter((item) => {
        const cat = categoryName(item);
        const code = item.category?.code || "";
        return isDrinkCategory(cat, code, item);
      });
    }

    if (selectedSubCategory !== "ALL") {
      list = list.filter((item) =>
        matchesSubCategory(item, selectedSubCategory, isDrinkMode),
      );
    }

    const q = search.trim().toLowerCase();
    if (!q) return list;

    return list.filter((item) => {
      const name = foodName(item).toLowerCase();
      const canonical = (item.canonicalName || "").toLowerCase();
      const cat = categoryName(item).toLowerCase();
      const cuis = cuisineName(item).toLowerCase();
      return (
        name.includes(q) ||
        canonical.includes(q) ||
        cat.includes(q) ||
        cuis.includes(q)
      );
    });
  }, [activeFoods, selectedTab, selectedSubCategory, search]);

  // Counts
  const totalCount = activeFoods.length;
  const drinkCount = useMemo(
    () =>
      activeFoods.filter((item) =>
        isDrinkCategory(categoryName(item), item.category?.code || "", item),
      ).length,
    [activeFoods],
  );
  const foodOnlyCount = totalCount - drinkCount;

  // Subcategory Counts
  const subCategoryCounts = useMemo(() => {
    const isDrinkMode = selectedTab === "DRINK";
    const list = isDrinkMode ? DRINK_SUBCATEGORIES : FOOD_SUBCATEGORIES;
    const sourceFoods = isDrinkMode
      ? activeFoods.filter((item) =>
          isDrinkCategory(categoryName(item), item.category?.code, item),
        )
      : activeFoods.filter(
          (item) =>
            !isDrinkCategory(categoryName(item), item.category?.code, item),
        );

    const counts: Record<string, number> = {};
    list.forEach((subcat) => {
      counts[subcat.key] = sourceFoods.filter((item) =>
        matchesSubCategory(item, subcat.key, isDrinkMode),
      ).length;
    });
    return counts;
  }, [activeFoods, selectedTab]);

  const currentTabFoods = useMemo(() => {
    if (selectedTab === "FOOD") {
      return activeFoods.filter(
        (item) =>
          !isDrinkCategory(categoryName(item), item.category?.code || "", item),
      );
    }
    if (selectedTab === "DRINK") {
      return activeFoods.filter((item) =>
        isDrinkCategory(categoryName(item), item.category?.code || "", item),
      );
    }
    return activeFoods;
  }, [activeFoods, selectedTab]);

  // Sort Foods
  const sortedFoods = useMemo(() => {
    return [...filteredFoods].sort((a, b) => {
      const nameA = foodName(a);
      const nameB = foodName(b);

      if (sortMode === "A_Z") {
        return nameA.localeCompare(nameB, undefined, { sensitivity: "base" });
      }

      if (sortMode === "Z_A") {
        return nameB.localeCompare(nameA, undefined, { sensitivity: "base" });
      }

      const timeA = new Date(a.createdAt || 0).getTime();
      const timeB = new Date(b.createdAt || 0).getTime();

      return sortMode === "NEWEST" ? timeB - timeA : timeA - timeB;
    });
  }, [filteredFoods, sortMode]);

  // Pagination
  const totalPages = Math.max(Math.ceil(sortedFoods.length / size), 1);
  const safePage = Math.min(page, totalPages - 1);
  const pageItems = sortedFoods.slice(safePage * size, safePage * size + size);

  // Actions
  const handleCreateFood = () => {
    setEditingFood(null);
    setFoodModalOpen(true);
  };

  const handleEditFood = (item: FoodRecord) => {
    setEditingFood(item);
    setFoodModalOpen(true);
  };

  const handleSaveFood = async (payload: FoodWritePayload, images: File[]) => {
    try {
      if (editingFood) {
        await updateFood({
          uuid: editingFood.uuid,
          payload,
          images,
        }).unwrap();
        setNotice({ type: "success", text: "បានកែប្រែមុខម្ហូបដោយជោគជ័យ!" });
      } else {
        await createFood({
          payload,
          images,
        }).unwrap();
        setNotice({ type: "success", text: "បានបង្កើតមុខម្ហូបថ្មីដោយជោគជ័យ!" });
      }
      setFoodModalOpen(false);
      setEditingFood(null);
      void foodsQuery.refetch();
    } catch (err: any) {
      const msg = getMenuManagementApiError(err);
      setNotice({
        type: "error",
        text: msg,
      });
      throw new Error(msg);
    }
  };

  const confirmDeleteFood = async () => {
    if (!deletingFood) return;
    try {
      await deleteFood(deletingFood.uuid).unwrap();
      setNotice({
        type: "success",
        text: "បានលុប Food Catalog ជាអចិន្ត្រៃយ៍ដោយជោគជ័យ!",
      });
      setDeletingFood(null);
      void foodsQuery.refetch();
    } catch (err: any) {
      setNotice({
        type: "error",
        text: getMenuManagementApiError(err),
      });
    }
  };

  const sortOptions = [
    { value: "A_Z" as const, label: "A → Z" },
    { value: "Z_A" as const, label: "Z → A" },
    { value: "NEWEST" as const, label: "ថ្មីបំផុត" },
    { value: "OLDEST" as const, label: "ចាស់បំផុត" },
  ];

  return (
    <div className="w-full min-w-0 max-w-full space-y-5">
      {/* =====================================================
          HEADER
          Same visual concept as MenuItemsManager / UsersHeader / ShopsHeader
      ====================================================== */}
      <section className="relative overflow-hidden rounded-[30px] bg-[#14833E] px-6 py-7 text-white shadow-sm sm:px-8 sm:py-8">
        <div className="pointer-events-none absolute -right-12 -top-16 h-52 w-52 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-24 right-20 h-64 w-64 rounded-full bg-white/5" />

        <div className="relative flex flex-col gap-7 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15">
                {filterMode === "DRINK" ? (
                  <Coffee size={25} />
                ) : (
                  <Utensils size={25} />
                )}
              </div>

              <div className="min-w-0">
                <p className="text-5xl font-bold text-accent-400">
                  {filterMode === "DRINK" ? "ប្រភេទភេសជ្ជៈ" : "ប្រភេទអាហារ"}
                </p>

                <p className="mt-6 max-w-3xl text-xl leading-7 text-white/85">
                  Food Catalog សម្រាប់ហាង និង{" "}
                  <br className="md:block max-md:hidden" /> Menu Items សម្រាប់
                  វែបសាយ
                </p>
              </div>
            </div>

            {/* Statistics */}
            <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-3xl bg-white/20 px-5 py-4">
                <div className="flex items-center gap-2 text-xl text-white/80">
                  {filterMode === "DRINK" ? (
                    <Coffee size={20} />
                  ) : (
                    <Utensils size={20} />
                  )}
                  <span>
                    {filterMode === "DRINK"
                      ? "Food Catalog សម្រាប់ហាង (ភេសជ្ជៈ)"
                      : "Food Catalog សម្រាប់ហាង"}
                  </span>
                </div>
                <p className="mt-1 text-2xl font-bold text-white">
                  {filterMode === "DRINK" ? drinkCount : foodOnlyCount}
                </p>
              </div>

              <div className="rounded-3xl bg-white/20 px-5 py-4">
                <div className="flex items-center gap-2 text-xl text-white/80">
                  <Check size={20} />
                  <span>សកម្ម (Active)</span>
                </div>
                <p className="mt-1 text-2xl font-bold text-white">
                  {
                    activeFoods.filter((item) =>
                      filterMode === "DRINK"
                        ? isDrinkCategory(
                            categoryName(item),
                            item.category?.code,
                            item,
                          )
                        : !isDrinkCategory(
                            categoryName(item),
                            item.category?.code,
                            item,
                          ),
                    ).length
                  }
                </p>
              </div>

              <div className="rounded-3xl bg-white/20 px-5 py-4">
                <div className="flex items-center gap-2 text-xl text-white/80">
                  <Layers size={20} />
                  <span>ប្រភេទ (Categories)</span>
                </div>
                <p className="mt-1 text-2xl font-bold text-white">
                  {categories.length}
                </p>
              </div>
            </div>
          </div>

          {/* Header actions */}
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <button
              type="button"
              onClick={handleCreateFood}
              className="inline-flex min-w-[150px]  items-center justify-center gap-2 rounded-full py-2 bg-white  text-lg font-bold text-primary-800 shadow-sm transition hover:bg-primary-50 focus:outline-none focus:ring-4 focus:ring-white/20 "
            >
              <Plus size={20} />
              <p className="">
                {" "}
                {filterMode === "DRINK" ? "បន្ថែមភេសជ្ជៈ" : "បន្ថែមមីនុយ"}
              </p>
            </button>
          </div>
        </div>
      </section>

      {/* Notice Message */}
      {notice && (
        <div
          className={`rounded-2xl border px-5 py-4 text-lg leading-7 ${
            notice.type === "success"
              ? "border-primary-100 bg-primary-50 text-primary-700"
              : "border-red-100 bg-red-50 text-red-600"
          }`}
        >
          {notice.text}
        </div>
      )}

      {/* =====================================================
          FILTER TABS + SEARCH + SIZE + SORT TOOLBAR
      ====================================================== */}
      <section className="space-y-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          {/* Tabs */}
          <div className="flex w-full min-w-0 gap-2 overflow-x-auto pb-1 xl:w-auto">
            {filterMode === "ALL" && (
              <button
                type="button"
                onClick={() => {
                  setSelectedTab("ALL");
                  setPage(0);
                }}
                className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-lg font-medium transition ${
                  selectedTab === "ALL"
                    ? "bg-primary-800 text-white"
                    : "bg-white text-gray-500 hover:bg-emerald-50 hover:text-[#136C34]"
                }`}
              >
                ទាំងអស់
                <span
                  className={`flex h-7 min-w-7 items-center justify-center rounded-full px-1.5 text-lg font-medium ${
                    selectedTab === "ALL"
                      ? "bg-white/20 text-white"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {totalCount}
                </span>
              </button>
            )}

            {(filterMode === "ALL" || filterMode === "FOOD") && (
              <button
                type="button"
                onClick={() => {
                  setSelectedTab("FOOD");
                  setPage(0);
                }}
                className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-lg font-medium transition ${
                  selectedTab === "FOOD"
                    ? "bg-primary-800 text-white"
                    : "bg-white text-gray-500 hover:bg-emerald-50 hover:text-[#136C34]"
                }`}
              >
                <Utensils size={18} />
                ម្ហូប
                <span
                  className={`flex h-7 min-w-7 items-center justify-center rounded-full px-1.5 text-lg font-medium ${
                    selectedTab === "FOOD"
                      ? "bg-white/20 text-white"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {foodOnlyCount}
                </span>
              </button>
            )}

            {(filterMode === "ALL" || filterMode === "DRINK") && (
              <button
                type="button"
                onClick={() => {
                  setSelectedTab("DRINK");
                  setPage(0);
                }}
                className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-lg font-medium transition ${
                  selectedTab === "DRINK"
                    ? "bg-primary-800 text-white"
                    : "bg-white text-gray-500 hover:bg-emerald-50 hover:text-[#136C34]"
                }`}
              >
                <Coffee size={18} />
                ភេសជ្ជៈ
                <span
                  className={`flex h-7 min-w-7 items-center justify-center rounded-full px-1.5 text-lg font-medium ${
                    selectedTab === "DRINK"
                      ? "bg-white/20 text-white"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {drinkCount}
                </span>
              </button>
            )}
          </div>

          {/* Search + Size + Sort */}
          <div className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-center xl:w-auto">
            {/* Search Input */}
            <div className="relative min-w-0 flex-1 sm:min-w-[340px]">
              <Search
                size={20}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(0);
                }}
                placeholder={
                  filterMode === "FOOD"
                    ? "ស្វែងរក ម្ហូប..."
                    : filterMode === "DRINK"
                      ? "ស្វែងរក ភេសជ្ជៈ..."
                      : "ស្វែងរក ម្ហូប ឬ ភេសជ្ជៈ..."
                }
                className="h-[52px] w-full rounded-full border border-gray-200 bg-gray-50 pl-12 pr-11 text-lg text-gray-800 outline-none transition placeholder:text-gray-400 hover:border-gray-300 focus:border-primary-600 focus:bg-white focus:ring-4 focus:ring-primary-100"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setPage(0);
                  }}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            {/* Page size dropdown */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => {
                  setSizeOpen(!sizeOpen);
                  if (!sizeOpen) setSortOpen(false);
                }}
                className="flex h-[52px] min-w-[150px] items-center justify-between gap-3 rounded-full border border-gray-200 bg-white px-4 text-lg font-medium text-gray-700 transition hover:border-primary-200 hover:bg-primary-50"
              >
                <span>{size} / ទំព័រ</span>
                <ChevronDown size={18} />
              </button>

              {sizeOpen && (
                <div className="absolute right-0 top-[60px] z-[100] w-[180px] rounded-2xl border border-gray-100 bg-white p-2 shadow-xl">
                  {[10, 20, 50].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => {
                        setSize(value);
                        setPage(0);
                        setSizeOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-lg transition ${
                        size === value
                          ? "bg-primary-50 font-medium text-primary-800"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <span>{value} / ទំព័រ</span>
                      {size === value && <Check size={18} />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sort dropdown */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => {
                  setSortOpen(!sortOpen);
                  if (!sortOpen) setSizeOpen(false);
                }}
                aria-label="Sort"
                title="Sort"
                className="flex h-[52px] w-[52px] items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-800"
              >
                <ArrowUpDown size={20} />
              </button>

              {sortOpen && (
                <div className="absolute right-0 top-[60px] z-[100] w-[210px] rounded-2xl border border-gray-100 bg-white p-2 shadow-xl">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setSortMode(option.value);
                        setSortOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-lg transition ${
                        sortMode === option.value
                          ? "bg-primary-50 font-medium text-primary-800"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <span>{option.label}</span>
                      {sortMode === option.value && <Check size={18} />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sub-categories Filter Pills Bar */}
        <div className="flex w-full min-w-0 items-center gap-2 overflow-x-auto rounded-2xl border border-gray-100 bg-white p-3 shadow-xs [scrollbar-width:thin]">
          <button
            type="button"
            onClick={() => {
              setSelectedSubCategory("ALL");
              setPage(0);
            }}
            className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-base font-medium transition ${
              selectedSubCategory === "ALL"
                ? "bg-primary-800 text-white shadow-sm"
                : "border border-gray-200 bg-gray-50/70 text-gray-600 hover:border-primary-200 hover:bg-primary-50 hover:text-primary-800"
            }`}
          >
            <span>ទាំងអស់</span>
            <span
              className={`flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-xs font-bold ${
                selectedSubCategory === "ALL"
                  ? "bg-white/20 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {currentTabFoods.length}
            </span>
          </button>

          {(selectedTab === "DRINK"
            ? DRINK_SUBCATEGORIES
            : FOOD_SUBCATEGORIES
          ).map((subcat) => {
            const count = subCategoryCounts[subcat.key] || 0;
            const isSelected = selectedSubCategory === subcat.key;

            return (
              <button
                key={subcat.key}
                type="button"
                onClick={() => {
                  setSelectedSubCategory(isSelected ? "ALL" : subcat.key);
                  setPage(0);
                }}
                className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-base font-medium transition ${
                  isSelected
                    ? "bg-primary-800 text-white shadow-sm"
                    : "border border-gray-200 bg-white text-gray-700 hover:border-primary-200 hover:bg-primary-50 hover:text-primary-800"
                }`}
              >
                <span>{subcat.label}</span>
                {count > 0 && (
                  <span
                    className={`flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-xs font-bold ${
                      isSelected
                        ? "bg-white/20 text-white"
                        : "bg-primary-50 text-primary-800"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* =====================================================
          FOOD CATALOG TABLE
      ====================================================== */}
      <section className="w-full min-w-0 max-w-full overflow-hidden rounded-[24px] border border-gray-100 bg-white shadow-sm">
        {foodsQuery.isLoading ? (
          <div className="flex min-h-[340px] flex-col items-center justify-center gap-3">
            <Loader2 size={32} className="animate-spin text-primary-800" />
            <p className="mt-3 text-lg font-medium text-gray-500">
              កំពុងទាញយកទិន្នន័យ...
            </p>
          </div>
        ) : pageItems.length === 0 ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center p-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 text-primary-800">
              <Utensils size={30} />
            </div>
            <p className="mt-4 text-2xl font-semibold text-primary-800">
              មិនមានមុខម្ហូបត្រូវនឹងការស្វែងរក
            </p>
            <p className="mt-2 max-w-xl text-lg leading-8 text-gray-500">
              ចុចប៊ូតុង &quot;
              {filterMode === "DRINK" ? "បន្ថែមភេសជ្ជៈ" : "បន្ថែមមីនុយ"}&quot;
              ដើម្បីបញ្ចូលទៅក្នុងប្រព័ន្ធ។
            </p>
            <button
              type="button"
              onClick={handleCreateFood}
              className="mt-5 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary-800 px-6 text-lg font-medium text-white transition hover:bg-primary-900 focus:outline-none focus:ring-4 focus:ring-primary-200"
            >
              <Plus size={20} />
              {filterMode === "DRINK" ? "បន្ថែមភេសជ្ជៈ" : "បន្ថែមមីនុយ"}
            </button>
          </div>
        ) : (
          <div className="w-full min-w-0 max-w-full overflow-x-auto">
            <table className="w-full min-w-[1000px] border-collapse text-left">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/70">
                  <th className="px-6 py-4 text-xl font-semibold text-primary-800">
                    ម្ហូប
                  </th>
                  <th className="px-6 py-4 text-xl font-semibold text-primary-800">
                    Category
                  </th>
                  <th className="px-6 py-4 text-xl font-semibold text-primary-800">
                    Cuisine
                  </th>
                  <th className="px-6 py-4 text-xl font-semibold text-primary-800">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xl font-semibold text-primary-800">
                    សកម្មភាព
                  </th>
                </tr>
              </thead>

              <tbody>
                {pageItems.map((item) => {
                  const img = imageUrl(item);
                  const active = item.isActive !== false;
                  const cat = categoryName(item);
                  const isDrink = isDrinkCategory(
                    cat,
                    item.category?.code,
                    item,
                  );

                  return (
                    <tr
                      key={item.uuid}
                      className="border-b border-gray-100 bg-white transition-colors duration-150 last:border-b-0 hover:bg-gray-50/70"
                    >
                      {/* Food Item */}
                      <td className="px-6 py-5">
                        <div className="flex min-w-[320px] items-center gap-4">
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-100 bg-primary-50 text-primary-800">
                            {img ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={img}
                                alt={foodName(item)}
                                className="h-full w-full object-cover"
                                loading="lazy"
                                onError={(e) => {
                                  (
                                    e.currentTarget as HTMLImageElement
                                  ).style.display = "none";
                                  const fallback =
                                    e.currentTarget.parentElement?.querySelector(
                                      ".img-fallback",
                                    );
                                  if (fallback)
                                    fallback.classList.remove("hidden");
                                }}
                              />
                            ) : null}
                            <div
                              className={`img-fallback flex h-full w-full items-center justify-center ${
                                img ? "hidden" : ""
                              }`}
                            >
                              <ImageIcon size={24} />
                            </div>
                          </div>

                          <div className="min-w-0">
                            <p className="max-w-[300px] truncate text-lg font-semibold text-gray-800">
                              {foodName(item)}
                            </p>
                            {item.canonicalName &&
                              item.canonicalName !== foodName(item) && (
                                <p className="mt-1 max-w-[300px] truncate text-lg text-gray-400">
                                  {item.canonicalName}
                                </p>
                              )}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-6 py-5">
                        <p className="text-lg font-medium text-gray-600">
                          {getSubCategoryLabel(item)}
                        </p>
                      </td>

                      {/* Cuisine */}
                      <td className="px-6 py-5">
                        <p className="text-lg font-medium text-gray-600">
                          {cuisineName(item)}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full px-3.5 py-1.5 text-lg font-medium ring-1 ring-inset ${
                            active
                              ? "bg-primary-50 text-primary-700 ring-primary-100"
                              : "bg-gray-100 text-gray-500 ring-gray-200"
                          }`}
                        >
                          <span
                            className={`h-2 w-2 rounded-full ${
                              active ? "bg-primary-600" : "bg-gray-400"
                            }`}
                          />
                          {active ? "សកម្ម" : "អសកម្ម"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleEditFood(item)}
                            title="កែប្រែ"
                            className="flex h-10 w-10 items-center justify-center rounded-xl text-blue-500 transition hover:bg-blue-50 focus:outline-none focus:ring-4 focus:ring-blue-100"
                          >
                            <Pencil size={20} />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeletingFood(item)}
                            title="លុបជាអចិន្ត្រៃយ៍"
                            className="flex h-10 w-10 items-center justify-center rounded-xl text-red-500 transition hover:bg-red-50 focus:outline-none focus:ring-4 focus:ring-red-100"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* =====================================================
          PAGINATION
      ====================================================== */}
      {totalPages > 1 && (
        <div className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-lg text-gray-500">
            Page{" "}
            <span className="font-semibold text-gray-800">{safePage + 1}</span>{" "}
            / <span className="font-semibold text-gray-800">{totalPages}</span>
            {" · "}
            សរុប{" "}
            <span className="font-semibold text-primary-800">
              {sortedFoods.length}
            </span>
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={safePage <= 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-4 text-lg font-medium text-gray-600 transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={19} />
              មុន
            </button>

            <button
              type="button"
              disabled={safePage >= totalPages - 1}
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-4 text-lg font-medium text-gray-600 transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              បន្ទាប់
              <ChevronRight size={19} />
            </button>
          </div>
        </div>
      )}

      {/* =====================================================
          FOOD FORM MODAL (CREATE / EDIT)
      ====================================================== */}
      <FoodFormModal
        open={foodModalOpen}
        item={editingFood}
        saving={creatingFood || updatingFood}
        categories={categories}
        cuisines={cuisinesQuery.data ?? []}
        seasons={seasonsQuery.data ?? []}
        events={eventsQuery.data ?? []}
        weatherConditions={weatherQuery.data ?? []}
        mealTypes={mealTypesQuery.data?.contents ?? []}
        ageGroups={ageGroupsQuery.data?.contents ?? []}
        dietaryTypes={dietaryTypesQuery.data?.contents ?? []}
        onClose={() => {
          setFoodModalOpen(false);
          setEditingFood(null);
        }}
        onSubmit={handleSaveFood}
      />

      {/* =====================================================
          HARD DELETE CONFIRM MODAL
      ====================================================== */}
      <HardDeleteFoodConfirmModal
        food={deletingFood}
        deleting={deletingFoodRequest}
        onClose={() => setDeletingFood(null)}
        onConfirm={confirmDeleteFood}
      />
    </div>
  );
}
