import type { AgeGroup } from "../types/ageGroup";

export const LOCAL_AGE_GROUPS_CACHE_KEY = "foodhub-admin-age-groups-cache-v1";

export const DEFAULT_AGE_GROUP_SEEDS: AgeGroup[] = [
  {
    uuid: "seed-age-baby",
    code: "BABY",
    name: "កុមារតូច",
    minAge: 1,
    maxAge: 4,
    description: "កុមារតូចតាមចន្លោះអាយុដែលបានកំណត់ក្នុងប្រព័ន្ធ។",
    isActive: true,
  },
  {
    uuid: "seed-age-child",
    code: "CHILD",
    name: "កុមារ",
    minAge: 3,
    maxAge: 12,
    description: "កុមារតាមចន្លោះអាយុដែលបានកំណត់ក្នុងប្រព័ន្ធ។",
    isActive: true,
  },
  {
    uuid: "seed-age-teen",
    code: "TEEN",
    name: "ក្មេងជំទង់",
    minAge: 13,
    maxAge: 17,
    description: "ក្មេងជំទង់តាមចន្លោះអាយុដែលបានកំណត់ក្នុងប្រព័ន្ធ។",
    isActive: true,
  },
  {
    uuid: "seed-age-adult",
    code: "ADULT",
    name: "មនុស្សពេញវ័យ",
    minAge: 18,
    maxAge: 59,
    description: "មនុស្សពេញវ័យតាមចន្លោះអាយុដែលបានកំណត់ក្នុងប្រព័ន្ធ។",
    isActive: true,
  },
  {
    uuid: "seed-age-senior",
    code: "SENIOR",
    name: "មនុស្សចាស់",
    minAge: 60,
    maxAge: 120,
    description: "មនុស្សចាស់តាមចន្លោះអាយុដែលបានកំណត់ក្នុងប្រព័ន្ធ។",
    isActive: true,
  },
];

export function readLocalAgeGroupsCache(): AgeGroup[] {
  if (typeof window === "undefined") return DEFAULT_AGE_GROUP_SEEDS;
  try {
    const raw = window.localStorage.getItem(LOCAL_AGE_GROUPS_CACHE_KEY);
    if (!raw) return DEFAULT_AGE_GROUP_SEEDS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_AGE_GROUP_SEEDS;
  } catch {
    return DEFAULT_AGE_GROUP_SEEDS;
  }
}

export function saveLocalAgeGroupsCache(items: AgeGroup[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LOCAL_AGE_GROUPS_CACHE_KEY, JSON.stringify(items));
}

export function updateAgeGroupCacheActive(identifier: string, isActive: boolean) {
  const current = readLocalAgeGroupsCache();
  const targetId = identifier.trim().toUpperCase();
  const next = current.map((item) => {
    if (
      item.uuid.toUpperCase() === targetId ||
      item.code.toUpperCase() === targetId
    ) {
      return { ...item, isActive };
    }
    return item;
  });
  saveLocalAgeGroupsCache(next);
}

export function mergeAgeGroups(
  serverItems: AgeGroup[] = [],
  localCache: AgeGroup[] = [],
): AgeGroup[] {
  const map = new Map<string, AgeGroup>();

  // 1. Add local cache items first
  localCache.forEach((item) => {
    const key = (item.code || item.uuid).toUpperCase();
    map.set(key, item);
  });

  // 2. Overlay server items, respecting local deactivate if inactive
  serverItems.forEach((serverItem) => {
    const key = (serverItem.code || serverItem.uuid).toUpperCase();
    const existing = map.get(key);
    map.set(key, {
      ...existing,
      ...serverItem,
      isActive: existing ? existing.isActive : (serverItem.isActive ?? true),
    });
  });

  return Array.from(map.values());
}
