import { useCallback, useMemo } from "react";

import {
  useCreateSeasonMutation,
  useGetManagedSeasonsQuery,
  useUpdateSeasonMutation,
} from "@/src/app/store/menuManagementApi";
import { createCodeFromLabel } from "@/src/lib/filterCatalogStorage";
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

  const groupOptions = useMemo(() => {
    const raw = data ?? [];
    const map = new Map<string, FilterCatalogOption>();
    for (const item of raw) {
      if (item?.uuid) {
        map.set(item.uuid, toCatalogOption(item));
      }
    }
    return Array.from(map.values());
  }, [data]);

  const createOption = useCallback(
    async (values: FilterCatalogOptionFormValues) => {
      const label = values.name.trim() || values.localName.trim();
      const code = values.code?.trim().toUpperCase() || createCodeFromLabel(label);

      await createSeason({
        code,
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

      await refetch();
    },
    [updateSeason, refetch],
  );

  const setActive = useCallback(
    async (uuid: string, active: boolean) => {
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
