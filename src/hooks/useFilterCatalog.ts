"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  FilterCatalogOption,
  FilterCatalogOptionFormValues,
} from "@/src/types/filterCatalog";

import {
  FILTER_CATALOG_CHANGED_EVENT,
  FILTER_CATALOG_STORAGE_KEY,
  createClientUuid,
  createCodeFromLabel,
  readFilterCatalog,
  writeFilterCatalog,
} from "@/src/lib/filterCatalogStorage";

export function useFilterCatalog(groupCode?: string) {
  const [options, setOptions] =
    useState<FilterCatalogOption[]>([]);

  const load = useCallback(() => {
    setOptions(readFilterCatalog());
  }, []);

  useEffect(() => {
    load();

    const onChanged = () => load();

    const onStorage = (event: StorageEvent) => {
      if (
        event.key === FILTER_CATALOG_STORAGE_KEY
      ) {
        load();
      }
    };

    window.addEventListener(
      FILTER_CATALOG_CHANGED_EVENT,
      onChanged,
    );

    window.addEventListener(
      "storage",
      onStorage,
    );

    return () => {
      window.removeEventListener(
        FILTER_CATALOG_CHANGED_EVENT,
        onChanged,
      );

      window.removeEventListener(
        "storage",
        onStorage,
      );
    };
  }, [load]);

  const groupOptions = useMemo(() => {
    if (!groupCode) {
      return options;
    }

    return options.filter(
      (item) => item.groupCode === groupCode,
    );
  }, [groupCode, options]);

  const createOption = useCallback(
    (values: FilterCatalogOptionFormValues) => {
      if (!groupCode) {
        throw new Error("groupCode is required.");
      }

      const now = new Date().toISOString();
      const label =
        values.name.trim() ||
        values.localName.trim();

      const next: FilterCatalogOption = {
        uuid: createClientUuid(),
        groupCode,
        code: values.code?.trim().toUpperCase() || createCodeFromLabel(label),
        name: values.name.trim() || values.localName.trim(),
        localName:
          values.localName.trim() || values.name.trim(),
        description:
          values.description.trim() || null,
        numericValue:
          values.numericValue.trim() === ""
            ? null
            : Number(values.numericValue),
        unit: values.unit.trim() || null,
        active: values.active,
        createdAt: now,
        updatedAt: now,
      };

      const current = readFilterCatalog();

      const duplicate = current.some(
        (item) =>
          item.groupCode === groupCode &&
          item.code === next.code,
      );

      if (duplicate) {
        throw new Error(
          "មានទិន្នន័យនេះរួចហើយ។ សូមប្រើឈ្មោះផ្សេង។",
        );
      }

      writeFilterCatalog([
        ...current,
        next,
      ]);

      return next;
    },
    [groupCode],
  );

  const updateOption = useCallback(
    (
      uuid: string,
      values: FilterCatalogOptionFormValues,
    ) => {
      const current =
        readFilterCatalog();

      const existing =
        current.find(
          (item) =>
            item.uuid === uuid,
        );

      if (!existing) {
        throw new Error(
          "រកមិនឃើញទិន្នន័យ។",
        );
      }

      const next =
        current.map(
          (item) => {
            if (
              item.uuid !== uuid
            ) {
              return item;
            }

            return {
              ...item,
              code:
                values.code?.trim().toUpperCase() ||
                item.code,
              name:
                values.name.trim() ||
                values.localName.trim(),
              localName:
                values.localName.trim() ||
                values.name.trim(),
              description:
                values.description.trim() ||
                null,
              numericValue:
                values.numericValue.trim() ===
                ""
                  ? null
                  : Number(
                      values.numericValue,
                    ),
              unit:
                values.unit.trim() ||
                null,
              active:
                values.active,
              updatedAt:
                new Date().toISOString(),
            };
          },
        );

      writeFilterCatalog(next);
    },
    [],
  );

  const setActive = useCallback(
    (
      uuid: string,
      active: boolean,
    ) => {
      const current =
        readFilterCatalog();

      writeFilterCatalog(
        current.map(
          (item) =>
            item.uuid === uuid
              ? {
                  ...item,
                  active,
                  updatedAt:
                    new Date().toISOString(),
                }
              : item,
        ),
      );
    },
    [],
  );

  return {
    options,
    groupOptions,
    createOption,
    updateOption,
    setActive,
    refresh: load,
  };
}
