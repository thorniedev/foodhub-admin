import { useCallback, useEffect, useMemo, useState } from "react";

import {
  useCreateFoodCategoryMutation,
  useGetFoodCategoriesQuery,
  useUpdateFoodCategoryMutation,
} from "@/src/app/store/foodCategoryApi";
import {
  createCodeFromLabel,
  mergeCatalogWithCache,
  readCatalogCache,
  updateCatalogCacheActive,
} from "@/src/lib/filterCatalogStorage";
import type {
  FilterCatalogOption,
  FilterCatalogOptionFormValues,
} from "@/src/types/filterCatalog";

function toCatalogOption(item: {
  uuid: string;
  code: string;
  name: string;
  description: string | null;
  parentCategoryUuid: string | null;
  isActive: boolean;
  createdAt: string;
}): FilterCatalogOption {
  return {
    uuid: item.uuid,
    groupCode: "FOOD_CATEGORY",
    code: item.code,
    name: item.name,
    localName: item.name,
    description: item.description,
    parentUuid: item.parentCategoryUuid,
    numericValue: null,
    unit: null,
    active: item.isActive,
    createdAt: item.createdAt,
    updatedAt: item.createdAt, // Fallback since updatedAt isn't clearly always there
  };
}

export function useFoodCategoryCatalog() {
  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetFoodCategoriesQuery({
    page: 0,
    size: 100,
    includeInactive: true,
  });

  const [createFoodCategory] = useCreateFoodCategoryMutation();
  const [updateFoodCategory] = useUpdateFoodCategoryMutation();
  const [localItems, setLocalItems] = useState<FilterCatalogOption[]>(() =>
    readCatalogCache("FOOD_CATEGORY"),
  );

  useEffect(() => {
    if (data?.contents) {
      const serverConverted = data.contents.map(toCatalogOption);
      const merged = mergeCatalogWithCache("FOOD_CATEGORY", serverConverted);
      setLocalItems(merged);
    }
  }, [data]);

  const groupOptions = useMemo(() => {
    if (localItems.length > 0) return localItems;
    return (data?.contents ?? []).map(toCatalogOption);
  }, [data, localItems]);

  const createOption = useCallback(
    async (values: FilterCatalogOptionFormValues) => {
      const label = values.name.trim() || values.localName.trim();

      await createFoodCategory({
        code: createCodeFromLabel(label),
        name: values.name.trim() || values.localName.trim(),
        description: values.description.trim() || null,
        isActive: values.active,
        parentCategoryUuid: values.parentUuid || null,
      }).unwrap();

      await refetch();
    },
    [createFoodCategory, refetch],
  );

  const updateOption = useCallback(
    async (uuid: string, values: FilterCatalogOptionFormValues) => {
      await updateFoodCategory({
        uuid,
        body: {
          name: values.name.trim() || values.localName.trim(),
          description: values.description.trim() || null,
          isActive: values.active,
          parentCategoryUuid: values.parentUuid || null,
        },
      }).unwrap();

      updateCatalogCacheActive("FOOD_CATEGORY", uuid, values.active);
      setLocalItems((prev) =>
        prev.map((item) =>
          item.uuid === uuid
            ? {
                ...item,
                name: values.name.trim() || values.localName.trim(),
                localName: values.localName.trim() || values.name.trim(),
                description: values.description.trim() || null,
                parentUuid: values.parentUuid || null,
                active: values.active,
              }
            : item,
        ),
      );

      await refetch();
    },
    [updateFoodCategory, refetch],
  );

  const setActive = useCallback(
    async (uuid: string, active: boolean) => {
      updateCatalogCacheActive("FOOD_CATEGORY", uuid, active);
      setLocalItems((prev) =>
        prev.map((item) => (item.uuid === uuid ? { ...item, active } : item)),
      );

      try {
        await updateFoodCategory({
          uuid,
          body: {
            isActive: active,
          },
        }).unwrap();
      } catch (err) {
        console.warn("Could not update category on server:", err);
      }

      await refetch();
    },
    [updateFoodCategory, refetch],
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
