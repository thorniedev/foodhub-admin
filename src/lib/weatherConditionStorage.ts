import type { WeatherCondition } from "@/src/types/weather-condition";

export const WEATHER_STORAGE_KEY = "foodhub-weather-conditions-storage-v1";
export const WEATHER_CHANGED_EVENT = "foodhub-weather-conditions-changed";

export const INITIAL_WEATHER_CONDITIONS: WeatherCondition[] = [
  {
    uuid: "917d5dfb-f0b3-4cd0-9544-6388841498ed",
    code: "RAINY",
    name: "រដូវភ្លៀង",
    localName: "រដូវភ្លៀង",
    description:
      "ម្ហូបក្តៅៗ និងអាហារដែលសាកសមសម្រាប់ថ្ងៃភ្លៀង ដូចជា ស៊ុប សម្ល មី និងអាហារចម្អិនក្តៅៗ",
    isActive: true,
    active: true,
    createdAt: "2026-08-14T05:58:08.327371",
    updatedAt: "2026-08-21T01:18:51.036002",
  },
  {
    uuid: "weather-cond-fruit-uuid",
    code: "FRUIT",
    name: "រដូវផ្លែឈើ",
    localName: "រដូវផ្លែឈើ",
    description: "ផ្លែឈើស្រស់ៗ និងមុខម្ហូប/ភេសជ្ជៈដែលផ្សំពីផ្លែឈើតាមរដូវកាល",
    isActive: false,
    active: false,
    createdAt: "2026-08-14T05:58:08.000000",
    updatedAt: "2026-08-21T08:30:00.000000",
  },
  {
    uuid: "weather-cond-hot-uuid",
    code: "HOT",
    name: "រដូវក្តៅ",
    localName: "រដូវក្តៅ",
    description: "ភេសជ្ជៈត្រជាក់ៗ ការ៉េម និងអាហារបំប៉នកម្លាំងសម្រាប់ថ្ងៃក្តៅ",
    isActive: false,
    active: false,
    createdAt: "2026-08-14T05:58:08.000000",
    updatedAt: "2026-08-21T08:30:00.000000",
  },
  {
    uuid: "weather-cond-cool-uuid",
    code: "COOL",
    name: "រដូវត្រជាក់",
    localName: "រដូវត្រជាក់",
    description: "អាហារក្តៅៗ និងភេសជ្ជៈក្តៅសម្រាប់អាកាសធាតុត្រជាក់",
    isActive: false,
    active: false,
    createdAt: "2026-08-14T05:58:08.000000",
    updatedAt: "2026-08-21T08:30:00.000000",
  },
];

function cloneInitialSeeds(): WeatherCondition[] {
  return INITIAL_WEATHER_CONDITIONS.map((item) => ({ ...item }));
}

export function readStoredWeatherConditions(): WeatherCondition[] {
  if (typeof window === "undefined") {
    return cloneInitialSeeds();
  }

  try {
    const raw = window.localStorage.getItem(WEATHER_STORAGE_KEY);
    if (!raw) {
      const initial = cloneInitialSeeds();
      window.localStorage.setItem(WEATHER_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed) || parsed.length === 0) {
      const initial = cloneInitialSeeds();
      window.localStorage.setItem(WEATHER_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }

    const current = parsed as WeatherCondition[];
    const seeds = cloneInitialSeeds();

    // Ensure all 4 seed items (RAINY, FRUIT, HOT, COOL) exist
    let hasChanges = false;
    const existingCodes = new Set(current.map((item) => item.code.toUpperCase()));
    const merged = [...current];

    for (const seedItem of seeds) {
      if (!existingCodes.has(seedItem.code.toUpperCase())) {
        merged.push(seedItem);
        hasChanges = true;
      }
    }

    if (hasChanges) {
      window.localStorage.setItem(WEATHER_STORAGE_KEY, JSON.stringify(merged));
    }

    return merged;
  } catch {
    return cloneInitialSeeds();
  }
}

export function writeStoredWeatherConditions(items: WeatherCondition[]): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(WEATHER_STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent(WEATHER_CHANGED_EVENT));
  } catch (err) {
    console.error("[weatherConditionStorage] Error saving:", err);
  }
}

export function mergeBackendWeatherConditions(
  backendItems: WeatherCondition[],
): WeatherCondition[] {
  const localList = readStoredWeatherConditions();
  const backendMap = new Map<string, WeatherCondition>();

  for (const b of backendItems) {
    if (b.uuid) backendMap.set(b.uuid, b);
    if (b.code) backendMap.set(b.code.toUpperCase(), b);
  }

  const updated = localList.map((item) => {
    const fromBackend =
      backendMap.get(item.uuid) || backendMap.get(item.code.toUpperCase());

    if (fromBackend) {
      return {
        ...item,
        ...fromBackend,
        uuid: fromBackend.uuid || item.uuid,
        isActive: fromBackend.isActive ?? fromBackend.active ?? true,
        active: fromBackend.isActive ?? fromBackend.active ?? true,
      };
    }

    return item;
  });

  // Add any new backend items not in local list
  const existingUuids = new Set(updated.map((i) => i.uuid));
  const existingCodes = new Set(updated.map((i) => i.code.toUpperCase()));

  for (const b of backendItems) {
    if (!existingUuids.has(b.uuid) && !existingCodes.has(b.code.toUpperCase())) {
      updated.push({
        ...b,
        isActive: b.isActive ?? b.active ?? true,
        active: b.isActive ?? b.active ?? true,
      });
    }
  }

  writeStoredWeatherConditions(updated);
  return updated;
}

export function updateStoredWeatherConditionStatus(
  uuid: string,
  isActive: boolean,
): WeatherCondition[] {
  const list = readStoredWeatherConditions();
  const now = new Date().toISOString();

  const updated = list.map((item) => {
    if (item.uuid === uuid || item.code === uuid) {
      return {
        ...item,
        isActive,
        active: isActive,
        updatedAt: now,
      };
    }
    return item;
  });

  writeStoredWeatherConditions(updated);
  return updated;
}

export function saveStoredWeatherCondition(
  payload: Partial<WeatherCondition> & { code: string; name: string },
): WeatherCondition[] {
  const list = readStoredWeatherConditions();
  const now = new Date().toISOString();
  const active = payload.isActive ?? payload.active ?? true;

  const existingIndex = list.findIndex(
    (item) =>
      (payload.uuid && item.uuid === payload.uuid) ||
      item.code.toUpperCase() === payload.code.toUpperCase(),
  );

  let updated: WeatherCondition[];

  if (existingIndex >= 0) {
    updated = [...list];
    updated[existingIndex] = {
      ...updated[existingIndex],
      ...payload,
      isActive: active,
      active: active,
      localName: payload.localName || payload.name || updated[existingIndex].localName,
      description: payload.description !== undefined ? payload.description : updated[existingIndex].description,
      updatedAt: now,
    };
  } else {
    const newItem: WeatherCondition = {
      uuid: payload.uuid || `weather-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      code: payload.code.toUpperCase(),
      name: payload.name,
      localName: payload.localName || payload.name,
      description: payload.description || null,
      isActive: active,
      active: active,
      createdAt: now,
      updatedAt: now,
    };
    updated = [newItem, ...list];
  }

  writeStoredWeatherConditions(updated);
  return updated;
}
