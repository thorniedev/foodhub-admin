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

const PRESET_DRINK_SUBCATEGORIES = [
  { code: "WATER", name: "Water", localName: "ទឹក", keywords: ["water", "ទឹក", "បរិសុទ្ធ"] },
  { code: "CANNED_DRINK", name: "Canned Drinks", localName: "ភេសជ្ជៈកំប៉ុង", keywords: ["canned", "can", "soda", "កំប៉ុង", "សូដា"] },
  { code: "FRESH_JUICE", name: "Fresh Fruit Juice", localName: "ទឹកផ្លែឈើស្រស់", keywords: ["juice", "fresh juice", "cane", "ផ្លែឈើ", "ទឹកអំពៅ"] },
  { code: "SMOOTHIE", name: "Smoothies", localName: "ស្មូតធី", keywords: ["smoothie", "shake", "ស្មូតធី"] },
  { code: "COFFEE", name: "Coffee", localName: "កាហ្វេ", keywords: ["coffee", "កាហ្វេ"] },
  { code: "TEA", name: "Tea", localName: "តែ", keywords: ["tea", "តែ"] },
  { code: "MILK", name: "Milk", localName: "ទឹកដោះគោ", keywords: ["milk", "ទឹកដោះគោ"] },
  { code: "MILK_TEA", name: "Milk Tea", localName: "តែទឹកដោះគោ", keywords: ["milk tea", "boba", "bubble tea", "តែទឹកដោះគោ"] },
  { code: "CHOCOLATE_DRINK", name: "Chocolate Drinks", localName: "ភេសជ្ជៈសូកូឡា", keywords: ["chocolate", "cocoa", "សូកូឡា"] },
  { code: "ENERGY_DRINK", name: "Energy Drinks", localName: "ភេសជ្ជៈប៉ូវកម្លាំង", keywords: ["energy", "energy drink", "ប៉ូវកម្លាំង"] },
  { code: "HERBAL_DRINK", name: "Herbal Drinks", localName: "ភេសជ្ជៈរុក្ខជាតិ", keywords: ["herbal", "herbal drink", "រុក្ខជាតិ"] },
  { code: "TRADITIONAL_KHMER_DRINK", name: "Traditional Khmer Drinks", localName: "ភេសជ្ជៈប្រពៃណីខ្មែរ", keywords: ["traditional khmer drink", "ប្រពៃណី", "ខ្មែរ"] },
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

export function useDrinkSubCategoryCatalog() {
  const { data, isLoading, isFetching, error, refetch } =
    useGetFoodCategoriesQuery({
      page: 0,
      size: 200,
      includeInactive: true,
    });

  const [createFoodCategory] = useCreateFoodCategoryMutation();
  const [updateFoodCategory] = useUpdateFoodCategoryMutation();

  const allCategories = useMemo(() => data?.contents ?? [], [data]);

  // Find root drink category UUID
  const drinkRootUuid = useMemo(() => {
    const root = allCategories.find(
      (c) =>
        c.code?.toLowerCase() === "drink" ||
        c.code?.toLowerCase() === "beverage" ||
        c.name?.includes("ភេសជ្ជៈ") ||
        c.name?.toLowerCase().includes("drink"),
    );
    return root?.uuid ?? null;
  }, [allCategories]);

  const groupOptions: FilterCatalogOption[] = useMemo(() => {
    const apiOptions: FilterCatalogOption[] = allCategories
      .filter((item) => {
        // Exclude root category itself
        if (
          item.code?.toUpperCase() === "DRINK" ||
          item.name === "ភេសជ្ជៈ"
        ) {
          return false;
        }
        // Only include drinks
        return isDrink(item.name, item.code);
      })
      .map((item) => ({
        uuid: item.uuid,
        groupCode: "DRINK_SUBCATEGORY",
        code: item.code,
        name: item.name,
        localName: item.name,
        description: item.description,
        parentUuid: item.parentCategoryUuid || drinkRootUuid,
        numericValue: null,
        unit: null,
        active: item.isActive ?? true,
        createdAt: item.createdAt || new Date().toISOString(),
        updatedAt: item.createdAt || new Date().toISOString(),
      }));

    // Merge with preset list if not already present in API options
    const presetsToAdd: FilterCatalogOption[] = PRESET_DRINK_SUBCATEGORIES.filter(
      (preset) =>
        !apiOptions.some(
          (opt) =>
            opt.name.toLowerCase() === preset.localName.toLowerCase() ||
            opt.name.toLowerCase() === preset.name.toLowerCase() ||
            opt.code.toUpperCase() === preset.code.toUpperCase(),
        ),
    ).map((preset) => ({
      uuid: `preset-drink-${preset.code.toLowerCase()}`,
      groupCode: "DRINK_SUBCATEGORY",
      code: preset.code,
      name: preset.name,
      localName: preset.localName,
      description: `ប្រភេទរងនៃភេសជ្ជៈ: ${preset.localName} (${preset.name})`,
      parentUuid: drinkRootUuid,
      numericValue: null,
      unit: null,
      active: true,
      createdAt: "2026-08-11T00:00:00.000Z",
      updatedAt: "2026-08-11T00:00:00.000Z",
    }));

    return [...apiOptions, ...presetsToAdd];
  }, [allCategories, drinkRootUuid]);

  const createOption = useCallback(
    async (values: FilterCatalogOptionFormValues) => {
      const label = values.localName.trim() || values.name.trim();

      await createFoodCategory({
        code:
          values.code?.trim().toUpperCase().replace(/\s+/g, "_") ||
          createCodeFromLabel(label),
        name: label,
        description: values.description.trim() || null,
        isActive: values.active,
        parentCategoryUuid: drinkRootUuid,
      }).unwrap();

      await refetch();
    },
    [createFoodCategory, drinkRootUuid, refetch],
  );

  const updateOption = useCallback(
    async (uuid: string, values: FilterCatalogOptionFormValues) => {
      const label = values.localName.trim() || values.name.trim();
      const code = values.code?.trim().toUpperCase().replace(/\s+/g, "_");

      if (uuid.startsWith("preset-")) {
        // Create as real category in API if editing preset
        await createFoodCategory({
          code: code || createCodeFromLabel(label),
          name: label,
          description: values.description.trim() || null,
          isActive: values.active,
          parentCategoryUuid: drinkRootUuid,
        }).unwrap();
      } else {
        await updateFoodCategory({
          uuid,
          body: {
            code,
            name: label,
            description: values.description.trim() || null,
            isActive: values.active,
            parentCategoryUuid: drinkRootUuid,
          },
        }).unwrap();
      }

      await refetch();
    },
    [createFoodCategory, updateFoodCategory, drinkRootUuid, refetch],
  );

  const setActive = useCallback(
    async (uuid: string, active: boolean) => {
      if (uuid.startsWith("preset-")) {
        const found = PRESET_DRINK_SUBCATEGORIES.find(
          (p) => `preset-drink-${p.code.toLowerCase()}` === uuid,
        );
        if (found) {
          await createFoodCategory({
            code: found.code,
            name: found.localName,
            description: `ប្រភេទរងនៃភេសជ្ជៈ: ${found.localName}`,
            isActive: active,
            parentCategoryUuid: drinkRootUuid,
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
    [createFoodCategory, updateFoodCategory, drinkRootUuid, refetch],
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
