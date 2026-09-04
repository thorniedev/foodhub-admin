"use client";

import React, { useMemo } from "react";
import {
  RotateCcw,
  RefreshCw,
  Layers,
  User,
  Hash,
  Activity,
  X,
} from "lucide-react";
import { AuditLogFilterParams, EntityType } from "../types/audit-log.types";
import {
  ENTITY_TYPE_CONFIGS,
  getActionsForEntityType,
} from "../constants/audit-log-dictionary";
import ActorUserPicker from "./actor-user-picker";
import CatalogEntityPicker from "./catalog-entity-picker";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { useGetFoodCategoriesQuery } from "@/src/app/store/foodCategoryApi";
import { useGetCuisinesQuery } from "@/src/app/store/cuisineApi";

/** Large enough to hold the full directory in one page; see catalog-entity-picker.tsx. */
const CATALOG_PAGE_SIZE = 500;

const controlClassName =
  "h-9 w-full rounded-lg border bg-background px-2.5 text-xs text-foreground outline-none transition hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-ring/25";

interface AuditLogFiltersProps {
  filters: AuditLogFilterParams;
  onFilterChange: (
    updater:
      | Partial<AuditLogFilterParams>
      | ((prev: AuditLogFilterParams) => AuditLogFilterParams),
  ) => void;
  onReset: () => void;
  onRefresh: () => void;
  loading: boolean;
}

export default function AuditLogFilters({
  filters,
  onFilterChange,
  onReset,
  onRefresh,
  loading,
}: AuditLogFiltersProps) {
  // Available action codes based on currently selected entity type
  const availableActions = useMemo(() => {
    return getActionsForEntityType(filters.entityType);
  }, [filters.entityType]);

  // Fed to CatalogEntityPicker below. Fetched unconditionally — hooks can't
  // be called only when their entity type is selected — but both catalogs are
  // small, so this is one lightweight request each, not a scaling concern.
  const { data: foodCategoriesPage, isFetching: categoriesLoading } =
    useGetFoodCategoriesQuery({ page: 0, size: CATALOG_PAGE_SIZE });
  const { data: cuisinesPage, isFetching: cuisinesLoading } = useGetCuisinesQuery({
    page: 0,
    size: CATALOG_PAGE_SIZE,
  });
  const foodCategories = useMemo(
    () => foodCategoriesPage?.contents ?? [],
    [foodCategoriesPage],
  );
  const cuisines = useMemo(() => cuisinesPage?.contents ?? [], [cuisinesPage]);

  // Count active non-default filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.entityType && filters.entityType !== "ALL") count++;
    if (filters.actionCode && filters.actionCode !== "ALL") count++;
    if (filters.actorUuid && filters.actorUuid.trim()) count++;
    if (filters.entityId !== undefined && filters.entityId !== null) count++;
    if (filters.from && filters.from.trim()) count++;
    if (filters.to && filters.to.trim()) count++;
    return count;
  }, [filters]);

  // Quick date presets
  const applyDatePreset = (preset: "TODAY" | "LAST_24H" | "LAST_7D" | "LAST_30D") => {
    const now = new Date();
    const toIso = now.toISOString();
    let fromIso = "";

    if (preset === "TODAY") {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      fromIso = startOfDay.toISOString();
    } else if (preset === "LAST_24H") {
      const past = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      fromIso = past.toISOString();
    } else if (preset === "LAST_7D") {
      const past = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      fromIso = past.toISOString();
    } else if (preset === "LAST_30D") {
      const past = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      fromIso = past.toISOString();
    }

    onFilterChange({ from: fromIso, to: toIso });
  };

  // Format ISO strings to local input format (YYYY-MM-DDTHH:mm)
  const formatForInput = (iso?: string) => {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return "";
      const offset = d.getTimezoneOffset();
      const local = new Date(d.getTime() - offset * 60 * 1000);
      return local.toISOString().slice(0, 16);
    } catch {
      return "";
    }
  };

  const handleDateInput = (key: "from" | "to", value: string) => {
    if (!value) {
      onFilterChange({ [key]: "" });
      return;
    }
    try {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        onFilterChange({ [key]: date.toISOString() });
      }
    } catch {
      onFilterChange({ [key]: value });
    }
  };

  return (
    <div className="space-y-3 rounded-xl border bg-card p-4 shadow-card">
      {/* Top row: Primary Filters (Entity Type, Action Code, Actor UUID, Entity ID) */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* 1. Entity Type Dropdown */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-[0.6875rem] font-medium text-muted-foreground">
            <Layers size={12} aria-hidden="true" />
            <span>Entity Type</span>
          </label>
          <select
            value={filters.entityType || "ALL"}
            onChange={(e) => {
              const val = e.target.value;
              onFilterChange({
                entityType: val,
                // Reset action code if not in chosen entity type
                actionCode: "ALL",
                // An id is only meaningful within the entity type it was
                // picked for — #55 is a Food Category in one type and an
                // unrelated Cuisine (or nothing) in another. Carrying it
                // across a type change would silently filter by the wrong
                // target instead of visibly resetting.
                entityId: undefined,
              });
            }}
            className={`${controlClassName} cursor-pointer`}
          >
            <option value="ALL">All Entity Types</option>
            {Object.keys(ENTITY_TYPE_CONFIGS).map((type) => {
              const cfg = ENTITY_TYPE_CONFIGS[type as EntityType];
              return (
                <option key={type} value={type}>
                  {cfg.label} ({type})
                </option>
              );
            })}
          </select>
        </div>

        {/* 2. Action Code Dropdown */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-[0.6875rem] font-medium text-muted-foreground">
            <Activity size={12} aria-hidden="true" />
            <span>Action Code</span>
          </label>
          <select
            value={filters.actionCode || "ALL"}
            onChange={(e) => onFilterChange({ actionCode: e.target.value })}
            className={`${controlClassName} cursor-pointer`}
          >
            <option value="ALL">All Action Codes</option>
            {availableActions.map((action) => (
              <option key={action.code} value={action.code}>
                {action.label} ({action.code})
              </option>
            ))}
          </select>
        </div>

        {/* 3. Actor — searched by name, submitted as a UUID */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-[0.6875rem] font-medium text-muted-foreground">
            <User size={12} aria-hidden="true" />
            <span>Actor (user)</span>
          </label>
          <ActorUserPicker
            value={filters.actorUuid || ""}
            onChange={(actorUuid) => onFilterChange({ actorUuid })}
          />
        </div>

        {/* 4. Entity Target — a name picker for the two catalog types whose
               list endpoint actually returns a numeric id (verified against
               the live API), a plain numeric field for every other type. */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-[0.6875rem] font-medium text-muted-foreground">
            <Hash size={12} aria-hidden="true" />
            <span>Entity Target ID</span>
          </label>
          {filters.entityType === "FOOD_CATEGORY" ? (
            <CatalogEntityPicker
              value={filters.entityId ?? undefined}
              onChange={(entityId) => onFilterChange({ entityId })}
              entities={foodCategories}
              isLoading={categoriesLoading}
              placeholder="Search food category…"
              emptyLabel="No matching food categories."
            />
          ) : filters.entityType === "CUISINE" ? (
            <CatalogEntityPicker
              value={filters.entityId ?? undefined}
              onChange={(entityId) => onFilterChange({ entityId })}
              entities={cuisines}
              isLoading={cuisinesLoading}
              placeholder="Search cuisine…"
              emptyLabel="No matching cuisines."
            />
          ) : (
            <div className="relative">
              <input
                type="number"
                min="1"
                placeholder="e.g. 42"
                value={filters.entityId !== undefined && filters.entityId !== null ? filters.entityId : ""}
                onChange={(e) => {
                  const val = e.target.value ? parseInt(e.target.value, 10) : undefined;
                  onFilterChange({ entityId: val });
                }}
                className={`${controlClassName} pr-7`}
              />
              {filters.entityId !== undefined && (
                <button
                  type="button"
                  aria-label="Clear entity ID"
                  onClick={() => onFilterChange({ entityId: undefined })}
                  className="absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer rounded p-0.5 text-muted-foreground transition hover:text-foreground"
                >
                  <X size={13} aria-hidden="true" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom row: Date Range & Action Buttons */}
      <div className="flex flex-wrap items-end justify-between gap-3 border-t pt-3">
        {/* Date Range Fields & Presets */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="space-y-1">
              <span className="block text-[0.6875rem] font-medium text-muted-foreground">
                From Date
              </span>
              <div className="relative">
                <input
                  type="datetime-local"
                  value={formatForInput(filters.from)}
                  onChange={(e) => handleDateInput("from", e.target.value)}
                  className={controlClassName}
                />
              </div>
            </div>

            <span className="mt-5 text-xs text-muted-foreground">to</span>

            <div className="space-y-1">
              <span className="block text-[0.6875rem] font-medium text-muted-foreground">
                To Date
              </span>
              <div className="relative">
                <input
                  type="datetime-local"
                  value={formatForInput(filters.to)}
                  onChange={(e) => handleDateInput("to", e.target.value)}
                  className={controlClassName}
                />
              </div>
            </div>
          </div>

          {/* Date Quick Preset Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 mt-5">
            <button
              type="button"
              onClick={() => applyDatePreset("TODAY")}
              className="cursor-pointer rounded-md bg-muted px-2 py-1 text-[0.6875rem] font-medium text-muted-foreground transition hover:bg-muted/70 hover:text-foreground"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => applyDatePreset("LAST_24H")}
              className="cursor-pointer rounded-md bg-muted px-2 py-1 text-[0.6875rem] font-medium text-muted-foreground transition hover:bg-muted/70 hover:text-foreground"
            >
              Last 24h
            </button>
            <button
              type="button"
              onClick={() => applyDatePreset("LAST_7D")}
              className="cursor-pointer rounded-md bg-muted px-2 py-1 text-[0.6875rem] font-medium text-muted-foreground transition hover:bg-muted/70 hover:text-foreground"
            >
              Last 7 Days
            </button>
            <button
              type="button"
              onClick={() => applyDatePreset("LAST_30D")}
              className="cursor-pointer rounded-md bg-muted px-2 py-1 text-[0.6875rem] font-medium text-muted-foreground transition hover:bg-muted/70 hover:text-foreground"
            >
              Last 30 Days
            </button>
            {(filters.from || filters.to) && (
              <button
                type="button"
                onClick={() => onFilterChange({ from: "", to: "" })}
                className="cursor-pointer rounded-md px-2 py-1 text-[0.6875rem] font-medium text-destructive transition hover:bg-red-50 dark:hover:bg-red-950/40"
              >
                Clear Dates
              </button>
            )}
          </div>
        </div>

        {/* Action Buttons (Reset & Refresh) */}
        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <Button type="button" variant="outline" size="sm" onClick={onReset} disabled={loading}>
              <RotateCcw size={13} aria-hidden="true" />
              <span>Reset</span>
              <Badge tone="neutral" size="sm">{activeFilterCount}</Badge>
            </Button>
          )}

          <Button type="button" size="sm" onClick={onRefresh} disabled={loading}>
            <RefreshCw size={13} aria-hidden="true" className={loading ? "animate-spin" : undefined} />
            <span>Apply &amp; Refresh</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
