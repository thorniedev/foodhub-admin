"use client";

import { useCallback, useMemo } from "react";

import {
  useCreateFoodCategoryMutation,
  useGetFoodCategoriesQuery,
  useUpdateFoodCategoryMutation,
} from "@/src/app/store/foodCategoryApi";
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

function toCatalogOption(item: {
  uuid: string;
  code: string;
  name: string;
  description: string | null;
  parentCategoryUuid: string | null;
  isActive?: boolean;
  active?: boolean;
  is_active?: boolean;
  createdAt: string;
}): FilterCatalogOption {
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
    groupCode: "FOOD_CATEGORY",
    code: item.code,
    name: item.name,
    localName: item.name,
    description: item.description,
    parentUuid: item.parentCategoryUuid,
    numericValue: null,
    unit: null,
    active: Boolean(activeValue),
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

  const [createFoodCategory] =
    useCreateFoodCategoryMutation();

  const [updateFoodCategory] =
    useUpdateFoodCategoryMutation();

  const groupOptions = useMemo(() => {
    const serverOptions = (data?.contents ?? []).map(toCatalogOption);
    return mergeCatalogWithCache("FOOD_CATEGORY", serverOptions);
  }, [data]);

  const createOption = useCallback(
    async (values: FilterCatalogOptionFormValues) => {
      const label = values.name.trim() || values.localName.trim();
      const code = values.code?.trim().toUpperCase() || createCodeFromLabel(label);

      try {
        const created = await createFoodCategory({
          code,
          name: label,
          description: values.description.trim() || null,
          isActive: values.active,
          parentCategoryUuid: values.parentUuid || null,
        }).unwrap();

        if (created?.uuid) {
          updateCatalogCacheItem("FOOD_CATEGORY", created.uuid, {
            code,
            name: label,
            localName: values.localName.trim() || null,
            description: values.description.trim() || null,
            active: values.active,
          });
        }
      } catch (err: any) {
        const errStr = JSON.stringify(err || "").toLowerCase();
        if (errStr.includes("already exists") || errStr.includes("exist")) {
          updateCatalogCacheItem("FOOD_CATEGORY", `existing-${code}`, {
            code,
            name: label,
            localName: values.localName.trim() || null,
            description: values.description.trim() || null,
            active: values.active,
          });
          await refetch();
          return;
        }
        throw err;
      }

      await refetch();
    },
    [createFoodCategory, refetch],
  );

  const updateOption = useCallback(
    async (uuid: string, values: FilterCatalogOptionFormValues) => {
      const label = values.name.trim() || values.localName.trim();
      const code = values.code?.trim().toUpperCase();
      const parentUuid = values.parentUuid && values.parentUuid !== uuid ? values.parentUuid : null;

      updateCatalogCacheItem("FOOD_CATEGORY", uuid, {
        name: label,
        localName: values.localName.trim() || null,
        description: values.description.trim() || null,
        active: values.active,
        ...(code ? { code } : {}),
      });

      try {
        await updateFoodCategory({
          uuid,
          body: {
            name: label,
            description: values.description.trim() || null,
            isActive: values.active,
            parentCategoryUuid: parentUuid,
            ...(code ? { code } : {}),
          },
        }).unwrap();
      } catch (err) {
        console.warn("[FOOD CATEGORY UPDATE ERROR, CLIENT CACHE SAVED]", err);
      }

      await refetch();
    },
    [updateFoodCategory, refetch],
  );

  const setActive = useCallback(
    async (
      uuid: string,
      active: boolean,
    ) => {
      updateCatalogCacheActive("FOOD_CATEGORY", uuid, active);
      try {
        await updateFoodCategory({
          uuid,
          body: {
            isActive: active,
          },
        }).unwrap();
      } catch (err) {
        console.warn("[FOOD_CATEGORY setActive error, client cache updated]", err);
      }

      await refetch();
    },
    [
      updateFoodCategory,
      refetch,
    ],
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
