import { useCallback, useEffect, useMemo, useState } from "react";

import {
  useCreateSeasonMutation,
  useGetManagedSeasonsQuery,
  useUpdateSeasonMutation,
} from "@/src/app/store/menuManagementApi";
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
import type { SeasonOption } from "@/src/types/menu-management";

function toCatalogOption(item: SeasonOption): FilterCatalogOption {
  return {
    uuid: item.uuid,
    groupCode: "SEASON",
    code: item.code,
    name: item.name,
    localName: item.localName || item.name,
    description: item.description ?? null,
    numericValue: null,
    unit: null,
    active: item.isActive !== false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function useSeasonCatalog() {
  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetManagedSeasonsQuery();

  const [createSeason] = useCreateSeasonMutation();
  const [updateSeason] = useUpdateSeasonMutation();
  const [localItems, setLocalItems] = useState<FilterCatalogOption[]>(() =>
    readCatalogCache("SEASON"),
  );

  useEffect(() => {
    if (data) {
      const serverConverted = data.map(toCatalogOption);
      const merged = mergeCatalogWithCache("SEASON", serverConverted);
      setLocalItems(merged);
    }
  }, [data]);

  const groupOptions = useMemo(() => {
    if (localItems.length > 0) return localItems;
    return (data ?? []).map(toCatalogOption);
  }, [data, localItems]);

  const createOption = useCallback(
    async (values: FilterCatalogOptionFormValues) => {
      const label = values.name.trim() || values.localName.trim();

      await createSeason({
        code: createCodeFromLabel(label),
        name: values.name.trim() || values.localName.trim(),
        localName: values.localName.trim() || null,
        description: values.description.trim() || null,
        isActive: values.active,
      }).unwrap();

      await refetch();
    },
    [createSeason, refetch],
  );

  const updateOption = useCallback(
    async (uuid: string, values: FilterCatalogOptionFormValues) => {
      await updateSeason({
        uuid,
        payload: {
          name: values.name.trim() || values.localName.trim(),
          localName: values.localName.trim() || null,
          description: values.description.trim() || null,
          isActive: values.active,
        },
      }).unwrap();

      updateCatalogCacheActive("SEASON", uuid, values.active);
      setLocalItems((prev) =>
        prev.map((item) =>
          item.uuid === uuid
            ? {
                ...item,
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
    [updateSeason, refetch],
  );

  const setActive = useCallback(
    async (uuid: string, active: boolean) => {
      updateCatalogCacheActive("SEASON", uuid, active);
      setLocalItems((prev) =>
        prev.map((item) => (item.uuid === uuid ? { ...item, active } : item)),
      );

      try {
        await updateSeason({
          uuid,
          payload: {
            isActive: active,
          },
        }).unwrap();
      } catch (err) {
        console.warn("Could not update season on server:", err);
      }

      await refetch();
    },
    [updateSeason, refetch],
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
