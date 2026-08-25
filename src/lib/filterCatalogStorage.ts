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
