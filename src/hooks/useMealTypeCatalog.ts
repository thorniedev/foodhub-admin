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

function formatToBackendTime(t?: string, defaultVal = "00:00:00"): string {
  if (!t || !t.trim()) return defaultVal;
  const clean = t.trim();
  if (clean.length === 5) return `${clean}:00`;
  return clean;
}

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
    active: item.isActive !== false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
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
      const code = values.code?.trim().toUpperCase() || createCodeFromLabel(label);
      const startTime = formatToBackendTime(values.startTime, "00:00:00");
      const endTime = formatToBackendTime(values.endTime, "23:59:00");

      await createMealType({
        code,
        name: label,
        defaultStartTime: startTime,
        defaultEndTime: endTime,
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
      const updatedCode = values.code?.trim().toUpperCase() || undefined;
      const startTime = formatToBackendTime(values.startTime, "00:00:00");
      const endTime = formatToBackendTime(values.endTime, "23:59:00");

      await updateMealType({
        uuid,
        body: {
          code: updatedCode,
          name: label,
          defaultStartTime: startTime,
          defaultEndTime: endTime,
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
                code: updatedCode || item.code,
                name: label,
                localName: label,
                startTime,
                endTime,
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
