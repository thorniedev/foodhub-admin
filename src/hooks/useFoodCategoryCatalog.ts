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

  const [createFoodCategory] =
    useCreateFoodCategoryMutation();

  const [updateFoodCategory] =
    useUpdateFoodCategoryMutation();

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

      await createFoodCategory({
        code:
          values.code?.trim().toUpperCase().replace(/\s+/g, "_") ||
          createCodeFromLabel(label),
        name:
          values.name.trim() ||
          values.localName.trim(),
        description:
          values.description.trim() ||
          null,
        isActive:
          values.active,
        parentCategoryUuid:
          values.parentUuid || null,
      }).unwrap();

      await refetch();
    },
    [
      createFoodCategory,
      refetch,
    ],
  );

  const updateOption = useCallback(
    async (
      uuid: string,
      values: FilterCatalogOptionFormValues,
    ) => {
      await updateFoodCategory({
        uuid,
        body: {
          code: values.code?.trim().toUpperCase().replace(/\s+/g, "_"),
          name:
            values.name.trim() ||
            values.localName.trim(),
          description:
            values.description.trim() ||
            null,
          isActive:
            values.active,
          parentCategoryUuid:
            values.parentUuid || null,
        },
      }).unwrap();

      await refetch();
    },
    [
      updateFoodCategory,
      refetch,
    ],
  );

  const setActive = useCallback(
    async (
      uuid: string,
      active: boolean,
    ) => {
      await updateFoodCategory({
        uuid,
        body: {
          isActive: active,
        },
      }).unwrap();

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
