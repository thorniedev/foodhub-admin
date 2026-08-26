import {
  INITIAL_FILTER_OPTIONS,
} from "@/src/config/filterCatalog";

import type {
  FilterCatalogOption,
} from "@/src/types/filterCatalog";

export const FILTER_CATALOG_STORAGE_KEY =
  "foodhub-admin-filter-catalog-v1";

export const FILTER_CATALOG_CHANGED_EVENT =
  "foodhub-filter-catalog-changed";

function cloneSeeds(): FilterCatalogOption[] {
  return INITIAL_FILTER_OPTIONS.map((item) => ({ ...item }));
}

export function readFilterCatalog(): FilterCatalogOption[] {
  if (typeof window === "undefined") {
    return cloneSeeds();
  }

  try {
    const raw = window.localStorage.getItem(
      FILTER_CATALOG_STORAGE_KEY,
    );

    if (!raw) {
      const seeded = cloneSeeds();

      window.localStorage.setItem(
        FILTER_CATALOG_STORAGE_KEY,
        JSON.stringify(seeded),
      );

      return seeded;
    }

    const parsed = JSON.parse(raw) as unknown;

    if (!Array.isArray(parsed)) {
      return cloneSeeds();
    }

    return parsed as FilterCatalogOption[];
  } catch {
    return cloneSeeds();
  }
}

export function writeFilterCatalog(
  options: FilterCatalogOption[],
) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    FILTER_CATALOG_STORAGE_KEY,
    JSON.stringify(options),
  );

  window.dispatchEvent(
    new CustomEvent(FILTER_CATALOG_CHANGED_EVENT),
  );
}

export function resetFilterCatalog() {
  if (typeof window === "undefined") {
    return;
  }

  const seeded = cloneSeeds();

  writeFilterCatalog(seeded);
}

export function createClientUuid(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()
    .toString(16)
    .slice(2)}`;
}

export function createCodeFromLabel(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return `OPTION_${Date.now()}`;

  const latinOnly = trimmed
    .replace(/[^a-zA-Z0-9\s_-]/g, " ")
    .trim()
    .replace(/\s+/g, "_")
    .toUpperCase();

  if (latinOnly.length >= 2) {
    return latinOnly;
  }

  const clean = trimmed
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toUpperCase();

  return clean || `OPTION_${Date.now()}`;
}

export function readCatalogCache(groupCode: string): FilterCatalogOption[] {
  if (typeof window === "undefined") return [];
  const cacheKey = `foodhub-admin-catalog-cache-${groupCode}`;
  try {
    const raw = window.localStorage.getItem(cacheKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeCatalogCache(
  groupCode: string,
  options: FilterCatalogOption[],
) {
  if (typeof window === "undefined") return;
  const cacheKey = `foodhub-admin-catalog-cache-${groupCode}`;
  try {
    window.localStorage.setItem(cacheKey, JSON.stringify(options));
  } catch {}
}

export function mergeCatalogWithCache(
  groupCode: string,
  serverItems: FilterCatalogOption[],
): FilterCatalogOption[] {
  const localCache = readCatalogCache(groupCode);
  const map = new Map<string, FilterCatalogOption>();

  // 1. Add all from local cache first (keyed strictly by UUID)
  localCache.forEach((item) => {
    if (item.uuid) {
      map.set(item.uuid, item);
    }
  });

  // 2. Overlay server items (keyed strictly by UUID)
  serverItems.forEach((serverItem) => {
    if (serverItem.uuid) {
      const existing = map.get(serverItem.uuid);
      map.set(serverItem.uuid, {
        ...existing,
        ...serverItem,
        active: existing && existing.active === false ? false : (serverItem.active !== false),
      });
    }
  });

  const unique = Array.from(map.values());
  writeCatalogCache(groupCode, unique);
  return unique;
}

export function updateCatalogCacheActive(
  groupCode: string,
  uuid: string,
  active: boolean,
) {
  const items = readCatalogCache(groupCode);
  const updated = items.map((item) =>
    item.uuid === uuid
      ? { ...item, active, updatedAt: new Date().toISOString() }
      : item,
  );
  writeCatalogCache(groupCode, updated);
}

export const FOOD_RELATIONS_STORAGE_PREFIX = "foodhub-food-relations-";

export interface StoredFoodRelations {
  seasons?: any[];
  events?: any[];
  suitableWeather?: any[];
  weatherConditions?: any[];
  mealTypes?: any[];
  ageRules?: any[];
  ageGroups?: any[];
  dietaryTypes?: any[];
  allergens?: any[];
  nutritionData?: any;
  nutrition?: any;
  preparationTimes?: any[];
  distances?: any[];
  regions?: any[];
  defaultSpiceLevel?: number | null;
  updatedAt?: string;
}

export function saveFoodRelationsStorage(
  foodUuid: string,
  relations: StoredFoodRelations,
) {
  if (typeof window === "undefined" || !foodUuid) return;
  try {
    const key = `${FOOD_RELATIONS_STORAGE_PREFIX}${foodUuid}`;
    window.localStorage.setItem(
      key,
      JSON.stringify({
        ...relations,
        updatedAt: new Date().toISOString(),
      }),
    );
  } catch (err) {
    console.warn("[FOOD RELATIONS STORAGE SAVE FAILED]", err);
  }
}

export function readFoodRelationsStorage(
  foodUuid: string,
): StoredFoodRelations | null {
  if (typeof window === "undefined" || !foodUuid) return null;
  try {
    const key = `${FOOD_RELATIONS_STORAGE_PREFIX}${foodUuid}`;
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as StoredFoodRelations;
  } catch {
    return null;
  }
}

export const MENU_ITEM_RELATIONS_STORAGE_PREFIX = "foodhub-menu-item-relations-";

export interface StoredMenuItemRelations {
  dietaryTypes?: any[];
  ingredients?: any[];
  medicalConditions?: any[];
  updatedAt?: string;
}

export function saveMenuItemRelationsStorage(
  menuItemUuid: string,
  relations: StoredMenuItemRelations,
) {
  if (typeof window === "undefined" || !menuItemUuid) return;
  try {
    const key = `${MENU_ITEM_RELATIONS_STORAGE_PREFIX}${menuItemUuid}`;
    window.localStorage.setItem(
      key,
      JSON.stringify({
        ...relations,
        updatedAt: new Date().toISOString(),
      }),
    );
  } catch (err) {
    console.warn("[MENU ITEM RELATIONS STORAGE SAVE FAILED]", err);
  }
}

export function readMenuItemRelationsStorage(
  menuItemUuid: string,
): StoredMenuItemRelations | null {
  if (typeof window === "undefined" || !menuItemUuid) return null;
  try {
    const key = `${MENU_ITEM_RELATIONS_STORAGE_PREFIX}${menuItemUuid}`;
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as StoredMenuItemRelations;
  } catch {
    return null;
  }
}