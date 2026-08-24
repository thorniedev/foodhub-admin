import { useCallback, useEffect, useMemo, useState } from "react";

import {
  useCreateCuisineMutation,
  useGetCuisinesQuery,
  useUpdateCuisineMutation,
} from "@/src/app/store/cuisineApi";
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
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}): FilterCatalogOption {
  return {
    uuid: item.uuid,
    groupCode: "CUISINE",
    code: item.code,
    name: item.name,
    localName: item.name,
    description: item.description,
    numericValue: null,
    unit: null,
    active: item.isActive !== false,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
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

  const [createCuisine] = useCreateCuisineMutation();
  const [updateCuisine] = useUpdateCuisineMutation();

  const [localItems, setLocalItems] = useState<FilterCatalogOption[]>(() =>
    readCatalogCache("CUISINE"),
  );

  useEffect(() => {
    if (data?.contents) {
      const serverConverted = data.contents.map(toCatalogOption);
      const merged = mergeCatalogWithCache("CUISINE", serverConverted);
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

      await createCuisine({
        code,
        name: values.name.trim() || values.localName.trim(),
        description: values.description.trim() || null,
        isActive: values.active,
      }).unwrap();

      await refetch();
    },
    [createCuisine, refetch],
  );

  const updateOption = useCallback(
    async (uuid: string, values: FilterCatalogOptionFormValues) => {
      const updatedCode = values.code?.trim().toUpperCase() || undefined;

      await updateCuisine({
        uuid,
        body: {
          code: updatedCode,
          name: values.name.trim() || values.localName.trim(),
          description: values.description.trim() || null,
          isActive: values.active,
        },
      }).unwrap();

      updateCatalogCacheActive("CUISINE", uuid, values.active);
      setLocalItems((prev) =>
        prev.map((item) =>
          item.uuid === uuid
            ? {
                ...item,
                code: updatedCode || item.code,
                name: values.name.trim() || values.localName.trim(),
                localName: values.localName.trim() || values.name.trim(),
                description: values.description.trim() || null,
                active: values.active,
              }
            : item,
        ),
      );

      await refetch();
    },
    [updateCuisine, refetch],
  );

  const setActive = useCallback(
    async (uuid: string, active: boolean) => {
      // 1. Immediately preserve in local state & cache so it does not disappear
      updateCatalogCacheActive("CUISINE", uuid, active);
      setLocalItems((prev) =>
        prev.map((item) => (item.uuid === uuid ? { ...item, active } : item)),
      );

      // 2. Call backend update
      try {
        await updateCuisine({
          uuid,
          body: {
            isActive: active,
          },
        }).unwrap();
      } catch (err) {
        console.warn("Could not update cuisine on server:", err);
      }

      await refetch();
    },
    [updateCuisine, refetch],
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
