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
    updatedAt: item.createdAt,
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

  const groupOptions = useMemo(() => {
    const raw = data?.contents ?? [];
    const map = new Map<string, FilterCatalogOption>();
    for (const item of raw) {
      if (item?.uuid) {
        map.set(item.uuid, toCatalogOption(item));
      }
    }
    return Array.from(map.values());
  }, [data]);

  const createOption = useCallback(
    async (values: FilterCatalogOptionFormValues) => {
      const label = values.name.trim() || values.localName.trim();
      const code = values.code?.trim().toUpperCase() || createCodeFromLabel(label);

      await createFoodCategory({
        code,
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
          code: values.code?.trim().toUpperCase() || undefined,
          name: values.name.trim() || values.localName.trim(),
          description: values.description.trim() || null,
          isActive: values.active,
          parentCategoryUuid: values.parentUuid || null,
        },
      }).unwrap();

      await refetch();
    },
    [updateFoodCategory, refetch],
  );

  const setActive = useCallback(
    async (uuid: string, active: boolean) => {
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
