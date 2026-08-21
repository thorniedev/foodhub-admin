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

    const current = parsed as FilterCatalogOption[];
    const seeds = cloneSeeds();

    let hasNewSeeds = false;
    const existingUuids = new Set(current.map((item) => item.uuid));
    const existingGroupCodes = new Set(
      current.map((item) => `${item.groupCode}:${item.code}`),
    );

    const merged = [...current];
    for (const seedItem of seeds) {
      const key = `${seedItem.groupCode}:${seedItem.code}`;
      if (!existingUuids.has(seedItem.uuid) && !existingGroupCodes.has(key)) {
        merged.push(seedItem);
        hasNewSeeds = true;
      }
    }

    if (hasNewSeeds) {
      window.localStorage.setItem(
        FILTER_CATALOG_STORAGE_KEY,
        JSON.stringify(merged),
      );
    }

    return merged;
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

export function createCodeFromLabel(
  value: string,
  prefix = "OPTION",
): string {
  const latinOnly = value
    .trim()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toUpperCase();

  if (latinOnly.length > 0) {
    return latinOnly;
  }

  return `${prefix}_${Date.now()}`;
}

