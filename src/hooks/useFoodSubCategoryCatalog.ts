"use client";

import { useCallback, useMemo } from "react";

import {
  useCreateFoodCategoryMutation,
  useGetFoodCategoriesQuery,
  useUpdateFoodCategoryMutation,
} from "@/src/app/store/foodCategoryApi";
import { createCodeFromLabel } from "@/src/lib/filterCatalogStorage";
import type {
  FilterCatalogOption,
  FilterCatalogOptionFormValues,
} from "@/src/types/filterCatalog";

const PRESET_FOOD_SUBCATEGORIES = [
  { code: "KHMER_FOOD", name: "Khmer Food", localName: "ម្ហូបខ្មែរ", keywords: ["khmer", "ខ្មែរ"] },
  { code: "RICE", name: "Rice Dishes", localName: "ម្ហូបបាយ", keywords: ["rice", "បាយ"] },
  { code: "NOODLES", name: "Noodles & Kuyteav", localName: "មី និងគុយទាវ", keywords: ["noodle", "kuyteav", "គុយទាវ", "មី", "នំបញ្ចុក"] },
  { code: "SOUP", name: "Soups", localName: "សម្ល និងស៊ុប", keywords: ["soup", "សម្ល", "ស៊ុប", "ស្ងោរ"] },
  { code: "GRILLED", name: "Grilled Dishes", localName: "ម្ហូបអាំង", keywords: ["grill", "អាំង", "bbq"] },
  { code: "FRIED", name: "Fried Dishes", localName: "ម្ហូបចៀន", keywords: ["fry", "fried", "ចៀន", "បំពង"] },
  { code: "STIR_FRIED", name: "Stir-fried Dishes", localName: "ម្ហូបឆា", keywords: ["stir", "stir-fry", "ឆា"] },
  { code: "SEAFOOD", name: "Seafood", localName: "គ្រឿងសមុទ្រ", keywords: ["seafood", "សមុទ្រ", "បង្គា", "ក្តាម", "មឹក", "ត្រី"] },
  { code: "MEAT", name: "Meat Dishes", localName: "ម្ហូបសាច់", keywords: ["meat", "សាច់", "គោ", "ជ្រូក", "មាន់"] },
  { code: "VEGETARIAN", name: "Vegetarian Dishes", localName: "ម្ហូបបួស", keywords: ["vegetarian", "vegan", "បួស"] },
  { code: "FAST_FOOD", name: "Fast Food", localName: "អាហាររហ័ស", keywords: ["fast food", "fast", "burger", "pizza", "អាហាររហ័ស"] },
  { code: "SNACK", name: "Snacks", localName: "អាហារសម្រន់", keywords: ["snack", "street bites", "សម្រន់", "គ្រឿងក្លែម", "street"] },
  { code: "DESSERT", name: "Desserts", localName: "បង្អែម", keywords: ["dessert", "sweet", "បង្អែម"] },
  { code: "BAKERY", name: "Bakery & Pastries", localName: "នំ និងផលិតផលដុត", keywords: ["bakery", "pastry", "bread", "cake", "នំ", "ដុត"] },
  { code: "BREAKFAST", name: "Breakfast", localName: "អាហារពេលព្រឹក", keywords: ["breakfast", "ពេលព្រឹក"] },
  { code: "SALAD", name: "Salads", localName: "សាឡាត់", keywords: ["salad", "សាឡាត់"] },
];

function isDrink(name: string, code?: string): boolean {
  const n = (name || "").toLowerCase();
  const cd = (code || "").toLowerCase();
  return (
    cd.includes("drink") ||
    cd.includes("beverage") ||
    n.includes("ភេសជ្ជៈ") ||
    n.includes("drink") ||
    n.includes("ទឹក") ||
    n.includes("កាហ្វេ") ||
    n.includes("តែ")
  );
}

export function useFoodSubCategoryCatalog() {
  const { data, isLoading, isFetching, error, refetch } =
    useGetFoodCategoriesQuery({
      page: 0,
      size: 200,
      includeInactive: true,
    });

  const [createFoodCategory] = useCreateFoodCategoryMutation();
  const [updateFoodCategory] = useUpdateFoodCategoryMutation();

  const allCategories = useMemo(() => data?.contents ?? [], [data]);

  // Find root food category UUID
  const foodRootUuid = useMemo(() => {
    const root = allCategories.find(
      (c) =>
        c.code?.toLowerCase() === "food" ||
        c.name?.includes("ម្ហូបអាហារ") ||
        c.name?.includes("អាហារ") ||
        c.name?.toLowerCase().includes("food"),
    );
    return root?.uuid ?? null;
  }, [allCategories]);

  const groupOptions: FilterCatalogOption[] = useMemo(() => {
    const apiOptions: FilterCatalogOption[] = allCategories
      .filter((item) => {
        // Exclude root category itself
        if (
          item.code?.toUpperCase() === "FOOD" ||
          item.name === "ម្ហូបអាហារ" ||
          item.name === "អាហារ"
        ) {
          return false;
        }
        // Exclude drinks
        if (isDrink(item.name, item.code)) {
          return false;
        }
        return true;
      })
      .map((item) => ({
        uuid: item.uuid,
        groupCode: "FOOD_SUBCATEGORY",
        code: item.code,
        name: item.name,
        localName: item.name,
        description: item.description,
        parentUuid: item.parentCategoryUuid || foodRootUuid,
        numericValue: null,
        unit: null,
        active: item.isActive ?? true,
        createdAt: item.createdAt || new Date().toISOString(),
        updatedAt: item.createdAt || new Date().toISOString(),
      }));

    // Merge with preset list if not already present in API options
    const presetsToAdd: FilterCatalogOption[] = PRESET_FOOD_SUBCATEGORIES.filter(
      (preset) =>
        !apiOptions.some(
          (opt) =>
            opt.name.toLowerCase() === preset.localName.toLowerCase() ||
            opt.name.toLowerCase() === preset.name.toLowerCase() ||
            opt.code.toUpperCase() === preset.code.toUpperCase(),
        ),
    ).map((preset) => ({
      uuid: `preset-food-${preset.code.toLowerCase()}`,
      groupCode: "FOOD_SUBCATEGORY",
      code: preset.code,
      name: preset.name,
      localName: preset.localName,
      description: `ប្រភេទរងនៃអាហារ: ${preset.localName} (${preset.name})`,
      parentUuid: foodRootUuid,
      numericValue: null,
      unit: null,
      active: true,
      createdAt: "2026-08-11T00:00:00.000Z",
      updatedAt: "2026-08-11T00:00:00.000Z",
    }));

    return [...apiOptions, ...presetsToAdd];
  }, [allCategories, foodRootUuid]);

  const createOption = useCallback(
    async (values: FilterCatalogOptionFormValues) => {
      const label = values.localName.trim() || values.name.trim();

      await createFoodCategory({
        code: createCodeFromLabel(label),
        name: label,
        description: values.description.trim() || null,
        isActive: values.active,
        parentCategoryUuid: foodRootUuid,
      }).unwrap();

      await refetch();
    },
    [createFoodCategory, foodRootUuid, refetch],
  );

  const updateOption = useCallback(
    async (uuid: string, values: FilterCatalogOptionFormValues) => {
      const label = values.localName.trim() || values.name.trim();

      if (uuid.startsWith("preset-")) {
        // Create as real category in API if editing preset
        await createFoodCategory({
          code: createCodeFromLabel(label),
          name: label,
          description: values.description.trim() || null,
          isActive: values.active,
          parentCategoryUuid: foodRootUuid,
        }).unwrap();
      } else {
        await updateFoodCategory({
          uuid,
          body: {
            name: label,
            description: values.description.trim() || null,
            isActive: values.active,
            parentCategoryUuid: foodRootUuid,
          },
        }).unwrap();
      }

      await refetch();
    },
    [createFoodCategory, updateFoodCategory, foodRootUuid, refetch],
  );

  const setActive = useCallback(
    async (uuid: string, active: boolean) => {
      if (uuid.startsWith("preset-")) {
        const found = PRESET_FOOD_SUBCATEGORIES.find(
          (p) => `preset-food-${p.code.toLowerCase()}` === uuid,
        );
        if (found) {
          await createFoodCategory({
            code: found.code,
            name: found.localName,
            description: `ប្រភេទរងនៃអាហារ: ${found.localName}`,
            isActive: active,
            parentCategoryUuid: foodRootUuid,
          }).unwrap();
        }
      } else {
        await updateFoodCategory({
          uuid,
          body: {
            isActive: active,
          },
        }).unwrap();
      }

      await refetch();
    },
    [createFoodCategory, updateFoodCategory, foodRootUuid, refetch],
  );

  return {
    groupOptions,
    createOption,
    updateOption,
    setActive,
    isLoading,
    isFetching,
    error,
    refresh: refetch,
  };
}
