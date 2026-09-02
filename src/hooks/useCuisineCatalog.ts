"use client";

import { useCallback, useMemo } from "react";

import {
  useCreateCuisineMutation,
  useGetCuisinesQuery,
  useUpdateCuisineMutation,
} from "@/src/app/store/cuisineApi";
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

  const groupOptions = useMemo(() => {
    const serverOptions = (data?.contents ?? []).map(toCatalogOption);
    return mergeCatalogWithCache("CUISINE", serverOptions);
  }, [data]);

  const createOption = useCallback(
    async (values: FilterCatalogOptionFormValues) => {
      const label = values.name.trim() || values.localName.trim();
      const code = values.code?.trim().toUpperCase() || createCodeFromLabel(label);

      try {
        const created = await createCuisine({
          code,
          name: label,
          description: values.description.trim() || null,
          isActive: values.active,
          is_active: values.active,
          active: values.active,
        }).unwrap();

        if (created?.uuid) {
          updateCatalogCacheItem("CUISINE", created.uuid, {
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
          updateCatalogCacheItem("CUISINE", `existing-${code}`, {
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
    [createCuisine, refetch],
  );

  const updateOption = useCallback(
    async (uuid: string, values: FilterCatalogOptionFormValues) => {
      const label = values.name.trim() || values.localName.trim();
      const code = values.code?.trim().toUpperCase();

      updateCatalogCacheItem("CUISINE", uuid, {
        name: label,
        localName: values.localName.trim() || null,
        description: values.description.trim() || null,
        active: values.active,
        ...(code ? { code } : {}),
      });

      const body: any = {
        name: label,
        description: values.description.trim() || null,
        isActive: values.active,
        is_active: values.active,
        active: values.active,
      };

      if (code) {
        body.code = values.code.trim().toUpperCase();
      }

      try {
        await updateCuisine({
          uuid,
          body,
        }).unwrap();
      } catch (err) {
        console.warn("[CUISINE UPDATE ERROR, CLIENT CACHE SAVED]", err);
      }

      await refetch();
    },
    [updateCuisine, refetch],
  );

  const setActive = useCallback(
    async (
      uuid: string,
      active: boolean,
    ) => {
      updateCatalogCacheActive("CUISINE", uuid, active);
      try {
        await updateCuisine({
          uuid,
          body: {
            isActive: active,
            is_active: active,
            active: active,
          },
        }).unwrap();
      } catch (err) {
        console.warn("[CUISINE setActive error, client cache updated]", err);
      }

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
