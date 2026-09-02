"use client";

import { useCallback, useMemo } from "react";

import {
  useCreateEventMutation,
  useGetManagedEventsQuery,
  useUpdateEventMutation,
} from "@/src/app/store/menuManagementApi";
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
import type { EventOption } from "@/src/types/menu-management";

function toCatalogOption(item: any): FilterCatalogOption {
  let active = true;
  if (item.isActive !== undefined && item.isActive !== null) {
    active = Boolean(item.isActive);
  } else if (item.is_active !== undefined && item.is_active !== null) {
    active = Boolean(item.is_active);
  } else if (item.active !== undefined && item.active !== null) {
    active = Boolean(item.active);
  } else if (item.status !== undefined && item.status !== null) {
    active = item.status === "ACTIVE";
  } else if (item.deletedAt || item.deleted_at) {
    active = false;
  }

  return {
    uuid: item.uuid,
    groupCode: "EVENT",
    code: item.code,
    name: item.name,
    localName: item.localName || item.name,
    description: item.description ?? null,
    numericValue: null,
    unit: null,
    active,
    createdAt: item.createdAt || new Date().toISOString(),
    updatedAt: item.updatedAt || new Date().toISOString(),
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

  const groupOptions = useMemo(() => {
    const serverOptions = (data ?? []).map(toCatalogOption);
    return mergeCatalogWithCache("EVENT", serverOptions);
  }, [data]);

  const createOption = useCallback(
    async (values: FilterCatalogOptionFormValues) => {
      const label = values.name.trim() || values.localName.trim();
      const code = values.code?.trim().toUpperCase() || createCodeFromLabel(label);

      try {
        const created = await createEvent({
          code,
          name: label,
          localName: values.localName.trim() || null,
          description: values.description.trim() || null,
          isActive: values.active,
        }).unwrap();

        if (created?.uuid) {
          updateCatalogCacheItem("EVENT", created.uuid, {
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
          updateCatalogCacheItem("EVENT", `existing-${code}`, {
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
    [createEvent, refetch],
  );

  const updateOption = useCallback(
    async (uuid: string, values: FilterCatalogOptionFormValues) => {
      const label = values.name.trim() || values.localName.trim();
      const code = values.code?.trim().toUpperCase();

      updateCatalogCacheItem("EVENT", uuid, {
        name: label,
        localName: values.localName.trim() || null,
        description: values.description.trim() || null,
        active: values.active,
        ...(code ? { code } : {}),
      });

      const payload: any = {
        name: label,
        localName: values.localName.trim() || null,
        description: values.description.trim() || null,
        isActive: values.active,
      };

      if (code) {
        payload.code = code;
      }

      try {
        await updateEvent({
          uuid,
          payload,
        }).unwrap();
      } catch (err) {
        console.warn("[EVENT UPDATE ERROR, CLIENT CACHE SAVED]", err);
      }

      await refetch();
    },
    [updateEvent, refetch],
  );

  const setActive = useCallback(
    async (uuid: string, active: boolean) => {
      updateCatalogCacheActive("EVENT", uuid, active);
      try {
        await updateEvent({
          uuid,
          payload: {
            isActive: active,
          },
        }).unwrap();
      } catch (err) {
        console.warn("[EVENT setActive error, client cache updated]", err);
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
