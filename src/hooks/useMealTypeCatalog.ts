"use client";

import { useCallback, useMemo } from "react";

import {
  useCreateMealTypeMutation,
  useGetMealTypesQuery,
  useUpdateMealTypeMutation,
} from "@/src/app/store/mealTypeApi";
import { createCodeFromLabel } from "@/src/lib/filterCatalogStorage";
import type {
  FilterCatalogOption,
  FilterCatalogOptionFormValues,
} from "@/src/types/filterCatalog";
import type { MealType } from "@/src/types/mealType";

function toCatalogOption(item: MealType): FilterCatalogOption {
  const activeValue =
    item.is_active !== undefined
      ? item.is_active
      : item.isActive !== undefined
        ? item.isActive
        : item.active !== undefined
          ? item.active
          : true;

  return {
    uuid: item.uuid,
    groupCode: "MEAL_TIME",
    code: item.code,
    name: item.name,
    localName: item.name,
    description: null,
    numericValue: item.displayOrder ?? item.display_order ?? null,
    unit: null,
    startTime: item.defaultStartTime || item.default_start_time || "",
    endTime: item.defaultEndTime || item.default_end_time || "",
    active: Boolean(activeValue),
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

  const [createMealType] =
    useCreateMealTypeMutation();

  const [updateMealType] =
    useUpdateMealTypeMutation();

  const groupOptions = useMemo(
    () =>
      (data?.contents ?? []).map(
        toCatalogOption,
      ),
    [data],
  );

  const createOption = useCallback(
    async (
      values: FilterCatalogOptionFormValues,
    ) => {
      const label =
        values.name.trim() ||
        values.localName.trim();
      const code =
        values.code?.trim().toUpperCase() ||
        createCodeFromLabel(label);

      const startTime = values.startTime || "00:00:00";
      const endTime = values.endTime || "23:59:00";
      const order = Number(values.numericValue) || 1;

      await createMealType({
        code,
        name: label,
        defaultStartTime: startTime,
        default_start_time: startTime,
        defaultEndTime: endTime,
        default_end_time: endTime,
        displayOrder: order,
        display_order: order,
        isActive: values.active,
        is_active: values.active,
        active: values.active,
      }).unwrap();

      await refetch();
    },
    [createMealType, refetch],
  );

  const updateOption = useCallback(
    async (
      uuid: string,
      values: FilterCatalogOptionFormValues,
    ) => {
      const label =
        values.name.trim() ||
        values.localName.trim();

      const startTime = values.startTime || "00:00:00";
      const endTime = values.endTime || "23:59:00";
      const order = Number(values.numericValue) || 1;

      const body: any = {
        name: label,
        defaultStartTime: startTime,
        default_start_time: startTime,
        defaultEndTime: endTime,
        default_end_time: endTime,
        displayOrder: order,
        display_order: order,
        isActive: values.active,
        is_active: values.active,
        active: values.active,
      };

      if (values.code?.trim()) {
        body.code = values.code.trim().toUpperCase();
      }

      await updateMealType({
        uuid,
        body,
      }).unwrap();

      await refetch();
    },
    [updateMealType, refetch],
  );

  const setActive = useCallback(
    async (
      uuid: string,
      active: boolean,
    ) => {
      await updateMealType({
        uuid,
        body: {
          isActive: active,
          is_active: active,
          active: active,
        },
      }).unwrap();

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
