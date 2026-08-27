"use client";

import { useCallback, useMemo } from "react";

import {
  useCreateCuisineMutation,
  useGetCuisinesQuery,
  useUpdateCuisineMutation,
} from "@/src/app/store/cuisineApi";
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
  isActive?: boolean;
  active?: boolean;
  is_active?: boolean;
  createdAt?: string;
  updatedAt?: string;
  created_at?: string;
  updated_at?: string;
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
    groupCode: "CUISINE",
    code: item.code,
    name: item.name,
    localName: item.name,
    description: item.description,
    numericValue: null,
    unit: null,
    active: Boolean(activeValue),
    createdAt: item.createdAt || item.created_at || "",
    updatedAt: item.updatedAt || item.updated_at || "",
  };
}

export function useCuisineCatalog() {
  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetCuisinesQuery({
    page: 0,
    size: 100,
    includeInactive: true,
  });

  const [createCuisine] =
    useCreateCuisineMutation();

  const [updateCuisine] =
    useUpdateCuisineMutation();

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

      await createCuisine({
        code: createCodeFromLabel(
          label,
        ),
        name:
          values.name.trim() ||
          values.localName.trim(),
        description:
          values.description.trim() ||
          null,
        isActive: values.active,
        is_active: values.active,
        active: values.active,
      }).unwrap();

      await refetch();
    },
    [
      createCuisine,
      refetch,
    ],
  );

  const updateOption = useCallback(
    async (
      uuid: string,
      values: FilterCatalogOptionFormValues,
    ) => {
      await updateCuisine({
        uuid,
        body: {
          name:
            values.name.trim() ||
            values.localName.trim(),
          description:
            values.description.trim() ||
            null,
          isActive: values.active,
          is_active: values.active,
          active: values.active,
        },
      }).unwrap();

      await refetch();
    },
    [
      updateCuisine,
      refetch,
    ],
  );

  const setActive = useCallback(
    async (
      uuid: string,
      active: boolean,
    ) => {
      await updateCuisine({
        uuid,
        body: {
          isActive: active,
          is_active: active,
          active: active,
        },
      }).unwrap();

      await refetch();
    },
    [
      updateCuisine,
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
