import type { WeatherCondition } from "../types/weather-condition";

export const LOCAL_WEATHER_CACHE_KEY = "foodhub-admin-weather-conditions-cache-v1";

export const DEFAULT_WEATHER_SEEDS: WeatherCondition[] = [
  {
    uuid: "917d5dfb-f0b3-4cd0-9544-6388841498ed",
    code: "RAINY",
    name: "រដូវភ្លៀង",
    localName: "រដូវភ្លៀង",
    description: "ម្ហូបក្តៅៗ និងអាហារដែលសាកសមសម្រាប់ថ្ងៃភ្លៀង ដូចជា ស៊ុប សម្ល មី និងអាហារចម្អិនក្តៅៗ",
    isActive: true,
    active: true,
    createdAt: "2026-08-14T05:58:08.327371",
  },
  {
    uuid: "seed-weather-hot",
    code: "HOT",
    name: "អាកាសធាតុក្តៅ",
    localName: "ក្តៅ",
    description: "ភេសជ្ជៈត្រជាក់ៗ ការ៉េម និងអាហារស្រស់ស្រាយសម្រាប់ថ្ងៃក្តៅ",
    isActive: true,
    active: true,
    createdAt: "2026-08-15T00:00:00.000Z",
  },
  {
    uuid: "seed-weather-cold",
    code: "COLD",
    name: "អាកាសធាតុត្រជាក់",
    localName: "ត្រជាក់",
    description: "ស៊ុបក្តៅៗ ហតផត និងម្ហូបដែលមានជាតិកម្តៅសម្រាប់អាកាសធាតុត្រជាក់",
    isActive: true,
    active: true,
    createdAt: "2026-08-15T00:00:00.000Z",
  },
  {
    uuid: "seed-weather-dry",
    code: "DRY",
    name: "រដូវក្តៅ",
    localName: "រដូវក្តៅ",
    description: "រដូវក្តៅ គឺជារដូវដែលមានអាកាសធាតុក្តៅ និងស្ងួត",
    isActive: true,
    active: true,
    createdAt: "2026-08-15T00:00:00.000Z",
  },
];

export function readLocalWeatherCache(): WeatherCondition[] {
  if (typeof window === "undefined") return DEFAULT_WEATHER_SEEDS;
  try {
    const raw = window.localStorage.getItem(LOCAL_WEATHER_CACHE_KEY);
    if (!raw) return DEFAULT_WEATHER_SEEDS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_WEATHER_SEEDS;
  } catch {
    return DEFAULT_WEATHER_SEEDS;
  }
}

export function saveLocalWeatherCache(items: WeatherCondition[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LOCAL_WEATHER_CACHE_KEY, JSON.stringify(items));
}

export function mergeWeatherConditions(
  serverItems: WeatherCondition[] = [],
  localCache: WeatherCondition[] = [],
): WeatherCondition[] {
  const map = new Map<string, WeatherCondition>();

  // 1. Add local cache items first
  localCache.forEach((item) => {
    const key = (item.code || item.uuid).toUpperCase();
    map.set(key, item);
  });

  // 2. Overlay server items
  serverItems.forEach((serverItem) => {
    const key = (serverItem.code || serverItem.uuid).toUpperCase();
    const existing = map.get(key);
    map.set(key, {
      ...existing,
      ...serverItem,
      isActive: serverItem.isActive ?? serverItem.active ?? existing?.isActive ?? true,
      active: serverItem.isActive ?? serverItem.active ?? existing?.active ?? true,
    });
  });

  return Array.from(map.values());
}
