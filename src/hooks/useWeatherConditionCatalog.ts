"use client";

import { useCallback, useMemo } from "react";

import {
  useCreateWeatherConditionMutation,
  useDeactivateWeatherConditionMutation,
  useGetWeatherConditionsQuery,
  useRestoreWeatherConditionMutation,
  useUpdateWeatherConditionMutation,
} from "@/src/app/store/weatherConditionApi";
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
import type { WeatherCondition } from "@/src/types/weather-condition";

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
    groupCode: "WEATHER_CONDITION",
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

export function useWeatherConditionCatalog() {
  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetWeatherConditionsQuery({
    page: 0,
    size: 100,
    sort: "name,asc",
  });

  const [createWeather] = useCreateWeatherConditionMutation();
  const [updateWeather] = useUpdateWeatherConditionMutation();
  const [restoreWeather] = useRestoreWeatherConditionMutation();
  const [deactivateWeather] = useDeactivateWeatherConditionMutation();

  const groupOptions = useMemo(() => {
    const serverOptions = (data?.contents ?? []).map(toCatalogOption);
    return mergeCatalogWithCache("WEATHER_CONDITION", serverOptions);
  }, [data]);

  const createOption = useCallback(
    async (values: FilterCatalogOptionFormValues) => {
      const label = values.name.trim() || values.localName.trim();
      const code = values.code?.trim().toUpperCase() || createCodeFromLabel(label);

      try {
        const created = await createWeather({
          code,
          name: label,
          localName: values.localName.trim() || null,
          description: values.description.trim() || null,
          isActive: values.active,
          active: values.active,
        }).unwrap();

        if (created?.uuid) {
          updateCatalogCacheItem("WEATHER_CONDITION", created.uuid, {
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
          updateCatalogCacheItem("WEATHER_CONDITION", `existing-${code}`, {
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
    [createWeather, refetch],
  );

  const updateOption = useCallback(
    async (uuid: string, values: FilterCatalogOptionFormValues) => {
      const label = values.name.trim() || values.localName.trim();
      const code = values.code?.trim().toUpperCase();

      updateCatalogCacheItem("WEATHER_CONDITION", uuid, {
        name: label,
        localName: values.localName.trim() || null,
        description: values.description.trim() || null,
        active: values.active,
        ...(code ? { code } : {}),
      });

      const body: any = {
        name: label,
        localName: values.localName.trim() || null,
        description: values.description.trim() || null,
        isActive: values.active,
        active: values.active,
      };

      if (code) {
        body.code = code;
      }

      try {
        await updateWeather({
          uuid,
          body,
        }).unwrap();
      } catch (err) {
        console.warn("[WEATHER UPDATE ERROR, CLIENT CACHE SAVED]", err);
      }

      await refetch();
    },
    [updateWeather, refetch],
  );

  const setActive = useCallback(
    async (uuid: string, active: boolean) => {
      updateCatalogCacheActive("WEATHER_CONDITION", uuid, active);

      try {
        if (active) {
          try {
            await restoreWeather(uuid).unwrap();
          } catch {
            await updateWeather({
              uuid,
              body: {
                isActive: true,
                active: true,
              },
            }).unwrap();
          }
        } else {
          try {
            await updateWeather({
              uuid,
              body: {
                isActive: false,
                active: false,
              },
            }).unwrap();
          } catch {
            await deactivateWeather(uuid).unwrap();
          }
        }
      } catch (err) {
        console.warn("[WEATHER_CONDITION setActive error, client state updated]", err);
      }

      await refetch();
    },
    [updateWeather, restoreWeather, deactivateWeather, refetch],
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
