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
  const cacheMap = new Map<string, FilterCatalogOption>();

  // Filter out any stale seed items from local cache
  localCache.forEach((item) => {
    if (item.uuid && !item.uuid.startsWith("seed-")) {
      cacheMap.set(item.uuid, item);
    }
  });

  const resultMap = new Map<string, FilterCatalogOption>();

  // 1. Overlay server items (primary source of truth for items on server)
  serverItems.forEach((serverItem) => {
    if (serverItem.uuid) {
      const cached = cacheMap.get(serverItem.uuid);
      // Determine active status: respect serverItem.active, unless client cache has a local toggle override
      const active =
        cached && cached.updatedAt && (!serverItem.updatedAt || new Date(cached.updatedAt) > new Date(serverItem.updatedAt))
          ? cached.active
          : serverItem.active;

      // If client cache has more recent field modifications (e.g. while inactive), keep them
      const isCacheNewer =
        cached && cached.updatedAt && (!serverItem.updatedAt || new Date(cached.updatedAt) > new Date(serverItem.updatedAt));

      resultMap.set(serverItem.uuid, {
        ...serverItem,
        ...(isCacheNewer
          ? {
              name: cached.name || serverItem.name,
              localName: cached.localName || serverItem.localName,
              description: cached.description !== undefined ? cached.description : serverItem.description,
              code: cached.code || serverItem.code,
            }
          : {}),
        active,
      });
    }
  });

  // 2. Retain any item previously known but omitted by server GET (e.g. backend filtered soft-deleted item)
  cacheMap.forEach((cachedItem, uuid) => {
    if (!resultMap.has(uuid)) {
      resultMap.set(uuid, {
        ...cachedItem,
        active: cachedItem.active !== undefined ? cachedItem.active : false,
      });
    }
  });

  const unique = Array.from(resultMap.values());
  writeCatalogCache(groupCode, unique);
  return unique;
}

export function updateCatalogCacheActive(
  groupCode: string,
  uuid: string,
  active: boolean,
) {
  const items = readCatalogCache(groupCode);
  let matched = false;
  const updated = items.map((item) => {
    if (item.uuid === uuid) {
      matched = true;
      return { ...item, active, updatedAt: new Date().toISOString() };
    }
    return item;
  });

  if (!matched) {
    const seedItem = INITIAL_FILTER_OPTIONS.find((x) => x.uuid === uuid || x.groupCode === groupCode);
    if (seedItem) {
      updated.push({ ...seedItem, uuid, active, updatedAt: new Date().toISOString() });
    }
  }

  writeCatalogCache(groupCode, updated);
}

export function updateCatalogCacheItem(
  groupCode: string,
  uuid: string,
  changes: Partial<FilterCatalogOption>,
) {
  const items = readCatalogCache(groupCode);
  let matched = false;
  const updated = items.map((item) => {
    if (item.uuid === uuid || (changes.code && item.code === changes.code)) {
      matched = true;
      return {
        ...item,
        ...changes,
        updatedAt: new Date().toISOString(),
      };
    }
    return item;
  });

  if (!matched && changes.name) {
    updated.push({
      uuid: uuid || `local-${Date.now()}`,
      groupCode,
      code: changes.code || "",
      name: changes.name || "",
      localName: changes.localName || changes.name || "",
      description: changes.description ?? null,
      numericValue: changes.numericValue ?? null,
      unit: changes.unit ?? null,
      active: changes.active ?? true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...changes,
    });
  }

  writeCatalogCache(groupCode, updated);
}

export const MENU_ITEM_RELATIONS_STORAGE_PREFIX = "foodhub-menu-item-relations-";

/**
 * Only the menu item declarations the server still drops.
 *
 * MenuItemCatalogCommandRepository.replaceDietaryTypes and
 * replaceAllergenDeclarations are no-ops, so these two would be lost on
 * reload without a local copy. Everything else on a menu item — including
 * ingredients and the food attribute snapshot — is read back from the API.
 */
export interface StoredMenuItemRelations {
  dietaryTypes?: any[];
  allergenDeclarations?: any[];
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