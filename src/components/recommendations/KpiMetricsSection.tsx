"use client";

import React from "react";
import {
  Layers,
  Clock,
  ShieldAlert,
  Users,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { AdminKpiMetrics } from "@/src/types/adminRecommendation";

interface KpiMetricsSectionProps {
  kpis: AdminKpiMetrics;
  loading?: boolean;
}

export default function KpiMetricsSection({
  kpis,
  loading = false,
}: KpiMetricsSectionProps) {
  const total = kpis.totalSessions || 0;
  const soloCount = kpis.soloModeCount || 0;
  const groupCount = kpis.groupModeCount || 0;
  const totalModes = soloCount + groupCount;
  const soloPercent = totalModes > 0 ? Math.round((soloCount / totalModes) * 100) : 0;
  const groupPercent = totalModes > 0 ? 100 - soloPercent : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* 1. Total Sessions */}
      <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-xs space-y-2 hover:border-blue-300 dark:hover:border-blue-800/60 transition duration-200">
        <div className="flex items-center justify-between text-zinc-500">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
            Total Sessions
          </span>
          <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
            <Layers className="w-4 h-4" />
          </div>
        </div>
        <div>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {loading ? (
              <span className="inline-block w-16 h-7 bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded" />
            ) : (
              total.toLocaleString()
            )}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-blue-500" />
            <span>Recorded recommendation runs</span>
          </p>
        </div>
      </div>

      {/* 2. Avg Response Time / Latency */}
      <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-xs space-y-2 hover:border-emerald-300 dark:hover:border-emerald-800/60 transition duration-200">
        <div className="flex items-center justify-between text-zinc-500">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
            Avg Latency
          </span>
          <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {loading ? (
              <span className="inline-block w-20 h-7 bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded" />
            ) : (
              `${kpis.avgLatencyMs || 0} ms`
            )}
          </p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">
            Deterministic AI & filter pipeline
          </p>
        </div>
      </div>

      {/* 3. Allergen Block Rate */}
      <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-xs space-y-2 hover:border-rose-300 dark:hover:border-rose-800/60 transition duration-200">
        <div className="flex items-center justify-between text-zinc-500">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
            Allergen Block Rate
          </span>
          <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
            <ShieldAlert className="w-4 h-4" />
          </div>
        </div>
        <div>
          <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">
            {loading ? (
              <span className="inline-block w-16 h-7 bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded" />
            ) : (
              `${kpis.safetyBlockRate}%`
            )}
          </p>
          <div className="mt-1.5 space-y-1">
            <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-rose-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, kpis.safetyBlockRate))}%` }}
              />
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Zero-tolerance allergen filter
            </p>
          </div>
        </div>
      </div>

      {/* 4. Mode Distribution */}
      <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-xs space-y-2 hover:border-purple-300 dark:hover:border-purple-800/60 transition duration-200">
        <div className="flex items-center justify-between text-zinc-500">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
            Mode Distribution
          </span>
          <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {loading ? (
              <span className="inline-block w-24 h-7 bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded" />
            ) : (
              `${soloPercent}% / ${groupPercent}%`
            )}
          </p>
          <div className="mt-1.5 flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> Solo {soloPercent}%
            </span>
            <span className="inline-flex items-center gap-1 text-purple-600 dark:text-purple-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-purple-500 inline-block" /> Group {groupPercent}%
            </span>
          </div>
        </div>
      </div>

      {/* 5. AI Strategy Health */}
      <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-xs space-y-2 hover:border-amber-300 dark:hover:border-amber-800/60 transition duration-200 sm:col-span-2 lg:col-span-1">
        <div className="flex items-center justify-between text-zinc-500">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
            AI Strategy Health
          </span>
          <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>
        <div>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {loading ? (
              <span className="inline-block w-16 h-7 bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded" />
            ) : (
              `${kpis.aiStrategyHealthRate ?? 0}%`
            )}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Active multi-strategy scoring
          </p>
        </div>
      </div>
    </div>
  );
}
