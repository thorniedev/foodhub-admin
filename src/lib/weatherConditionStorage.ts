import type { WeatherCondition } from "../types/weather-condition";

export const LOCAL_WEATHER_CACHE_KEY = "foodhub-admin-weather-conditions-cache-v2";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const DEFAULT_WEATHER_SEEDS: WeatherCondition[] = [
  {
    uuid: "4c394b08-35bf-4861-91b2-a42aca7e86fb",
    code: "DRY",
    name: "រដូវក្ដៅ",
    localName: "រដូវក្ដៅ",
    description: "រដូវក្ដៅ គឺជារដូវដែលមានអាកាសធាតុក្តៅ និងស្ងួត ភ្លៀងធ្លាក់តិច ហើយពេលខ្លះមានខ្យល់ក្តៅ។ រដូវនេះអាចធ្វើឱ្យអាកាសធាតុកាន់តែក្តៅ ដូច្នេះការទទួលទានអាហារ និងភេសជ្ជៈដែលស្រស់ស្រាយ អាចជួយបំបាត់ការស្រេកទឹក និងធ្វើឱ្យមានអារម្មណ៍ស្រស់ស្រាយ។",
    isActive: true,
    active: true,
    createdAt: "2026-08-22T10:30:01.03283",
    updatedAt: "2026-08-22T10:30:21.850966",
  },
  {
    uuid: "917d5dfb-f0b3-4cd0-9544-6388841498ed",
    code: "RAINY",
    name: "រដូវភ្លៀង",
    localName: "រដូវភ្លៀង",
    description: "ម្ហូបក្តៅៗ និងអាហារដែលសាកសមសម្រាប់ថ្ងៃភ្លៀង ដូចជា ស៊ុប សម្ល មី និងអាហារចម្អិនក្តៅៗ",
    isActive: true,
    active: true,
    createdAt: "2026-08-14T05:58:08.327371",
    updatedAt: "2026-08-24T03:29:15.505156",
  },
  {
    uuid: "f6f569b2-d705-4b23-b720-fbb603ae810f",
    code: "COLD",
    name: "អាកាសធាតុត្រជាក់",
    localName: "ត្រជាក់",
    description: "ស៊ុបក្តៅៗ ហតផត និងម្ហូបដែលមានជាតិកម្តៅសម្រាប់អាកាសធាតុត្រជាក់",
    isActive: true,
    active: true,
    createdAt: "2026-08-22T09:40:29.656838",
    updatedAt: "2026-08-22T09:40:29.656838",
  },
];

export function readLocalWeatherCache(): WeatherCondition[] {
  if (typeof window === "undefined") return DEFAULT_WEATHER_SEEDS;
  try {
    const raw = window.localStorage.getItem(LOCAL_WEATHER_CACHE_KEY);
    if (!raw) return DEFAULT_WEATHER_SEEDS;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return DEFAULT_WEATHER_SEEDS;
    // Filter out any stale entries with invalid UUIDs
    const valid = parsed.filter((item) => typeof item?.uuid === "string" && UUID_REGEX.test(item.uuid));
    return valid.length > 0 ? valid : DEFAULT_WEATHER_SEEDS;
  } catch {
    return DEFAULT_WEATHER_SEEDS;
  }
}

export function saveLocalWeatherCache(items: WeatherCondition[]) {
  if (typeof window === "undefined") return;
  const valid = items.filter((item) => typeof item?.uuid === "string" && UUID_REGEX.test(item.uuid));
  window.localStorage.setItem(LOCAL_WEATHER_CACHE_KEY, JSON.stringify(valid));
}

export function mergeWeatherConditions(
  serverItems: WeatherCondition[] = [],
  localCache: WeatherCondition[] = [],
): WeatherCondition[] {
  const map = new Map<string, WeatherCondition>();

  // 1. Add valid local cache items first
  localCache.forEach((item) => {
    if (typeof item?.uuid === "string" && UUID_REGEX.test(item.uuid)) {
      const key = (item.code || item.uuid).toUpperCase();
      map.set(key, item);
    }
  });

  // 2. Overlay server items (primary source of truth)
  serverItems.forEach((serverItem) => {
    if (typeof serverItem?.uuid === "string" && UUID_REGEX.test(serverItem.uuid)) {
      const key = (serverItem.code || serverItem.uuid).toUpperCase();
      const existing = map.get(key);
      map.set(key, {
        ...existing,
        ...serverItem,
        isActive: serverItem.isActive ?? serverItem.active ?? existing?.isActive ?? true,
        active: serverItem.isActive ?? serverItem.active ?? existing?.active ?? true,
      });
    }
  });

  // Fallback to default seeds if map is empty
  if (map.size === 0) {
    DEFAULT_WEATHER_SEEDS.forEach((seed) => {
      const key = (seed.code || seed.uuid).toUpperCase();
      map.set(key, seed);
    });
  }

  return Array.from(map.values());
}
