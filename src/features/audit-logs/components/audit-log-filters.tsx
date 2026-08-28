"use client";

import React, { useMemo } from "react";
import {
  Search,
  Filter,
  RotateCcw,
  RefreshCw,
  Calendar,
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
    <div className="bg-white dark:bg-zinc-900 p-5 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl shadow-xs space-y-4">
      {/* Top row: Primary Filters (Entity Type, Action Code, Actor UUID, Entity ID) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* 1. Entity Type Dropdown */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-zinc-400" />
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
              });
            }}
            className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 rounded-xl text-xs font-medium text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
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
          <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-zinc-400" />
            <span>Action Code</span>
          </label>
          <select
            value={filters.actionCode || "ALL"}
            onChange={(e) => onFilterChange({ actionCode: e.target.value })}
            className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 rounded-xl text-xs font-medium text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="ALL">All Action Codes</option>
            {availableActions.map((action) => (
              <option key={action.code} value={action.code}>
                {action.label} ({action.code})
              </option>
            ))}
          </select>
        </div>

        {/* 3. Actor UUID Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-zinc-400" />
            <span>Actor User UUID</span>
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="e.g. 7b6f72c0-8d5f..."
              value={filters.actorUuid || ""}
              onChange={(e) => onFilterChange({ actorUuid: e.target.value })}
              className="w-full pl-3 pr-8 py-2 border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 rounded-xl text-xs font-mono text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            />
            {filters.actorUuid && (
              <button
                type="button"
                onClick={() => onFilterChange({ actorUuid: "" })}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* 4. Entity ID Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
            <Hash className="w-3.5 h-3.5 text-zinc-400" />
            <span>Entity Target ID</span>
          </label>
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
              className="w-full pl-3 pr-8 py-2 border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 rounded-xl text-xs font-medium text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            />
            {filters.entityId !== undefined && (
              <button
                type="button"
                onClick={() => onFilterChange({ entityId: undefined })}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bottom row: Date Range & Action Buttons */}
      <div className="flex flex-wrap items-end justify-between gap-4 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
        {/* Date Range Fields & Presets */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">
                From Date
              </span>
              <div className="relative">
                <input
                  type="datetime-local"
                  value={formatForInput(filters.from)}
                  onChange={(e) => handleDateInput("from", e.target.value)}
                  className="px-2.5 py-1.5 border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 rounded-xl text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <span className="text-zinc-400 text-xs mt-5">to</span>

            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">
                To Date
              </span>
              <div className="relative">
                <input
                  type="datetime-local"
                  value={formatForInput(filters.to)}
                  onChange={(e) => handleDateInput("to", e.target.value)}
                  className="px-2.5 py-1.5 border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 rounded-xl text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Date Quick Preset Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 mt-5">
            <button
              type="button"
              onClick={() => applyDatePreset("TODAY")}
              className="px-2 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-[11px] font-medium transition cursor-pointer"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => applyDatePreset("LAST_24H")}
              className="px-2 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-[11px] font-medium transition cursor-pointer"
            >
              Last 24h
            </button>
            <button
              type="button"
              onClick={() => applyDatePreset("LAST_7D")}
              className="px-2 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-[11px] font-medium transition cursor-pointer"
            >
              Last 7 Days
            </button>
            <button
              type="button"
              onClick={() => applyDatePreset("LAST_30D")}
              className="px-2 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-[11px] font-medium transition cursor-pointer"
            >
              Last 30 Days
            </button>
            {(filters.from || filters.to) && (
              <button
                type="button"
                onClick={() => onFilterChange({ from: "", to: "" })}
                className="px-2 py-1 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-[11px] font-medium transition cursor-pointer"
              >
                Clear Dates
              </button>
            )}
          </div>
        </div>

        {/* Action Buttons (Reset & Refresh) */}
        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={onReset}
              disabled={loading}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-zinc-500" />
              <span>Reset ({activeFilterCount})</span>
            </button>
          )}

          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-xl text-xs font-semibold transition shadow-xs disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Apply & Refresh</span>
          </button>
        </div>
      </div>
    </div>
  );
}
