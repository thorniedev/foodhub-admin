"use client";

import { useCallback, useMemo } from "react";

import {
  useCreateEventMutation,
  useGetManagedEventsQuery,
  useUpdateEventMutation,
} from "@/src/app/store/menuManagementApi";
import { createCodeFromLabel } from "@/src/lib/filterCatalogStorage";
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

  const groupOptions = useMemo(
    () => (data ?? []).map(toCatalogOption),
    [data],
  );

  const createOption = useCallback(
    async (values: FilterCatalogOptionFormValues) => {
      const label = values.name.trim() || values.localName.trim();

      await createEvent({
        code:
          values.code?.trim().toUpperCase().replace(/\s+/g, "_") ||
          createCodeFromLabel(label, "EVENT"),
        name: values.name.trim() || values.localName.trim(),
        localName: values.localName.trim() || values.name.trim() || null,
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
          code: values.code?.trim().toUpperCase().replace(/\s+/g, "_"),
          name: values.name.trim() || values.localName.trim(),
          localName: values.localName.trim() || values.name.trim() || null,
          description: values.description.trim() || null,
          isActive: values.active,
        },
      }).unwrap();

      await refetch();
    },
    [updateEvent, refetch],
  );

  const setActive = useCallback(
    async (uuid: string, active: boolean) => {
      await updateEvent({
        uuid,
        payload: {
          isActive: active,
        },
      }).unwrap();

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
