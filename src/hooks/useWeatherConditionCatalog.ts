import { useCallback, useEffect, useMemo, useState } from "react";

import {
  useCreateWeatherConditionMutation,
  useGetWeatherConditionsQuery,
  useUpdateWeatherConditionMutation,
} from "@/src/app/store/weatherConditionApi";
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
import type { WeatherCondition } from "@/src/types/weather-condition";

function toCatalogOption(item: WeatherCondition): FilterCatalogOption {
  return {
    uuid: item.uuid,
    groupCode: "WEATHER_CONDITION",
    code: item.code,
    name: item.name,
    localName: item.localName || item.name,
    description: item.description ?? null,
    numericValue: null,
    unit: null,
    active: item.isActive !== false && item.active !== false,
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
  const [localItems, setLocalItems] = useState<FilterCatalogOption[]>(() =>
    readCatalogCache("WEATHER_CONDITION"),
  );

  useEffect(() => {
    if (data?.contents) {
      const serverConverted = data.contents.map(toCatalogOption);
      const merged = mergeCatalogWithCache("WEATHER_CONDITION", serverConverted);
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

      await createWeather({
        code: createCodeFromLabel(label),
        name: values.name.trim() || values.localName.trim(),
        localName: values.localName.trim() || null,
        description: values.description.trim() || null,
        isActive: values.active,
        active: values.active,
      }).unwrap();

      await refetch();
    },
    [createWeather, refetch],
  );

  const updateOption = useCallback(
    async (uuid: string, values: FilterCatalogOptionFormValues) => {
      await updateWeather({
        uuid,
        body: {
          name: values.name.trim() || values.localName.trim(),
          localName: values.localName.trim() || null,
          description: values.description.trim() || null,
          isActive: values.active,
          active: values.active,
        },
      }).unwrap();

      updateCatalogCacheActive("WEATHER_CONDITION", uuid, values.active);
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
    [updateWeather, refetch],
  );

  const setActive = useCallback(
    async (uuid: string, active: boolean) => {
      updateCatalogCacheActive("WEATHER_CONDITION", uuid, active);
      setLocalItems((prev) =>
        prev.map((item) => (item.uuid === uuid ? { ...item, active } : item)),
      );

      try {
        await updateWeather({
          uuid,
          body: {
            isActive: active,
            active,
          },
        }).unwrap();
      } catch (err) {
        console.warn("Could not update weather condition on server:", err);
      }

      await refetch();
    },
    [updateWeather, refetch],
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
