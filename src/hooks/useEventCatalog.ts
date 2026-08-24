import { useCallback, useEffect, useMemo, useState } from "react";

import {
  useCreateEventMutation,
  useGetManagedEventsQuery,
  useUpdateEventMutation,
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
import type { EventOption } from "@/src/types/menu-management";

function toCatalogOption(item: EventOption): FilterCatalogOption {
  return {
    uuid: item.uuid,
    groupCode: "EVENT",
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

export function useEventCatalog() {
  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetManagedEventsQuery();

  const [createEvent] = useCreateEventMutation();
  const [updateEvent] = useUpdateEventMutation();
  const [localItems, setLocalItems] = useState<FilterCatalogOption[]>(() =>
    readCatalogCache("EVENT"),
  );

  useEffect(() => {
    if (data) {
      const serverConverted = data.map(toCatalogOption);
      const merged = mergeCatalogWithCache("EVENT", serverConverted);
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

      await createEvent({
        code: createCodeFromLabel(label),
        name: values.name.trim() || values.localName.trim(),
        localName: values.localName.trim() || null,
        description: values.description.trim() || null,
        isActive: values.active,
      }).unwrap();

      await refetch();
    },
    [createEvent, refetch],
  );

  const updateOption = useCallback(
    async (uuid: string, values: FilterCatalogOptionFormValues) => {
      await updateEvent({
        uuid,
        payload: {
          name: values.name.trim() || values.localName.trim(),
          localName: values.localName.trim() || null,
          description: values.description.trim() || null,
          isActive: values.active,
        },
      }).unwrap();

      updateCatalogCacheActive("EVENT", uuid, values.active);
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
    [updateEvent, refetch],
  );

  const setActive = useCallback(
    async (uuid: string, active: boolean) => {
      // 1. Instantly update local cache & state so table row updates to Inactive/Active
      updateCatalogCacheActive("EVENT", uuid, active);
      setLocalItems((prev) =>
        prev.map((item) => (item.uuid === uuid ? { ...item, active } : item)),
      );

      // 2. Call backend update
      try {
        await updateEvent({
          uuid,
          payload: {
            isActive: active,
          },
        }).unwrap();
      } catch (err) {
        console.warn("Could not update event on server:", err);
      }

      await refetch();
    },
    [updateEvent, refetch],
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
