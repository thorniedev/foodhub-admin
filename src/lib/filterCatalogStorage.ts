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
  const normalized = value
    .trim()
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}]+/gu, "_")
    .replace(/^_+|_+$/g, "")
    .toUpperCase();

  return (
    normalized ||
    `OPTION_${Date.now()}`
  );
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

  // 1. Add all from local cache first (keeps inactive items preserved)
  localCache.forEach((item) => {
    map.set(item.uuid, item);
    if (item.code) {
      map.set(`${groupCode}_${item.code}`, item);
    }
  });

  // 2. Overlay server items (which are active on server)
  serverItems.forEach((serverItem) => {
    const keyByCode = serverItem.code ? `${groupCode}_${serverItem.code}` : "";
    const existing = map.get(serverItem.uuid) || (keyByCode ? map.get(keyByCode) : undefined);

    const merged: FilterCatalogOption = {
      ...existing,
      ...serverItem,
      active: serverItem.active !== false,
    };

    map.set(serverItem.uuid, merged);
    if (keyByCode) {
      map.set(keyByCode, merged);
    }
  });

  const unique = Array.from(new Set(map.values()));
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

