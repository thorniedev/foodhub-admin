import { useCallback, useEffect, useMemo, useState } from "react";

import {
  useCreateMealTypeMutation,
  useGetMealTypesQuery,
  useUpdateMealTypeMutation,
} from "@/src/app/store/mealTypeApi";
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
import type { MealType } from "@/src/types/mealType";

function toCatalogOption(item: MealType): FilterCatalogOption {
  return {
    uuid: item.uuid,
    groupCode: "MEAL_TIME",
    code: item.code,
    name: item.name,
    localName: item.name,
    description: null,
    numericValue: item.displayOrder,
    unit: null,
    startTime: item.defaultStartTime,
    endTime: item.defaultEndTime,
    active: item.isActive,
    createdAt: new Date().toISOString(), // Fallback
    updatedAt: new Date().toISOString(), // Fallback
  };
}

export function useMealTypeCatalog() {
  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetMealTypesQuery({
    page: 0,
    size: 100,
    includeInactive: true,
  });

  const [createMealType] = useCreateMealTypeMutation();
  const [updateMealType] = useUpdateMealTypeMutation();
  const [localItems, setLocalItems] = useState<FilterCatalogOption[]>(() =>
    readCatalogCache("MEAL_TIME"),
  );

  useEffect(() => {
    if (data?.contents) {
      const serverConverted = data.contents.map(toCatalogOption);
      const merged = mergeCatalogWithCache("MEAL_TIME", serverConverted);
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

      await createMealType({
        code: createCodeFromLabel(label),
        name: label,
        defaultStartTime: values.startTime || "00:00:00",
        defaultEndTime: values.endTime || "23:59:00",
        displayOrder: Number(values.numericValue) || 1,
        isActive: values.active,
      }).unwrap();

      await refetch();
    },
    [createMealType, refetch],
  );

  const updateOption = useCallback(
    async (uuid: string, values: FilterCatalogOptionFormValues) => {
      const label = values.name.trim() || values.localName.trim();

      await updateMealType({
        uuid,
        body: {
          name: label,
          defaultStartTime: values.startTime || "00:00:00",
          defaultEndTime: values.endTime || "23:59:00",
          displayOrder: Number(values.numericValue) || 1,
          isActive: values.active,
        },
      }).unwrap();

      updateCatalogCacheActive("MEAL_TIME", uuid, values.active);
      setLocalItems((prev) =>
        prev.map((item) =>
          item.uuid === uuid
            ? {
                ...item,
                name: label,
                localName: label,
                active: values.active,
              }
            : item,
        ),
      );

      await refetch();
    },
    [updateMealType, refetch],
  );

  const setActive = useCallback(
    async (uuid: string, active: boolean) => {
      updateCatalogCacheActive("MEAL_TIME", uuid, active);
      setLocalItems((prev) =>
        prev.map((item) => (item.uuid === uuid ? { ...item, active } : item)),
      );

      try {
        await updateMealType({
          uuid,
          body: {
            isActive: active,
          },
        }).unwrap();
      } catch (err) {
        console.warn("Could not update meal type on server:", err);
      }

      await refetch();
    },
    [updateMealType, refetch],
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
