import { useCallback, useMemo } from "react";

import {
  useCreateWeatherConditionMutation,
  useGetWeatherConditionsQuery,
  useUpdateWeatherConditionMutation,
} from "@/src/app/store/weatherConditionApi";
import { createCodeFromLabel } from "@/src/lib/filterCatalogStorage";
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

  const groupOptions = useMemo(() => {
    const raw = data?.contents ?? [];
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

      await createWeather({
        code,
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
          code: values.code?.trim().toUpperCase() || undefined,
          name: values.name.trim() || values.localName.trim(),
          localName: values.localName.trim() || null,
          description: values.description.trim() || null,
          isActive: values.active,
          active: values.active,
        },
      }).unwrap();

      await refetch();
    },
    [updateWeather, refetch],
  );

  const setActive = useCallback(
    async (uuid: string, active: boolean) => {
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
