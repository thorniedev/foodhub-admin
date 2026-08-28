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
      const code = values.code?.trim().toUpperCase() || createCodeFromLabel(label);

      await createEvent({
        code,
        name: label,
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
      const label = values.name.trim() || values.localName.trim();
      const payload: any = {
        name: label,
        localName: values.localName.trim() || null,
        description: values.description.trim() || null,
        isActive: values.active,
      };

      if (values.code?.trim()) {
        payload.code = values.code.trim().toUpperCase();
      }

      await updateEvent({
        uuid,
        payload,
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
