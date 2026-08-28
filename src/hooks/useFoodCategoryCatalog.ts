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

      await createFoodCategory({
        code,
        name: label,
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
      const parentUuid =
        values.parentUuid && values.parentUuid !== uuid
          ? values.parentUuid
          : null;

      await updateFoodCategory({
        uuid,
        body: {
          name:
            values.name.trim() ||
            values.localName.trim(),
          description:
            values.description.trim() ||
            null,
          isActive:
            values.active,
          parentCategoryUuid:
            parentUuid,
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
