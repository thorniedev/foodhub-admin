"use client";

import { useCallback, useMemo } from "react";

import {
  useCreateMealTypeMutation,
  useGetMealTypesQuery,
  useUpdateMealTypeMutation,
} from "@/src/app/store/mealTypeApi";
import {
  createCodeFromLabel,
  mergeCatalogWithCache,
  updateCatalogCacheActive,
  updateCatalogCacheItem,
} from "@/src/lib/filterCatalogStorage";
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

  const groupOptions = useMemo(() => {
    const serverOptions = (data?.contents ?? []).map(toCatalogOption);
    return mergeCatalogWithCache("MEAL_TIME", serverOptions);
  }, [data]);

  const createOption = useCallback(
    async (values: FilterCatalogOptionFormValues) => {
      const label = values.name.trim() || values.localName.trim();
      const code = values.code?.trim().toUpperCase() || createCodeFromLabel(label);

      const startTime = values.startTime || "00:00:00";
      const endTime = values.endTime || "23:59:00";
      const order = Number(values.numericValue) || 1;

      try {
        const created = await createMealType({
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

        if (created?.uuid) {
          updateCatalogCacheItem("MEAL_TYPE", created.uuid, {
            code,
            name: label,
            localName: values.localName.trim() || null,
            description: values.description.trim() || null,
            numericValue: order,
            active: values.active,
          });
        }
      } catch (err: any) {
        const errStr = JSON.stringify(err || "").toLowerCase();
        if (errStr.includes("already exists") || errStr.includes("exist")) {
          updateCatalogCacheItem("MEAL_TYPE", `existing-${code}`, {
            code,
            name: label,
            localName: values.localName.trim() || null,
            description: values.description.trim() || null,
            numericValue: order,
            active: values.active,
          });
          await refetch();
          return;
        }
        throw err;
      }

      await refetch();
    },
    [createMealType, refetch],
  );

  const updateOption = useCallback(
    async (uuid: string, values: FilterCatalogOptionFormValues) => {
      const label = values.name.trim() || values.localName.trim();
      const code = values.code?.trim().toUpperCase();

      const startTime = values.startTime || "00:00:00";
      const endTime = values.endTime || "23:59:00";
      const order = Number(values.numericValue) || 1;

      updateCatalogCacheItem("MEAL_TYPE", uuid, {
        name: label,
        localName: values.localName.trim() || null,
        description: values.description.trim() || null,
        numericValue: order,
        active: values.active,
        ...(code ? { code } : {}),
      });

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

      if (code) {
        body.code = code;
      }

      try {
        await updateMealType({
          uuid,
          body,
        }).unwrap();
      } catch (err) {
        console.warn("[MEAL TYPE UPDATE ERROR, CLIENT CACHE SAVED]", err);
      }

      await refetch();
    },
    [updateMealType, refetch],
  );

  const setActive = useCallback(
    async (
      uuid: string,
      active: boolean,
    ) => {
      updateCatalogCacheActive("MEAL_TIME", uuid, active);
      try {
        await updateMealType({
          uuid,
          body: {
            isActive: active,
            is_active: active,
            active: active,
          },
        }).unwrap();
      } catch (err) {
        console.warn("[MEAL_TIME setActive error, client cache updated]", err);
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
